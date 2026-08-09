# Processamento dos PDFs e banco offline

## Pipeline

```text
PDFs
  → inventário e amostra textual
  → extração de páginas, tópicos e candidatos
  → normalização e deduplicação
  → matriz de cobertura
  → banco offline + fila de revisão
  → catálogo e contexto compacto para a IA
```

Os scripts ficam em [`../05-automacao/scripts/`](../05-automacao/scripts/):

- `inventory_pdfs.py`: inventário das fontes;
- `extract_governanca.py`: projeto-piloto de Governança de TI;
- `process_pdf_batches.py`: processamento por lotes, matriz e bancos;
- `generate_pdf_contexts.py`: catálogo e contexto consumidos no navegador;
- `test_final.js`: verificações finais da aplicação.

## Cobertura registrada

A matriz atual está em [`../03-dados-extraidos/Dados-Extraidos/matriz-cobertura.md`](../03-dados-extraidos/Dados-Extraidos/matriz-cobertura.md) e registra:

- 58 PDFs e 4.965 páginas;
- 4.907 páginas com texto útil na amostra;
- 4.038 candidatos de questões;
- 2.951 candidatos únicos após deduplicação;
- 1.033 questões no banco offline;
- 1.918 registros mantidos para revisão.

Por matéria, a matriz deve ser a referência para saber o que já foi aproveitado e o que ainda exige verificação. Ela evita a falsa impressão de que apenas colocar um PDF na pasta significa ter todas as questões dele prontas no modo offline.

## Banco offline

O banco offline global e os bancos por matéria são dados gerados. Eles preservam, quando disponível, enunciado, alternativas, gabarito, explicação, tópico, PDF de origem e página. O aplicativo prioriza registros associados aos PDFs selecionados; se não houver registros vinculados, informa a limitação e usa o banco completo da matéria.

O banco é apropriado para estudar sem API e para fallback quando a IA falha. A fila de revisão não deve ser tratada como gabarito definitivo sem conferência no PDF.

## Atualização segura

Quando novos PDFs forem adicionados ou um arquivo for renomeado, execute novamente o inventário, o processamento e a geração de contexto na ordem indicada. Depois valide os JSONs, o banco e as sete páginas HTML. Não edite manualmente os arquivos gerados para corrigir uma fonte: corrija o processamento ou o PDF de origem e regenere.

