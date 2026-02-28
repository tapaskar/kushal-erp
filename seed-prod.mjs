// Production seed runner — executes seed SQL against the database.
// Usage: node seed-prod.mjs
import postgres from "postgres";
import { readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const seedFile = join(__dirname, "seed-staff-security-housekeeping.sql");

const sql = postgres(process.env.DATABASE_URL, {
  max: 1,
  ssl: process.env.NODE_ENV === "production" ? "require" : false,
});

try {
  const seedSql = readFileSync(seedFile, "utf8");

  // Remove BEGIN/COMMIT — we'll wrap it ourselves
  const cleaned = seedSql
    .replace(/^BEGIN;\s*/m, "")
    .replace(/\nCOMMIT;\s*$/m, "");

  // Split on semicolons followed by newline, then filter out pure-comment blocks
  const parts = cleaned
    .split(/;\s*\n/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0);

  // Keep only parts that have at least one non-comment line
  const statements = parts.filter((s) => {
    const lines = s.split("\n").map((l) => l.trim()).filter((l) => l.length > 0);
    return lines.some((l) => !l.startsWith("--"));
  });

  console.log(`[seed] Found ${statements.length} statements to execute`);

  await sql.begin(async (tx) => {
    for (let i = 0; i < statements.length; i++) {
      const stmt = statements[i];
      const firstSqlLine = stmt.split("\n").find((l) => l.trim() && !l.trim().startsWith("--")) || "";
      const preview = firstSqlLine.substring(0, 80);
      console.log(`[seed] (${i + 1}/${statements.length}) ${preview}...`);
      await tx.unsafe(stmt);
    }
  });

  console.log("[seed] Production seed completed successfully!");
} catch (err) {
  console.error("[seed] FAILED:", err);
  process.exit(1);
} finally {
  await sql.end();
}
