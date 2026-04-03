#!/usr/bin/env python3
"""
Obsidian MD 파일들을 shoes.json으로 변환
"""
import os
import re
import json
from pathlib import Path

VAULT = "/Users/cydiv/Library/Mobile Documents/iCloud~md~obsidian/Documents/cydiv/cydiv/러닝화 데이터베이스"

shoes = []

for f in Path(VAULT).glob("*.md"):
    if f.name.startswith("📋") or f.name.startswith("images"):
        continue
    
    with open(f, 'r', encoding='utf-8') as fh:
        content = fh.read()
    
    m = re.match(r'---\n(.*?)\n---', content, re.DOTALL)
    if not m:
        continue
    
    shoe = {}
    for line in m.group(1).split('\n'):
        if ':' in line:
            key, val = line.split(':', 1)
            key = key.strip()
            val = val.strip().strip('"').strip("'")
            try:
                val = float(val)
                if val == int(val):
                    val = int(val)
            except (ValueError, TypeError):
                pass
            shoe[key] = val
    
    # 본문에서 메모 내용 추출 (있는 경우)
    memo_match = re.search(r'## 📝 메모\n\n(.*?)\n\n##', content, re.DOTALL)
    if memo_match:
        shoe['memo'] = memo_match.group(1).strip()
        if shoe['memo'] == '<!-- 직접 달려보고 느낀 점을 여기에 기록하세요 -->':
            shoe['memo'] = ''
    
    # 이미지 경로 처리
    if shoe.get('image', '').startswith('images/'):
        shoe['image'] = shoe['image']  # 그대로 사용 (public/images에 복사 필요)
    
    # 필수 필드가 누락된 경우 기본값
    shoe.setdefault('name', f.name.replace('.md', ''))
    shoe.setdefault('brand', 'Unknown')
    shoe.setdefault('model', shoe['name'])
    shoe.setdefault('type', 'Daily Trainer')
    shoe.setdefault('rating', 4.0)
    shoe.setdefault('review_count', 0)
    shoe.setdefault('pace_score', 3)
    shoe.setdefault('cushion_score', 3)
    shoe.setdefault('mileage_score', 3)
    shoe.setdefault('weight_g', 0)
    shoe.setdefault('drop_mm', 0)
    shoe.setdefault('stack_height_mm', 0)
    shoe.setdefault('price_usd', 0)
    shoe.setdefault('one_liner', '')
    
    shoes.append(shoe)

# 브랜드/모델별 정렬
shoes.sort(key=lambda x: (x['brand'], x['model']))

output_path = "/tmp/shoes.json"
with open(output_path, 'w', encoding='utf-8') as f:
    json.dump(shoes, f, ensure_ascii=False, indent=2)

print(f"✅ {len(shoes)}개 신발을 {output_path}로 내보냄")

# 샘플 출력
print("\n샘플:")
for s in shoes[:3]:
    print(f"  {s['brand']} {s['model']} - ⭐{s['rating']}")
