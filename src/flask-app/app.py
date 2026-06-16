import os
from flask import Flask, request, jsonify, render_template
from predictor import Predictor

app = Flask(__name__)

# Instanciar o preditor no startup
# Ele tentará carregar o modelo real e entrará em fallback mock se falhar
predictor = Predictor()

@app.after_request
def add_cors_headers(response):
    response.headers["Access-Control-Allow-Origin"] = "*"
    response.headers["Access-Control-Allow-Headers"] = "Content-Type,Authorization"
    response.headers["Access-Control-Allow-Methods"] = "GET,POST,OPTIONS"
    return response

@app.route("/", methods=["GET"])
def index():
    return render_template("index.html")

@app.route("/predict", methods=["POST"])
def predict():
    if "image" not in request.files:
        return jsonify({"error": "Nenhuma imagem enviada. Use o campo 'image'."}), 400
        
    file = request.files["image"]
    if file.filename == "":
        return jsonify({"error": "Nome de arquivo vazio."}), 400
        
    try:
        image_bytes = file.read()
        result = predictor.predict(image_bytes, filename=file.filename)
        return jsonify(result)
    except Exception as e:
        return jsonify({"error": f"Erro interno no processamento: {str(e)}"}), 500

@app.route("/api/predict", methods=["POST", "OPTIONS"])
def api_predict():
    if request.method == "OPTIONS":
        return jsonify({"status": "CORS preflight ok"}), 200
        
    if "image" not in request.files:
        return jsonify({"error": "Nenhuma imagem enviada no multipart form. Use o campo 'image'."}), 400
        
    file = request.files["image"]
    if file.filename == "":
        return jsonify({"error": "Nome de arquivo vazio."}), 400
        
    try:
        image_bytes = file.read()
        result = predictor.predict(image_bytes, filename=file.filename)
        return jsonify(result)
    except Exception as e:
        return jsonify({"error": f"Erro interno no processamento: {str(e)}"}), 500

@app.route("/api/health", methods=["GET"])
def health():
    return jsonify({
        "status": "ok",
        "mock_mode": predictor.mock_mode,
        "model_loaded": predictor.model is not None
    })

if __name__ == "__main__":
    # porta 5050 para evitar conflitos no macOS (AirPlay) e host 0.0.0.0 para acesso local
    port = int(os.environ.get("PORT", 5050))
    print(f"Iniciando o servidor CardioIA Flask na porta {port}...")
    app.run(host="0.0.0.0", port=port, debug=False)
