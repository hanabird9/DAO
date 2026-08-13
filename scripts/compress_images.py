import os
import re
from PIL import Image

# Directories and files to check
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ASSETS_DIR = os.path.join(BASE_DIR, "assets")
FILES_TO_UPDATE = [
    os.path.join(BASE_DIR, "menu_data.js"),
    os.path.join(BASE_DIR, "app.js"),
    os.path.join(BASE_DIR, "index.html")
]

# File size threshold (200 KB)
SIZE_THRESHOLD_BYTES = 200 * 1024

def compress_image_to_webp(file_path):
    """Compress image and convert to WebP, saving it in the same directory."""
    try:
        file_size = os.path.getsize(file_path)
        if file_size <= SIZE_THRESHOLD_BYTES:
            return None  # Skip small files

        # Avoid converting already converted files or non-image assets
        ext = os.path.splitext(file_path)[1].lower()
        if ext not in ['.png', '.jpg', '.jpeg', '.jfif']:
            return None

        img = Image.open(file_path)
        # Convert RGBA to RGB if saving to WebP (handles transparency correctly)
        if img.mode in ('RGBA', 'LA'):
            background = Image.new('RGB', img.size, (255, 255, 255))
            background.paste(img, mask=img.split()[3] if img.mode == 'RGBA' else img.split()[1])
            img = background
        elif img.mode != 'RGB':
            img = img.convert('RGB')

        new_filename = os.path.splitext(file_path)[0] + ".webp"
        
        # Save as WebP with quality=80
        img.save(new_filename, "WEBP", quality=80)
        
        new_size = os.path.getsize(new_filename)
        print(f"Compressed: {os.path.basename(file_path)} ({file_size/1024:.1f}KB) -> {os.path.basename(new_filename)} ({new_size/1024:.1f}KB) [Saved {((file_size - new_size)/file_size)*100:.1f}%]")
        
        # Remove original file to keep project clean
        os.remove(file_path)
        
        return {
            "old_rel_path": os.path.relpath(file_path, BASE_DIR).replace('\\', '/'),
            "new_rel_path": os.path.relpath(new_filename, BASE_DIR).replace('\\', '/')
        }
    except Exception as e:
        print(f"Error compressing {file_path}: {e}")
        return None

def update_references(replacements):
    """Update file references in JS and HTML files."""
    for file_path in FILES_TO_UPDATE:
        if not os.path.exists(file_path):
            continue
            
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
            
        updated = False
        for rep in replacements:
            old_path = rep["old_rel_path"]
            new_path = rep["new_rel_path"]
            
            # Simple replacement
            if old_path in content:
                content = content.replace(old_path, new_path)
                updated = True
                print(f"Updated reference in {os.path.basename(file_path)}: {old_path} -> {new_path}")
                
            # Also check for just basename replacements if relative paths differ slightly
            old_base = os.path.basename(old_path)
            new_base = os.path.basename(new_path)
            if old_base in content:
                content = content.replace(old_base, new_base)
                updated = True
                print(f"Updated basename reference in {os.path.basename(file_path)}: {old_base} -> {new_base}")

        if updated:
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(content)

def main():
    print("Starting automated image compression...")
    replacements = []
    
    # Recurse through assets directory
    for root, dirs, files in os.walk(ASSETS_DIR):
        for file in files:
            file_path = os.path.join(root, file)
            res = compress_image_to_webp(file_path)
            if res:
                replacements.append(res)
                
    if replacements:
        print(f"\nReplacing references for {len(replacements)} converted images...")
        update_references(replacements)
        print("Reference update complete.")
    else:
        print("\nNo images required compression.")

if __name__ == "__main__":
    main()
