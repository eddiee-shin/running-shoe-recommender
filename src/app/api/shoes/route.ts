import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function GET() {
  try {
    const db = getDb();
    const stmt = db.prepare('SELECT *, image_path as image, updated_at as updated FROM shoes');
    const shoes = stmt.all();
    return NextResponse.json(shoes);
  } catch (error) {
    console.error('Failed to fetch shoes from db:', error);
    return NextResponse.json({ error: 'Failed to fetch shoes' }, { status: 500 });
  }
}
