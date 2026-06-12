# Relatorio Parte 1 - Pre-processamento e Organizacao das Imagens

## Contexto

A Parte 1 da Fase 4 prepara a base de imagens medicas que alimenta toda a solucao: a CNN treinada do zero, o Transfer Learning com VGG16, a analise de fairness e o prototipo de classificacao (web e mobile). Todo o codigo esta em `notebooks/01_preprocessamento.ipynb`, executavel no Google Colab.

## Escolha do dataset

Foi selecionado o **Chest X-Ray Pneumonia** (Kaggle `paultimothymooney/chest-xray-pneumonia`, licenca CC BY 4.0), com **5.856 radiografias de torax** rotuladas como NORMAL ou PNEUMONIA, sendo as pneumonias subdivididas em bacterianas e virais pelo nome do arquivo. As imagens vem de pacientes pediatricos (1 a 5 anos) do Guangzhou Women and Children's Medical Center.

Justificativas da escolha:

- **Viabilidade no Colab gratuito**: aproximadamente 1,2 GB, contra 42 GB do NIH Chest X-rays citado como exemplo no enunciado, que excede o disco e o tempo de sessao do Colab gratuito.
- **Tarefa bem definida**: classificacao binaria (NORMAL vs PNEUMONIA) permite avaliar com clareza as metricas pedidas (acuracia, matriz de confusao, precisao, recall, F1).
- **Relevancia clinica**: triagem de pneumonia em radiografia e um caso de uso real de apoio a decisao medica, alinhado a proposta do Assistente Cardiologico Virtual de analisar exames de torax.
- **Subtipos rotulados**: a distincao bacteria/virus viabiliza a analise de fairness do Ir Alem 1 sem necessidade de metadados externos.

## Diagnostico da divisao original

| Split original | NORMAL | PNEUMONIA | Total |
|---|---|---|---|
| train | 1.341 | 3.875 | 5.216 |
| val | 8 | 8 | 16 |
| test | 234 | 390 | 624 |
| **Total** | **1.583** | **4.273** | **5.856** |

Dois problemas orientaram as decisoes de organizacao:

1. **Conjunto de validacao com apenas 16 imagens**: insuficiente para monitorar o treino (EarlyStopping, ReduceLROnPlateau) - uma unica imagem muda a acuracia de validacao em 6,25 pontos percentuais.
2. **Desbalanceamento de classes**: cerca de 73% das imagens sao de pneumonia. Um modelo que sempre responde PNEUMONIA teria acuracia enganosa; por isso o treino usa `class_weight` e a avaliacao reporta metricas por classe.

## Re-split: treino, validacao e teste

- O **teste original (624 imagens) foi preservado intacto**, mantendo comparabilidade com a literatura que usa este dataset.
- Train e val originais foram fundidos (5.232 imagens) e redivididos em **90% treino / 10% validacao**, estratificado por classe.
- Para PNEUMONIA, a divisao e **agrupada por paciente** (`personXXXX` extraido do nome do arquivo): ha varias imagens do mesmo paciente, e separa-las entre treino e validacao causaria vazamento de dados (o modelo "reconheceria" o paciente, inflando as metricas de validacao). Para NORMAL os nomes de arquivo nao trazem identificador de paciente, limitacao registrada aqui e tratada como risco residual.
- O notebook executa verificacoes automaticas (asserts): nenhuma imagem em mais de um split, nenhum paciente de pneumonia em treino e validacao ao mesmo tempo, e soma total igual a 5.856.
- O resultado e gravado em manifestos versionados (`data/splits/train.csv`, `val.csv`, `test.csv`) com `filepath`, `label`, `subtipo` e `person_id`. Os notebooks das proximas partes leem esses CSVs, garantindo que todos os integrantes usem exatamente a mesma divisao.

## Pipeline de pre-processamento

| Etapa | Decisao | Justificativa |
|---|---|---|
| Leitura | `tf.data` com `decode_jpeg(channels=3)` | pipeline eficiente (cache/prefetch) e conversao uniforme para 3 canais |
| Conversao de formato | grayscale -> RGB | o dataset mistura imagens de 1 e 3 canais, e o VGG16 pre-treinado no ImageNet exige entrada RGB |
| Redimensionamento | 224x224 | tamanho nativo do VGG16; padronizado tambem para a CNN do zero, garantindo comparacao justa entre os dois modelos |
| Normalizacao (CNN do zero) | `Rescaling(1/255)` embutido como primeira camada do modelo | leva pixels para [0, 1]; embutir no modelo elimina o risco de esquecer a normalizacao na inferencia (Flask/mobile) |
| Normalizacao (VGG16) | `preprocess_input` aplicado fora do modelo, no `tf.data` | o VGG16 espera o pre-processamento original do ImageNet (conversao BGR e subtracao das medias por canal); fica registrado em `models/model_meta.json` para o prototipo aplicar o mesmo tratamento |
| Augmentation (so treino) | rotacao +-10 graus, zoom 0.1, translacao 0.1 | simula variacoes reais de posicionamento do paciente e aumenta a diversidade do treino, reduzindo overfitting |
| Flip horizontal | **nao utilizado** | decisao de dominio: espelhar uma radiografia de torax inverte a posicao anatomica do coracao (dextrocardia artificial), criando exemplos clinicamente invalidos |

## Resultado da Parte 1

- Notebook `01_preprocessamento.ipynb` com inventario, analise exploratoria, re-split verificado e demonstracao do pipeline.
- Manifestos `data/splits/{train,val,test}.csv` versionados no repositorio.
- Decisoes de pre-processamento documentadas e prontas para reuso identico nos notebooks de treino (Parte 2) e na inferencia do prototipo.
