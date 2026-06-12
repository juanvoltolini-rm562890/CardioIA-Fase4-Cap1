# Modelos treinados

Os arquivos `.keras` NAO sao versionados no git (o VGG16 fine-tuned tem entre 60 e 120 MB, proximo do limite de 100 MB por arquivo do GitHub). Eles serao publicados como assets do **GitHub Release `v1.0-modelos`** apos o treino nos notebooks 02 e 03.

Para baixar os modelos para esta pasta:

```bash
python scripts/download_model.py
```

Arquivos esperados nesta pasta apos o download:

| Arquivo | Origem | Uso |
|---|---|---|
| `cnn_zero.keras` | `notebooks/02_cnn_do_zero.ipynb` | comparativo de metricas |
| `vgg16_finetuned.keras` | `notebooks/03_transfer_learning.ipynb` | modelo final servido pelo Flask |
| `model_meta.json` | `notebooks/03_transfer_learning.ipynb` | metadados (arquitetura, img_size, preprocess, classes, threshold) lidos pelo Flask - este e versionado no git |

Importante: o `model_meta.json` define qual pre-processamento o Flask aplica antes da inferencia (`rescale` embutido no modelo da CNN do zero vs `preprocess_input` do VGG16 aplicado fora do modelo). Nao alterar manualmente.
