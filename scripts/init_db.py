#!/usr/bin/env python3
"""
SQLite 데이터베이스 초기화 및 시드 스크립트
기존 shoes.json 데이터를 SQLite DB로 마이그레이션
"""
import sqlite3
import json
import os

DB_PATH = "shoes.db"
JSON_PATH = "public/data/shoes.json"

SCHEMA = """
CREATE TABLE IF NOT EXISTS shoes (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    brand           TEXT    NOT NULL,
    model           TEXT    NOT NULL,
    type            TEXT    NOT NULL DEFAULT 'Daily Trainer',
    price_usd       REAL    DEFAULT 0,
    weight_g        INTEGER DEFAULT 0,
    drop_mm         REAL    DEFAULT 0,
    stack_height_mm REAL    DEFAULT 0,
    cushion_score   INTEGER DEFAULT 3,
    pace_score      INTEGER DEFAULT 3,
    mileage_score   INTEGER DEFAULT 3,
    rating          REAL    DEFAULT 4.0,
    review_count    INTEGER DEFAULT 0,
    one_liner       TEXT    DEFAULT '',
    image_path      TEXT    DEFAULT '',
    tags            TEXT    DEFAULT '',
    memo            TEXT    DEFAULT '',
    updated_at      TEXT    DEFAULT (date('now')),
    UNIQUE(brand, model)
);
"""

def seed(conn, shoes):
    cur = conn.cursor()
    inserted = 0
    skipped = 0
    for s in shoes:
        image = s.get('image', '')
        # Normalize: strip leading 'images/' if present, store as 'images/...'
        if image and not image.startswith('images/'):
            image = f"images/{os.path.basename(image)}"
        try:
            cur.execute("""
                INSERT OR REPLACE INTO shoes
                    (brand, model, type, price_usd, weight_g, drop_mm,
                     stack_height_mm, cushion_score, pace_score, mileage_score,
                     rating, review_count, one_liner, image_path, tags, memo, updated_at)
                VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
            """, (
                s.get('brand', 'Unknown'),
                s.get('model', ''),
                s.get('type', 'Daily Trainer'),
                float(s.get('price_usd', 0) or 0),
                int(s.get('weight_g', 0) or 0),
                float(s.get('drop_mm', 0) or 0),
                float(s.get('stack_height_mm', 0) or 0),
                int(s.get('cushion_score', 3) or 3),
                int(s.get('pace_score', 3) or 3),
                int(s.get('mileage_score', 3) or 3),
                float(s.get('rating', 4.0) or 4.0),
                int(s.get('review_count', 0) or 0),
                s.get('one_liner', ''),
                image,
                s.get('tags', ''),
                s.get('memo', ''),
                s.get('updated', '2025-01-01'),
            ))
            inserted += 1
        except Exception as e:
            print(f"  ⚠️  스킵: {s.get('brand')} {s.get('model')} → {e}")
            skipped += 1
    conn.commit()
    return inserted, skipped

def main():
    print(f"📂 DB 경로: {DB_PATH}")
    conn = sqlite3.connect(DB_PATH)
    conn.execute(SCHEMA)
    conn.commit()
    print("✅ 스키마 생성 완료")

    with open(JSON_PATH, encoding='utf-8') as f:
        shoes = json.load(f)

    inserted, skipped = seed(conn, shoes)
    total = conn.execute("SELECT COUNT(*) FROM shoes").fetchone()[0]
    conn.close()

    print(f"\n✅ 시드 완료: {inserted}개 삽입, {skipped}개 스킵")
    print(f"📊 DB 총 레코드: {total}개")
    print(f"📁 파일 크기: {os.path.getsize(DB_PATH):,} bytes")

if __name__ == "__main__":
    main()
