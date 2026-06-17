# Roteiro do Vídeo - CardioIA Fase 4 (até 3 minutos)

Vídeo de demonstração da solução completa: pré-processamento, CNN do zero,
Transfer Learning, protótipo Flask e app mobile.

**Vídeo publicado (YouTube, não listado):** <https://youtu.be/MWg5o2Bh_Tg>

- **Duração alvo:** até 3 min (~165 s de conteúdo + abertura/encerramento).
- **Formato:** screencast 1080p, áudio limpo. Mostrar a tela enquanto narra.
- **Dica:** rodar o Flask e o `npx expo start` antes de gravar; deixar uma imagem
  NORMAL e uma PNEUMONIA do conjunto de teste à mão.

---

## Estrutura (cena a cena)

### 0. Abertura (~10 s)
- **Tela:** README do projeto / slide com título e Grupo 72.
- **Fala:** "Somos o Grupo 72. Este é o CardioIA Visão Computacional: um assistente
  que classifica radiografias de tórax em NORMAL ou PNEUMONIA usando deep learning."

### 1. Notebooks - pré-processamento e dados (~30 s)
- **Tela:** `notebooks/01_preprocessamento.ipynb` no Colab; rolar pelo inventário,
  o problema do val com 16 imagens e o re-split por paciente; mostrar
  `data/splits/*.csv`.
- **Fala:** "Usamos o dataset Chest X-Ray Pneumonia, com quase 6 mil imagens.
  Refizemos a divisão treino/validação/teste por paciente, para evitar vazamento,
  e padronizamos tudo em 224x224 RGB com normalização e augmentation."

### 2. Modelos e métricas (~45 s)
- **Tela:** `02_cnn_do_zero.ipynb` e `03_transfer_learning.ipynb`; mostrar as
  curvas de treino, a **matriz de confusão**, o `classification_report`
  (acurácia, precisão, recall, F1) e a **tabela comparativa CNN vs VGG16**;
  fechar com o **Grad-CAM**.
- **Fala:** "Treinamos uma CNN do zero e um Transfer Learning com VGG16. Avaliamos
  no conjunto de teste com matriz de confusão, precisão, recall e F1. O VGG16
  teve o melhor desempenho. Com Grad-CAM, vemos que o modelo olha para as regiões
  pulmonares relevantes."

### 3. Protótipo Flask (~30 s)
- **Tela:** navegador em `http://localhost:5050`; upload de uma radiografia;
  mostrar o resultado (classe + confiança) na página.
- **Fala:** "Empacotamos o modelo num protótipo web em Flask. O usuário faz upload
  da radiografia e recebe a classificação com o nível de confiança. O mesmo
  backend expõe uma API REST."

### 4. App mobile (~60 s)
- **Tela:** celular (ou Expo Go espelhado). Mostrar o selo de conexão com o
  backend; "Escolher da galeria" -> preview -> "Analisar" -> cartão de
  resultado colorido com a porcentagem; destacar o aviso de uso acadêmico;
  tocar "Nova análise" e repetir com uma imagem da outra classe.
- **Fala:** "No Ir Além 2, levamos a classificação para um app em React Native
  com Expo. Ele se conecta ao mesmo backend Flask pela rede local: escolhemos a
  imagem, classificamos e o resultado aparece com a classe, a confiança e o
  aviso de que isso não substitui avaliação médica."

### 5. Encerramento (~10 s)
- **Tela:** slide final com ética/limitações e os nomes do grupo.
- **Fala:** "Reforçamos que é um estudo acadêmico, com dados pediátricos de uma
  única fonte - discutimos os vieses no Ir Além 1. Obrigado!"

---

## Checklist antes de gravar
- [ ] Flask rodando (`python app.py`, porta 5050) com o modelo real do Release.
- [ ] `.env` do app com `EXPO_PUBLIC_USE_MOCK=false` e IP correto.
- [ ] `npx expo start -c`; app aberto no Expo Go, selo 🟢 conectado.
- [ ] Uma imagem NORMAL e uma PNEUMONIA do `test` separadas.
- [ ] Notebooks abertos com os outputs visíveis (matriz de confusão, Grad-CAM).
- [ ] Áudio testado; resolução 1080p.
