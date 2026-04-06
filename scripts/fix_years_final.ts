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

const FINAL_UPDATES = [
  // Nike
  { brand: 'Nike', model: 'Vomero Premium', year: 2025 },
  { brand: 'Nike', model: 'Vomero Plus', year: 2025 },
  { brand: 'Nike', model: 'Pegasus 42', year: 2026 },
  { brand: 'Nike', model: 'Pegasus 41', year: 2024 },
  { brand: 'Nike', model: 'Alphafly 3', year: 2024 },
  { brand: 'Nike', model: 'Invincible 4', year: 2025 },
  { brand: 'Nike', model: 'Zoom Fly 6', year: 2024 },
  { brand: 'Nike', model: 'Vaporfly 3', year: 2023 },
  { brand: 'Nike', model: 'Vaporfly 4', year: 2025 },
  { brand: 'Nike', model: 'Free Run 5.0', year: 2023 },
  { brand: 'Nike', model: 'Infinity Run 4', year: 2023 },
  { brand: 'Nike', model: 'Structure 25', year: 2023 },

  // Asics
  { brand: 'Asics', model: 'Gel-Nimbus 27', year: 2025 },
  { brand: 'Asics', model: 'Novablast 5', year: 2024 },
  { brand: 'Asics', model: 'Superblast 2', year: 2024 },
  { brand: 'Asics', model: 'Gel-Kayano 31', year: 2024 },
  { brand: 'Asics', model: 'Gel-Nimbus 26', year: 2024 },
  { brand: 'Asics', model: 'Metaspeed Edge Paris', year: 2024 },
  { brand: 'Asics', model: 'Novablast 4', year: 2023 },
  { brand: 'Asics', model: 'Gel-Cumulus 26', year: 2024 },

  // Adidas
  { brand: 'Adidas', model: 'Adizero Adios Pro 4', year: 2025 },
  { brand: 'Adidas', model: 'Adizero Adios Pro 3', year: 2022 },
  { brand: 'Adidas', model: 'Adizero Evo Sl', year: 2024 },
  { brand: 'Adidas', model: 'Boston 12', year: 2023 },
  { brand: 'Adidas', model: 'Boston 13', year: 2024 },
  { brand: 'Adidas', model: 'Takumi Sen 10', year: 2024 },
  { brand: 'Adidas', model: 'Ultraboost Light', year: 2023 },

  // Hoka
  { brand: 'Hoka', model: 'Clifton 10', year: 2025 },
  { brand: 'Hoka', model: 'Clifton 9', year: 2023 },
  { brand: 'Hoka', model: 'Bondi 9', year: 2025 },
  { brand: 'Hoka', model: 'Bondi 8', year: 2022 },
  { brand: 'Hoka', model: 'Mach 7', year: 2025 },
  { brand: 'Hoka', model: 'Mach 6', year: 2024 },
  { brand: 'Hoka', model: 'Speedgoat 6', year: 2024 },
  { brand: 'Hoka', model: 'Speedgoat 5', year: 2022 },

  // Brooks
  { brand: 'Brooks', model: 'Ghost 17', year: 2025 },
  { brand: 'Brooks', model: 'Ghost 16', year: 2024 },
  { brand: 'Brooks', model: 'Adrenaline GTS 24', year: 2024 },
  { brand: 'Brooks', model: 'Glycerin 21', year: 2024 },
  { brand: 'Brooks', model: 'Hyperion 2', year: 2024 },
  { brand: 'Brooks', model: 'Hyperion Max 2', year: 2024 },
  { brand: 'Brooks', model: 'Ghost Max 2', year: 2024 },

  // Saucony
  { brand: 'Saucony', model: 'Endorphin Speed 5', year: 2025 },
  { brand: 'Saucony', model: 'Endorphin Speed 4', year: 2024 },
  { brand: 'Saucony', model: 'Endorphin Pro 4', year: 2024 },
  { brand: 'Saucony', model: 'Ride 18', year: 2024 },
  { brand: 'Saucony', model: 'Triumph 22', year: 2024 },
  { brand: 'Saucony', model: 'Guide 17', year: 2023 },
];

async function updateYears() {
  console.log('Starting deep verification updates...');
  let successCount = 0;
  for (const item of FINAL_UPDATES) {
    const { data, error, count } = await supabase
      .from('shoes')
      .update({ release_year: item.year })
      .eq('brand', item.brand)
      .eq('model', item.model);

    if (error) {
      console.error(`Error updating ${item.brand} ${item.model}:`, error);
    } else {
      console.log(`Verified & Updated: ${item.brand} ${item.model} -> ${item.year}`);
      successCount++;
    }
  }
  console.log(`Finished. Total updated: ${successCount}`);
}

updateYears();
