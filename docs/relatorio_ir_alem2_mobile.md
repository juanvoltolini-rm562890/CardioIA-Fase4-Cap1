# Relatório Ir Além 2 - App Mobile (React Native / Expo)

> **Status:** app concluído e **integração com o backend Flask validada fim-a-fim**
> contra o modelo VGG16 real (ver "Validação da integração"). Pendências apenas
> humanas: print no dispositivo e gravação do vídeo.

## Objetivo

Levar a classificação da CNN para um protótipo mobile: o usuário seleciona uma
radiografia de tórax no celular (câmera ou galeria) e recebe a categoria
detectada pelo modelo (NORMAL ou PNEUMONIA), com a confiança. Atende ao desafio
"Ir Além 2" (interface React Native + integração com backend + vídeo).

## Arquitetura

```text
[ App Expo / React Native ]            [ Backend Flask :5050 ]
  seleção de imagem                      POST /api/predict
  (expo-image-picker)                       |  multipart: image (JPEG)
        |  uri da imagem                     v
        v                                 VGG16 (vgg16_finetuned.keras)
  api.classifyImage(uri)  --HTTP-->       resize 224x224 + rescale 1/255 + predict
  multipart/form-data                       |
        ^                                    v
        |  JSON  <----------------  { classe, confianca, probabilidade_pneumonia, mock }
  ResultCard (classe + medidores)
```

O app conversa com o **mesmo backend Flask** que serve a interface web (Pessoa 4),
pela rede Wi-Fi local. O contrato é exatamente o JSON de `POST /api/predict`.

## Stack e decisões técnicas

| Decisão | Escolha | Justificativa |
|---|---|---|
| Framework | Expo SDK 54 / React Native 0.81 / TypeScript | rodar no celular real via Expo Go (compatível com a versão da loja), sem build nativo |
| Imagem | `expo-image-picker` | cobre câmera (`launchCameraAsync`) e galeria (`launchImageLibraryAsync`) num único módulo |
| Comunicação | `fetch` + `FormData` multipart | formato esperado pelo Flask (`image` JPEG); sem dependência extra |
| Mock-first | flag `USE_MOCK` em `config.ts` | permite construir e demonstrar a UI antes do backend; a troca para o real é só o `.env` |
| Tela única | seleção -> classificar -> resultado | foco na clareza do resultado, critério do enunciado |
| Identidade visual | tema "monitor cardíaco" (IBM Plex, ECG animado, medidores) | leitura clínica clara do diagnóstico e bom impacto no vídeo |

### Isolamento mock vs real

Toda a diferença entre dados simulados e backend real fica em `api.ts` e
`config.ts`. A tela (`App.tsx`) sempre chama `classifyImage(uri)` e recebe o
tipo `ClassificationResult`. Em modo mock, `classifyImage` devolve uma resposta
coerente (probabilidade alta => PNEUMONIA) com latência simulada; em modo real,
faz o `POST` ao Flask. A integração foi apenas configurar o `.env` — **nenhuma
linha da interface mudou**.

> Observação: as chaves do JSON (`confianca`, `probabilidade_pneumonia`) são
> mantidas sem acento no código para casar exatamente com a resposta do Flask;
> a acentuação aparece apenas nos rótulos exibidos na tela.

### Experiência e segurança de uso

- Indicador de conexão no topo: 🟡 demonstração (mock), 🟢 conectado ou 🔴 offline
  (via `GET /api/health`).
- Resultado com cor por classe (verde NORMAL / vermelho PNEUMONIA), confiança e
  probabilidade de pneumonia em medidores animados.
- Aviso fixo de **uso acadêmico** (não substitui avaliação médica).
- Mensagem de erro de rede orientando a configuração de IP / mesma Wi-Fi.

## Validação da integração (smoke-test com o modelo real)

O backend Flask (branch `flask-aap-felipe`) foi executado localmente com o
**modelo VGG16 real** baixado do Release `v1.0-modelos`
(`python scripts/download_model.py`, `vgg16_finetuned.keras` de ~60 MB,
TensorFlow 2.21). As chamadas reproduzem exatamente o que o app envia
(`multipart/form-data`, campo `image`):

| Chamada | Resposta |
|---|---|
| `GET /api/health` | `{ "status": "ok", "mock_mode": false, "model_loaded": true }` |
| `POST /api/predict` (radiografia de pneumonia) | `{ "classe": "PNEUMONIA", "confianca": 0.9766, "probabilidade_pneumonia": 0.9766, "mock": false }` |
| `POST /api/predict` (radiografia normal) | `{ "classe": "NORMAL", "confianca": 0.6595, "probabilidade_pneumonia": 0.3405, "mock": false }` |

Conclusões:

- O JSON retornado bate **campo a campo** com o tipo `ClassificationResult` do app
  (`classe`, `confianca`, `probabilidade_pneumonia`); o campo extra `mock` é
  ignorado pelo app. **Não foi necessária nenhuma alteração no código mobile.**
- O modelo classifica corretamente os dois casos de teste, com confiança alta na
  pneumonia.
- Pré-processamento do VGG16: 224×224×3 com **rescale 1/255** (registrado em
  `models/model_meta.json`, campo `use_native_preprocess: false`), aplicado pelo
  Flask. Métricas de teste do modelo (do `model_meta.json`): acurácia 0.843,
  recall pneumonia 0.974, especificidade 0.624, AUC 0.938.
- O `predictor.py` tem **fallback mock próprio**: se o `.keras` não for encontrado
  ou o TensorFlow falhar, ele responde no mesmo formato em modo mock — o app
  funciona mesmo sem o modelo baixado.

## Como executar

Instruções completas em [`src/mobile/README.md`](../src/mobile/README.md)
(instalação, modo demonstração, integração com o Flask e troubleshooting).

Resumo do modo real:

```bash
# backend
python scripts/download_model.py     # baixa o VGG16 do Release
python src/flask-app/app.py          # Flask na porta 5050

# app (em src/mobile, com .env apontando para o IP do backend)
npx expo start -c
```

## Dependência de equipe

O backend Flask está pronto no branch `flask-aap-felipe` e foi usado para validar
a integração acima, mas **ainda não foi mesclado na `main`** (PR em aberto, sob
responsabilidade do P4). Para o repositório final que o professor clona e para o
vídeo "tudo funcionando", o Flask precisa entrar na `main`. A parte mobile não
depende mais de nada: ao mesclar, basta apontar o `.env` para o IP do backend.

## Status final

- [x] Teste no dispositivo (Expo Go) contra o Flask real, demonstrado no vídeo:
      classificação por galeria com resultados PNEUMONIA (98%) e NORMAL (65%).
- [x] Prints do resultado em `assets/evidencias/app_mobile_resultado.png` (PNEUMONIA)
      e `app_mobile_normal.png` (NORMAL), extraídos da gravação no dispositivo.
- [x] Vídeo de até 3 min gravado (roteiro em [`docs/roteiro_video.md`](roteiro_video.md))
      e link inserido no README.

## Limitações

- Mesma limitação de domínio do dataset (radiografias pediátricas, fonte única) -
  ver Ir Além 1.
- Comunicação por rede local (HTTP), adequada à demonstração acadêmica; produção
  exigiria HTTPS e autenticação.
- Sem persistência de histórico - cada análise é independente.
