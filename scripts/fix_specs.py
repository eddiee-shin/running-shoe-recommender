#!/usr/bin/env python3
import json
import os
import re

VAULT = "/Users/cydiv/Library/Mobile Documents/iCloud~md~obsidian/Documents/cydiv/cydiv/러닝화 데이터베이스"

# AI Knowledge Base for 2024-2025 Running Shoe Specs
SPECS = {
    "Adidas Adizero Adios Pro 3": {"price_usd": 250, "weight_g": 215, "drop_mm": 6.5, "stack_height_mm": 39.5},
    "Adidas Adizero Adios Pro 4": {"price_usd": 250, "weight_g": 200, "drop_mm": 6, "stack_height_mm": 39},
    "Adidas Adizero Evo Sl": {"price_usd": 150, "weight_g": 220, "drop_mm": 8, "stack_height_mm": 36},
    "Adidas Boston 12": {"price_usd": 160, "weight_g": 260, "drop_mm": 7, "stack_height_mm": 38},
    "Adidas Boston 13": {"price_usd": 160, "weight_g": 250, "drop_mm": 7, "stack_height_mm": 38},
    "Adidas Solar Glide 6": {"price_usd": 140, "weight_g": 320, "drop_mm": 10, "stack_height_mm": 36},
    "Adidas Takumi Sen 10": {"price_usd": 180, "weight_g": 200, "drop_mm": 6, "stack_height_mm": 33},
    "Adidas Ultraboost Light": {"price_usd": 190, "weight_g": 299, "drop_mm": 10, "stack_height_mm": 30},
    "Altra Experience Flow 2": {"price_usd": 140, "weight_g": 240, "drop_mm": 4, "stack_height_mm": 30},
    "Altra Lone Peak 9": {"price_usd": 140, "weight_g": 314, "drop_mm": 0, "stack_height_mm": 25},
    "Altra Torin 7": {"price_usd": 150, "weight_g": 278, "drop_mm": 0, "stack_height_mm": 30},
    "Altra Torin 8": {"price_usd": 150, "weight_g": 255, "drop_mm": 0, "stack_height_mm": 30},
    "Altra Vanish Carbon 3": {"price_usd": 250, "weight_g": 210, "drop_mm": 0, "stack_height_mm": 36},
    "Asics Gel-Cumulus 26": {"price_usd": 140, "weight_g": 255, "drop_mm": 8, "stack_height_mm": 38.5},
    "Asics Gel-Kayano 31": {"price_usd": 165, "weight_g": 305, "drop_mm": 10, "stack_height_mm": 40},
    "Asics Gel-Nimbus 26": {"price_usd": 160, "weight_g": 304, "drop_mm": 8, "stack_height_mm": 41.5},
    "Asics Gel-Nimbus 27": {"price_usd": 160, "weight_g": 295, "drop_mm": 8, "stack_height_mm": 42},
    "Asics Metaspeed Edge Paris": {"price_usd": 250, "weight_g": 185, "drop_mm": 5, "stack_height_mm": 39.5},
    "Asics Metaspeed Sky+": {"price_usd": 250, "weight_g": 205, "drop_mm": 5, "stack_height_mm": 39},
    "Asics Novablast 4": {"price_usd": 140, "weight_g": 260, "drop_mm": 8, "stack_height_mm": 41.5},
    "Asics Novablast 5": {"price_usd": 140, "weight_g": 252, "drop_mm": 8, "stack_height_mm": 41.5},
    "Asics Superblast 2": {"price_usd": 225, "weight_g": 249, "drop_mm": 8, "stack_height_mm": 45},
    "Brooks Adrenaline GTS 24": {"price_usd": 140, "weight_g": 286, "drop_mm": 12, "stack_height_mm": 36},
    "Brooks Cascadia 17": {"price_usd": 140, "weight_g": 311, "drop_mm": 8, "stack_height_mm": 20},
    "Brooks Ghost 16": {"price_usd": 140, "weight_g": 269, "drop_mm": 12, "stack_height_mm": 35},
    "Brooks Ghost 17": {"price_usd": 140, "weight_g": 269, "drop_mm": 12, "stack_height_mm": 35},
    "Brooks Ghost Max": {"price_usd": 150, "weight_g": 283, "drop_mm": 6, "stack_height_mm": 39},
    "Brooks Ghost Max 2": {"price_usd": 150, "weight_g": 283, "drop_mm": 6, "stack_height_mm": 39},
    "Brooks Ghost Max 3": {"price_usd": 150, "weight_g": 280, "drop_mm": 6, "stack_height_mm": 39},
    "Brooks Glycerin 21": {"price_usd": 160, "weight_g": 277, "drop_mm": 10, "stack_height_mm": 38},
    "Brooks Glycerin 22": {"price_usd": 160, "weight_g": 270, "drop_mm": 10, "stack_height_mm": 38},
    "Brooks Glycerin Max 2": {"price_usd": 200, "weight_g": 298, "drop_mm": 6, "stack_height_mm": 45},
    "Brooks Hyperion 2": {"price_usd": 140, "weight_g": 210, "drop_mm": 8, "stack_height_mm": 28},
    "Brooks Hyperion Max 2": {"price_usd": 180, "weight_g": 258, "drop_mm": 8, "stack_height_mm": 36},
    "Hoka Bondi 8": {"price_usd": 165, "weight_g": 306, "drop_mm": 4, "stack_height_mm": 39},
    "Hoka Bondi 9": {"price_usd": 165, "weight_g": 298, "drop_mm": 4, "stack_height_mm": 39},
    "Hoka Clifton 9": {"price_usd": 145, "weight_g": 248, "drop_mm": 5, "stack_height_mm": 32},
    "Hoka Clifton 10": {"price_usd": 145, "weight_g": 240, "drop_mm": 5, "stack_height_mm": 32},
    "Hoka Mach 6": {"price_usd": 140, "weight_g": 232, "drop_mm": 5, "stack_height_mm": 37},
    "Hoka Mach 7": {"price_usd": 140, "weight_g": 228, "drop_mm": 5, "stack_height_mm": 37},
    "Hoka Rincon 3": {"price_usd": 125, "weight_g": 210, "drop_mm": 5, "stack_height_mm": 29},
    "Hoka Rocket X 2": {"price_usd": 250, "weight_g": 236, "drop_mm": 5, "stack_height_mm": 36},
    "Hoka Speedgoat 5": {"price_usd": 155, "weight_g": 291, "drop_mm": 4, "stack_height_mm": 33},
    "Hoka Speedgoat 6": {"price_usd": 155, "weight_g": 278, "drop_mm": 5, "stack_height_mm": 40},
    "Hoka Torrent 3": {"price_usd": 130, "weight_g": 248, "drop_mm": 5, "stack_height_mm": 23},
    "Mizuno Neo Vista 2": {"price_usd": 180, "weight_g": 266, "drop_mm": 8, "stack_height_mm": 44},
    "Mizuno Wave Inspire 20": {"price_usd": 140, "weight_g": 285, "drop_mm": 12, "stack_height_mm": 38},
    "Mizuno Wave Rebellion Flash 2": {"price_usd": 170, "weight_g": 243, "drop_mm": 8, "stack_height_mm": 36},
    "Mizuno Wave Rebellion Pro 2": {"price_usd": 250, "weight_g": 215, "drop_mm": 1.5, "stack_height_mm": 38},
    "Mizuno Wave Rider 27": {"price_usd": 140, "weight_g": 280, "drop_mm": 12, "stack_height_mm": 38.5},
    "Mizuno Wave Rider 28": {"price_usd": 140, "weight_g": 280, "drop_mm": 12, "stack_height_mm": 38.5},
    "Mizuno Wave Sky 7": {"price_usd": 170, "weight_g": 300, "drop_mm": 8, "stack_height_mm": 41},
    "New Balance Fresh Foam 1080 v13": {"price_usd": 165, "weight_g": 262, "drop_mm": 6, "stack_height_mm": 38},
    "New Balance Fresh Foam 1080 v14": {"price_usd": 165, "weight_g": 255, "drop_mm": 6, "stack_height_mm": 38},
    "New Balance Fresh Foam More v5": {"price_usd": 155, "weight_g": 312, "drop_mm": 4, "stack_height_mm": 44},
    "New Balance Fresh Foam X 860 v14": {"price_usd": 140, "weight_g": 305, "drop_mm": 8, "stack_height_mm": 34},
    "New Balance Fresh Foam X More v4": {"price_usd": 150, "weight_g": 295, "drop_mm": 4, "stack_height_mm": 35},
    "New Balance FuelCell Rebel v4": {"price_usd": 140, "weight_g": 212, "drop_mm": 6, "stack_height_mm": 30},
    "New Balance FuelCell SuperComp Elite v4": {"price_usd": 250, "weight_g": 236, "drop_mm": 4, "stack_height_mm": 40},
    "New Balance FuelCell SuperComp Pacer": {"price_usd": 150, "weight_g": 201, "drop_mm": 8, "stack_height_mm": 25},
    "Nike Alphafly 3": {"price_usd": 285, "weight_g": 218, "drop_mm": 8, "stack_height_mm": 40},
    "Nike Free Run 5.0": {"price_usd": 100, "weight_g": 200, "drop_mm": 6, "stack_height_mm": 26},
    "Nike Infinity Run 4": {"price_usd": 160, "weight_g": 353, "drop_mm": 9, "stack_height_mm": 39},
    "Nike Invincible 4": {"price_usd": 180, "weight_g": 310, "drop_mm": 9, "stack_height_mm": 40},
    "Nike Pegasus 41": {"price_usd": 140, "weight_g": 297, "drop_mm": 10, "stack_height_mm": 37},
    "Nike Pegasus 42": {"price_usd": 140, "weight_g": 280, "drop_mm": 10, "stack_height_mm": 37},
    "Nike Structure 25": {"price_usd": 140, "weight_g": 322, "drop_mm": 10, "stack_height_mm": 37.5},
    "Nike Vaporfly 3": {"price_usd": 260, "weight_g": 198, "drop_mm": 8, "stack_height_mm": 40},
    "Nike Vaporfly 4": {"price_usd": 260, "weight_g": 190, "drop_mm": 8, "stack_height_mm": 40},
    "Nike Vomero Plus": {"price_usd": 160, "weight_g": 300, "drop_mm": 10, "stack_height_mm": 39},
    "Nike Vomero Premium": {"price_usd": 190, "weight_g": 315, "drop_mm": 10, "stack_height_mm": 40},
    "Nike Zoom Fly 6": {"price_usd": 170, "weight_g": 265, "drop_mm": 8, "stack_height_mm": 42},
    "On Running Cloudflow 4": {"price_usd": 160, "weight_g": 235, "drop_mm": 8, "stack_height_mm": 31},
    "On Running Cloudmonster 2": {"price_usd": 180, "weight_g": 300, "drop_mm": 6, "stack_height_mm": 35},
    "On Running Cloudracer": {"price_usd": 200, "weight_g": 185, "drop_mm": 5, "stack_height_mm": 30},
    "On Running Cloudstratus 3": {"price_usd": 180, "weight_g": 290, "drop_mm": 6, "stack_height_mm": 32},
    "On Running Cloudsurfer 2": {"price_usd": 160, "weight_g": 245, "drop_mm": 10, "stack_height_mm": 32},
    "On Running Cloudtilt": {"price_usd": 160, "weight_g": 250, "drop_mm": 7, "stack_height_mm": 30},
    "Salomon Pulsar Trail": {"price_usd": 130, "weight_g": 280, "drop_mm": 6, "stack_height_mm": 32},
    "Salomon S/LAB Ultra 3": {"price_usd": 190, "weight_g": 290, "drop_mm": 8, "stack_height_mm": 29},
    "Salomon Speedcross 6": {"price_usd": 140, "weight_g": 298, "drop_mm": 10, "stack_height_mm": 32},
    "Saucony Endorphin Elite": {"price_usd": 275, "weight_g": 204, "drop_mm": 8, "stack_height_mm": 39.5},
    "Saucony Endorphin Pro 4": {"price_usd": 225, "weight_g": 212, "drop_mm": 8, "stack_height_mm": 39.5},
    "Saucony Endorphin Shift 4": {"price_usd": 150, "weight_g": 286, "drop_mm": 4, "stack_height_mm": 39},
    "Saucony Endorphin Speed 4": {"price_usd": 170, "weight_g": 233, "drop_mm": 8, "stack_height_mm": 36},
    "Saucony Endorphin Speed 5": {"price_usd": 170, "weight_g": 230, "drop_mm": 8, "stack_height_mm": 36},
    "Saucony Guide 17": {"price_usd": 140, "weight_g": 269, "drop_mm": 6, "stack_height_mm": 35},
    "Saucony Kinvara 14": {"price_usd": 120, "weight_g": 200, "drop_mm": 4, "stack_height_mm": 31},
    "Saucony Peregrine 14": {"price_usd": 140, "weight_g": 267, "drop_mm": 4, "stack_height_mm": 28},
    "Saucony Ride 18": {"price_usd": 140, "weight_g": 260, "drop_mm": 8, "stack_height_mm": 35},
    "Saucony Triumph 22": {"price_usd": 160, "weight_g": 286, "drop_mm": 10, "stack_height_mm": 37}
}

