import { NextResponse } from 'next/server';
import { writeFile } from 'fs/promises';
import { join } from 'path';

export async function POST(request: Request) {
  try {
    const data = await request.formData();
    const file: File | null = data.get('file') as unknown as File;

    if (!file) {
      return NextResponse.json({ success: false, error: 'No file provided' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // 저장될 파일 이름 (공백 등은 하이픈 제거 처리 권장)
    const fileName = file.name.replace(/\s+/g, '-');
    const destPath = join(process.cwd(), 'public', 'images', fileName);

    await writeFile(destPath, buffer);

    console.log(`Image saved to ${destPath}`);

    return NextResponse.json({ success: true, imagePath: `images/${fileName}` });
  } catch (error) {
    console.error('File upload error:', error);
    return NextResponse.json({ success: false, error: 'Failed to upload' }, { status: 500 });
  }
}
