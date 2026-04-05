import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const db = getDb();
    const resolvedParams = await Promise.resolve(params);
    const id = parseInt(resolvedParams.id, 10);
    const body = await request.json();
    
    // 허용할 업데이트 필드 목록 (타입 안전성을 위해 지정)
    const allowedFields = [
      'brand', 'model', 'type', 'price_usd', 'weight_g', 'drop_mm',
      'stack_height_mm', 'cushion_score', 'pace_score', 'mileage_score',
      'rating', 'review_count', 'one_liner', 'image_path', 'release_year'
    ];
    
    const updates = [];
    const values = [];
    
    for (const key of Object.keys(body)) {
      if (allowedFields.includes(key)) {
        updates.push(`${key} = ?`);
        values.push(body[key]);
      }
    }
    
    if (updates.length === 0) {
      return NextResponse.json({ error: 'No valid fields provided' }, { status: 400 });
    }
    
    updates.push("updated_at = date('now')");
    values.push(id);
    
    const stmt = db.prepare(`UPDATE shoes SET ${updates.join(', ')} WHERE id = ?`);
    const result = stmt.run(...values);

    if (result.changes === 0) {
      return NextResponse.json({ error: 'Shoe not found' }, { status: 404 });
    }

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
    const db = getDb();
    const resolvedParams = await Promise.resolve(params);
    const id = parseInt(resolvedParams.id, 10);
    
    const stmt = db.prepare('DELETE FROM shoes WHERE id = ?');
    const result = stmt.run(id);

    if (result.changes === 0) {
      return NextResponse.json({ error: 'Shoe not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete shoe:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
