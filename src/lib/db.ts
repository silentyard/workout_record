import fs from 'fs/promises';
import path from 'path';
import { DatabaseSchema } from '../types/workout';

const dbPath = path.join(process.cwd(), 'data', 'db.json');

// Initialize database if it doesn't exist
async function initDb() {
  try {
    await fs.mkdir(path.join(process.cwd(), 'data'), { recursive: true });
    try {
      await fs.access(dbPath);
    } catch {
      const defaultData: DatabaseSchema = { bodyParts: [], exercises: [], records: [] };
      await fs.writeFile(dbPath, JSON.stringify(defaultData, null, 2), 'utf-8');
    }
  } catch (error) {
    console.error('Error initializing db:', error);
  }
}

export async function getDb(): Promise<DatabaseSchema> {
  await initDb();
  const data = await fs.readFile(dbPath, 'utf-8');
  return JSON.parse(data);
}

export async function saveDb(data: DatabaseSchema): Promise<void> {
  await initDb();
  await fs.writeFile(dbPath, JSON.stringify(data, null, 2), 'utf-8');
}
