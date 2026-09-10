import type { Knex } from "knex";

export const up = async (knex: Knex): Promise<void> => {
  if (await knex.schema.hasTable("companies")) {
    const hasLogo = await knex.schema.hasColumn("companies", "logo");
    
    if (hasLogo) {
      // Alter existing column to TEXT to support longer file paths/URLs
      await knex.schema.alterTable("companies", (table) => {
        table.text("logo").nullable().alter();
      });
    } else {
      // Add the column if it was somehow missing entirely
      await knex.schema.alterTable("companies", (table) => {
        table.text("logo").nullable();
      });
    }
  }
};

export const down = async (knex: Knex): Promise<void> => {
  if (await knex.schema.hasTable("companies")) {
    const hasLogo = await knex.schema.hasColumn("companies", "logo");
    if (hasLogo) {
      await knex.schema.alterTable("companies", (table) => {
        table.string("logo", 255).nullable().alter();
      });
    }
  }
};