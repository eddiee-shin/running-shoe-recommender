#!/usr/bin/env python3
"""
특정 신발의 정보를 SQLite DB에서 바로 수정하는 스크립트
예: python3 update_shoe.py --brand "Nike" --model "Pegasus 41" --price 145
"""
import argparse
import sqlite3
import os

DB_PATH = "shoes.db"

def main():
    parser = argparse.ArgumentParser(description="Update shoe specs in DB")
    parser.add_argument('--brand', required=True, help="Brand name (e.g. Nike)")
    parser.add_argument('--model', required=True, help="Model name (e.g. Pegasus 41)")
    parser.add_argument('--price', type=float, help="Update price_usd")
    parser.add_argument('--weight', type=int, help="Update weight_g")
    parser.add_argument('--drop', type=float, help="Update drop_mm")
    parser.add_argument('--stack', type=float, help="Update stack_height_mm")
    parser.add_argument('--image', type=str, help="Update image_path")

    args = parser.parse_args()

    conn = sqlite3.connect(DB_PATH)
    cur = conn.cursor()

    # Check if exists
    cur.execute("SELECT id FROM shoes WHERE brand = ? AND model = ?", (args.brand, args.model))
    row = cur.fetchone()
    if not row:
        print(f"❌ '{args.brand} {args.model}' 모델을 찾을 수 없습니다.")
        conn.close()
        return

    updates = []
    params = []
    
    if args.price is not None:
        updates.append("price_usd = ?")
        params.append(args.price)
    if args.weight is not None:
        updates.append("weight_g = ?")
        params.append(args.weight)
    if args.drop is not None:
        updates.append("drop_mm = ?")
        params.append(args.drop)
    if args.stack is not None:
        updates.append("stack_height_mm = ?")
        params.append(args.stack)
    if args.image is not None:
        updates.append("image_path = ?")
        params.append(args.image)

    if not updates:
        print("ℹ️ 변경할 값이 주어지지 않았습니다. --help 를 확인하세요.")
        conn.close()
        return

    updates.append("updated_at = date('now')")
    
    query = f"UPDATE shoes SET {', '.join(updates)} WHERE brand = ? AND model = ?"
    params.extend([args.brand, args.model])

    try:
        cur.execute(query, params)
        conn.commit()
        print(f"✅ '{args.brand} {args.model}' 업데이트 완료 ({cur.rowcount}행 적용).")
    except Exception as e:
        print(f"❌ 업데이트 실패: {e}")
    finally:
        conn.close()

if __name__ == "__main__":
    main()
