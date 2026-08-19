import knex from "knex";
import { loadDatabaseConfig } from "../config/database";
import { db } from "../config/dbconnection";
import { fileURLToPath } from "url";

export const initializeDatabase = async () => {
  const config = loadDatabaseConfig();
  const connection = config.connection as any;
  const dbName = connection.database;

  if (!dbName) {
    throw new Error("Database name is not defined in configuration.");
  }

  // 1. Connect without database to create it if it doesn't exist
  const tempConfig = {
    ...config,
    connection: { ...connection, database: undefined },
  };
  const tempDb = knex(tempConfig);

  try {
    console.log(`Checking/Creating database: ${dbName}...`);
    await tempDb.raw(`CREATE DATABASE IF NOT EXISTS \`${dbName}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
    console.log(`Database '${dbName}' is ready.`);
  } catch (error) {
    console.error("Failed to create database:", error);
    throw error;
  } finally {
    await tempDb.destroy();
  }

  // 2. Run migrations using the main db instance
  console.log("Running migrations...");
  try {
    await db.migrate.latest();
    console.log("Migrations complete.");
  } catch (error) {
    console.error("Migration failed:", error);
    throw error;
  }

  // 3. Run seeds (Safe-guarded: only runs in development or if forced)
  if (process.env.NODE_ENV === "development" || process.env.RUN_SEEDS === "true") {
    console.log("Running seeds...");
    try {
      await db.seed.run();
      console.log("Seeds complete.");
    } catch (error) {
      console.error("Seeding failed:", error);
    }
  }
};

// --- CLI Execution Block ---
// Checks if this file is being run directly (e.g., via pnpm db:setup)
const isDirectRun = process.argv[1] === fileURLToPath(import.meta.url);

if (isDirectRun) {
  initializeDatabase()
    .then(() => {
      console.log("✅ Database setup completed successfully.");
      process.exit(0);
    })
    .catch((err) => {
      console.error("❌ Database setup failed:", err);
      process.exit(1);
    });
}