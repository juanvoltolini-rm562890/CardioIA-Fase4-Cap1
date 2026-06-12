# Dados

O dataset **Chest X-Ray Pneumonia** nao e versionado neste repositorio (aprox. 1,2 GB). Ele e baixado automaticamente nos notebooks via `kagglehub`:

```python
import kagglehub
caminho = kagglehub.dataset_download("paultimothymooney/chest-xray-pneumonia")
```

O download funciona sem credenciais por se tratar de dataset publico. Caso o `kagglehub` peca autenticacao (mudanca de politica do Kaggle), gere um token em `kaggle.com > Settings > API > Create New Token` e suba o `kaggle.json` para o Colab antes de executar.

Fonte: <https://www.kaggle.com/datasets/paultimothymooney/chest-xray-pneumonia> (licenca CC BY 4.0).

## data/splits/

Os arquivos `train.csv`, `val.csv` e `test.csv` sao os **manifestos do re-split** gerados pelo notebook `01_preprocessamento.ipynb` e SAO versionados. Colunas:

| Coluna | Conteudo |
|---|---|
| `filepath` | caminho relativo a raiz do dataset (ex.: `train/PNEUMONIA/person1_bacteria_1.jpeg`) |
| `label` | `NORMAL` ou `PNEUMONIA` |
| `subtipo` | `normal`, `bacteria` ou `virus` |
| `person_id` | id do paciente (somente para PNEUMONIA; vazio para NORMAL) |

Os notebooks 02, 03 e 04 leem esses CSVs em vez de refazer o split, garantindo que todos os integrantes treinem e avaliem com exatamente a mesma divisao. Motivo do re-split: o conjunto de validacao original do dataset tem apenas 16 imagens; detalhes em `docs/relatorio_parte1_preprocessamento.md`.
