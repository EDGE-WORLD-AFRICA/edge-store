import type { Knex } from "knex";
import { loadDatabaseConfig } from "./config/database";

const config = loadDatabaseConfig();

const knexConfig: Record<string, Knex.Config> = {
  development: config,
  production: config,
};

export default knexConfig;