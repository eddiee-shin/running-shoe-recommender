#!/usr/bin/env python3
import os
import sys
import shutil
import re
import sqlite3

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from bing_image_downloader import downloader
from PIL import Image

VAULT_IMAGES = "/Users/cydiv/Library/Mobile Documents/iCloud~md~obsidian/Documents/cydiv/cydiv/러닝화 데이터베이스/images/"
DB_PATH = "shoes.db"
DOWNLOAD_DIR = "downloads_strict"

MIN_ASPECT_RATIO = 1.15  # 가로가 세로보다 최소 15% 이상 길어야 측면 뷰로 판정
MAX_ASPECT_RATIO = 3.0   # 너무 극단적인 배너 형태 제외

def get_aspect_ratio(file_path):
    try:
        with Image.open(file_path) as img:
            w, h = img.size
            ratio = w / h
            return ratio
    except Exception:
        return None

def is_valid_lateral_shot(file_path):
    ratio = get_aspect_ratio(file_path)
    if ratio is None:
        return False, None
    if MIN_ASPECT_RATIO <= ratio <= MAX_ASPECT_RATIO:
        return True, ratio
    return False, ratio

def download_candidates(query, shoe_key, n=5):
    """Download n candidates and return the best lateral shot file path."""
    try:
        downloader.download(
            query, limit=n, output_dir=DOWNLOAD_DIR,
            adult_filter_off=True, force_replace=True, timeout=10, verbose=False
        )
    except Exception as e:
        print(f"   ⚠️ 다운로드 오류: {e}")
        return None

    dl_dir = os.path.join(DOWNLOAD_DIR, query)
    if not os.path.exists(dl_dir) or not os.listdir(dl_dir):
        print("   ❌ 다운로드 결과 없음")
        return None

    best_file = None
    best_ratio = None

    for fname in os.listdir(dl_dir):
        fpath = os.path.join(dl_dir, fname)
        valid, ratio = is_valid_lateral_shot(fpath)
        if ratio is not None:
            print(f"   🔍 검사: {fname} → 비율 {ratio:.2f} {'✅ 합격' if valid else '❌ 탈락(밑창/탑뷰 의심)'}")
        if valid:
            if best_ratio is None or abs(ratio - 1.6) < abs(best_ratio - 1.6):
                # 1.6 비율(황금비율 측면뷰)에 가장 가까운 이미지 선택
                best_file = fpath
                best_ratio = ratio

    return best_file

def fix_images_strict():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    cur = conn.cursor()
    cur.execute("SELECT brand, model FROM shoes")
    shoes = cur.fetchall()

    modified = False

    for shoe in shoes:
        brand = shoe['brand']
        model = shoe['model']
        key = f"{brand} {model}"

        # 정밀 측면뷰 키워드 조합
        query = f"{brand} {model} running shoe lateral outer side profile white background"
        print(f"\n🔍 [{key}] 검색 중 ...")

        best = download_candidates(query, key, n=5)

        if best:
            ext = os.path.splitext(best)[1].lower()
            if ext not in ['.jpg', '.jpeg', '.png', '.webp']:
                ext = '.jpg'

            save_name = f"{brand.lower().replace(' ', '-')}-{model.lower().replace(' ', '-')}{ext}".replace('/', '-')
            save_path = os.path.join(VAULT_IMAGES, save_name)

            shutil.copy2(best, save_path)
            print(f"   ✅ 최종 저장: {save_name} (비율 {get_aspect_ratio(best):.2f})")

            cur.execute("UPDATE shoes SET image_path = ?, updated_at = date('now') WHERE brand = ? AND model = ?", (f"images/{save_name}", brand, model))
            modified = True

            # Markdown 파일 업데이트
            md_path = f"/Users/cydiv/Library/Mobile Documents/iCloud~md~obsidian/Documents/cydiv/cydiv/러닝화 데이터베이스/{brand} - {model}.md"
            if os.path.exists(md_path):
                with open(md_path, 'r', encoding='utf-8') as mf:
                    content = mf.read()
                content = re.sub(r'image:.*', f'image: "images/{save_name}"', content)
                with open(md_path, 'w', encoding='utf-8') as mf:
                    mf.write(content)
        else:
            print(f"   ⚠️ 합격 이미지를 찾지 못함 — 기존 이미지 유지")

    # 임시 다운로드 디렉터리 정리
    if os.path.exists(DOWNLOAD_DIR):
        shutil.rmtree(DOWNLOAD_DIR)
        print("\n🗑️ 임시 다운로드 디렉터리 정리 완료")

    if modified:
        conn.commit()
        print("\n✅ SQLite shoes.db 업데이트 완료")
    conn.close()

if __name__ == "__main__":
    fix_images_strict()
