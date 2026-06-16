# Relatorio Parte 2 - Classificacao de Imagens Medicas com CNN

## Contexto e objetivo

A Parte 2 implementa e compara duas abordagens de classificacao (NORMAL vs PNEUMONIA) sobre o mesmo split do NB01: uma **CNN treinada do zero** (`notebooks/02_cnn_do_zero.ipynb`) e **Transfer Learning com VGG16** (`notebooks/03_transfer_learning.ipynb`). Ambos os modelos usam imagens 224x224x3 e o rotulo NORMAL=0 / PNEUMONIA=1; a saida sigmoide e a probabilidade de pneumonia (threshold 0.5). As metricas pedidas no enunciado (acuracia, matriz de confusao, precisao, recall, F1) sao reportadas por classe, dado o desbalanceamento (~73% pneumonia).

## 1. CNN treinada do zero

### Arquitetura e treino

- **Pipeline** `tf.data` lendo os manifestos `data/splits/*.csv` (cache + prefetch), com augmentation (rotacao +-10 graus, zoom e translacao 0.1, **sem flip horizontal**) e `Rescaling(1/255)` **embutidos no modelo** - a normalizacao acompanha o `.keras` exportado, evitando divergencia na inferencia do Flask.
- **Arquitetura**: 4 blocos `Conv2D (32 -> 64 -> 128 -> 128) + BatchNorm + ReLU + MaxPool` -> `GlobalAveragePooling2D` -> `Dropout(0.5)` -> `Dense(1, sigmoid)` (~242 mil parametros).
- **Treino**: Adam(1e-3), `binary_crossentropy`, `class_weight` balanceado ({0: 1.93, 1: 0.68}) para compensar o desbalanceamento; ate 30 epocas com `EarlyStopping` (restaurou a melhor epoca, a 7), `ReduceLROnPlateau` e `ModelCheckpoint`.

### Avaliacao no conjunto de teste (624 imagens)

| Classe | Precisao | Recall | F1 | Suporte |
|---|---|---|---|---|
| NORMAL | 0,990 | 0,423 | 0,593 | 234 |
| PNEUMONIA | 0,742 | 0,997 | 0,851 | 390 |
| **Acuracia** | | | **0,782** | 624 |

- **AUC-ROC**: 0,943.
- **Matriz de confusao**: NORMAL 99 corretos / 135 falsos positivos; PNEUMONIA 389 corretos / **1 falso negativo**.
- Evidencias: `assets/evidencias/cnn_zero_curvas_treino.png` e `assets/evidencias/cnn_zero_matriz_roc.png`.

### Leitura clinica

O modelo tem **sensibilidade quase perfeita** para pneumonia (recall 0,997, apenas 1 caso perdido em 390) - desejavel em triagem, onde nao detectar um doente e o erro mais grave. Em contrapartida, a **especificidade e baixa** (recall NORMAL 0,423): muitos exames normais sao sinalizados como pneumonia (135 falsos positivos). O AUC de 0,943 mostra que o modelo **separa bem as classes**; o desequilibrio vem do ponto de corte 0,5, e ajustar o threshold e uma mitigacao discutida no relatorio de fairness (Ir Alem 1). O modelo foi exportado como `cnn_zero.keras` para o Release `v1.0-modelos`.

## 2. Transfer Learning com VGG16

> **Paulo, esta secao e sua.** Preencher a partir do `notebooks/03_transfer_learning.ipynb`. Sugestao do que descrever:
> - **Arquitetura**: VGG16 pre-treinada na ImageNet (`include_top=False`) com a base congelada + cabeca densa (`GlobalAveragePooling2D -> Dense(256, relu) -> Dropout(0.5) -> Dense(1, sigmoid)`).
> - **Pre-processamento**: registrar que o treino usou `rescale=1/255` (e nao `preprocess_input`) - isso precisa estar coerente com o que o Flask aplica.
> - **Treino**: otimizador, epocas, callbacks; comentar que foi feita extracao de features (sem fine-tuning das camadas `block5`) e sem `class_weight`.
> - **Grad-CAM**: incluir as imagens de explicabilidade (`assets/evidencias/vgg16_gradcam.png`, `raios_x_original.png`) e comentar que o modelo foca nas opacidades pulmonares, e nao em bordas/ossos.
> - **Resultados no teste**: usar a tabela comparativa da secao 3 (ja preenchida com os numeros reais obtidos no NB04, que avaliou o VGG16 no conjunto de teste).
> - (Opcional) proximos passos: fine-tuning do `block5` com LR baixo e `class_weight` para melhorar ainda mais o equilibrio.

## 3. Comparativo CNN do zero x VGG16

Resultados medidos no **mesmo conjunto de teste** (624 imagens):

| Metrica | CNN do zero | VGG16 (Transfer Learning) |
|---|---|---|
| Acuracia | 0,782 | **0,843** |
| AUC-ROC | **0,943** | 0,938 |
| Recall PNEUMONIA (sensibilidade) | **0,997** | 0,974 |
| Recall NORMAL (especificidade) | 0,423 | **0,624** |
| Falsos positivos | 135 | **88** |
| Falsos negativos | 1 | 10 |

**Leitura**: o **Transfer Learning equilibra o modelo** - quase dobra a especificidade (0,42 -> 0,62), cortando falsos positivos de 135 para 88 e elevando a acuracia, ao custo de alguns falsos negativos a mais. O AUC fica praticamente empatado (0,94 nos dois), indicando capacidade de separacao semelhante; a diferenca esta no equilibrio das predicoes. A CNN do zero e um baseline forte e mais sensivel; o VGG16 e a escolha mais balanceada para o prototipo. A analise de vies dos dois modelos (incluindo equidade entre pneumonia bacteriana e viral) esta em `docs/relatorio_ir_alem1_fairness.md`.

## 4. Prototipo

A apresentacao dos resultados (upload de imagem e classificacao) e feita pelo prototipo Flask (`src/flask-app/`), que carrega o modelo do Release e aplica o pre-processamento registrado em `models/model_meta.json`. Detalhes na secao correspondente / no app mobile (Ir Alem 2).
