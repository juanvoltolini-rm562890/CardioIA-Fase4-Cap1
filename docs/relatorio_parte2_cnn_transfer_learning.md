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

## Seção 2: Classificação via Transfer Learning (VGG16)

### 2.1 Arquitetura do Modelo e Estratégia de Extração de Features
Para estabelecer um comparativo de alto desempenho com a CNN desenvolvida do zero, foi implementada a técnica de *Transfer Learning* (Aprendizado por Transferência) utilizando a arquitetura consolidada **VGG16**, pré-treinada com o dataset *ImageNet*. 

A estratégia adotada consistiu estritamente em **Extração de Features**, configurada da seguinte forma:
1. **Congelamento da Base Convolucional:** A base da VGG16 foi importada sem o seu topo original (`include_top=False`) e teve todas as suas camadas completamente congeladas (`trainable = False`), incluindo os blocos finais como o `block5`. Não foi realizado o processo de *fine-tuning* nessas camadas convolucionais nesta etapa.
2. **Desenho do Topo Classificador (Head):** No topo da rede, foi acoplada uma nova estrutura densa especializada, composta pela seguinte sequência de camadas:
   * **`GlobalAveragePooling2D`**: Para reduzir a dimensionalidade espacial dos mapas de características sem perder informações latentes.
   * **`Dense(256, activation='relu')`**: Camada intermediária com 256 neurônios para aprendizado das combinações não-lineares.
   * **`Dropout(0.5)`**: Camada de regularização com fator de 50% para mitigar o risco de *overfitting*.
   * **`Dense(1, activation='sigmoid')`**: Camada de saída linear configurada com um único neurônio para retornar a probabilidade da classificação binária (NORMAL vs PNEUMONIA).

### 2.2 Pipeline de Pré-processamento e Normalização Aplicada
O pipeline de dados mapeado em `notebooks/03_transfer_learning.ipynb` foi estruturado de forma customizada, aplicando:
* **Redimensionamento Espacial:** Imagens redimensionadas uniformemente para $224 \times 224$ pixels com 3 canais de cor (RGB).
* **Normalização de Escala (Rescale):** Os pixels das imagens foram normalizados linearmente através do fator de divisão de $1/255.0$, reescalando os tensores estritamente para o intervalo estável de $[0, 1]$. 

> **Nota Crítica para o Deploy (Flask):** O modelo foi treinado utilizando o fator de escala direta de $1/255$ em vez da função nativa `preprocess_input` da VGG16. Consequentemente, o backend de inferência do Flask deve repetir exatamente este passo matemático ($img / 255.0$), abstendo-se do uso do pré-processamento original do pacote Keras, sob o risco de corromper os resultados preditivos.

### 2.3 Dinâmica de Treinamento
O treinamento do classificador foi acelerado utilizando hardware dedicado (GPU NVIDIA T4) ao longo de **10 épocas**, operando com um tamanho de lote (*batch size*) de 32 imagens.

A otimização focou na minimização da função de perda de Entropia Cruzada Binária (*Binary Crossentropy*) utilizando o otimizador **Adam** com taxa de aprendizado instanciada em $\alpha = 10^{-4}$. É importante destacar que o treinamento foi executado de forma direta, **sem a aplicação de pesos de classe (`class_weight`)** para compensar o desbalanceamento do dataset. Para blindar a rede, foram injetados os *callbacks*:
* **Early Stopping:** Monitorando a perda de validação (*val_loss*) com paciência de 3 épocas.
* **Model Checkpoint:** Configurado para persistir e salvar em disco exclusivamente o arquivo de pesos com o melhor desempenho em validação.

### 2.4 Análise Diagnóstica por Imagem (GRAD-CAM)
Como pilar fundamental de governança, ética e auditabilidade médica (XAI - *Explainable Artificial Intelligence*), utilizou-se o algoritmo **GRAD-CAM** (*Gradient-weighted Class Activation Mapping*) para inspecionar os critérios de decisão do modelo.

Ao gerar os mapas de ativação térmica sobrepostos às radiografias originais de teste, o modelo provou sua robustez clínica. Os maiores gradientes de ativação concentraram-se nitidamente sobre os campos pulmonares internos (regiões de opacidade e consolidação alveolar características de infecções pulmonares), ignorando artefatos externos, tecidos ósseos adjacentes (clavículas/costelas) ou vieses de bordas.

<p align="center">
  <img src="../assets/evidencias/raios_x_original.png" alt="Raios X de Referência Original" width="45%">
  <img src="../assets/evidencias/vgg16_gradcam.png" alt="Mapa de Calor das Ativações GRAD-CAM" width="45%">
</p>

### 2.5 Resultados Consolidados no Conjunto de Teste
Avaliada de forma robusta no conjunto de **Teste** final isolado (conforme mapeado no pipeline de Fairness do `04_fairness.ipynb`), a arquitetura VGG16 obteve os seguintes indicadores de performance real:
* **Acurácia Geral:** 84.3%
* **Sensibilidade (Recall para Pneumonia):** 97.4% *(Crítico para evitar falsos negativos na triagem médica)*
* **Especificidade (Recall para Normal):** 62.4%
* **Área sob a Curva ROC (AUC):** 0.938

### 2.6 Próximos Passos Sugeridos para Evolução
Para trabalhos futuros e iterações de melhoria do modelo, recomenda-se:
1. **Fine-Tuning Localizado:** Descongelar o último bloco convolucional da VGG16 (`block5`) e retomar o treinamento utilizando uma taxa de aprendizado extremamente reduzida ($\alpha = 10^{-5}$) para ajustar os filtros de alta granularidade ao padrão das texturas pulmonares.
2. **Injeção de `class_weight`:** Aplicar pesos balanceados durante a fase de ajuste fino para tentar elevar o índice de Especificidade (62.4%) do modelo, mitigando a ocorrência de falsos positivos na classe Normal sem sacrificar a excelente Sensibilidade já alcançada.

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
