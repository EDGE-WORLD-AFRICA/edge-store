import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import type { Knex } from "knex";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface IDatabaseConnection {
  host?: string;
  port?: number;
  user?: string;
  password?: string;
  database?: string;
}

interface IDatabaseConfig {
  client?: string;
  connection?: IDatabaseConnection;
  pool?: {
    min: number;
    max: number;
  };
  migrations?: {
    tableName: string;
    directory: string;
  };
  seeds?: {
    directory: string;
  };
}

export const loadDatabaseConfig = (): Knex.Config => {
  const env = process.env.NODE_ENV || "development";
  
  // Look for database.json in the current directory (src/config/)
  const configPath = path.resolve(__dirname, "database.json");

  let fileConfig: Record<string, IDatabaseConfig> = {};

  if (fs.existsSync(configPath)) {
    try {
      const rawContent = fs.readFileSync(configPath, "utf-8");
      fileConfig = JSON.parse(rawContent);
      console.log(`[Config] Loaded database config from: ${configPath}`);
    } catch (error) {
      console.warn("[Config] Failed to parse database.json. Falling back to .env variables.");
    }
  } else {
    console.warn(`[Config] ⚠️ database.json not found at: ${configPath}`);
  }

  const envConfig = fileConfig[env] || fileConfig["development"] || {};
  const jsonConn = envConfig.connection || {};

  const connection = {
    host: jsonConn.host || process.env.DB_HOST || "127.0.0.1",
    port: parseInt(String(jsonConn.port || process.env.DB_PORT || 3306), 10),
    user: jsonConn.user || process.env.DB_USER || "root",
    password: jsonConn.password !== undefined ? jsonConn.password : (process.env.DB_PASSWORD ?? ""),
    database: jsonConn.database || process.env.DB_NAME || "edge_store",
  };

  // FORCE absolute paths for migrations and seeds relative to the src/ folder.
  // This prevents the "src/src" duplication error when Knex changes working directories.
  const migrationsDir = path.resolve(__dirname, "../db/migrations");
  const seedsDir = path.resolve(__dirname, "../db/seeds");

  return {
    client: "mysql2",
    connection,
    pool: envConfig.pool || { min: 0, max: 10 },
    migrations: {
      tableName: envConfig.migrations?.tableName || "knex_migrations",
      directory: migrationsDir,
    },
    seeds: {
      directory: seedsDir,
    },
  };
};