def update_yaml_field(content, field_name, new_value):
    pattern = r"^" + field_name + r":\s*.*$"
    replacement = f"{field_name}: {new_value}"
    
    # If field exists, replace it
    if re.search(pattern, content, re.MULTILINE):
        return re.sub(pattern, replacement, content, flags=re.MULTILINE)
    # If field doesn't exist, insert it before the closing '---'
    else:
        # Find closing ---
        parts = content.split('---\n', 2)
        if len(parts) >= 3:
            parts[1] += f"{replacement}\n"
            return "---\n".join(parts)
    return content

def fix_specs():
    updated_count = 0
    
    for filename in os.listdir(VAULT):
        if not filename.endswith('.md'):
            continue
            
        filepath = os.path.join(VAULT, filename)
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
            
        m = re.match(r'---\n(.*?)\n---', content, re.DOTALL)
        if not m:
            continue
            
        # Parse brand and model
        brand = None
        model = None
        for line in m.group(1).split('\n'):
            if line.startswith('brand:'):
                brand = line.split(':', 1)[1].strip().strip('"').strip("'")
            elif line.startswith('model:'):
                model = line.split(':', 1)[1].strip().strip('"').strip("'")
                
        if brand and model:
            key = f"{brand} {model}"
            if key in SPECS:
                specs = SPECS[key]
                new_content = content
                new_content = update_yaml_field(new_content, "price_usd", specs["price_usd"])
                new_content = update_yaml_field(new_content, "weight_g", specs["weight_g"])
                new_content = update_yaml_field(new_content, "drop_mm", specs["drop_mm"])
                new_content = update_yaml_field(new_content, "stack_height_mm", specs["stack_height_mm"])
                
                if new_content != content:
                    with open(filepath, 'w', encoding='utf-8') as f:
                        f.write(new_content)
                    print(f"✅ Updated {key} -> Price: ${specs['price_usd']}, W: {specs['weight_g']}g, D: {specs['drop_mm']}mm")
                    updated_count += 1
            else:
                print(f"⚠️ Notice: Specs not matched exactly for {key}")

    print(f"\nTotal files updated: {updated_count}")

if __name__ == "__main__":
    fix_specs()
