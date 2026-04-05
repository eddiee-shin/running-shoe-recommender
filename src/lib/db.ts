import Database from 'better-sqlite3';
import path from 'path';

// Singleton instance to prevent multiple connections in dev mode
let db: Database.Database | null = null;

export function getDb() {
  if (!db) {
    const dbPath = path.join(process.cwd(), 'shoes.db');
    db = new Database(dbPath);
    // Optimization for reading
    db.pragma('journal_mode = WAL');
  }
  return db;
}
