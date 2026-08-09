(() => {
  const config = window.PETROBRAS_GOOGLE_DRIVE_CONFIG || {};
  const subjectIds = ["bd", "es", "gov", "ing", "por", "rl", "sec"];
  const subjectNames = {
    bd: "Banco de Dados",
    es: "Engenharia de Software",
    gov: "Governança de TI",
    ing: "Língua Inglesa",
    por: "Língua Portuguesa",
    rl: "Raciocínio Lógico-Matemático",
    sec: "Segurança da Informação"
  };
  const stateKey = "petrobras_drive_sync_state";
  const deviceKey = "petrobras_device_id";
  const autoKey = "petrobras_drive_auto_backup";
  const clientIdKey = "petrobras_google_client_id";
  const statusEvent = "petrobras:drive-status";
  const stateChangedEvent = "petrobras:state-changed";
  let accessToken = "";
  let tokenExpiresAt = 0;
  let autoBackupTimer = null;
  let busy = false;

  const get = (key, fallback = "") => {
    try { return localStorage.getItem(key) ?? fallback; } catch (_) { return fallback; }
  };
  const set = (key, value) => {
    try { localStorage.setItem(key, value); } catch (_) {}
  };
  const readJson = (key, fallback) => {
    try {
      const value = JSON.parse(get(key, ""));
      return value ?? fallback;
    } catch (_) { return fallback; }
  };
  const readSyncState = () => readJson(stateKey, {});
  const writeSyncState = value => set(stateKey, JSON.stringify(value));
  const getDeviceId = () => {
    let id = get(deviceKey);
    if (!id) {
      id = globalThis.crypto?.randomUUID?.() || `device-${Date.now()}-${Math.random().toString(36).slice(2)}`;
      set(deviceKey, id);
    }
    return id;
  };
  const notify = (message, type = "info", extra = {}) => {
    document.dispatchEvent(new CustomEvent(statusEvent, { detail: { message, type, ...extra } }));
  };
  const setModalStatus = (message, type = "info") => {
    const node = document.getElementById("drive-sync-status");
    if (!node) return;
    node.textContent = message;
    node.className = `drive-sync-status drive-status-${type}`;
  };
  const formatDate = value => {
    if (!value) return "Nunca";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "Nunca";
    return new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeStyle: "short" }).format(date);
  };
  const updateLastSyncUi = () => {
    const state = readSyncState();
    const node = document.getElementById("drive-last-sync");
    if (node) node.textContent = state.lastSyncedAt ? `Última sincronização: ${formatDate(state.lastSyncedAt)}` : "Ainda não sincronizado";
    const auto = document.getElementById("drive-auto-backup");
    if (auto) auto.checked = get(autoKey, "false") === "true";
    const configBox = document.getElementById("drive-client-config");
    if (configBox) configBox.classList.toggle("hidden", hasConfig());
    const connected = Boolean(accessToken && tokenExpiresAt > Date.now());
    const connectButton = document.getElementById("btn-connect-drive");
    if (connectButton) connectButton.textContent = connected ? "✅ Google Drive conectado" : "🔐 Conectar Google Drive";
    document.querySelectorAll("[data-drive-action]").forEach(button => { button.disabled = busy || !connected; });
  };
  const getClientId = () => get(clientIdKey, String(config.clientId || "").trim()).trim();
  const hasConfig = () => Boolean(getClientId() && String(config.folderId || "").trim());
  const explainMissingConfig = () => {
    const message = "Para conectar o Drive, falta configurar o Client ID OAuth do Google em 04-codigo-fonte/js/integrations/google-drive-config.js.";
    setModalStatus(message, "warning");
    notify(message, "warning");
  };
  const loadGoogleIdentityServices = () => new Promise((resolve, reject) => {
    if (globalThis.google?.accounts?.oauth2) return resolve();
    const existing = document.querySelector('script[src="https://accounts.google.com/gsi/client"]');
    if (existing) {
      existing.addEventListener("load", () => resolve(), { once: true });
      existing.addEventListener("error", () => reject(new Error("Não foi possível carregar a autenticação do Google.")), { once: true });
      return;
    }
    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Não foi possível carregar a autenticação do Google."));
    document.head.appendChild(script);
  });
  const requestToken = async () => {
    if (!hasConfig()) { explainMissingConfig(); throw new Error("Configuração do Google Drive incompleta."); }
    await loadGoogleIdentityServices();
    return new Promise((resolve, reject) => {
      const client = google.accounts.oauth2.initTokenClient({
        client_id: getClientId(),
        scope: config.scope,
        callback: response => {
          if (response.error) { reject(new Error("O Google não autorizou o acesso ao Drive.")); return; }
          accessToken = response.access_token;
          tokenExpiresAt = Date.now() + (Number(response.expires_in || 3600) * 1000);
          updateLastSyncUi();
          resolve(accessToken);
        }
      });
      client.requestAccessToken({ prompt: accessToken ? "" : "consent" });
    });
  };
  const getToken = async () => accessToken && tokenExpiresAt > Date.now() + 60000 ? accessToken : requestToken();
  const api = async (url, options = {}, retry = true) => {
    const token = await getToken();
    const headers = new Headers(options.headers || {});
    headers.set("Authorization", `Bearer ${token}`);
    const response = await fetch(url, { ...options, headers });
    if (response.status === 401 && retry) {
      accessToken = "";
      tokenExpiresAt = 0;
      return api(url, options, false);
    }
    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      throw new Error(data.error?.message || `Google Drive respondeu HTTP ${response.status}.`);
    }
    return response;
  };
  const findBackupFile = async () => {
    const query = `'${config.folderId}' in parents and name = '${String(config.backupFileName).replace(/'/g, "\\'")}' and trashed = false`;
    const url = `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(query)}&spaces=drive&pageSize=10&fields=${encodeURIComponent("files(id,name,mimeType,modifiedTime,version,webViewLink,parents)")}`;
    const data = await (await api(url)).json();
    return data.files?.sort((a, b) => new Date(b.modifiedTime || 0) - new Date(a.modifiedTime || 0))[0] || null;
  };
  const downloadFile = async fileId => {
    const url = `https://www.googleapis.com/drive/v3/files/${encodeURIComponent(fileId)}?alt=media`;
    const data = await (await api(url)).json();
    if (!data || typeof data !== "object") throw new Error("O backup do Drive não contém JSON válido.");
    return data;
  };
  const multipartUpload = async (metadata, content, fileId = "") => {
    const boundary = `petrobras_${Date.now()}`;
    const body = [
      `--${boundary}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n${JSON.stringify(metadata)}\r\n`,
      `--${boundary}\r\nContent-Type: application/json\r\n\r\n${JSON.stringify(content)}\r\n`,
      `--${boundary}--`
    ].join("");
    const base = fileId ? `https://www.googleapis.com/upload/drive/v3/files/${encodeURIComponent(fileId)}?uploadType=multipart` : "https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart";
    const response = await api(base, { method: fileId ? "PATCH" : "POST", headers: { "Content-Type": `multipart/related; boundary=${boundary}` }, body });
    return response.json();
  };
  const stableStringify = value => {
    if (Array.isArray(value)) return `[${value.map(stableStringify).join(",")}]`;
    if (value && typeof value === "object") return `{${Object.keys(value).sort().map(key => `${JSON.stringify(key)}:${stableStringify(value[key])}`).join(",")}}`;
    return JSON.stringify(value);
  };
  const hash = async value => {
    const input = stableStringify(value);
    if (globalThis.crypto?.subtle) {
      const bytes = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(input));
      return [...new Uint8Array(bytes)].map(byte => byte.toString(16).padStart(2, "0")).join("");
    }
    return String([...input].reduce((total, char) => ((total << 5) - total + char.charCodeAt(0)) | 0, 0));
  };
  const collectState = () => ({
    settings: {
      theme: get("petrobras_theme", "dark"),
      model: get("petrobras_openrouter_model", "google/gemma-4-31b-it"),
      banca: get("petrobras_banca", "CESGRANRIO"),
      thinking: get("petrobras_thinking_level", "medium"),
      difficulty: get("petrobras_difficulty_level", "medium")
    },
    subjects: Object.fromEntries(subjectIds.map(id => [id, {
      name: subjectNames[id],
      sessions: readJson(`petrobras_sessions_${id}`, []),
      wrongQuestions: readJson(`petrobras_wrong_${id}`, [])
    }]))
  });
  const buildEnvelope = async (state, revision = 1) => ({
    schemaVersion: 2,
    app: config.appName || "Concurso Petrobras",
    revision,
    createdAt: readSyncState().createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    deviceId: getDeviceId(),
    contentHash: await hash(state),
    state
  });
  const validateEnvelope = data => {
    if (!data || typeof data !== "object" || !data.state?.subjects || data.schemaVersion !== 2) throw new Error("O arquivo não é um backup completo do Concurso Petrobras.");
    return data;
  };
  const applyState = data => {
    const envelope = validateEnvelope(data);
    subjectIds.forEach(id => {
      const subject = envelope.state.subjects[id];
      if (!subject) return;
      set(`petrobras_sessions_${id}`, JSON.stringify(Array.isArray(subject.sessions) ? subject.sessions : []));
      set(`petrobras_wrong_${id}`, JSON.stringify(Array.isArray(subject.wrongQuestions) ? subject.wrongQuestions : []));
    });
    const settings = envelope.state.settings || {};
    if (settings.theme) set("petrobras_theme", settings.theme);
    if (settings.model) set("petrobras_openrouter_model", settings.model);
    if (settings.banca) set("petrobras_banca", settings.banca);
    if (settings.thinking) set("petrobras_thinking_level", settings.thinking);
    if (settings.difficulty) set("petrobras_difficulty_level", settings.difficulty);
    const current = readSyncState();
    writeSyncState({ ...current, lastSyncedAt: envelope.updatedAt, lastSyncedHash: envelope.contentHash, remoteRevision: envelope.revision, remoteFileId: current.remoteFileId || "" });
    window.dispatchEvent(new CustomEvent("petrobras:backup-applied", { detail: envelope }));
  };
  const downloadLocal = async () => {
    const envelope = await buildEnvelope(collectState(), Number(readSyncState().remoteRevision || 0) + 1);
    const blob = new Blob([JSON.stringify(envelope, null, 2)], { type: "application/json" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `backup-concurso-petrobras-${new Date().toISOString().slice(0, 16).replace(/[:T]/g, "-")}.json`;
    link.click();
    setTimeout(() => URL.revokeObjectURL(link.href), 1000);
    notify("Cópia local do backup baixada.", "success");
  };
  const syncToDrive = async ({ restore = false, snapshot = false } = {}) => {
    if (busy) return;
    busy = true;
    updateLastSyncUi();
    setModalStatus(restore ? "Lendo o backup do Google Drive..." : "Salvando backup no Google Drive...", "loading");
    try {
      const currentState = collectState();
      const syncState = readSyncState();
      const currentHash = await hash(currentState);
      const file = await findBackupFile();
      const remote = file ? validateEnvelope(await downloadFile(file.id)) : null;
      if (restore) {
        if (!file) throw new Error("Ainda não existe um backup na pasta oficial.");
        const hasLocalChanges = Boolean(syncState.lastSyncedHash && syncState.lastSyncedHash !== currentHash);
        const remoteChanged = Boolean(syncState.lastSyncedHash && syncState.lastSyncedHash !== remote.contentHash);
        if (hasLocalChanges && remoteChanged && !window.confirm("Este dispositivo possui alterações não sincronizadas. Restaurar agora substituirá os dados locais. Deseja continuar?")) throw new Error("Restauração cancelada para preservar os dados locais.");
        applyState(remote);
        const nextState = { ...readSyncState(), remoteFileId: file.id, lastSyncedAt: remote.updatedAt, lastSyncedHash: remote.contentHash, remoteRevision: remote.revision };
        writeSyncState(nextState);
        setModalStatus(`Backup restaurado em ${formatDate(remote.updatedAt)}.`, "success");
        notify("Backup restaurado. A página será atualizada para aplicar o progresso.", "success");
        setTimeout(() => location.reload(), 900);
        return;
      }
      if (remote) {
        const localChanged = Boolean(syncState.lastSyncedHash && syncState.lastSyncedHash !== currentHash);
        const remoteChanged = Boolean(syncState.lastSyncedHash && syncState.lastSyncedHash !== remote.contentHash);
        if (localChanged && remoteChanged) throw new Error("Há alterações mais recentes no Drive. Restaure ou sincronize antes de enviar para evitar sobrescrever seu progresso.");
        if (!syncState.lastSyncedHash && !window.confirm("Já existe um backup na pasta oficial. Fazer este backup irá substituí-lo. Deseja continuar?")) throw new Error("Backup cancelado para preservar a versão existente.");
      }
      const nextRevision = Math.max(Number(syncState.remoteRevision || 0), Number(remote?.revision || 0)) + 1;
      const envelope = await buildEnvelope(currentState, nextRevision);
      const uploaded = await multipartUpload(file ? { name: file.name, mimeType: "application/json" } : { name: config.backupFileName, mimeType: "application/json", parents: [config.folderId] }, envelope, file?.id || "");
      const remoteFileId = uploaded.id || file?.id || "";
      writeSyncState({ createdAt: syncState.createdAt || envelope.createdAt, lastSyncedAt: envelope.updatedAt, lastSyncedHash: envelope.contentHash, remoteRevision: envelope.revision, remoteFileId, autoBackup: get(autoKey, "false") === "true" });
      if (snapshot) {
        const stamp = envelope.updatedAt.replace(/[-:]/g, "").replace(/\.\d{3}Z$/, "Z").replace("T", "-");
        await multipartUpload({ name: `concurso-petrobras-${stamp}.json`, mimeType: "application/json", parents: [config.folderId] }, envelope);
      }
      setModalStatus(`Backup salvo em ${formatDate(envelope.updatedAt)}.`, "success");
      notify("Backup salvo no Google Drive com sucesso.", "success");
    } catch (error) {
      setModalStatus(error.message, "error");
      notify(error.message, "error");
    } finally {
      busy = false;
      updateLastSyncUi();
    }
  };
  const connect = async () => {
    try {
      setModalStatus("Abrindo autorização do Google...", "loading");
      await requestToken();
      setModalStatus("Google Drive conectado. A pasta oficial está pronta para uso.", "success");
      notify("Google Drive conectado.", "success");
    } catch (error) {
      setModalStatus(error.message, "error");
    } finally { updateLastSyncUi(); }
  };
  const markDirty = () => {
    const auto = get(autoKey, "false") === "true";
    if (!auto || !accessToken) return;
    clearTimeout(autoBackupTimer);
    autoBackupTimer = setTimeout(() => syncToDrive({ snapshot: false }), 30000);
  };
  const setAutoBackup = enabled => {
    set(autoKey, enabled ? "true" : "false");
    if (enabled) markDirty();
    notify(enabled ? "Backup automático ativado." : "Backup automático desativado.", "success");
  };
  const saveClientId = () => {
    const input = document.getElementById("drive-client-id");
    const value = input?.value.trim() || "";
    if (!value || !value.includes(".apps.googleusercontent.com")) {
      setModalStatus("Informe um Client ID OAuth Web válido do Google.", "error");
      return;
    }
    set(clientIdKey, value);
    setModalStatus("Client ID salvo neste navegador. Agora conecte o Google Drive.", "success");
    updateLastSyncUi();
  };
  const bind = () => {
    const clientInput = document.getElementById("drive-client-id");
    if (clientInput) clientInput.value = getClientId();
    document.getElementById("btn-save-drive-client-id")?.addEventListener("click", saveClientId);
    document.getElementById("btn-connect-drive")?.addEventListener("click", connect);
    document.getElementById("btn-drive-backup")?.addEventListener("click", () => syncToDrive({ snapshot: true }));
    document.getElementById("btn-drive-restore")?.addEventListener("click", () => syncToDrive({ restore: true }));
    document.getElementById("drive-auto-backup")?.addEventListener("change", event => setAutoBackup(event.target.checked));
    document.addEventListener(stateChangedEvent, markDirty);
    document.addEventListener(statusEvent, event => {
      if (event.detail?.message) {
        const node = document.getElementById("setup-status");
        if (node) {
          node.textContent = event.detail.message;
          node.className = `setup-status status-${event.detail.type || "warning"}`;
        }
      }
    });
    updateLastSyncUi();
  };
  globalThis.PetrobrasDriveSync = { connect, backupNow: () => syncToDrive({ snapshot: true }), restoreNow: () => syncToDrive({ restore: true }), downloadLocal, importData: applyState, setAutoBackup, markDirty, updateLastSyncUi };
  document.addEventListener("DOMContentLoaded", bind);
})();

