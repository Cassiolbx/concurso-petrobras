(() => {
  const file = location.pathname.split("/").pop();
  const subjectMap = {
    "banco-dados.html": ["bd", "Banco de Dados"],
    "engenharia-software.html": ["es", "Engenharia de Software"],
    "governanca-ti.html": ["gov", "Governança de TI"],
    "ingles.html": ["ing", "Língua Inglesa"],
    "portugues.html": ["por", "Língua Portuguesa"],
    "raciocinio-logico.html": ["rl", "Raciocínio Lógico-Matemático"],
    "seguranca-informacao.html": ["sec", "Segurança da Informação"]
  };
  const [subjectId, subjectName] = subjectMap[file] || ["materia", "Matéria"];
  const themeKey = "petrobras_theme";
  const apiKeyKey = "petrobras_openrouter_api_key";
  const modelKey = "petrobras_openrouter_model";
  const bancaKey = "petrobras_banca";
  const thinkingKey = "petrobras_thinking_level";
  const difficultyKey = "petrobras_difficulty_level";
  const profiles = {
    CESGRANRIO: { label: "Fundação Cesgranrio", format: "múltipla escolha com 5 alternativas (A a E) e uma única resposta correta", description: "Enunciados contextualizados e aplicados, com cobrança técnica equilibrada e distratores plausíveis.", instructions: "Priorize situações práticas, interpretação de cenários, aplicação de conceitos e cálculos quando pertinentes. Não use Certo ou Errado." },
    CEBRASPE: { label: "CEBRASPE", format: "julgamento de item com exatamente 2 alternativas: A) Certo e B) Errado", description: "Itens assertivos, técnicos e sensíveis a detalhes conceituais.", instructions: "Escreva afirmações independentes, precisas e tecnicamente verificáveis. Use somente Certo e Errado." },
    FGV: { label: "FGV", format: "múltipla escolha com 5 alternativas (A a E) e uma única resposta correta", description: "Casos densos, interpretação e distinções finas entre alternativas.", instructions: "Use situações-problema quando fizer sentido. Exija interpretação e aplicação, mantendo uma única melhor resposta." },
    FCC: { label: "FCC", format: "múltipla escolha com 5 alternativas (A a E) e uma única resposta correta", description: "Questões objetivas e técnicas, com redação precisa.", instructions: "Prefira cobrança direta de conceitos, normas, procedimentos e aplicação objetiva. Evite excesso de narrativa." }
  };
  const levels = {
    low: ["Baixo", "Seja direto e conciso, sem sacrificar a precisão técnica."],
    medium: ["Médio", "Equilibre contextualização, rigor técnico e objetividade."],
    high: ["Alto", "Use raciocínio analítico profundo, distinções conceituais e justificativas minuciosas."]
  };
  let engineLabel = "📦 Offline";
  let currentMode = "all";
  let currentBanca = "CESGRANRIO";
  let startedAt = null;
  let timerInterval = null;

  const get = (key, fallback = "") => { try { return localStorage.getItem(key) ?? fallback; } catch (_) { return fallback; } };
  const set = (key, value) => { try { localStorage.setItem(key, value); } catch (_) {} };
  const readArray = key => {
    try {
      const value = JSON.parse(get(key, "[]"));
      return Array.isArray(value) ? value : [];
    } catch (_) { return []; }
  };
  let currentSessionQuestions = [];
  let currentQuestionIndex = 0;
  let selectedOptionIndex = null;
  let sessionAnswers = [];
  let pastSessions = readArray(`petrobras_sessions_${subjectId}`);
  let wrongQuestions = readArray(`petrobras_wrong_${subjectId}`);
  const offlineQuestions = () => Array.isArray(window.PETROBRAS_OFFLINE_BANKS?.[subjectId]) ? window.PETROBRAS_OFFLINE_BANKS[subjectId] : [];
  const status = (message = "", type = "warning") => {
    const node = document.getElementById("setup-status");
    if (!node) return;
    node.textContent = message;
    node.className = `setup-status${message ? ` status-${type}` : " hidden"}`;
  };
  const notifyStateChanged = reason => document.dispatchEvent(new CustomEvent("petrobras:state-changed", { detail: { reason, subjectId } }));
  const applyTheme = theme => {
    const safe = theme === "light" ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", safe);
    set(themeKey, safe);
    document.getElementById("theme-icon")?.replaceChildren(document.createTextNode(safe === "dark" ? "🌙" : "☀️"));
    document.getElementById("theme-label")?.replaceChildren(document.createTextNode(safe === "dark" ? "Escuro" : "Claro"));
  };
  const toggleTheme = () => { applyTheme(document.documentElement.getAttribute("data-theme") === "dark" ? "light" : "dark"); notifyStateChanged("tema-alterado"); };
  const updateProfile = () => {
    const select = document.getElementById("banca-select");
    const node = document.getElementById("banca-profile");
    if (!select || !node) return;
    currentBanca = select.value;
    const profile = profiles[currentBanca] || profiles.CESGRANRIO;
    node.textContent = `${profile.label}: ${profile.description} Formato: ${profile.format}.`;
    set(bancaKey, currentBanca);
  };
  const setEngineUi = engine => {
    document.querySelectorAll("#engine-selector .tile-card").forEach(card => card.classList.remove("tile-selected"));
    document.querySelector(`input[name="engine"][value="${engine}"]`)?.closest(".tile-card")?.classList.add("tile-selected");
    document.getElementById("ai-config-box")?.classList.toggle("hidden", engine === "offline");
    document.getElementById("ai-pdf-panel")?.classList.toggle("hidden", engine === "offline");
    document.getElementById("specific-topics-panel")?.classList.toggle("hidden", engine !== "ai-specific");
  };
  const pdfCatalog = () => Array.isArray(window.PETROBRAS_PDF_CATALOG?.[subjectId]) ? window.PETROBRAS_PDF_CATALOG[subjectId] : [];
  const updatePdfCounter = () => {
    const all = document.querySelectorAll("#ai-pdf-list input[type=checkbox]");
    const selected = document.querySelectorAll("#ai-pdf-list input[type=checkbox]:checked");
    const node = document.getElementById("ai-pdf-count");
    if (node) node.textContent = `${selected.length} de ${all.length} PDFs selecionados`;
    const selectAll = document.getElementById("pdfs-select-all");
    if (selectAll && all.length) {
      selectAll.checked = selected.length === all.length;
      selectAll.indeterminate = selected.length > 0 && selected.length < all.length;
    }
  };
  const renderPdfSelector = () => {
    const list = document.getElementById("ai-pdf-list");
    if (!list) return;
    list.replaceChildren();
    pdfCatalog().forEach((pdf, index) => {
      const label = document.createElement("label");
      label.className = "topic-check-item pdf-check-item";
      label.dataset.pdf = `${pdf.label} ${pdf.file}`.toLocaleLowerCase("pt-BR");
      const input = document.createElement("input");
      input.type = "checkbox";
      input.value = pdf.id;
      input.checked = true;
      input.id = `pdf-${subjectId}-${index}`;
      input.addEventListener("change", updatePdfCounter);
      const text = document.createElement("span");
      text.textContent = pdf.label;
      label.append(input, text);
      list.appendChild(label);
    });
    document.getElementById("pdf-filter")?.addEventListener("input", event => {
      const search = event.target.value.trim().toLocaleLowerCase("pt-BR");
      list.querySelectorAll(".pdf-check-item").forEach(item => { item.hidden = Boolean(search) && !item.dataset.pdf.includes(search); });
    });
    document.getElementById("pdfs-select-all")?.addEventListener("change", event => {
      list.querySelectorAll("input[type=checkbox]").forEach(input => { input.checked = event.target.checked; });
      updatePdfCounter();
    });
    document.getElementById("clear-pdfs-button")?.addEventListener("click", () => {
      list.querySelectorAll("input[type=checkbox]").forEach(input => { input.checked = false; });
      const filter = document.getElementById("pdf-filter");
      if (filter) { filter.value = ""; list.querySelectorAll(".pdf-check-item").forEach(item => { item.hidden = false; }); }
      const selectAll = document.getElementById("pdfs-select-all");
      if (selectAll) { selectAll.checked = false; selectAll.indeterminate = false; }
      updatePdfCounter();
    });
    updatePdfCounter();
  };
  const selectedPdfIds = () => [...document.querySelectorAll("#ai-pdf-list input[type=checkbox]:checked")].map(input => input.value);
  const selectedPdfs = () => {
    const selectedIds = new Set(selectedPdfIds());
    return pdfCatalog().filter(pdf => selectedIds.has(pdf.id));
  };
  const selectedPdfContext = pdfs => {
    const contextMap = window.PETROBRAS_PDF_CONTEXTS?.[subjectId] || {};
    return pdfs.map(pdf => ({ ...pdf, context: contextMap[pdf.id] || {} }));
  };
  const setupTiles = selector => document.querySelectorAll(selector).forEach(radio => radio.addEventListener("change", event => {
    event.target.closest(".grid-options")?.querySelectorAll(".tile-card").forEach(card => card.classList.remove("tile-selected"));
    event.target.closest(".tile-card")?.classList.add("tile-selected");
  }));
  const setup = () => {
    applyTheme(get(themeKey, document.documentElement.getAttribute("data-theme") || "dark"));
    const apiInput = document.getElementById("api-key-input");
    if (apiInput) { apiInput.value = get(apiKeyKey); apiInput.addEventListener("input", () => set(apiKeyKey, apiInput.value.trim())); }
    const model = document.getElementById("model-select");
    const savedModel = get(modelKey);
    if (model && [...model.options].some(option => option.value === savedModel)) model.value = savedModel;
    model?.addEventListener("change", () => { set(modelKey, model.value); notifyStateChanged("modelo-alterado"); });
    const thinking = document.getElementById("thinking-level");
    const savedThinking = get(thinkingKey, "medium");
    if (thinking && [...thinking.options].some(option => option.value === savedThinking)) thinking.value = savedThinking;
    thinking?.addEventListener("change", () => { set(thinkingKey, thinking.value); notifyStateChanged("pensamento-alterado"); });
    const difficulty = document.getElementById("difficulty-level");
    const savedDifficulty = get(difficultyKey, "medium");
    if (difficulty && [...difficulty.options].some(option => option.value === savedDifficulty)) difficulty.value = savedDifficulty;
    difficulty?.addEventListener("change", () => { set(difficultyKey, difficulty.value); notifyStateChanged("dificuldade-alterada"); });
    const banca = document.getElementById("banca-select");
    const savedBanca = get(bancaKey, "CESGRANRIO");
    if (banca && [...banca.options].some(option => option.value === savedBanca)) banca.value = savedBanca;
    banca?.addEventListener("change", () => { updateProfile(); notifyStateChanged("banca-alterada"); });
    updateProfile();
    document.getElementById("theme-toggle-btn")?.addEventListener("click", toggleTheme);
    document.querySelectorAll('input[name="engine"]').forEach(radio => radio.addEventListener("change", event => setEngineUi(event.target.value)));
    setupTiles('input[name="num-questions"]');
    setupTiles('input[name="mode"]');
    renderPdfSelector();
    setEngineUi(document.querySelector('input[name="engine"]:checked')?.value || "offline");
    document.getElementById("btn-start-session")?.addEventListener("click", startSession);
    document.getElementById("btn-submit-answer")?.addEventListener("click", submitAnswer);
    document.getElementById("btn-next-question")?.addEventListener("click", nextQuestion);
    document.getElementById("btn-cancel-session")?.addEventListener("click", resetToSetup);
    document.getElementById("btn-restart-setup")?.addEventListener("click", resetToSetup);
    document.getElementById("btn-open-backup-modal")?.addEventListener("click", () => document.getElementById("backup-modal")?.classList.remove("hidden"));
    document.getElementById("btn-close-modal")?.addEventListener("click", () => document.getElementById("backup-modal")?.classList.add("hidden"));
    document.getElementById("btn-export-backup")?.addEventListener("click", exportBackup);
    document.getElementById("btn-trigger-import")?.addEventListener("click", () => document.getElementById("backup-file-input")?.click());
    document.getElementById("backup-file-input")?.addEventListener("change", importBackup);
  };
  const updateStats = () => {
    const sessionsNode = document.getElementById("stat-sessions");
    const wrongNode = document.getElementById("stat-wrong-count");
    const accuracyNode = document.getElementById("stat-accuracy");
    if (!sessionsNode || !wrongNode || !accuracyNode) return;
    sessionsNode.textContent = pastSessions.length;
    wrongNode.textContent = wrongQuestions.length;
    const total = pastSessions.reduce((sum, session) => sum + Number(session.total || 0), 0);
    const correct = pastSessions.reduce((sum, session) => sum + Number(session.correct || 0), 0);
    accuracyNode.textContent = `${total ? Math.round((correct / total) * 100) : 0}%`;
  };
  const shuffle = items => [...items].sort(() => Math.random() - 0.5);
  const normalize = (raw, fallbackBanca = currentBanca, index = 0, fromAI = false) => {
    const source = raw || {};
    const options = Array.isArray(source.options) ? source.options.map(option => typeof option === "string" ? option : String(option?.text || option?.label || "")) : [];
    const labelIndex = typeof source.correctLabel === "string" ? "ABCDE".indexOf(source.correctLabel.trim().toUpperCase()) : -1;
    const numericIndex = Number(source.correctIndex);
    const correctIndex = Number.isInteger(numericIndex) && numericIndex >= 0 && numericIndex < options.length ? numericIndex : (labelIndex >= 0 && labelIndex < options.length ? labelIndex : 0);
    let explanations = Array.isArray(source.optionExplanations) ? source.optionExplanations.map(item => String(item || "")) : [];
    if (!explanations.length && source.optionExplanations && typeof source.optionExplanations === "object") explanations = options.map((_, i) => String(source.optionExplanations[String.fromCharCode(65 + i)] || source.optionExplanations[i] || ""));
    const rawId = String(source.id || `${subjectId}-question-${index + 1}`).replace(/[^a-zA-Z0-9_-]/g, "-");
    return { ...source, id: fromAI ? `ai-${Date.now()}-${index}-${rawId}` : rawId, topic: source.topic || subjectName, banca: source.banca || fallbackBanca, statement: String(source.statement || "Enunciado não informado."), options, correctIndex, explanation: String(source.explanation || "A questão deve ser analisada conforme o conceito cobrado."), optionExplanations: explanations };
  };
  const startOffline = (count, mode, reason = "", selectedPdfRecords = []) => {
    const basePool = mode === "wrong-only" ? wrongQuestions : offlineQuestions();
    let pool = basePool;
    let scopeNote = "";
    if (selectedPdfRecords.length && mode !== "wrong-only") {
      const selectedFiles = new Set(selectedPdfRecords.map(pdf => pdf.file));
      const scopedPool = basePool.filter(question => {
        const source = question.source || {};
        const file = source.file || String(source.pdf || "").split(/[\\/]/).pop();
        return selectedFiles.has(file);
      });
      if (scopedPool.length) pool = scopedPool;
      else scopeNote = "Não havia questões offline associadas aos PDFs selecionados; o banco completo desta matéria foi usado como contingência.";
    }
    if (!pool.length) { status("Não há questões offline disponíveis para esta matéria.", "error"); return false; }
    const amount = Math.min(count, pool.length);
    const notices = [reason, scopeNote].filter(Boolean).join(" ");
    if (amount < count) status(`${notices ? `${notices} ` : ""}O banco offline possui ${pool.length} questão(ões) única(s); esta sessão será iniciada com ${amount}. Para criar ${count}, use a IA ou importe as questões do PDF.`, "warning");
    else if (notices) status(notices, "warning");
    currentSessionQuestions = shuffle(pool).slice(0, amount).map((question, i) => normalize(question, question.banca || "CEBRASPE", i));
    engineLabel = "📦 Offline";
    initQuizView();
    return true;
  };
  const startSession = () => {
    const engine = document.querySelector('input[name="engine"]:checked')?.value || "offline";
    const count = Number(document.querySelector('input[name="num-questions"]:checked')?.value || 5);
    currentMode = document.querySelector('input[name="mode"]:checked')?.value || "all";
    currentBanca = document.getElementById("banca-select")?.value || "CESGRANRIO";
    set(bancaKey, currentBanca);
    if (currentMode === "wrong-only" && !wrongQuestions.length) { status("Seu Caderno de Erros está vazio. Escolha Banco Completo para iniciar.", "error"); return; }
    if (engine === "offline") startOffline(count, currentMode);
    else generateAIQuestions(engine, count, currentMode);
  };
  const buildPrompt = (count, engine, topics, pdfContext) => {
    const profile = profiles[currentBanca] || profiles.CESGRANRIO;
    const [thinkingLabel, thinkingText] = levels[document.getElementById("thinking-level")?.value || "medium"] || levels.medium;
    const [difficultyLabel, difficultyText] = levels[document.getElementById("difficulty-level")?.value || "medium"] || levels.medium;
    const subjectTopics = engine === "ai-specific" ? topics : `todos os tópicos presentes nos PDFs selecionados`;
    const optionRule = currentBanca === "CEBRASPE" ? "options deve conter exatamente [\"Certo\", \"Errado\"]" : "options deve conter exatamente cinco alternativas como strings, na ordem A, B, C, D e E";
    const wrongContext = currentMode === "wrong-only" && wrongQuestions.length ? `\n- Caderno de Erros: revise de forma inédita estes assuntos: ${[...new Set(wrongQuestions.map(question => question.topic).filter(Boolean))].slice(0, 12).join("; ")}.` : "";
    const sourceText = pdfContext.map((pdf, index) => {
      const context = pdf.context || {};
      const topicsText = (context.topics || []).slice(0, 20).join("; ") || "não identificado";
      const excerptsText = (context.excerpts || []).slice(0, 4).map(excerpt => `p. ${excerpt.page}: ${excerpt.text}`).join(" | ") || "não disponível";
      const examplesText = (context.questionExamples || []).slice(0, 3).map(example => `${example.topic ? `[${example.topic}] ` : ""}${example.statement} Opções: ${(example.options || []).join(" | ")}`).join(" | ") || "não disponível";
      return `FONTE ${index + 1}: ${pdf.label} (${pdf.pages || "?"} páginas)\nTópicos: ${topicsText}\nTrechos: ${excerptsText}\nExemplos de questões: ${examplesText}`.slice(0, 4200);
    }).join("\n\n").slice(0, 26000);
    const selectedFiles = pdfContext.map(pdf => pdf.label).join("; ");
    const focusInstruction = engine === "ai-specific"
      ? `O foco específico digitado pelo estudante é: ${topics}. Restrinja a abordagem a esse foco dentro dos PDFs selecionados.`
      : "Não use assuntos de outros PDFs: percorra os tópicos disponíveis nos PDFs selecionados e distribua a cobertura de forma coerente.";
    return `Você é um examinador especialista da ${profile.label} para o concurso Petrobras, na matéria ${subjectName}.\n\nPERFIL DA BANCA:\n- Formato: ${profile.format}.\n- Características: ${profile.description}\n- Instruções: ${profile.instructions}\n\nFONTES SELECIONADAS:\n- ${selectedFiles}\n${sourceText}\n\nCONFIGURAÇÕES:\n- Nível de pensamento: ${thinkingLabel}. ${thinkingText}\n- Nível da questão: ${difficultyLabel}. ${difficultyText}\n- Assuntos-base: ${subjectTopics}${wrongContext}\n- ${focusInstruction}\n- Gere EXATAMENTE ${count} questões inéditas.\n\nREGRAS DE USO DAS FONTES:\n1. Baseie cada questão em conceitos sustentados pelos trechos, tópicos e exemplos das fontes acima.\n2. Não invente normas, definições ou fatos que não sejam compatíveis com o material selecionado.\n3. Os exemplos servem apenas como referência de conteúdo e estilo; não copie seus enunciados nem suas respostas.\n4. Não mencione o nome do arquivo no enunciado, salvo se isso fizer parte natural do conteúdo cobrado.\n\nREGRAS DA RESPOSTA:\n1. ${optionRule}.\n2. Cada questão tem uma única resposta correta.\n3. O enunciado deve ser claro, técnico e sem ambiguidade.\n4. explanation deve explicar diretamente por que o gabarito está correto.\n5. optionExplanations deve explicar de modo curto e direto por que cada alternativa está correta ou errada, na mesma ordem de options.\n6. Retorne somente JSON válido, sem Markdown, no formato {\"items\":[{\"id\":\"q-1\",\"topic\":\"...\",\"banca\":\"${currentBanca}\",\"statement\":\"...\",\"options\":[\"...\"],\"correctIndex\":0,\"explanation\":\"...\",\"optionExplanations\":[\"...\"]}]}. items deve conter exatamente ${count} itens.`;
  };
  const parseAI = raw => {
    const text = String(raw || "").replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "").trim();
    let parsed;
    try { parsed = JSON.parse(text); } catch (_) {
      const starts = [text.indexOf("{"), text.indexOf("[")].filter(index => index >= 0);
      const start = starts.length ? Math.min(...starts) : -1;
      const end = Math.max(text.lastIndexOf("}"), text.lastIndexOf("]"));
      if (start < 0 || end <= start) throw new Error("A IA não retornou JSON válido.");
      parsed = JSON.parse(text.slice(start, end + 1));
    }
    const items = Array.isArray(parsed) ? parsed : parsed.items || parsed.questions;
    if (!Array.isArray(items)) throw new Error("A resposta da IA não contém uma lista de questões.");
    return items;
  };
  const loading = (show, text = "") => {
    document.getElementById("loading-overlay")?.classList.toggle("hidden", !show);
    if (show) document.getElementById("loading-text").textContent = text;
    const button = document.getElementById("btn-start-session");
    if (button) button.disabled = show;
  };
  const generateAIQuestions = async (engine, count, mode) => {
    const apiKey = document.getElementById("api-key-input")?.value.trim() || get(apiKeyKey);
    const model = document.getElementById("model-select")?.value || "google/gemma-4-31b-it";
    const pdfs = selectedPdfContext(selectedPdfs());
    const topics = engine === "ai-specific" ? document.getElementById("specific-topics-input")?.value.trim() || "" : "";
    if (!pdfs.length) { status("Selecione pelo menos um PDF-base para a IA focar.", "error"); return; }
    if (engine === "ai-specific" && !topics) { status("Digite pelo menos um assunto específico para continuar.", "error"); return; }
    if (!apiKey) { startOffline(count, mode, "Nenhuma chave OpenRouter foi informada. Fallback automático ativado.", pdfs); return; }
    set(apiKeyKey, apiKey); set(modelKey, model);
    loading(true, `Gerando ${count} questões com a IA...`);
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 60000);
    try {
      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", { method: "POST", signal: controller.signal, headers: { "Authorization": `Bearer ${apiKey}`, "Content-Type": "application/json", "HTTP-Referer": "https://cassiolbx.github.io/concurso-petrobras/", "X-Title": "Concurso Petrobras - Plataforma de Estudos" }, body: JSON.stringify({ model, messages: [{ role: "user", content: buildPrompt(count, engine, topics, pdfs) }], response_format: { type: "json_object" }, temperature: 0.45, max_tokens: 16000 }) });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error?.message || `OpenRouter respondeu HTTP ${response.status}.`);
      const items = parseAI(data.choices?.[0]?.message?.content);
      if (items.length !== count) throw new Error(`A IA retornou ${items.length} questão(ões), mas eram necessárias exatamente ${count}.`);
      const normalizedItems = items.map((question, i) => normalize(question, currentBanca, i, true));
      const expectedOptions = currentBanca === "CEBRASPE" ? 2 : 5;
      const invalid = normalizedItems.find(question => question.statement.length < 30 || question.options.length !== expectedOptions || (currentBanca === "CEBRASPE" && (!/^certo$/i.test(question.options[0]) || !/^errado$/i.test(question.options[1]))) || !Number.isInteger(question.correctIndex) || question.correctIndex < 0 || question.correctIndex >= question.options.length || question.explanation.length < 20 || question.optionExplanations.length !== question.options.length);
      if (invalid) throw new Error(`A IA retornou uma questão fora do formato da banca ${currentBanca}.`);
      currentSessionQuestions = normalizedItems;
      const modelLabels = { "google/gemma-4-31b-it": "Gemma 4 31B", "deepseek/deepseek-v4-flash-0731": "DeepSeek V4 Flash", "xiaomi/mimo-v2.5": "Xiaomi MiMo V2.5" };
      engineLabel = `🤖 ${modelLabels[model] || model}`;
      loading(false); status(`Sessão criada com exatamente ${currentSessionQuestions.length} questões.`, "success"); initQuizView();
    } catch (error) {
      loading(false);
      const detail = error?.name === "AbortError" ? "A IA demorou mais de 60 segundos para responder." : `A IA não pôde gerar as questões (${error.message}).`;
      startOffline(count, mode, `${detail} Fallback automático ativado.`, pdfs);
    } finally { clearTimeout(timeout); }
  };
  const formatDuration = total => {
    const seconds = Math.max(0, Number(total) || 0);
    const hours = Math.floor(seconds / 3600), minutes = Math.floor((seconds % 3600) / 60), remainder = seconds % 60;
    return hours ? `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(remainder).padStart(2, "0")}` : `${String(minutes).padStart(2, "0")}:${String(remainder).padStart(2, "0")}`;
  };
  const updateTimer = () => { document.getElementById("timer-display").textContent = `⏱️ ${formatDuration(startedAt ? Math.floor((Date.now() - startedAt) / 1000) : 0)}`; };
  const startTimer = () => { clearInterval(timerInterval); startedAt = Date.now(); updateTimer(); timerInterval = setInterval(updateTimer, 1000); };
  const stopTimer = () => { const elapsed = startedAt ? Math.floor((Date.now() - startedAt) / 1000) : 0; clearInterval(timerInterval); timerInterval = null; return elapsed; };
  const initQuizView = () => {
    if (!currentSessionQuestions.length) return;
    currentQuestionIndex = 0; sessionAnswers = [];
    document.getElementById("view-setup").classList.add("hidden"); document.getElementById("view-results").classList.add("hidden"); document.getElementById("view-quiz").classList.remove("hidden");
    startTimer(); renderQuestion();
  };
  const renderQuestion = () => {
    selectedOptionIndex = null; document.getElementById("btn-submit-answer").disabled = true; document.getElementById("btn-submit-answer").classList.remove("hidden"); document.getElementById("btn-next-question").classList.add("hidden"); document.getElementById("feedback-banner").classList.add("hidden");
    const question = currentSessionQuestions[currentQuestionIndex];
    document.getElementById("badge-topic").textContent = question.topic; document.getElementById("badge-difficulty").textContent = question.banca; document.getElementById("badge-engine").textContent = engineLabel; document.getElementById("counter-display").textContent = `Questão ${currentQuestionIndex + 1} de ${currentSessionQuestions.length}`; document.getElementById("progress-bar-fill").style.width = `${((currentQuestionIndex + 1) / currentSessionQuestions.length) * 100}%`; document.getElementById("question-statement").textContent = question.statement;
    const container = document.getElementById("options-container"); container.replaceChildren();
    question.options.forEach((option, index) => { const card = document.createElement("div"); card.className = "option-card"; card.tabIndex = 0; card.setAttribute("role", "button"); card.setAttribute("aria-label", `Alternativa ${String.fromCharCode(65 + index)}: ${option}`); const tag = document.createElement("div"); tag.className = "option-tag"; tag.textContent = String.fromCharCode(65 + index); const text = document.createElement("div"); text.textContent = option; card.append(tag, text); card.addEventListener("click", () => selectOption(index)); card.addEventListener("keydown", event => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); selectOption(index); } }); container.appendChild(card); });
  };
  const selectOption = index => { selectedOptionIndex = index; document.querySelectorAll("#options-container .option-card").forEach((card, i) => card.classList.toggle("option-selected", i === index)); document.getElementById("btn-submit-answer").disabled = false; };
  const feedback = question => `${question.explanation}\n\nAnálise direta das alternativas:\n${question.options.map((option, index) => `${String.fromCharCode(65 + index)}) ${option} — ${question.optionExplanations[index] || (index === question.correctIndex ? "É o gabarito porque corresponde ao enunciado." : "Está errada porque não atende ao conceito cobrado.")}`).join("\n")}`;
  const submitAnswer = () => {
    if (selectedOptionIndex === null) return;
    const question = currentSessionQuestions[currentQuestionIndex], correct = selectedOptionIndex === question.correctIndex;
    sessionAnswers.push({ question, selected: selectedOptionIndex, isCorrect: correct });
    document.querySelectorAll("#options-container .option-card").forEach((card, i) => { card.style.pointerEvents = "none"; if (i === question.correctIndex) card.classList.add("option-correct"); if (i === selectedOptionIndex && !correct) card.classList.add("option-wrong"); });
    if (!correct && !wrongQuestions.some(item => item.id === question.id)) wrongQuestions.push(question);
    if (correct) wrongQuestions = wrongQuestions.filter(item => item.id !== question.id);
    set(`petrobras_wrong_${subjectId}`, JSON.stringify(wrongQuestions));
    notifyStateChanged("resposta-registrada");
    const banner = document.getElementById("feedback-banner"); banner.classList.remove("hidden", "feedback-correct", "feedback-wrong"); banner.classList.add(correct ? "feedback-correct" : "feedback-wrong"); document.getElementById("feedback-title").textContent = correct ? "✅ Resposta correta!" : "❌ Resposta incorreta!"; document.getElementById("feedback-explanation").textContent = feedback(question); document.getElementById("btn-submit-answer").classList.add("hidden"); document.getElementById("btn-next-question").classList.remove("hidden"); updateStats();
  };
  const nextQuestion = () => { currentQuestionIndex += 1; currentQuestionIndex < currentSessionQuestions.length ? renderQuestion() : finishSession(); };
  const finishSession = () => {
    const durationSeconds = stopTimer(), total = sessionAnswers.length, correct = sessionAnswers.filter(answer => answer.isCorrect).length, accuracy = total ? Math.round((correct / total) * 100) : 0;
    pastSessions.push({ date: new Date().toISOString(), total, correct, accuracy, durationSeconds, banca: currentBanca, engine: engineLabel }); set(`petrobras_sessions_${subjectId}`, JSON.stringify(pastSessions)); updateStats();
    notifyStateChanged("sessao-finalizada");
    document.getElementById("res-total").textContent = total; document.getElementById("res-correct").textContent = correct; document.getElementById("res-wrong").textContent = total - correct; document.getElementById("res-accuracy").textContent = `${accuracy}%`; document.getElementById("res-time").textContent = formatDuration(durationSeconds); document.getElementById("view-quiz").classList.add("hidden"); document.getElementById("view-results").classList.remove("hidden");
  };
  const resetToSetup = () => { stopTimer(); document.getElementById("view-quiz").classList.add("hidden"); document.getElementById("view-results").classList.add("hidden"); document.getElementById("view-setup").classList.remove("hidden"); };
  const downloadLocalBackup = () => { const data = { materia: subjectId, timestamp: new Date().toISOString(), pastSessions, wrongQuestions, settings: { banca: currentBanca, model: document.getElementById("model-select")?.value, thinking: document.getElementById("thinking-level")?.value, difficulty: document.getElementById("difficulty-level")?.value } }; const url = URL.createObjectURL(new Blob([JSON.stringify(data, null, 2)], { type: "application/json" })); const link = document.createElement("a"); link.href = url; link.download = `backup-${subjectId}-${new Date().toISOString().slice(0, 10)}.json`; link.click(); setTimeout(() => URL.revokeObjectURL(link.href), 1000); };
  const exportBackup = () => { if (globalThis.PetrobrasDriveSync?.downloadLocal) globalThis.PetrobrasDriveSync.downloadLocal(); else downloadLocalBackup(); };
  const importBackup = event => { const file = event.target.files?.[0]; if (!file) return; const reader = new FileReader(); reader.onload = loadEvent => { try { const data = JSON.parse(loadEvent.target.result); if (data.schemaVersion === 2 && data.state?.subjects && globalThis.PetrobrasDriveSync?.importData) { globalThis.PetrobrasDriveSync.importData(data); status("Backup completo importado. A página será atualizada.", "success"); setTimeout(() => location.reload(), 700); } else { if (!Array.isArray(data.pastSessions) && !Array.isArray(data.wrongQuestions)) throw new Error("O arquivo não possui um backup reconhecido."); if (Array.isArray(data.pastSessions)) pastSessions = data.pastSessions; if (Array.isArray(data.wrongQuestions)) wrongQuestions = data.wrongQuestions; set(`petrobras_sessions_${subjectId}`, JSON.stringify(pastSessions)); set(`petrobras_wrong_${subjectId}`, JSON.stringify(wrongQuestions)); updateStats(); notifyStateChanged("backup-importado"); status("Backup importado com sucesso.", "success"); document.getElementById("backup-modal")?.classList.add("hidden"); } } catch (error) { status(`Não foi possível importar o backup: ${error.message}`, "error"); } event.target.value = ""; }; reader.readAsText(file); };

  globalThis.updateHeaderStats = updateStats;
  globalThis.setupEventListeners = setup;
  globalThis.toggleTheme = toggleTheme;
  globalThis.startSession = startSession;
  globalThis.generateAIQuestions = generateAIQuestions;
  globalThis.showLoading = loading;
  globalThis.initQuizView = initQuizView;
  globalThis.renderQuestion = renderQuestion;
  globalThis.selectOption = selectOption;
  globalThis.submitAnswer = submitAnswer;
  globalThis.nextQuestion = nextQuestion;
  globalThis.finishSession = finishSession;
  globalThis.resetToSetup = resetToSetup;
  globalThis.exportBackup = exportBackup;
  globalThis.importBackup = importBackup;
  document.addEventListener("DOMContentLoaded", () => { updateStats(); setup(); });
})();

