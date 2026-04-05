import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase keys are missing. Ensure environment variables are set.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function getShoes() {
  const { data, error } = await supabase
    .from('shoes')
    .select('*')
    .order('likes', { ascending: false });
    
  if (error) {
    console.error('Error fetching shoes:', error);
    throw error;
  }
  
  // Map Supabase fields to application fields if they differ
  return data.map(shoe => ({
    ...shoe,
    image: shoe.image_path,
    updated: shoe.updated_at
  }));
}
