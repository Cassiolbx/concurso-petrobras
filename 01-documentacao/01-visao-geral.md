# Concurso Petrobras — visão geral

## Objetivo

Esta é uma plataforma local de estudos para o cargo de Analista de Sistemas — Processos de Negócios. Ela reúne sete matérias do edital em páginas HTML independentes, com uma base de questões offline, geração de questões pela OpenRouter, seleção de banca, timer, explicações e sincronização opcional do progresso.

## Matérias

As páginas que permanecem na raiz do projeto são:

| Matéria | Página |
| --- | --- |
| Raciocínio Lógico-Matemático | `raciocinio-logico.html` |
| Língua Inglesa | `ingles.html` |
| Segurança da Informação | `seguranca-informacao.html` |
| Governança de TI | `governanca-ti.html` |
| Língua Portuguesa | `portugues.html` |
| Engenharia de Software | `engenharia-software.html` |
| Banco de Dados | `banco-dados.html` |

## Ordem recomendada de leitura

1. Este documento, para entender o produto e as decisões principais.
2. [`02-fontes-e-inventario.md`](02-fontes-e-inventario.md), para conhecer os PDFs usados como fonte.
3. [`03-processamento-e-banco-offline.md`](03-processamento-e-banco-offline.md), para entender a extração e a cobertura.
4. [`04-arquitetura-e-codigo.md`](04-arquitetura-e-codigo.md), para localizar cada parte do código.
5. [`05-motor-ia-e-bancas.md`](05-motor-ia-e-bancas.md), para entender a geração por IA.
6. [`06-backup-e-sincronizacao.md`](06-backup-e-sincronizacao.md), para operar o progresso entre dispositivos.
7. [`07-testes-e-qualidade.md`](07-testes-e-qualidade.md), para conhecer as verificações existentes e seus limites.
8. [`08-historico-de-desenvolvimento.md`](08-historico-de-desenvolvimento.md), para consultar decisões e incidentes anteriores.
9. [`09-deploy-e-github-pages.md`](09-deploy-e-github-pages.md), somente quando a publicação no GitHub Pages for retomada.

## Funcionalidades atuais

- banco interno offline por matéria;
- modos Banco Completo, Caderno de Erros, Motor AI e Assuntos Específicos (AI);
- seleção de 5, 10, 15, 20, 25 ou 30 questões;
- timer funcional por sessão;
- explicação do gabarito e indicação direta do erro nas demais alternativas;
- Fundação Cesgranrio, CEBRASPE, FGV e FCC;
- modelos `google/gemma-4-31b-it`, `deepseek/deepseek-v4-flash-0731` e `xiaomi/mimo-v2.5`;
- nível de pensamento e dificuldade baixo, médio ou alto;
- preferência de tema e chave da OpenRouter persistidas no navegador;
- contexto estruturado de PDFs para a IA;
- backup JSON local e integração configurada com o Google Drive.

## Limites importantes

Os PDFs originais não são enviados integralmente ao navegador nem à API. O projeto gera catálogo, tópicos, trechos representativos e exemplos de questões. O banco offline contém as questões extraídas e normalizadas que passaram pelos critérios automatizados; a fila de revisão continua preservada para conferência de qualidade. Portanto, a matriz de cobertura deve ser consultada antes de afirmar que determinado PDF está totalmente coberto.

Esta reorganização é documental e local. Nenhum deploy ou publicação será feito nesta etapa.

