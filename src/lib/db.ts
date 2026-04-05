import Database from 'better-sqlite3';
import path from 'path';

let db: Database.Database | null = null;

export function getDb() {
  if (!db) {
    const dbPath = path.join(process.cwd(), 'shoes.db');
    // Vercel serverless functions handle only a read-only filesystem.
    // Opening with readonly: true is safer.
    db = new Database(dbPath, { readonly: true });
  }
  return db;
}
