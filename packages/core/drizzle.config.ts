import * as dotenv from "dotenv";
import { defineConfig } from "drizzle-kit";
import * as path from "node:path";

// Load .env from the root directory
dotenv.config({ path: path.resolve(__dirname, "../../.env") });

let dbUrl = process.env.DATABASE_URL || "../../data/openlearning.db";
if (dbUrl.startsWith("./")) {
  dbUrl = dbUrl.replace("./", "../../");
}

export default defineConfig({
  schema: "./src/db/schema.ts",
  out: "./src/db/migrations",
  dialect: "sqlite",
  dbCredentials: {
    url: dbUrl,
  },
});
