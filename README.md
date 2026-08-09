# 🇧🇷 Concurso Petrobras — Plataforma de Estudos Interativa

> **Cargo**: Analista de Sistemas — Processos de Negócios  
> **Acesso Online (GitHub Pages)**: [https://cassiolbx.github.io/concurso-petrobras/](https://cassiolbx.github.io/concurso-petrobras/)

Plataforma de estudos composta por **7 páginas HTML** (1 por matéria do edital), com banco offline, núcleo local compartilhado, geração via OpenRouter, backup e sincronização versionada em JSON com o Google Drive, modo escuro/claro e suporte às 4 bancas examinadoras (**Fundação Cesgranrio, CEBRASPE, FGV e FCC**).

## 📚 Documentação em ordem de leitura

1. [Visão geral](01-documentacao/01-visao-geral.md)
2. [Fontes e inventário dos PDFs](01-documentacao/02-fontes-e-inventario.md)
3. [Processamento e banco offline](01-documentacao/03-processamento-e-banco-offline.md)
4. [Arquitetura e código](01-documentacao/04-arquitetura-e-codigo.md)
5. [Motor de IA e bancas](01-documentacao/05-motor-ia-e-bancas.md)
6. [Backup e sincronização](01-documentacao/06-backup-e-sincronizacao.md)
7. [Testes e qualidade](01-documentacao/07-testes-e-qualidade.md)
8. [Histórico de desenvolvimento](01-documentacao/08-historico-de-desenvolvimento.md)
9. [Deploy, GitHub Pages e Backup Google Drive](01-documentacao/09-deploy-e-github-pages.md) — revisar somente quando a publicação for retomada.

---

## 📂 Matérias e Links Diretos

| Matéria | Aplicação Online | Tópicos Principais |
| :--- | :--- | :--- |
| 🧠 **Raciocínio Lógico** | [Acessar Lógica](raciocinio-logico.html) | Proposições, Equivalências, Tabela Verdade, Diagramas de Venn |
| 🌐 **Língua Inglesa** | [Acessar Inglês](ingles.html) | Interpretação de Texto Técnico, Phrasal Verbs, Tempos Verbais |
| 🛡️ **Segurança da Informação** | [Acessar Segurança](seguranca-informacao.html) | Criptografia, Assinatura Digital, Malwares, ISO 27001/2 |
| ⚙️ **Governança de TI** | [Acessar Governança](governanca-ti.html) | ITIL v4, COBIT 2019, PMBOK 6ª/7ª ed., LGPD (Lei 13.709) |
| 📖 **Língua Portuguesa** | [Acessar Português](portugues.html) | Gramática, Regência Verbal/Nominal, Crase, Concordância |
| 💻 **Engenharia de Software** | [Acessar Eng. Software](engenharia-software.html) | Scrum, Kanban, Requisitos, UML, Design Patterns GoF, Testes |
| 🛢️ **Banco de Dados** | [Acessar Banco de Dados](banco-dados.html) | SQL (DDL/DML/DCL), Modelagem ER, Normalização, ACID, NoSQL |

---

## ⚡ Recursos Principais

- **📦 Banco Interno Offline**: Questões pré-carregadas para estudo imediato sem internet.
- **🤖 Motor IA (OpenRouter API)**: Geração de quantidade exata de questões via `google/gemma-4-31b-it`, `deepseek/deepseek-v4-flash-0731` ou `xiaomi/mimo-v2.5`, com seleção de um ou mais PDFs-base.
- **📄 Contexto dos PDFs**: A IA recebe tópicos, trechos estruturados e exemplos de questões dos PDFs selecionados; o campo de assunto específico serve apenas para o foco digitado pelo estudante.
- **🏛️ Perfil de Banca**: Prompts específicos para Fundação Cesgranrio, CEBRASPE, FGV e FCC.
- **⏱️ Sessões completas**: Timer, gabarito, explicação geral e análise direta de todas as alternativas.
- **☁️ Backup e sincronização no Google Drive**: Usa a pasta oficial `Concurso Petrobras — Backups` para sincronizar o progresso no celular, tablet e PC, com backup manual, automático opcional e proteção contra conflitos.
- **🎨 Design System Responsivo**: Ícones vetoriais SVG exclusivos e alternador de tema Claro / Escuro.

