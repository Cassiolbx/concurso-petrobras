# 🌐 Guia de Deploy, GitHub Pages e Backup Google Drive

Este guia apresenta o passo a passo de publicação no **GitHub Pages**, configuração da página inicial Hub (`index.html`), sistema de backup com o **Google Drive** e soluções para o terminal Windows.

---

## 🚀 1. Passo a Passo de Deploy no GitHub Pages

1. **Repositório Público no GitHub**:
   - Crie um repositório público (ex: `concurso-petrobras`).
   - Certifique-se de enviar os arquivos HTML e a página inicial `index.html` para o branch `main`.

2. **Ativação da Hospedagem Gratuita**:
   - No GitHub, acesse a aba **Settings** (Configurações).
   - Na barra lateral esquerda, clique em **Pages**.
   - Em **Build and deployment -> Source**, selecione **Deploy from a branch**.
   - Em **Branch**, selecione `main` e a pasta `/ (root)`.
   - Clique em **Save**.
   - A página ficará disponível em alguns instantes na URL:
     `https://<seu-usuario>.github.io/<nome-do-repositorio>/`

---

## 🏠 2. Estrutura da Página Hub (`index.html`)

A página `index.html` funciona como o portal principal unificando o acesso às matérias com cartões responsivos, badges, estatísticas gerais e alternador de temas:

```html
<!DOCTYPE html>
<html lang="pt-BR" data-theme="dark">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Plataforma de Estudos — Concurso Petrobras</title>
</head>
<body>
  <!-- Cabeçalho com ícones e estatísticas -->
  <!-- Grid de cartões para cada matéria -->
  <!-- Cada cartão redireciona para <materia>.html -->
</body>
</html>
```

---

## ☁️ 3. Backup e sincronização com Google Drive

### 🔄 Como funciona

O projeto agora possui sincronização com a pasta **Concurso Petrobras — Backups**. O arquivo principal reúne o progresso das sete matérias, registra revisão, data/hora, dispositivo e hash do conteúdo.

Na primeira utilização, informe o Client ID OAuth Web do Google em `js/integrations/google-drive-config.js` ou no painel de configuração do backup. Depois clique em `Conectar Google Drive` e autorize o acesso restrito aos arquivos usados pelo aplicativo.

### Uso no dia a dia

1. Termine uma sessão no PC e clique em `Fazer backup no Drive`.
2. Abra a plataforma no celular e clique em `Sincronizar`.
3. Estude no celular e faça novo backup antes de sair.
4. No retorno ao PC, sincronize novamente.

O backup automático é opcional. Quando ativado, alterações de respostas e sessões aguardam 30 segundos antes do envio, evitando muitos uploads durante o estudo.

### Proteção contra conflitos

Se o PC e o celular tiverem alterações diferentes desde a última sincronização, o sistema interrompe o envio e informa o conflito. A restauração exige confirmação para evitar sobrescrever o progresso local sem intenção.

### Cópia local

O botão `Baixar cópia local (.json)` continua disponível para situações sem internet ou sem autorização do Google. O arquivo completo pode ser restaurado pelo botão `Restaurar por arquivo JSON`.

### O que o backup não contém

- a chave da OpenRouter, por segurança;
- os PDFs, o banco offline e os contextos de IA, que fazem parte do próprio projeto;
- uma mesclagem automática de respostas diferentes na mesma questão.

---

## 💻 4. Resolução de Problemas no Terminal Windows (PowerShell)

### ⚠️ Erro com operador `&&` no PowerShell:
No PowerShell do Windows, o separador `&&` não funciona por padrão e retorna erro de token.

- **Incorreto**: `git add . && git commit -m "feat: publicar" && git push`
- **Correto (PowerShell)**: `git add .; git commit -m "feat: publicar"; git push`

### 📦 Limite de Payload em Pushes do Composio MCP:
Ao enviar vários arquivos HTML grandes (1600+ linhas cada) de uma vez via API de MCP do Composio, divida o commit em **sub-lotes ou arquivo por arquivo** para não ultrapassar o limite de tokens da mensagem (`65.536 tokens`) nem causar truncamento de conteúdo.

---

## 🛑 5. Lições Aprendidas & Post-Mortem de Incidentes de Deploy

### 🔴 Incidente: Travamento de Push e Sobrescrita por Stubs Incompletos
- **Causa Raiz**: O comando `git push` rodando em segundo plano no PowerShell do Windows trava aguardando interação gráfica do *Windows Credential Manager*. Ao tentar desfazer a trava no Git sincronizando com a nuvem antes de subir a versão local completa, o `git reset --hard` puxou versos truncados do repositório remoto, sobrescrevendo o código completo de 1968 linhas no disco local.
- **Solução Aplicada**:
  1. **Resgate com Reflog**: Identificação do commit local íntegro (`94e0a14`) via `git reflog` e restauração com `git reset --hard 94e0a14`.
  2. **Push Individual via Composio**: Utilização da ferramenta MCP Composio (`GITHUB_COMMIT_MULTIPLE_FILES`) para enviar os 7 arquivos de 1968 linhas um a um separadamente.
  3. **Alinhamento do Workspace**: Sincronização final do repositório local com `git fetch origin; git reset --hard origin/main`.

### 🛡️ Regras de Ouro para Futuras Execuções:
1. **Jamais rodar `git push` nativo em background no Windows**: O Git no Windows exige login/credenciais gráficas que paralisam o processo em segundo plano.
2. **Utilizar sempre o Composio MCP para enviar alterações ao GitHub**: A ferramenta MCP realiza o commit via API REST do GitHub de forma assíncrona e imune ao Credential Manager.
3. **Pushes de arquivos grandes devem ser individuais**: Quando os arquivos superarem 1500 linhas (~70KB), envie cada arquivo em uma chamada separada do Composio para evitar truncamento por tamanho de payload.
4. **Recuperação de Emergência**: Em caso de perda acidental de alterações não commitadas, consulte o `git reflog` antes de fazer qualquer nova alteração.

