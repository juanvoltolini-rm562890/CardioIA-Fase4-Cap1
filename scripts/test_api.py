import os
import sys
import io
import requests
from PIL import Image

def run_test(file_path=None, url="http://localhost:5050/api/predict"):
    print(f"Testando endpoint: {url}")
    
    if file_path:
        if not os.path.exists(file_path):
            print(f"[ERRO] Arquivo não encontrado: {file_path}")
            sys.exit(1)
        print(f"Usando imagem local: {file_path}")
        filename = os.path.basename(file_path)
        with open(file_path, "rb") as f:
            file_bytes = f.read()
    else:
        print("Nenhuma imagem fornecida. Gerando uma imagem de teste temporária em memória...")
        # Gerar uma imagem simples 224x224 cinza
        img = Image.new("RGB", (224, 224), color=(128, 128, 128))
        img_byte_arr = io.BytesIO()
        img.save(img_byte_arr, format='PNG')
        file_bytes = img_byte_arr.getvalue()
        filename = "temp_normal_xray.png" # nome contendo 'normal' para guiar o mock se necessário
        
    files = {
        "image": (filename, file_bytes, "image/png")
    }
    
    try:
        response = requests.post(url, files=files)
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            print("[SUCESSO] Resposta recebida do servidor:")
            import json
            print(json.dumps(response.json(), indent=2, ensure_ascii=False))
        else:
            print("[ERRO] Ocorreu uma falha no servidor:")
            print(response.text)
            sys.exit(1)
            
    except requests.exceptions.ConnectionError:
        print("[ERRO] Não foi possível conectar ao servidor. Certifique-se de que o Flask está rodando em http://localhost:5050")
        sys.exit(1)
    except Exception as e:
        print(f"[ERRO] Falha ao executar o teste: {e}")
        sys.exit(1)

if __name__ == "__main__":
    file_path_arg = sys.argv[1] if len(sys.argv) > 1 else None
    run_test(file_path_arg)
