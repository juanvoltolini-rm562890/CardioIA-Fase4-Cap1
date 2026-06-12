# Plano de Trabalho - CardioIA Fase 4 Cap 1

**Assistente Cardiologico Virtual com Visao Computacional | Grupo 59**

Este documento divide a Fase 4 em etapas para os 5 integrantes, com dependencias explicitas. Leia primeiro a secao "Linha do tempo e dependencias" para saber o que bloqueia o que.

## 1. Pontuacao do enunciado

| Criterio | Pontos |
|---|---|
| Pipeline de pre-processamento implementado | 3 |
| Treinamento e avaliacao de CNN do zero | 2 |
| Implementacao de Transfer Learning funcional | 2 |
| Apresentacao dos resultados em prototipo simples | 2 |
| Documentacao clara | 1 |
| Trabalho em equipe (grupo de 2 a 5) | 1 (extra) |

O grupo tambem fara os dois "Ir Alem": **Etica/Fairness** (relatorio + notebook) e **App Mobile** (React Native + backend Flask + video de ate 3 minutos).

## 2. Decisoes ja tomadas

| Decisao | Escolha | Justificativa |
|---|---|---|
| Dataset | Chest X-Ray Pneumonia (Kaggle `paultimothymooney/chest-xray-pneumonia`) | ~5.856 imagens, NORMAL vs PNEUMONIA, ~1,2 GB - viavel no Colab gratuito; o NIH citado no enunciado tem 42 GB |
| Prototipo | Flask web (upload + classificacao) | atende o criterio de 2 pontos e ja serve de backend para o app mobile |
| Treino | Google Colab (GPU T4 gratuita) | o enunciado pede notebook Google Colab |
| Stack de ML | TensorFlow/Keras, VGG16 via `keras.applications` | modelos pre-treinados trabalhados em aula |
| Mobile | Expo / React Native (TypeScript) | caminho mais rapido para testar no celular via Expo Go |

## 3. Decisoes tecnicas transversais (valem para todos)

- **Download do dataset**: `kagglehub.dataset_download("paultimothymooney/chest-xray-pneumonia")` no Colab, sem credenciais.
- **Re-split obrigatorio**: o val original tem so 16 imagens. Manter o **test original intacto** (624 imagens) e re-dividir train+val (5.232 imagens) em 90/10, estratificado por classe e **agrupado por paciente** (`personXXXX` no nome dos arquivos de pneumonia, para evitar vazamento). Manifestos em `data/splits/*.csv` - os notebooks 02-04 leem esses CSVs.
- **Tamanho de imagem**: 224x224x3 padronizado para os dois modelos (comparacao justa; VGG16 exige 3 canais RGB).
- **Normalizacao** (pegadinha classica): CNN do zero com `layers.Rescaling(1./255)` EMBUTIDA no modelo; VGG16 com `preprocess_input` FORA do modelo (nao usar `Lambda` dentro do modelo - quebra a desserializacao no Keras 3). O arquivo `models/model_meta.json` registra `{arquitetura, img_size, preprocess, classes, threshold}` e o Flask o le.
- **Desbalanceamento** (~73% pneumonia): `class_weight` no treino; reportar metricas por classe, nunca so acuracia.
- **Augmentation**: rotacao +-10 graus, zoom 0.1, translacao 0.1 - SEM flip horizontal (inverte a posicao anatomica do coracao; justificar no relatorio).
- **Callbacks**: `EarlyStopping(monitor='val_loss', patience=5, restore_best_weights=True)`, `ReduceLROnPlateau`, `ModelCheckpoint`.
- **Reprodutibilidade**: `tf.keras.utils.set_random_seed(42)` na primeira celula de todo notebook; commitar notebooks COM outputs (a banca avalia sem executar).
- **Modelos no git**: NAO commitar `.keras`. Publicar como GitHub Release `v1.0-modelos` e baixar via `scripts/download_model.py`. Evitar Git LFS (cota de banda).
- **Versao do TensorFlow**: registrar `tf.__version__` do Colab no notebook e pinar a mesma versao no `requirements.txt` do Flask.

## 4. Linha do tempo e dependencias

