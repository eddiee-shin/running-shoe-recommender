import { createClient } from '@supabase/supabase-js'
import Database from 'better-sqlite3'
import path from 'path'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials in .env.local')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)
const db = new Database(path.join(process.cwd(), 'shoes.db'))

async function migrate() {
  console.log('Fetching shoes from SQLite...')
  const shoes = db.prepare('SELECT * FROM shoes').all() as any[]
  console.log(`Found ${shoes.length} shoes. Migrating to Supabase...`)

  for (const shoe of shoes) {
    const { error } = await supabase
      .from('shoes')
      .upsert({
        brand: shoe.brand,
        model: shoe.model,
        type: shoe.type,
        price_usd: shoe.price_usd,
        rating: shoe.rating,
        review_count: shoe.review_count,
        one_liner: shoe.one_liner,
        image_path: shoe.image_path,
        release_year: shoe.release_year,
        likes: shoe.likes || 0,
        cushion_score: shoe.cushion_score,
        pace_score: shoe.pace_score,
        mileage_score: shoe.mileage_score,
        drop_mm: shoe.drop_mm,
        stack_height_mm: shoe.stack_height_mm,
        weight_g: shoe.weight_g
      }, { onConflict: 'brand,model' })

    if (error) {
      console.error(`Error migrating ${shoe.model}:`, error)
    } else {
      console.log(`Migrated ${shoe.model}`)
    }
  }
}

migrate()
