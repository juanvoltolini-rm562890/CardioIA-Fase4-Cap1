# CardioIA Mobile (Expo / React Native)

App mobile do **Ir Além 2** da Fase 4. Tela única que seleciona uma radiografia
de tórax (câmera ou galeria), envia ao backend Flask e exibe a classificação
**NORMAL** ou **PNEUMONIA** com a confiança do modelo.

> Parte do projeto **CardioIA Visão Computacional - Grupo 72**. Backend e modelos
> descritos no [README principal](../../README.md) e no
> [plano de trabalho](../../docs/plano_de_trabalho.md).

## Stack

- Expo SDK 54 / React Native 0.81 / React 19 (TypeScript)
- `expo-image-picker` para câmera e galeria
- `fetch` com `multipart/form-data` para o endpoint `POST /api/predict`

## Pré-requisitos

- Node.js 18+ (testado com Node 22).
- App **Expo Go** instalado no celular (Android ou iOS), ou um emulador.
- Celular e computador na **mesma rede Wi-Fi** (necessário para alcançar o Flask).

## Como rodar

```bash
cd src/mobile
npm install
npx expo start
```

Leia o QR Code com o **Expo Go** (Android) ou a Câmera (iOS). O app abre no celular.

> A versão do Expo Go precisa suportar o **SDK 54**. Se o app reclamar de
> incompatibilidade, atualize o Expo Go ou alinhe o SDK ao da sua versão.

### Modo demonstração (padrão, sem backend)

Por padrão o app roda em **modo mock**: as classificações são simuladas, então a
interface funciona sem o Flask. Um selo amarelo "Modo demonstração" aparece no
topo. Útil para desenvolver a UI e para a demonstração do vídeo.

### Modo real (integrado ao Flask)

1. Baixe os modelos do Release e suba o backend Flask (porta 5050, `host=0.0.0.0`) - ver `src/flask-app/`:

   ```bash
   python scripts/download_model.py   # baixa vgg16_finetuned.keras + model_meta.json do Release
   python src/flask-app/app.py        # backend na porta 5050
   ```

   > O VGG16 usa normalização **rescale 1/255** (registrada em `models/model_meta.json`); o Flask aplica isso internamente, o app só envia a imagem.
2. Descubra o IP local da máquina que roda o Flask:
   - **Windows:** `ipconfig` -> campo **Endereço IPv4** do adaptador Wi-Fi.
   - **macOS:** `ipconfig getifaddr en0`
   - **Linux:** `hostname -I`
3. Crie o arquivo `.env` (copie de `.env.example`):

   ```env
   EXPO_PUBLIC_USE_MOCK=false
   EXPO_PUBLIC_API_URL=http://SEU_IP:5050
   ```

4. Reinicie o Expo com cache limpo para reler as variáveis:

   ```bash
   npx expo start -c
   ```

   O selo no topo passa a indicar 🟢 conectado / 🔴 offline (via `GET /api/health`).

## Estrutura

```
src/mobile/
├── App.tsx                 # tela única: seleciona imagem -> classifica -> resultado
├── config.ts               # USE_MOCK e API_URL (lidos do .env)
├── api.ts                  # classifyImage() e checkHealth(): mock ou Flask real
├── theme.ts                # cores e espaçamentos
├── components/
│   ├── ActionButton.tsx    # botão com variantes e loading
│   ├── ResultCard.tsx      # cartão do resultado (classe + confiança + barra)
│   └── Disclaimer.tsx      # aviso de uso acadêmico
├── .env.example            # modelo de configuração
└── app.json                # config Expo + permissões (expo-image-picker)
```

## Contrato com o backend

O app espera o endpoint definido para o Flask (ver plano de trabalho):

- `POST /api/predict` - `multipart/form-data`, campo `image` (JPEG). Resposta:

  ```json
  { "classe": "NORMAL", "confianca": 0.0, "probabilidade_pneumonia": 0.0 }
  ```

- `GET /api/health` - status 200 confirma que o backend está no ar.

Como o mock segue exatamente esse formato, a troca mock -> real é apenas o `.env`.

## Troubleshooting

| Sintoma | Causa provável | Ação |
|---|---|---|
| "Project is incompatible with this version of Expo Go" | SDK do projeto > SDK do Expo Go | atualizar o Expo Go ou alinhar o SDK |
| Selo "Backend offline" | Flask desligado ou IP errado | conferir `EXPO_PUBLIC_API_URL` e `python app.py` |
| "Network request failed" | celular em outra rede / firewall | mesma Wi-Fi; liberar a porta 5050 no firewall |
| Mudou o `.env` e nada muda | cache do Expo | rodar `npx expo start -c` |
| Permissão negada | acesso a fotos/câmera bloqueado | habilitar nas configurações do dispositivo |

## Uso acadêmico

Projeto acadêmico com dados públicos (radiografias pediátricas de uma única
instituição). A classificação **não** substitui avaliação médica ou diagnóstico
clínico.
