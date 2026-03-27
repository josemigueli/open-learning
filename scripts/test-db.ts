import { eq } from "drizzle-orm";
import { db, users, courses } from "@open-learning/core";

async function main() {
  console.log("Testing Database Connection...");
  try {
    const allUsers = await db.select().from(users).all();
    console.log(`✅ Connection successful. Users in DB: ${allUsers.length}`);
  } catch (error) {
    console.error("❌ Database test failed:", error);
  }
}

main();
