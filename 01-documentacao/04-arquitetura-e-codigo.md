# Arquitetura e organização do código

## Visão técnica

A aplicação é estática: HTML, CSS e JavaScript sem framework de build obrigatório. Cada matéria tem uma página HTML própria, enquanto o comportamento compartilhado fica em [`../04-codigo-fonte/js/`](../04-codigo-fonte/js/).

```text
HTML da matéria
  → dados gerados (banco, catálogo e contextos)
  → app-core.js
  → OpenRouter ou banco offline
  → sessão, timer, gabarito e progresso local
```

## Principais arquivos

- `app-core.js`: estado, telas, seleção, sessão, timer, IA, fallback, tema e armazenamento local;
- `offline-banks.js`: questões offline geradas por matéria;
- `pdf-catalog.js`: catálogo dos PDFs disponíveis para seleção;
- `pdf-contexts.js`: tópicos, trechos e exemplos usados no prompt;
- `integrations/google-drive-config.js`: Client ID, pasta e escopo do Drive;
- `integrations/google-drive-sync.js`: autenticação no navegador, backup, restauração e sincronização.

## Telas e fluxo

As páginas alternam entre três estados principais:

1. configuração da sessão;
2. resolução das questões;
3. resultado e revisão.

Na configuração, o estudante escolhe motor, banca, quantidade, níveis, PDFs e assuntos específicos. No modo **Assuntos Específicos (AI)**, o campo de texto vem antes do seletor de PDFs: o texto define o foco fino e os PDFs definem a base documental.

## Persistência local

As chaves principais usadas pelo núcleo são:

| Chave | Finalidade |
| --- | --- |
| `petrobras_theme` | preferência de tema claro/escuro |
| `petrobras_openrouter_api_key` | chave informada no formulário |
| `petrobras_openrouter_model` | modelo selecionado |
| `petrobras_banca` | banca selecionada |
| `petrobras_thinking_level` | nível de pensamento |
| `petrobras_difficulty_level` | dificuldade da questão |

O progresso, respostas e caderno de erros também são armazenados localmente para permitir estudo sem conta. A chave da OpenRouter não é incluída no backup do Drive.

## Quantidade e timer

As opções são 5, 10, 15, 20, 25 e 30 questões. A sessão cria a quantidade escolhida, mostra o progresso, inicia o timer e finaliza com acertos, percentual, tempo, gabarito e explicação das alternativas.

## Responsividade

Os controles de seleção de quantidade usam duas colunas em telas maiores e se reorganizam em uma coluna em telas estreitas. Os painéis de assunto e PDF têm rolagem própria para não ampliar excessivamente a tela do notebook ou do celular. Os HTML permanecem na raiz para manter os links diretos e a hospedagem estática simples.

