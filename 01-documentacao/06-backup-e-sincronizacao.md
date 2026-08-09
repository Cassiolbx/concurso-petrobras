# Backup e sincronização com Google Drive

## Estado atual

A integração usa Google Identity Services e a API do Drive diretamente no navegador. O Composio foi útil para localizar e validar a pasta oficial; a execução do backup ocorre no próprio site com OAuth Web.

Pasta configurada:

- nome: **Concurso Petrobras — Backups**;
- ID: `1uTXUC6Q2v9pJ0BJ2FInWQGw4ugT-5OyF`;
- arquivo principal: `concurso-petrobras-backup.json`;
- escopo: `drive.file`, limitado aos arquivos criados ou usados pela aplicação.

O arquivo de configuração fica em [`../04-codigo-fonte/js/integrations/google-drive-config.js`](../04-codigo-fonte/js/integrations/google-drive-config.js). O Client ID OAuth Web é público por natureza; Client Secret, token e chave da OpenRouter não devem ser colocados no projeto.

## Uso no dia a dia

1. No primeiro dispositivo, conecte a conta Google e autorize o acesso.
2. Estude normalmente.
3. Use **Backup e sincronização** para enviar o progresso quando quiser.
4. No outro dispositivo, conecte a mesma conta e use **Sincronizar** para trazer a cópia mais recente.
5. Ao terminar nesse dispositivo, faça novo backup.

O modo automático é opcional: depois de uma alteração, aguarda aproximadamente 30 segundos antes de tentar enviar. Ainda é necessário conectar cada navegador/dispositivo pelo menos uma vez. A sincronização não mescla duas respostas diferentes automaticamente; em caso de conflito, o site interrompe a operação e pede uma decisão explícita.

## O que é salvo

O JSON reúne progresso das sete matérias, respostas, caderno de erros, configurações não sensíveis, revisão, data/hora, dispositivo e hash do conteúdo. O sistema usa salvamento incremental por revisão/hash para evitar uploads desnecessários e mantém cópias históricas quando o backup manual é realizado.

Não são enviados: a chave da OpenRouter, os Client Secrets, os PDFs, o banco offline e os contextos da IA, que continuam sendo arquivos do próprio projeto.

## Cópia local e restauração

O botão de baixar JSON é uma segunda camada de segurança para guardar uma cópia fora do Drive. O arquivo pode ser restaurado pelo botão de restauração. Antes de restaurar, confirme a data/hora para não substituir um progresso local mais novo.

## Quando consultar este documento

Use-o para a operação cotidiana da integração já configurada. A revisão específica de deploy, origens autorizadas e funcionamento no GitHub Pages deve ser feita junto com o guia 9 quando a publicação for realmente retomada.

