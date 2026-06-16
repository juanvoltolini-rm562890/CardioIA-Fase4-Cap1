# Relatorio Ir Alem 1 - Etica e Fairness em Visao Computacional

## Contexto e objetivo

Este relatorio analisa possiveis vieses do dataset **Chest X-Ray Pneumonia** e do modelo de Visao Computacional treinado sobre ele, propondo praticas de mitigacao. O modelo auditado e o **VGG16 com Transfer Learning** (notebook `03_transfer_learning.ipynb`); os experimentos estao em `notebooks/04_fairness.ipynb`. Toda a analise e feita **no conjunto de teste** (624 imagens), preservado intacto durante o treino.

## Limitacoes do dataset

| Limitacao | Descricao | Risco etico |
|---|---|---|
| **Populacao pediatrica** | Pacientes de **1 a 5 anos** | O modelo nao generaliza para adultos/idosos; usa-lo fora dessa faixa e inseguro |
| **Fonte unica** | Um unico hospital (Guangzhou Women and Children's Medical Center, China) | Vies de equipamento, protocolo de aquisicao e populacao local; baixa validade externa |
| **Sem metadados demograficos** | Nao ha sexo, etnia ou idade exata | **Impossivel** auditar fairness por esses eixos sensiveis - declaramos a lacuna em vez de simular grupos inexistentes |
| **Desbalanceamento** | ~73% das imagens sao pneumonia | A acuracia global engana; um modelo que "chuta pneumonia" parece bom. Exige metricas por classe/subgrupo |
| **Rotulo por nome de arquivo** | Subtipo (bacteriana/viral) e `person_id` extraidos do nome | Unica particao clinica auditavel; NORMAL nao tem `person_id` (tratado como limitacao no NB01) |

## Metodologia de fairness

Sem atributos demograficos, a auditoria se apoia em tres eixos, com metricas alinhadas ao conteudo de Governanca/IA Responsavel:

1. **Igualdade de oportunidade (equal opportunity)** entre subtipos de pneumonia: a **sensibilidade** (recall) e a **taxa de falsos negativos (FNR)** deveriam ser semelhantes para pneumonia **bacteriana** e **viral**. Falso negativo = paciente doente classificado como saudavel, o erro clinicamente mais grave.
2. **Proxies tecnicos**: desempenho estratificado por **brilho medio** e **resolucao original** da imagem (tercis), para detectar vies que penalizaria certos equipamentos ou unidades de saude.
3. **Calibracao**: **curva de confiabilidade** e **Brier score** - em apoio a decisao clinica, a confianca informada pelo modelo precisa refletir a probabilidade real.

## Resultados

Valores obtidos com o `notebooks/04_fairness.ipynb` executado no Colab (modelo VGG16, conjunto de teste de 624 imagens).

**Desempenho global no teste** (lacuna que o NB03 nao reportou - ele avaliou apenas na validacao):

- Acuracia: **0,843** | AUC-ROC: **0,938**
- Recall PNEUMONIA: **0,974** | Recall NORMAL (especificidade): **0,624**

**Fairness por subtipo (equal opportunity):**

| Grupo | n | Sensibilidade/Especificidade | Erro (FNR/FPR) | Confianca media |
|---|---|---|---|---|
| bacteriana | 242 | 0,975 (sensib.) | 0,025 (FNR) | 0,916 |
| viral | 148 | 0,973 (sensib.) | 0,027 (FNR) | 0,900 |
| normal | 234 | 0,624 (especif.) | 0,376 (FPR) | 0,452 |

- Gap de sensibilidade bacteriana vs viral: **0,002** | razao (min/max): **0,998** -> praticamente **sem disparidade** entre os subtipos de pneumonia.

**Proxies tecnicos** (acuracia por tercil):

- **Brilho**: 0,861 (baixo) / 0,885 (medio) / 0,784 (alto) -> gap ~0,10.
- **Resolucao**: 0,976 (baixo) / 0,836 (medio) / **0,716 (alto)**, com a sensibilidade caindo para 0,821 nas imagens de maior resolucao -> gap **~0,26**. **Vies tecnico mais relevante encontrado.**

**Calibracao:** Brier score: **0,118**. A curva de confiabilidade (`assets/evidencias/fairness_calibracao.png`) fica abaixo da diagonal -> o modelo e **levemente superconfiante** (ex.: preve ~0,75 onde a fracao real de pneumonia e ~0,63).

**Comparativo com a CNN do zero** (mesmo conjunto de teste):

| Metrica | CNN do zero | VGG16 |
|---|---|---|
| Acuracia | 0,782 | 0,843 |
| AUC-ROC | 0,943 | 0,938 |
| Recall PNEUMONIA | 0,997 | 0,974 |
| Especificidade (NORMAL) | 0,423 | 0,624 |
| Sensib. bacteriana / viral | 0,996 / 1,000 | 0,975 / 0,973 |

O Transfer Learning **equilibra** o modelo: quase dobra a especificidade (de 0,42 para 0,62, reduzindo falsos positivos), ao custo de poucos falsos negativos a mais. **Ambos** os modelos sao justos entre subtipos (sensibilidade bacteriana ~ viral).

## Implicacoes eticas

- **Equidade entre subtipos (resultado positivo)**: a sensibilidade e praticamente igual para pneumonia bacteriana e viral (gap 0,002), logo o modelo nao penaliza o subtipo clinicamente mais dificil - um bom indicador de equal opportunity.
- **Vies tecnico por resolucao**: a queda de desempenho em imagens de maior resolucao revela sensibilidade ao equipamento/origem da aquisicao; em uso real, unidades com aparelhos diferentes seriam atendidas de forma desigual.
- **Baixa especificidade (falsos positivos)**: com threshold 0,5 muitos exames normais sao sinalizados como pneumonia, gerando sobrecarga de revisao e ansiedade desnecessaria - mais ameno no VGG16 que na CNN do zero.
- **Excesso de confianca**: um modelo levemente superconfiante (curva abaixo da diagonal) desencoraja a revisao humana, o que e perigoso em triagem.
- **Generalizacao**: aplicar um modelo pediatrico de fonte unica a outras populacoes pode amplificar desigualdades de acesso a saude; o uso e estritamente academico.

## Mitigacoes propostas

1. **Reportar sempre metricas por classe e por subgrupo** (nunca so acuracia), com destaque para FNR - ja adotado nos notebooks 02-04.
2. **`class_weight` no treino** para compensar o desbalanceamento (aplicado na CNN do zero; recomendado tambem para o VGG16, que no NB03 treinou sem ele).
3. **Threshold ajustavel**: permitir operar abaixo de 0.5 para priorizar sensibilidade (reduzir falsos negativos) em contexto de triagem.
4. **Calibracao** (ex.: Platt/temperature scaling) caso o Brier score indique desvio relevante.
5. **Coleta futura de metadados demograficos** e **validacao multi-institucional** antes de qualquer uso real.
6. **Comunicacao de limites ao usuario**: o app e a interface ja exibem o aviso de uso academico e nao-substituicao de diagnostico medico.

## Conclusao

O dataset viabiliza uma analise de fairness honesta dentro de seus limites: o eixo bacteriana/viral expoe o vies clinico mais relevante, os proxies tecnicos cobrem o vies de aquisicao e a calibracao avalia a confiabilidade da confianca do modelo. As maiores limitacoes (populacao pediatrica, fonte unica e ausencia de metadados demograficos) sao **intrinsecas ao dataset** e nao corrigiveis por modelagem - apenas por nova coleta de dados. Por isso, a solucao se mantem como **prototipo academico de apoio**, jamais como substituto de avaliacao medica.
