#!/usr/bin/env python3
import sqlite3
import re

DB_PATH = "shoes.db"

# 유추 룰셋 (브랜드, 모델명 포함 문자열 기준)
rules_2024 = [
    "Pegasus 41", "Superblast 2", "Metaspeed Paris", "Alphafly 3",
    "Velocity Nitro 3", "Deviate Nitro 3", "Boston 13", "Rebel v4",
    "1080 v14", "Novablast 4", "Mach 6", "Endorphin Pro 4", "Endorphin Speed 4",
    "Cielo X1", "Cloudmonster 2", "Cloudsurfer Next"
]

rules_2022 = [
    "Pegasus 39", "Vomero 16", "Novablast 3", "Metaspeed Sky+",
    "Metaspeed Edge+", "Alphafly 2", "Vaporfly 2", "Endorphin Pro 3",
    "Boston 11", "Adios Pro 3", "1080 v12"
]

def get_year_for_model(model):
    model_lower = model.lower()
    
    for r in rules_2024:
        if r.lower() in model_lower:
            return 2024
            
    for r in rules_2022:
        if r.lower() in model_lower:
            return 2022
            
    return 2023 # 기본값은 2023으로 설정 (가장 많은 세대)

def main():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    cur = conn.cursor()
    
    cur.execute("SELECT id, model FROM shoes")
    shoes = cur.fetchall()
    
    updated_count = 0
    for shoe in shoes:
        year = get_year_for_model(shoe["model"])
        cur.execute("UPDATE shoes SET release_year = ? WHERE id = ?", (year, shoe["id"]))
        updated_count += 1
        
    conn.commit()
    conn.close()
    print(f"✅ {updated_count}개 신발 출시 연도 매핑 완료.")

if __name__ == "__main__":
    main()
