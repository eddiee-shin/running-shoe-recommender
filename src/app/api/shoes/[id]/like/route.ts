import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const db = getDb();
    const resolvedParams = await Promise.resolve(params);
    const id = parseInt(resolvedParams.id, 10);
    
    // likes 카운트 +1 증가
    const stmt = db.prepare('UPDATE shoes SET likes = likes + 1, updated_at = date("now") WHERE id = ?');
    const result = stmt.run(id);

    if (result.changes === 0) {
      return NextResponse.json({ error: 'Shoe not found' }, { status: 404 });
    }

    // 증가된 최신 likes 값 반환
    const selectStmt = db.prepare('SELECT likes FROM shoes WHERE id = ?');
    const row = selectStmt.get(id) as { likes: number };

    return NextResponse.json({ success: true, likes: row.likes });
  } catch (error) {
    console.error('Failed to like shoe:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
