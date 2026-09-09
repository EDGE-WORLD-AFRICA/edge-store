import type { Knex } from "knex";

export const up = async (knex: Knex): Promise<void> => {
  await knex.schema.alterTable("companies", (table) => {
    table.text("logo").nullable().alter();
  });
};

export const down = async (knex: Knex): Promise<void> => {
  await knex.schema.alterTable("companies", (table) => {
    table.string("logo", 255).nullable().alter();
  });
};