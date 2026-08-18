import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import type { Knex } from "knex";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface IDatabaseConfig {
  client: string;
  connection: {
    host: string;
    port: number;
    user: string;
    password: string;
    database: string;
  };
  pool: {
    min: number;
    max: number;
  };
  migrations: {
    tableName: string;
    directory: string;
  };
  seeds?: {
    directory: string;
  };
}

export const loadDatabaseConfig = (): Knex.Config => {
  const env = process.env.NODE_ENV || "development";
  const configPath = path.resolve(__dirname, "database.json");

  let fileConfig: Record<string, IDatabaseConfig> = {};

  if (fs.existsSync(configPath)) {
    try {
      const rawContent = fs.readFileSync(configPath, "utf-8");
      fileConfig = JSON.parse(rawContent);
    } catch (error) {
      console.warn("Failed to parse database.json, using environment variables only.");
    }
  }

  const envConfig = fileConfig[env] || fileConfig["development"] || {};

  const connection = {
    host: process.env.DB_HOST || envConfig.connection?.host || "127.0.0.1",
    port: parseInt(process.env.DB_PORT || String(envConfig.connection?.port || 3306), 10),
    user: process.env.DB_USER || envConfig.connection?.user || "root",
    password: process.env.DB_PASSWORD || envConfig.connection?.password || "",
    database: process.env.DB_NAME || envConfig.connection?.database || "edge_store",
  };

  return {
    client: "mysql2",
    connection,
    pool: envConfig.pool || { min: 0, max: 10 },
    migrations: envConfig.migrations || {
      tableName: "knex_migrations",
      directory: "./src/db/migrations",
    },
    seeds: envConfig.seeds || {
      directory: "./src/db/seeds",
    },
  };
};