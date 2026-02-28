import * as SQLite from "expo-sqlite";

let db: SQLite.SQLiteDatabase | null = null;

async function getDb() {
  if (!db) {
    db = await SQLite.openDatabaseAsync("rwa_staff_offline");
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS offline_queue (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        method TEXT NOT NULL,
        url TEXT NOT NULL,
        body TEXT,
        created_at TEXT NOT NULL,
        retries INTEGER DEFAULT 0
      );
    `);
  }
  return db;
}

export async function enqueue(
  method: string,
  url: string,
  body?: object
): Promise<void> {
  const database = await getDb();
  await database.runAsync(
    "INSERT INTO offline_queue (method, url, body, created_at) VALUES (?, ?, ?, ?)",
    method,
    url,
    body ? JSON.stringify(body) : null,
    new Date().toISOString()
  );
}

export async function dequeueAll(): Promise<
  { id: number; method: string; url: string; body: string | null }[]
> {
  const database = await getDb();
  const rows = await database.getAllAsync<{
    id: number;
    method: string;
    url: string;
    body: string | null;
  }>("SELECT * FROM offline_queue ORDER BY id ASC LIMIT 50");
  return rows;
}

export async function remove(id: number): Promise<void> {
  const database = await getDb();
  await database.runAsync("DELETE FROM offline_queue WHERE id = ?", id);
}

export async function incrementRetry(id: number): Promise<void> {
  const database = await getDb();
  await database.runAsync(
    "UPDATE offline_queue SET retries = retries + 1 WHERE id = ?",
    id
  );
}

export async function removeExpired(maxRetries: number = 5): Promise<void> {
  const database = await getDb();
  await database.runAsync(
    "DELETE FROM offline_queue WHERE retries >= ?",
    maxRetries
  );
}

export async function queueSize(): Promise<number> {
  const database = await getDb();
  const result = await database.getFirstAsync<{ count: number }>(
    "SELECT COUNT(*) as count FROM offline_queue"
  );
  return result?.count ?? 0;
}
