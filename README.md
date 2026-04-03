# 👟 FindMyShoe - Running Shoe Recommender

AI-powered running shoe recommendation app built with Next.js and TailwindCSS.

## Features

- 🤖 Smart recommendation algorithm based on user preferences
- 📊 92+ running shoes from 12 brands with real data
- 🎨 Beautiful, responsive UI with Shoe cards and animations
- 📱 Mobile-friendly design
- 🔄 Real-time filtering by type, cushion, pace, mileage, and budget

## Data Source

Shoe data sourced from Obsidian vault, scraped from RunRepeat, Running Warehouse, and manufacturer websites.

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Styling**: TailwindCSS 4
- **Language**: TypeScript
- **Deployment**: Vercel

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Update Data

```bash
python3 scripts/export_shoes.py
cp /tmp/shoes.json public/data/shoes.json
```
