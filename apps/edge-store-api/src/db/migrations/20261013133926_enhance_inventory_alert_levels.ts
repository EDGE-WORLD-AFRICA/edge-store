import type { Knex } from "knex";

export const up = async (knex: Knex): Promise<void> => {
  // 1. Enhance inventory_categories with target stock for percentage-based alerts
  const hasCategoryTarget = await knex.schema.hasColumn("inventory_categories", "target_stock_level");
  if (!hasCategoryTarget) {
    await knex.schema.alterTable("inventory_categories", (t) => {
      t.integer("target_stock_level").unsigned().nullable().comment("Ideal max stock level. Used to calculate Full (100%), Half (50%), Quarter (25%) alerts.");
    });
  }

  // 2. Enhance inventory_types with target stock for percentage-based alerts
  const hasTypeTarget = await knex.schema.hasColumn("inventory_types", "target_stock_level");
  if (!hasTypeTarget) {
    await knex.schema.alterTable("inventory_types", (t) => {
      t.integer("target_stock_level").unsigned().nullable().comment("Ideal max stock level for this type of inventory.");
    });
  }
};

export const down = async (knex: Knex): Promise<void> => {
  await knex.schema.alterTable("inventory_categories", (t) => {
    t.dropColumn("target_stock_level");
  });

  await knex.schema.alterTable("inventory_types", (t) => {
    t.dropColumn("target_stock_level");
  });
};