```text
ETAPA 0 (P1): scaffold do repo ──────────────┐  (desbloqueia todos)        [FEITO]
ETAPA 1 (P1): NB01 + splits CSVs ────────────┤  (desbloqueia NB02/03/04)   [NB pronto; falta rodar no Colab]
ETAPA 2 (paralela):
   P2: NB02 CNN do zero
   P3: NB03 Transfer Learning ──> Release dos modelos + model_meta.json
   P4: Flask (esqueleto, modelo provisorio/mock)
   P5: Mobile Expo (esqueleto, API mockada)
ETAPA 3 (integracao):
   P4: Flask com modelo real (Release do P3)
   P2: NB04 fairness (usa o modelo do P3)
   P5: Mobile apontando para o Flask real
ETAPA 4 (fechamento):
   P1: documento mestre + checklist + validacao
   P5: roteiro + video (ate 3 min)
   Todos: prints em assets/evidencias/
```

Observacao: P4 e P5 nao precisam esperar os treinos - comecam logo apos a Etapa 0 usando mock e trocam pelo modelo/endpoint real na Etapa 3.

## 5. Tarefas por integrante

### Pessoa 1 - Coordenacao, pre-processamento e documentacao mestre

**Etapa 0 - Scaffold [FEITO]:** repo criado com estrutura de pastas, `.gitignore`, logo FIAP e README no padrao da Fase 3.

**Etapa 1 - Notebook `01_preprocessamento.ipynb` (Parte 1):**
- [x] Download via kagglehub; inventario do dataset original (evidenciar o val com 16 imagens).
- [x] EDA: amostras por classe, dimensoes, distribuicao de classes e subtipos (bacteria vs virus).
- [x] Re-split por paciente com asserts de nao-intersecao (soma = 5.856).
- [x] Geracao de `data/splits/{train,val,test}.csv`.
- [x] Demonstracao do pipeline: resize 224x224, RGB, as duas normalizacoes, augmentation.
- [x] `docs/relatorio_parte1_preprocessamento.md`.
- [ ] Rodar o notebook no Colab ("Run all"), salvar com outputs, baixar os CSVs para `data/splits/` e commitar.

**Etapa 4 - Fechamento:**
- [ ] `document/ai_project_document_fiap.md` (adaptar o template da Fase 3).
- [ ] `docs/checklist_enunciado.md` e `docs/validacao_local.md`.
- [ ] Revisao final do README com todos os links de entrega.

### Pessoa 2 - CNN do zero + Fairness

**Etapa 2 - Notebook `02_cnn_do_zero.ipynb` (depende dos CSVs do NB01):**
- Pipeline `tf.data` lendo `data/splits/*.csv` (cache + prefetch); augmentation como camadas Keras (ativas so no treino).
- Arquitetura: `Rescaling(1/255)` -> 4 blocos `Conv2D(32->64->128->128, 3x3) + BatchNorm + ReLU + MaxPool` -> `GlobalAveragePooling2D` -> `Dropout(0.5)` -> `Dense(1, sigmoid)`.
- Compile: Adam(1e-3), `binary_crossentropy`, metricas accuracy/AUC/precision/recall; `class_weight`; ate ~30 epocas com EarlyStopping.
- Avaliacao no test: curvas de treino, matriz de confusao, `classification_report`, AUC-ROC; analise de falsos negativos.
- Exportar `cnn_zero.keras` (entregar ao P3 para o Release) e prints para `assets/evidencias/`.
- Metade "CNN do zero" de `docs/relatorio_parte2_cnn_transfer_learning.md`.

**Etapa 3 - Notebook `04_fairness.ipynb` (Ir Alem 1, depende do modelo do P3):**
- Limitacoes do dataset: populacao pediatrica (1-5 anos, hospital unico de Guangzhou), fonte unica, ausencia de metadados demograficos (declarar explicitamente).
- Subgrupo analisavel: pneumonia bacteriana vs viral - recall/FNR por subtipo.
- Proxies tecnicos: desempenho estratificado por brilho medio e resolucao original.
- Calibracao do modelo VGG16 (curva de confiabilidade).
- `docs/relatorio_ir_alem1_fairness.md` (ate 2 paginas: limitacoes, metricas, implicacoes eticas, mitigacoes).

