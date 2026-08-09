# Motor de IA, bancas e contexto

## Modelos disponíveis

O usuário pode escolher na OpenRouter:

1. `deepseek/deepseek-v4-flash-0731` — recomendado para questões técnicas, análise profunda e explicações mais rigorosas;
2. `google/gemma-4-31b-it` — recomendado para equilíbrio entre clareza, velocidade e custo;
3. `xiaomi/mimo-v2.5` — alternativa para variar o modelo e comparar resultados.

O ranking é uma recomendação operacional, não uma garantia de que um modelo sempre acertará mais. O conteúdo do PDF, a banca e a validação humana continuam sendo decisivos.

## Níveis

- **Pensamento baixo**: resposta mais direta e enunciado menos elaborado;
- **Pensamento médio**: análise equilibrada, adequada ao treino cotidiano;
- **Pensamento alto**: maior rigor, comparação conceitual e justificativa detalhada.

Para a questão:

- **baixo**: fundamento e reconhecimento de conceitos;
- **médio**: aplicação prática e cenários comuns de prova;
- **alto**: integração de conceitos, distinções finas e pegadinhas plausíveis.

## Bancas configuradas

| Banca | Formato e características usadas no prompt |
| --- | --- |
| Fundação Cesgranrio | 5 alternativas; situações contextualizadas, interpretação, aplicação prática e cálculos quando cabíveis; distratores plausíveis. |
| CEBRASPE | `A) Certo` ou `B) Errado`; afirmações técnicas assertivas, sensíveis a detalhes e exceções. |
| FGV | 5 alternativas; casos densos, interpretação, aplicação e distinções conceituais. |
| FCC | 5 alternativas; abordagem objetiva, técnica, precisa e ligada a conceitos, normas e procedimentos. |

## PDF-base e assunto específico

O seletor de PDFs apresenta os arquivos numerados por matéria. Selecionar um PDF significa restringir a fonte documental usada no contexto: tópicos, trechos estruturados e exemplos de questões daquele arquivo.

No campo **Assuntos Específicos (AI)**, o estudante digita apenas o assunto ou subtópico, uma linha por item ou separado por vírgulas. Não é necessário repetir o nome do PDF. A combinação correta é:

```text
PDF selecionado = base documental
Assunto digitado = foco específico dentro da base
```

Se o modo for apenas **Motor AI**, os tópicos dos PDFs escolhidos orientam a geração. Se for **Assuntos Específicos (AI)**, o prompt aplica as duas restrições.

## Contexto enviado

O navegador envia à API um recorte estruturado dos PDFs selecionados, com tópicos, trechos representativos por página e exemplos de questões de referência. O contexto é limitado por fonte e por tamanho total para evitar que a requisição fique excessiva. O nome do arquivo sozinho não é usado como base suficiente.

## Formato e qualidade da resposta

A IA é instruída a devolver JSON com questões, alternativas, `correctLabel` e explicação. A aplicação valida e normaliza a resposta antes de iniciar a sessão. O resultado deve mostrar o gabarito, por que a alternativa correta está correta e, de forma direta, por que as demais estão erradas.

## Fallback

Se faltar chave, cota, rede ou a resposta da IA for inválida, a sessão tenta automaticamente o banco offline da matéria. Quando houver questões ligadas aos PDFs selecionados, elas são priorizadas; sem vínculo suficiente, o aplicativo avisa e usa o banco completo.

## Chave da OpenRouter

A chave é digitada no formulário e salva automaticamente apenas no `localStorage` daquele navegador. Ela não deve ser colocada no HTML, no GitHub ou no backup do Drive. Cada dispositivo pode precisar informar sua própria chave.

