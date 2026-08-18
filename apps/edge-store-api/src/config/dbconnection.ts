import knex from "knex";
import { loadDatabaseConfig } from "./database";

const dbConfig = loadDatabaseConfig();

export const db = knex(dbConfig);

export const testDatabaseConnection = async (): Promise<boolean> => {
  try {
    await db.raw("SELECT 1");
    return true;
  } catch {
    return false;
  }
};