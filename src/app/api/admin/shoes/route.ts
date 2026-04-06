import { NextResponse } from 'next/server';
import { supabase } from '@/lib/db';

export async function GET() {
  try {
    const { data: shoes, error } = await supabase
      .from('shoes')
      .select('*')
      .order('id', { ascending: true });

    if (error) throw error;
    
    const mappedShoes = shoes.map(shoe => ({
      ...shoe,
      image: shoe.image_path,
      updated: shoe.updated_at
    }));

    return NextResponse.json(mappedShoes);
  } catch (error) {
    console.error('Failed to fetch all shoes for admin:', error);
    return NextResponse.json({ error: 'Failed to fetch shoes' }, { status: 500 });
  }
}
