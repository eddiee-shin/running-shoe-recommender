#!/usr/bin/env python3
import sys, os, shutil, re, json
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from bing_image_downloader import downloader
from PIL import Image

VAULT_IMAGES = "/Users/cydiv/Library/Mobile Documents/iCloud~md~obsidian/Documents/cydiv/cydiv/러닝화 데이터베이스/images/"
JSON_PATH = "public/data/shoes.json"
DOWNLOAD_DIR = "downloads_fix_single"

def get_ar(path):
    try:
        with Image.open(path) as img:
            w, h = img.size
            return w / h
    except:
        return None

def is_bright_bg(path, threshold=200):
    """Check if image has a bright (white-ish) background by sampling corners."""
    try:
        with Image.open(path).convert('RGB') as img:
            w, h = img.size
            corners = [
                img.getpixel((5, 5)),
                img.getpixel((w-5, 5)),
                img.getpixel((5, h-5)),
                img.getpixel((w-5, h-5)),
            ]
            avg = sum(sum(c)/3 for c in corners) / 4
            return avg >= threshold
    except:
        return False

brand = "Asics"
model = "Superblast 2"

queries = [
    "Asics Superblast 2 white background lateral side shoe",
    "Asics Superblast 2 product image studio",
    "ASICS US Superblast 2 shoe",
]

best, best_ratio, best_score = None, None, -1

for query in queries:
    print(f"🔍 검색: {query}")
    try:
        downloader.download(query, limit=8, output_dir=DOWNLOAD_DIR, adult_filter_off=True, force_replace=True, timeout=10, verbose=False)
    except Exception as e:
        print(f"  오류: {e}"); continue
    dl_dir = os.path.join(DOWNLOAD_DIR, query)
    if not os.path.exists(dl_dir): continue
    for fname in sorted(os.listdir(dl_dir)):
        fpath = os.path.join(dl_dir, fname)
        ar = get_ar(fpath)
        bright = is_bright_bg(fpath)
        if ar:
            ok = 1.1 <= ar <= 3.0
            score = (1 if ok else 0) + (1 if bright else 0)
            print(f"  {fname}: ar={ar:.2f} bright={'✅' if bright else '❌'} {'✅' if ok else '❌'} score={score}")
            if ok and score > best_score:
                best, best_ratio, best_score = fpath, ar, score
    if best and best_score >= 2:
        break

if best:
    ext = os.path.splitext(best)[1].lower() or '.jpg'
    save_name = f"asics-superblast-2{ext}"
    save_path = os.path.join(VAULT_IMAGES, save_name)
    shutil.copy2(best, save_path)
    print(f"\n✅ 저장 완료: {save_name}  (ar={best_ratio:.2f}, score={best_score})")

    for ext2 in ['.jpg', '.jpeg', '.png', '.webp']:
        old = os.path.join(VAULT_IMAGES, f"asics-superblast-2{ext2}")
        if os.path.exists(old) and f"asics-superblast-2{ext2}" != save_name:
            os.remove(old); print(f"🗑️  {ext2} 삭제")

    with open(JSON_PATH) as f:
        shoes = json.load(f)
    for s in shoes:
        if s['brand'] == brand and s['model'] == model:
            s['image'] = f"images/{save_name}"
    with open(JSON_PATH, 'w') as f:
        json.dump(shoes, f, ensure_ascii=False, indent=2)
    print("✅ shoes.json 업데이트 완료")

    md_path = f"/Users/cydiv/Library/Mobile Documents/iCloud~md~obsidian/Documents/cydiv/cydiv/러닝화 데이터베이스/{brand} - {model}.md"
    if os.path.exists(md_path):
        content = open(md_path).read()
        content = re.sub(r'image:.*', f'image: "images/{save_name}"', content)
        open(md_path, 'w').write(content)
else:
    print("❌ 적합한 이미지 없음")

shutil.rmtree(DOWNLOAD_DIR, ignore_errors=True)
