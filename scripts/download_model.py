import os
import sys
import requests

def download_file_from_google_drive(file_id, destination):
    print(f"Iniciando download do modelo do Google Drive (ID: {file_id})...")
    URL = f"https://drive.usercontent.google.com/download?id={file_id}&export=download&confirm=t"
    
    try:
        response = requests.get(URL, stream=True)
    except Exception as e:
        print(f"Erro de conexão ao tentar baixar o arquivo: {e}")
        return False
            
    try:
        save_response_content(response, destination)
        print(f"Download concluído com sucesso! Salvo em: {destination}")
        return True
    except Exception as e:
        print(f"Erro ao gravar o arquivo de destino: {e}")
        return False

def get_confirm_token(response):
    for key, value in response.cookies.items():
        if key.startswith('download_warning'):
            return value
    return None

def save_response_content(response, destination):
    CHUNK_SIZE = 32768
    total_size = 0
    with open(destination, "wb") as f:
        for chunk in response.iter_content(CHUNK_SIZE):
            if chunk:  # filter out keep-alive new chunks
                f.write(chunk)
                total_size += len(chunk)
                # print progress periodically
                sys.stdout.write(f"\rBaixado: {total_size / (1024*1024):.2f} MB")
                sys.stdout.flush()
    print("") # new line

if __name__ == "__main__":
    # ID do arquivo vgg16_finetuned.keras no Google Drive
    FILE_ID = "1cnCgAeOt1tJvHRd85B_rONsZQ5TFG6En"
    
    # Caminho de destino
    script_dir = os.path.dirname(os.path.abspath(__file__))
    project_root = os.path.dirname(script_dir)
    dest_dir = os.path.join(project_root, "models")
    dest_path = os.path.join(dest_dir, "vgg16_finetuned.keras")
    
    if not os.path.exists(dest_dir):
        os.makedirs(dest_dir)
        
    success = download_file_from_google_drive(FILE_ID, dest_path)
    if not success:
        print("[ERRO] Falha no download do modelo.")
        sys.exit(1)
    else:
        print("[SUCESSO] Processo de download do modelo concluído.")
        sys.exit(0)
