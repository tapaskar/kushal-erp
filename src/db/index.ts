import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { sql } from "drizzle-orm";
import * as schema from "./schema";

// Lazy-initialize to avoid "Invalid URL" errors during Next.js build
// when DATABASE_URL is not set in the build environment.
let _client: ReturnType<typeof postgres> | null = null;
let _db: ReturnType<typeof drizzle<typeof schema>> | null = null;

function getDb() {
  if (!_db) {
    const connectionString = process.env.DATABASE_URL!;
    _client = postgres(connectionString, {
      max: 10,
      idle_timeout: 20,
      connect_timeout: 10,
      ssl: process.env.NODE_ENV === "production" ? "require" : false,
    });
    _db = drizzle(_client, { schema });
  }
  return _db;
}

export const db = new Proxy({} as ReturnType<typeof drizzle<typeof schema>>, {
  get(_target, prop) {
    return (getDb() as any)[prop];
  },
});

/**
 * Execute a callback within a tenant-scoped transaction.
 * Sets the PostgreSQL session variable `app.current_society_id`
 * so RLS policies can filter rows automatically.
 */
export async function withTenant<T>(
  societyId: string,
  callback: (tx: typeof db) => Promise<T>
): Promise<T> {
  return getDb().transaction(async (tx) => {
    await tx.execute(
      sql`SELECT set_config('app.current_society_id', ${societyId}, true)`
    );
    return callback(tx as unknown as typeof db);
  });
}
