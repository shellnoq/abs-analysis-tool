import os

def get_directory_structure(start_path, exclude_extensions=None):
    """
    Dizin yapısını emoji ve ağaç yapısı şeklinde gösterir
    """
    if exclude_extensions is None:
        exclude_extensions = []
    
    result = []
    
    for root, dirs, files in os.walk(start_path):
        level = root.replace(start_path, '').count(os.sep)
        indent = '  ' * level
        folder_name = os.path.basename(root)
        
        if level == 0:
            result.append(f"📦{folder_name}")
        else:
            result.append(f"{indent}┣ 📂{folder_name}")
        
        subindent = '  ' * (level + 1)
        for file in files:
            if any(file.endswith(ext) for ext in exclude_extensions):
                continue
            result.append(f"{subindent}┣ 📜{file}")
    
    return result

if __name__ == "__main__":
    # Frontend ve backend dizinleri
    frontend_dizini = "C:\\Users\\cande\\Desktop\\abs-analysis-tool\\frontend\\src"
    backend_dizini = "C:\\Users\\cande\\Desktop\\abs-analysis-tool\\backend"
    cikti_dosyasi = "C:\\Users\\cande\\Desktop\\abs-analysis-tool\\dosya_listesi.txt"
    
    # PYC dosyalarını hariç tut
    haric_tutulan_uzantilar = [".pyc"]
    
    # Dosya listesini ve içeriklerini txt dosyasına yaz
    with open(cikti_dosyasi, 'w', encoding='utf-8') as f:
        # Önce klasör yapılarını göster
        f.write("FRONTEND KLASÖR YAPISI:\n")
        f.write("======================\n\n")
        
        frontend_structure = get_directory_structure(frontend_dizini)
        for line in frontend_structure:
            f.write(f"{line}\n")
        
        f.write("\n\nBACKEND KLASÖR YAPISI:\n")
        f.write("=====================\n\n")
        
        backend_structure = get_directory_structure(backend_dizini, haric_tutulan_uzantilar)
        for line in backend_structure:
            f.write(f"{line}\n")
        
        # Ardından dosya içeriklerini yaz
        f.write("\n\n")
        f.write("FRONTEND DOSYALARI VE İÇERİKLERİ:\n")
        f.write("===============================\n\n")
        
        # Frontend dosyalarını listele ve içeriklerini yaz
        for root, dirs, files in os.walk(frontend_dizini):
            for file in files:
                file_path = os.path.join(root, file)
                relative_path = os.path.relpath(file_path, os.path.dirname(frontend_dizini))
                
                f.write(f"DOSYA: {relative_path}\n")
                f.write("="*50 + "\n")
                
                try:
                    # Dosya içeriğini oku ve yaz
                    with open(file_path, 'r', encoding='utf-8', errors='replace') as code_file:
                        content = code_file.read()
                        f.write(content)
                except Exception as e:
                    f.write(f"[DOSYA OKUNAMADI: {str(e)}]\n")
                
                f.write("\n\n" + "="*70 + "\n\n")
        
        # Backend dosyalarını listele ve içeriklerini yaz
        f.write("\n\nBACKEND DOSYALARI VE İÇERİKLERİ:\n")
        f.write("==============================\n\n")
        
        for root, dirs, files in os.walk(backend_dizini):
            for file in files:
                # PYC dosyalarını atla
                if any(file.endswith(ext) for ext in haric_tutulan_uzantilar):
                    continue
                    
                file_path = os.path.join(root, file)
                relative_path = os.path.relpath(file_path, os.path.dirname(backend_dizini))
                
                f.write(f"DOSYA: {relative_path}\n")
                f.write("="*50 + "\n")
                
                try:
                    # Dosya içeriğini oku ve yaz
                    with open(file_path, 'r', encoding='utf-8', errors='replace') as code_file:
                        content = code_file.read()
                        f.write(content)
                except Exception as e:
                    f.write(f"[DOSYA OKUNAMADI: {str(e)}]\n")
                
                f.write("\n\n" + "="*70 + "\n\n")
    
    print(f"Klasör yapıları ve dosya içerikleri '{cikti_dosyasi}' adlı dosyaya yazıldı.")
    print(f"Dosya listesi '{cikti_dosyasi}' adlı dosyaya yazıldı.")