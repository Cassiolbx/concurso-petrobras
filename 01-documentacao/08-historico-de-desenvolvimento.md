# Histórico de desenvolvimento

Este documento preserva as decisões e ocorrências relevantes registradas durante a construção da plataforma. Ele é histórico: não substitui os guias atuais de arquitetura, IA, backup ou testes.

## Evolução principal

- criação das sete páginas HTML e do hub `index.html`;
- centralização do comportamento em JavaScript compartilhado;
- persistência do tema e da chave da OpenRouter no navegador;
- seleção de banca, níveis de pensamento e dificuldade;
- inclusão dos modelos Gemma, DeepSeek e MiMo;
- organização dos PDFs em inventário, contextos e banco offline;
- fallback para estudo sem API;
- timer, caderno de erros, resultados e explicações;
- integração de backup JSON local e Google Drive;
- ajustes responsivos para quantidade de questões e painéis de seleção.

## Lições preservadas

Arquivos HTML grandes devem ser tratados como arquivos completos durante sincronizações e revisões. Alterações parciais ou stubs podem remover scripts e quebrar as páginas. Em Windows, operações Git que dependam de credenciais gráficas podem travar quando executadas em segundo plano; sempre verifique o estado local antes de qualquer sincronização externa.

## Estado desta reorganização

O projeto não foi publicado nem enviado ao GitHub nesta etapa. A estrutura foi reorganizada para facilitar leitura e manutenção, e o guia específico de deploy foi separado como último documento para ser revisado somente quando a publicação for solicitada.

