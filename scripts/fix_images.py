#!/usr/bin/env python3
import json
import os
import shutil
import sys

# Ensure current directory is in path so our fake imghdr.py gets picked up
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from bing_image_downloader import downloader

VAULT_IMAGES = "/Users/cydiv/Library/Mobile Documents/iCloud~md~obsidian/Documents/cydiv/cydiv/러닝화 데이터베이스/images/"
JSON_PATH = "public/data/shoes.json"

def fix_images():
    with open(JSON_PATH, 'r', encoding='utf-8') as f:
        shoes = json.load(f)
    
    modified = False
    
    # We will track downloaded searches to avoid redundant API hits for the exact same query
    # though brands and models are usually unique here.
    
    for shoe in shoes:
        query = f"{shoe['brand']} {shoe['model']} running shoe profile product shot white background"
        print(f"\n🔍 검색 중: {query}")
        
        try:
            # We enforce download
            downloader.download(query, limit=1, output_dir='downloads', adult_filter_off=True, force_replace=True, timeout=10, verbose=False)
            
            download_dir = os.path.join('downloads', query)
            if os.path.exists(download_dir) and os.listdir(download_dir):
                downloaded_file = os.listdir(download_dir)[0]
                ext = os.path.splitext(downloaded_file)[1].lower()
                if ext not in ['.jpg', '.jpeg', '.png', '.webp']:
                    ext = '.jpg'
                
                source_path = os.path.join(download_dir, downloaded_file)
                save_name = f"{shoe['brand'].lower().replace(' ', '-')}-{shoe['model'].lower().replace(' ', '-')}{ext}".replace('/', '-')
                save_path = os.path.join(VAULT_IMAGES, save_name)
                
                # 강제 이동 및 덮어쓰기
                shutil.move(source_path, save_path)
                
                print(f"✅ 다운로드 및 이동 성공: {save_name}")
                
                # JSON 업데이트
                shoe['image'] = f"images/{save_name}"
                modified = True
                
                # Markdown 파일 업데이트
                md_path = f"/Users/cydiv/Library/Mobile Documents/iCloud~md~obsidian/Documents/cydiv/cydiv/러닝화 데이터베이스/{shoe['brand']} - {shoe['model']}.md"
                if os.path.exists(md_path):
                    with open(md_path, 'r', encoding='utf-8') as mf:
                        content = mf.read()
                    import re
                    content = re.sub(r'image:.*', f'image: "images/{save_name}"', content)
                    with open(md_path, 'w', encoding='utf-8') as mf:
                        mf.write(content)
            else:
                print(f"⚠️ 검색 결과 다운로드 실패: {query}")
                
        except Exception as e:
            print(f"⚠️ 검색 API 오류: {e}")
                
    if modified:
        with open(JSON_PATH, 'w', encoding='utf-8') as f:
            json.dump(shoes, f, ensure_ascii=False, indent=2)
        print("\n✅ shoes.json 업데이트 완료")

if __name__ == "__main__":
    fix_images()
