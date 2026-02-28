// Migration runner — executes before the Next.js server on container startup.
// Mimics drizzle-orm/postgres-js/migrator behavior using the journal + SQL files.
import postgres from "postgres";
import { readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const migrationsDir = join(__dirname, "drizzle");

const sql = postgres(process.env.DATABASE_URL, {
  max: 1,
  ssl: process.env.NODE_ENV === "production" ? "require" : false,
});

try {
  // Ensure tracking table exists (drizzle-orm standard schema)
  await sql.unsafe(
    `CREATE TABLE IF NOT EXISTS "__drizzle_migrations" (id SERIAL PRIMARY KEY, hash text NOT NULL, created_at bigint)`
  );

  // Read journal first so we can bootstrap if needed
  const journal = JSON.parse(
    readFileSync(join(migrationsDir, "meta", "_journal.json"), "utf8")
  );

  // Bootstrap: if tables exist in DB but no migration is tracked, record 0000 as applied.
  // This handles databases that were created manually before drizzle-kit migrate was used.
  const tracked = await sql`SELECT COUNT(*)::int as count FROM "__drizzle_migrations"`;
  if (Number(tracked[0].count) === 0 && journal.entries.length > 0) {
    const tableCheck = await sql`
      SELECT 1 FROM information_schema.tables
      WHERE table_schema = 'public' AND table_name = 'users' LIMIT 1
    `;
    if (tableCheck.length > 0) {
      // DB already has schema — mark 0000 as applied so we don't re-run it
      const firstEntry = journal.entries[0];
      await sql`
        INSERT INTO "__drizzle_migrations" (hash, created_at)
        VALUES (${firstEntry.tag}, ${firstEntry.when})
      `;
      console.log(`[migrate] bootstrapped: ${firstEntry.tag} recorded as already applied`);
    }
  }

  // Get last applied migration (highest created_at)
  const rows = await sql`
    SELECT created_at FROM "__drizzle_migrations" ORDER BY created_at DESC LIMIT 1
  `;
  const lastApplied = rows[0] ? Number(rows[0].created_at) : 0;

  for (const entry of journal.entries) {
    if (lastApplied >= entry.when) {
      console.log(`[migrate] skip (already applied): ${entry.tag}`);
      continue;
    }

    const sqlContent = readFileSync(
      join(migrationsDir, `${entry.tag}.sql`),
      "utf8"
    );
    const statements = sqlContent
      .split("--> statement-breakpoint")
      .map((s) => s.trim())
      .filter(Boolean);

    console.log(`[migrate] applying: ${entry.tag} (${statements.length} statements)`);
    for (const stmt of statements) {
      await sql.unsafe(stmt);
    }

    await sql`
      INSERT INTO "__drizzle_migrations" (hash, created_at)
      VALUES (${entry.tag}, ${entry.when})
    `;
    console.log(`[migrate] done: ${entry.tag}`);
  }

  console.log("[migrate] All migrations up to date");
} catch (err) {
  console.error("[migrate] FAILED:", err);
  process.exit(1);
} finally {
  await sql.end();
}
