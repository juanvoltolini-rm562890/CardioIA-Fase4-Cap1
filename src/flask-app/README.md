# CardioIA - Servidor Flask & Interface Web (Passo 4)

Este diretório contém o protótipo funcional e a API REST do **CardioIA**, desenvolvidos em Python utilizando o framework **Flask**. 

O servidor opera em uma arquitetura unificada (Full-Stack), sendo responsável por entregar a interface web para o usuário no navegador e por servir o endpoint de inferência profunda que classifica as radiografias em tempo real.

---

## 🏗️ Arquitetura de Funcionamento

O sistema opera de forma integrada em uma única execução do `app.py`:

```text
Navegador (HTML/CSS/JS)   <--[Entrega index.html]--   Flask Server (app.py)
   │                                                    │  (Porta 5050)
   ├──[POST /predict (AJAX com Imagem)]---------------->├──> Carrega model_meta.json
   └──<--[JSON com Classe/Confiança]-------------------└──> Executa inferência na VGG16 (.keras)
```

1. **Frontend (Interface Visual):** A página `templates/index.html` oferece uma interface premium com drag-and-drop para envio de imagens de Raio-X de tórax e exibe laudos interativos com animações de escaneamento.
2. **Backend (Inferência VGG16):** O arquivo `predictor.py` carrega o modelo Keras `vgg16_finetuned.keras` e suas configurações de pré-processamento em `model_meta.json`. Toda imagem enviada é convertida para RGB, redimensionada para 224x224, normalizada na escala 0-1 e submetida à rede neural convolucional para classificação de pneumonia.
3. **Resiliência (Fallback Mock):** Se o modelo real não for encontrado ou se o TensorFlow falhar ao importar, o preditor entra automaticamente em modo *mock*, processando imagens de forma simulada e determinística por hash de arquivo para garantir que a interface continue testável.

---

## 📁 Estrutura de Arquivos

* **`app.py`**: O arquivo de entrada do Flask. Configura o servidor local na porta `5050` e define as rotas:
  * `GET /`: Rota principal que renderiza a interface web.
  * `POST /predict`: Rota interna utilizada via requisição assíncrona (AJAX) pela interface web.
  * `POST /api/predict`: Endpoint REST para integração com o aplicativo móvel (React Native).
  * `GET /api/health`: Endpoint de saúde que reporta se o modelo real foi carregado com sucesso.
* **`predictor.py`**: A classe responsável por encapsular a lógica de inteligência artificial (carregamento, pré-processamento e predição).
* **`requirements.txt`**: Definição das dependências necessárias pinadas (`Flask`, `tensorflow`, `Pillow`, `numpy`, `requests`).
* **`templates/`**:
  * `index.html`: Template HTML5 com estilização integrada (Outfit Font, Glassmorphism, FontAwesome) e Javascript de controle da interface.

---

## 🚀 Como Executar

> **Aviso de Caminho Longo no Windows:** Para evitar o limite de 260 caracteres imposto pelo Windows durante a instalação do TensorFlow, a pasta de ambiente virtual `.venv` na raiz do projeto foi criada como um atalho (*Directory Junction*) apontando para `c:\Users\felip\venv_cardio`.

### 1. Iniciar o Servidor Flask
A partir da raiz do projeto, execute o comando:
```bash
.venv\Scripts\python.exe src/flask-app/app.py
```
O servidor começará a rodar e estará acessível em:
* Interface Web: **[http://localhost:5050](http://localhost:5050)**
* Endereço na Rede Local: `http://<IP_DO_SEU_COMPUTADOR>:5050` (usado pelo app mobile)

### 2. Testar o Endpoint da API
Com o servidor rodando, abra outro terminal na raiz do projeto e execute o script de teste de API:
```bash
.venv\Scripts\python.exe scripts/test_api.py
```
O script gerará uma imagem temporária em memória e enviará uma requisição `POST /api/predict` para o servidor local, exibindo o retorno da classificação real executada pela rede neural VGG16.
