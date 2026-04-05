import { NextResponse } from 'next/server';
import { supabase } from '@/lib/db';

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const resolvedParams = await Promise.resolve(params);
    const id = resolvedParams.id;
    const body = await request.json();
    
    // 허용할 업데이트 필드 목록
    const allowedFields = [
      'brand', 'model', 'type', 'price_usd', 'weight_g', 'drop_mm',
      'stack_height_mm', 'cushion_score', 'pace_score', 'mileage_score',
      'rating', 'review_count', 'one_liner', 'image_path', 'release_year'
    ];
    
    interface Updates {
      [key: string]: any;
      updated_at: string;
    }
    
    const updates: Updates = { updated_at: new Date().toISOString() };
    
    for (const key of Object.keys(body)) {
      if (allowedFields.includes(key)) {
        updates[key] = body[key];
      }
    }
    
    if (Object.keys(updates).length <= 1) { // Only updated_at present
      return NextResponse.json({ error: 'No valid fields provided' }, { status: 400 });
    }
    
    const { data, error } = await supabase
      .from('shoes')
      .update(updates)
      .eq('id', id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to update shoe:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const resolvedParams = await Promise.resolve(params);
    const id = resolvedParams.id;
    
    const { data, error } = await supabase
      .from('shoes')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete shoe:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
