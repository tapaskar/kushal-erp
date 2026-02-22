import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { sql } from "drizzle-orm";
import * as schema from "./schema";

const connectionString = process.env.DATABASE_URL!;

const client = postgres(connectionString, {
  max: 10,
  idle_timeout: 20,
  connect_timeout: 10,
  ssl: process.env.NODE_ENV === "production" ? "require" : false,
});

export const db = drizzle(client, { schema });

/**
 * Execute a callback within a tenant-scoped transaction.
 * Sets the PostgreSQL session variable `app.current_society_id`
 * so RLS policies can filter rows automatically.
 */
export async function withTenant<T>(
  societyId: string,
  callback: (tx: typeof db) => Promise<T>
): Promise<T> {
  return db.transaction(async (tx) => {
    await tx.execute(
      sql`SELECT set_config('app.current_society_id', ${societyId}, true)`
    );
    return callback(tx as unknown as typeof db);
  });
}
