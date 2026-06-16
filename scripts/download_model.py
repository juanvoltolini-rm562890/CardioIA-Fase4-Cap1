import os
import urllib.request

def download_file(url, destination):
    if not os.path.exists(destination):
        print(f"Baixando {os.path.basename(destination)}...")
        try:
            urllib.request.urlretrieve(url, destination)
            print(f"-> {os.path.basename(destination)} baixado com sucesso!")
        except Exception as e:
            print(f"Erro ao baixar {os.path.basename(destination)}: {e}")
    else:
        print(f"O arquivo {os.path.basename(destination)} já existe localmente.")

if __name__ == "__main__":
    # Garante a criação apenas da pasta de modelos na raiz
    os.makedirs("models", exist_ok=True)
    
    # URL base apontando para o Release do repositório do grupo
    repo_url = "https://github.com/juanvoltolini-rm562890/CardioIA-Fase4-Cap1/releases/download/v1.0-modelos"
    
    # Lista de arquivos focada na pasta models/
    arquivos_downloads = [
        (f"{repo_url}/vgg16_finetuned.keras", "models/vgg16_finetuned.keras"),
        (f"{repo_url}/cnn_zero.keras", "models/cnn_zero.keras"),
        (f"{repo_url}/model_meta.json", "models/model_meta.json")
    ]
    
    print("=== Iniciando o download dos artefatos de IA (CardioIA) ===")
    for url, dest in arquivos_downloads:
        download_file(url, dest)
    print("=== Processo de sincronização concluído! ===")