### Pessoa 3 - Transfer Learning (modelo final do produto)

**Etapa 2 - Notebook `03_transfer_learning.ipynb` (depende dos CSVs do NB01):**
- Mesmo pipeline de dados; `preprocess_input` do VGG16 aplicado via `map` no `tf.data`.
- Etapa A (feature extraction): `VGG16(include_top=False, weights='imagenet')` congelado -> GAP -> `Dense(256, relu)` -> `Dropout(0.5)` -> `Dense(1, sigmoid)`; Adam(1e-3), ~10 epocas.
- Etapa B (fine-tuning): descongelar apenas `block5_*`, Adam(1e-5), ~10 epocas com EarlyStopping.
- Avaliacao identica ao NB02 + tabela comparativa CNN vs VGG16 + **Grad-CAM** em 4-6 imagens de teste.
- Exportar `vgg16_finetuned.keras` + `models/model_meta.json`; criar o **GitHub Release `v1.0-modelos`** com os dois `.keras` (desbloqueia P4 e o NB04); escrever `models/README.md` (ja existe, atualizar se preciso) e `scripts/download_model.py`.
- Metade "Transfer Learning" de `docs/relatorio_parte2_cnn_transfer_learning.md`.

### Pessoa 4 - Prototipo Flask

**Etapa 2 - Esqueleto (pode comecar ja, com mock):**
- `src/flask-app/predictor.py`: carrega `.keras` + `model_meta.json` no startup; `predict(image_bytes)` -> decode (Pillow), RGB, resize 224x224, pre-processamento conforme o meta, `model.predict`, threshold 0.5 -> `{"classe", "confianca", "probabilidade_pneumonia"}`.
- `src/flask-app/app.py` - rotas: `GET /` (form de upload + resultado), `POST /predict` (web), `POST /api/predict` (multipart campo `image`, resposta JSON - endpoint do mobile), `GET /api/health`.
- Rodar com `app.run(host="0.0.0.0", port=5050)` - porta 5050 porque a 5000 conflita com o AirPlay do macOS; `host=0.0.0.0` para o celular alcancar via rede local.
- `requirements.txt`: flask, tensorflow (pinado na versao do Colab - confirmar com P3), pillow, numpy.
- `scripts/test_api.sh`: curl com uma imagem NORMAL e uma PNEUMONIA do teste.

**Etapa 3 - Integracao:**
- Trocar o mock pelo modelo real do Release; **sanity check**: a predicao do Flask para uma mesma imagem deve bater com a do notebook.
- Prints + secao do prototipo no `docs/relatorio_parte2_cnn_transfer_learning.md`.

### Pessoa 5 - App Mobile (Ir Alem 2) + video

**Etapa 2 - Esqueleto (pode comecar ja, mockando a API):**
- `npx create-expo-app@latest mobile --template blank-typescript` dentro de `src/`; instalar `expo-image-picker`.
- `src/config.ts`: `export const API_URL = process.env.EXPO_PUBLIC_API_URL ?? "http://192.168.0.X:5050";` - cada um ajusta o IP da propria maquina (`ipconfig getifaddr en0` no macOS); celular e maquina na mesma rede Wi-Fi.
- `src/api.ts`: `classifyImage(uri)` monta `FormData` (`{uri, name: "xray.jpg", type: "image/jpeg"}`) e faz `fetch(API_URL + "/api/predict", {method: "POST", body})`.
- `App.tsx` (tela unica): "Tirar foto" / "Escolher da galeria" -> preview -> "Classificar" (loading) -> cartao de resultado (classe com cor + % de confianca) + aviso "uso academico, nao substitui diagnostico medico" + "Nova analise". Erro de rede com mensagem orientando a configuracao do IP.

**Etapa 3 - Integracao:** testar no Expo Go contra o Flask real (mesma rede); validar erro com o Flask desligado; prints; `docs/relatorio_ir_alem2_mobile.md`.

**Etapa 4 - Video:** `docs/roteiro_video.md` (notebooks 30s, metricas 45s, Flask web 30s, app mobile 60s); gravar ate 3 min; YouTube nao listado; link para o P1 colocar no README.

