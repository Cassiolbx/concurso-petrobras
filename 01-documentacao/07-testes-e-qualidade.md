# Testes e qualidade

## Escopo validado

O teste automatizado em [`../05-automacao/scripts/test_final.js`](../05-automacao/scripts/test_final.js) verifica:

- carregamento do banco offline, catálogo e contextos;
- referência única aos arquivos compartilhados em cada HTML;
- remoção de scripts legados;
- existência única do seletor de PDFs;
- ordem do campo de assuntos específicos antes do painel de PDFs;
- presença do botão de limpar filtro;
- presença do modelo Xiaomi;
- existência de banco offline não vazio para as sete matérias.

Os JSONs de inventário, matriz, catálogo e bancos também devem ser válidos antes de gerar os arquivos JavaScript consumidos pelo navegador.

## Critérios funcionais

Em uma revisão manual, confirme:

1. o tema continua após recarregar a página;
2. a chave OpenRouter reaparece no mesmo navegador;
3. cada quantidade cria exatamente 5, 10, 15, 20, 25 ou 30 questões;
4. o timer inicia, atualiza e para ao terminar a sessão;
5. o gabarito e a explicação aparecem para a correta e para as demais alternativas;
6. o fallback offline funciona quando a API é interrompida;
7. o modo específico usa PDFs selecionados e o texto digitado;
8. o backup e a sincronização preservam a revisão sem sobrescrever conflitos silenciosamente;
9. os painéis e cartões continuam utilizáveis em notebook e celular.

## Ambiente de teste

O script possui uma simulação mínima do navegador, incluindo agora o `CustomEvent` usado pela notificação de estado do aplicativo. Isso permite verificar o fluxo principal sem depender de um navegador aberto. A validação manual continua necessária para conferir layout, OAuth e comportamento em telas reais.

## Qualidade do conteúdo

O banco offline e os contextos são derivados dos PDFs, mas a extração automática não substitui a conferência humana de gabaritos, alternativas e páginas de origem. A fila de revisão em `Dados-Extraidos` deve ser trabalhada antes de tratar todo candidato como material definitivo.

