import { db, users, courses, progress, sessions, certificates } from "@open-learning/core";

async function main() {
  if (process.env.NODE_ENV !== "development") {
    console.error(
      "❌ Abortado: Este script solo se puede ejecutar en entorno de desarrollo (NODE_ENV=development)."
    );
    process.exit(1);
  }

  console.log("🌊 Flushing database...");
  try {
    // Correct order to avoid foreign key constraint issues
    await db.delete(sessions).execute();
    console.log("✅ Sessions cleared.");

    await db.delete(progress).execute();
    console.log("✅ Progress cleared.");

    await db.delete(certificates).execute();
    console.log("✅ Certificates cleared.");

    await db.delete(courses).execute();
    console.log("✅ Courses cleared.");

    await db.delete(users).execute();
    console.log("✅ Users cleared.");

    console.log("\n✨ Database reset successfully. Everything is clean!");
    console.log("⚠️  Remember to restart the bot to clear in-memory sessions.");
  } catch (error) {
    console.error("❌ Flush failed:", error);
  }
}

main();
