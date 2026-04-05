import { NextResponse } from 'next/server';
import { supabase } from '@/lib/db';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const resolvedParams = await Promise.resolve(params);
    const id = resolvedParams.id;
    
    // likes 카운트 +1 증가 (Postgres에서 단일 원자적 작업 수행)
    const { data: currentShoe, error: fetchError } = await supabase
      .from('shoes')
      .select('likes')
      .eq('id', id)
      .single();

    if (fetchError || !currentShoe) {
      return NextResponse.json({ error: 'Shoe not found' }, { status: 404 });
    }

    const newLikes = (currentShoe.likes || 0) + 1;

    const { data, error: updateError } = await supabase
      .from('shoes')
      .update({ likes: newLikes, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select('likes')
      .single();

    if (updateError) throw updateError;

    return NextResponse.json({ success: true, likes: data.likes });
  } catch (error) {
    console.error('Failed to like shoe:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
