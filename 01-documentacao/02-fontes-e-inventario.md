# Fontes e inventário dos PDFs

## Localização

Os PDFs originais estão em [`../02-fontes-pdf/PDFs/`](../02-fontes-pdf/PDFs/), separados por matéria. Os nomes numerados dos arquivos são usados para o estudante selecionar o material-base da IA; não devem ser alterados sem regenerar o catálogo e os contextos.

## Inventário atual

O inventário registrado em [`../03-dados-extraidos/Dados-Extraidos/inventario-pdfs.md`](../03-dados-extraidos/Dados-Extraidos/inventario-pdfs.md) contém:

- 58 PDFs;
- 4.965 páginas;
- aproximadamente 208,02 MB;
- amostra textual disponível em todos os arquivos verificados;
- nenhuma amostra classificada como PDF totalmente escaneado.

| Matéria | PDFs | Páginas |
| --- | ---: | ---: |
| Banco de Dados | 11 | 1.204 |
| Engenharia de Software | 10 | 594 |
| Governança de TI | 3 | 502 |
| Língua Inglesa | 8 | 459 |
| Língua Portuguesa | 15 | 981 |
| Raciocínio Lógico-Matemático | 5 | 493 |
| Segurança da Informação | 6 | 732 |

## O que é gerado a partir das fontes

- `inventario-pdfs.json` e `inventario-pdfs.md`: quantidade, páginas, tamanho e qualidade textual;
- `pdf-catalog.json`: identificação, nome e matéria de cada PDF;
- `pdf-contexts.json`: tópicos, trechos e exemplos de referência;
- arquivos por matéria com páginas, tópicos, candidatos e banco offline.

Todos esses artefatos ficam em [`../03-dados-extraidos/Dados-Extraidos/`](../03-dados-extraidos/Dados-Extraidos/). A origem é sempre o PDF, e não o nome do arquivo isoladamente.

## Regra de qualidade

Um PDF selecionado na interface limita a fonte de contexto, mas não substitui a leitura do conteúdo. A IA recebe o contexto estruturado produzido pelo processamento. Quando a extração encontrar exercício, gabarito ou tópico duvidoso, o registro deve permanecer na fila de revisão em vez de ser promovido automaticamente para o banco offline.

