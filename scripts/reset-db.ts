import { existsSync, unlinkSync } from "node:fs";
import { resolve } from "node:path";

const dbPath = process.env.DATABASE_URL || "./data/openlearning.db";
const resolvedPath = dbPath.startsWith("./") ? resolve(process.cwd(), dbPath) : dbPath;

if (process.env.NODE_ENV !== "development") {
  console.error(
    "❌ Abortado: Este script solo se puede ejecutar en desarrollo (NODE_ENV=development)."
  );
  process.exit(1);
}

console.log("🔄 Resetting database...");

if (existsSync(resolvedPath)) {
  unlinkSync(resolvedPath);
  console.log("✅ Database file deleted:", resolvedPath);
} else {
  console.log("ℹ️  No database file found at:", resolvedPath);
}

console.log("\n✨ Database reset complete!");
console.log("⚠️  Run 'npm run db:migrate' to apply migrations.");