## 6. Commits sugeridos (mensagens em portugues, padrao da Fase 3)

1. `Estrutura inicial do projeto Fase 4 com README, pastas e logo FIAP`
2. `Adiciona notebook de pre-processamento com re-split estratificado e relatorio da Parte 1`
3. `Adiciona CNN treinada do zero com avaliacao completa no conjunto de teste`
4. `Adiciona transfer learning VGG16 em duas etapas com Grad-CAM e comparativo de modelos`
5. `Adiciona prototipo Flask com interface web e endpoint REST de classificacao`
6. `Adiciona analise de fairness e relatorio Ir Alem 1`
7. `Adiciona app mobile Expo integrado ao backend Flask (Ir Alem 2)`
8. `Adiciona documento mestre FIAP, checklist do enunciado e roteiro do video`
9. `Adiciona links de entrega no README`

## 7. Verificacao antes da entrega

1. **Notebooks**: no Colab, "Disconnect and delete runtime" + "Run all" em cada um; conferir GPU ativa; salvar COM outputs antes de commitar.
2. **Split**: asserts do NB01 passando (sem intersecao de arquivo/paciente entre splits; soma = 5.856).
3. **Flask**: `pip install -r requirements.txt` -> `python scripts/download_model.py` -> `python app.py` -> `bash scripts/test_api.sh` -> upload pelo navegador em `http://localhost:5050`.
4. **Mobile**: `npx expo start`, abrir no Expo Go (mesma rede), classificar imagem da galeria e foto; testar o erro com o Flask desligado.
5. **Entrega**: percorrer `docs/checklist_enunciado.md`; clonar o repo em pasta limpa e seguir o README do zero (simula a correcao da banca).

## 8. Riscos e mitigacoes

| Risco | Mitigacao |
|---|---|
| `.keras` perto/acima de 100 MB no GitHub | GitHub Release + `scripts/download_model.py`; `models/*.keras` no `.gitignore` |
| Val original com 16 imagens | Re-split 90/10 por paciente no NB01; test original preservado |
| Vazamento de paciente entre splits | Split agrupado por `personXXXX` (so existe para pneumonia; limitacao documentada para NORMAL) |
| Normalizacao divergente CNN vs VGG16 | `Rescaling` embutido na CNN; `preprocess_input` fora do modelo + `model_meta.json`; sanity check Flask vs notebook |
| `Lambda(preprocess_input)` quebra no Keras 3 | Nunca usar `Lambda` dentro do modelo salvo |
| Versao TF do Colab diferente da local | Registrar `tf.__version__` no notebook e pinar no `requirements.txt`; fallback SavedModel/.h5 |
| Sessao do Colab cair no fine-tuning | `ModelCheckpoint` por epoca (opcionalmente salvando no Drive) |
| Porta 5000 ocupada no macOS (AirPlay) | Flask na porta 5050 |
| Mobile nao alcanca o backend | `host=0.0.0.0`, mesma rede Wi-Fi, IP documentado, `GET /api/health` |
| Dataset pediatrico e de fonte unica | Declarar nas limitacoes (NB04, relatorios e observacao academica no README) |

## 9. Mapa enunciado -> repositorio

| Exigencia do enunciado | Onde fica |
|---|---|
| Notebook de pre-processamento (Colab) | `notebooks/01_preprocessamento.ipynb` |
| Relatorio curto da Parte 1 | `docs/relatorio_parte1_preprocessamento.md` |
| Notebook CNN + resultados | `notebooks/02_cnn_do_zero.ipynb` e `notebooks/03_transfer_learning.ipynb` |
| Prints das metricas | `assets/evidencias/` |
| Prototipo de apresentacao | `src/flask-app/` (web) |
| Ir Alem 1 - relatorio + notebook | `docs/relatorio_ir_alem1_fairness.md` + `notebooks/04_fairness.ipynb` |
| Ir Alem 2 - app + video de ate 3 min | `src/mobile/` + link do YouTube no README |
| Documentacao clara | `README.md`, `docs/`, `document/ai_project_document_fiap.md` |
