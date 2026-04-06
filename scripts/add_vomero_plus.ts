import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function addVomeroPlus() {
  console.log('Checking for Vomero Plus...');
  const { data: existing } = await supabase
    .from('shoes')
    .select('id')
    .eq('brand', 'Nike')
    .eq('model', 'Vomero Plus')
    .single();

  if (existing) {
    console.log('Vomero Plus already exists.');
    return;
  }

  console.log('Adding Vomero Plus (2025)...');
  const { error } = await supabase
    .from('shoes')
    .insert([
      {
        brand: 'Nike',
        model: 'Vomero Plus',
        type: 'Daily Trainer',
        price_usd: 170,
        rating: 4.6,
        review_count: 0,
        one_liner: 'The evolution of comfort: Nike’s newest premium daily driver.',
        description: 'Vomero Plus offers an enhanced ZoomX experience with a more stable ride and premium upper materials for long-distance training.',
        image_path: '/images/nike-vomero-plus.jpg',
        release_year: 2025,
        likes: 0,
        cushion_score: 9,
        pace_score: 5,
        mileage_score: 9,
        drop_mm: 10,
        stack_height_mm: 40,
        weight_g: 280
      }
    ]);

  if (error) {
    console.error('Error adding Vomero Plus:', error);
  } else {
    console.log('Vomero Plus added successfully!');
  }
}

addVomeroPlus();
