import type { Knex } from "knex";
import { createTableIfNotExist, dropTableIfExists } from "../helpers/migrationHelper";

export const up = async (knex: Knex): Promise<void> => {
  
  // ─── currencies ───
  await createTableIfNotExist(knex, "currencies", (t) => {
    t.uuid("id").defaultTo(knex.raw("(UUID())")).primary();
    t.string("code", 3).notNullable().unique();
    t.string("name", 100).notNullable();
    t.string("symbol", 10).notNullable();
    t.integer("decimal_places").defaultTo(2);
    t.boolean("is_base").defaultTo(false);
    t.boolean("is_active").defaultTo(true);
    t.boolean("voided").defaultTo(false);
    t.timestamp("created_at").defaultTo(knex.fn.now());
    t.timestamp("updated_at").defaultTo(knex.fn.now());
  });

  // ─── inventory_categories (hierarchical) ───
  await createTableIfNotExist(knex, "inventory_categories", (t) => {
    t.uuid("id").defaultTo(knex.raw("(UUID())")).primary();
    t.uuid("parent_id").nullable();
    t.string("name", 150).notNullable();
    t.string("slug", 150).unique();
    t.string("code", 50).unique();
    t.text("description").nullable();
    t.string("icon_url", 500).nullable();
    t.integer("sort_order").defaultTo(0);
    t.boolean("is_active").defaultTo(true);
    t.boolean("voided").defaultTo(false);
    t.uuid("created_by").nullable();
    t.timestamp("created_at").defaultTo(knex.fn.now());
    t.timestamp("updated_at").defaultTo(knex.fn.now());
    t.foreign("parent_id").references("inventory_categories.id").onDelete("SET NULL");
  });

  // ─── inventory_types ───
  await createTableIfNotExist(knex, "inventory_types", (t) => {
    t.uuid("id").defaultTo(knex.raw("(UUID())")).primary();
    t.string("name", 100).notNullable();
    t.string("code", 50).unique();
    t.text("description").nullable();
    t.boolean("is_active").defaultTo(true);
    t.boolean("voided").defaultTo(false);
    t.timestamp("created_at").defaultTo(knex.fn.now());
    t.timestamp("updated_at").defaultTo(knex.fn.now());
  });

  // ─── units_of_measure ───
  await createTableIfNotExist(knex, "units_of_measure", (t) => {
    t.uuid("id").defaultTo(knex.raw("(UUID())")).primary();
    t.string("name", 100).notNullable();
    t.string("abbreviation", 20).notNullable();
    t.text("description").nullable();
    t.boolean("is_active").defaultTo(true);
    t.boolean("voided").defaultTo(false);
    t.timestamp("created_at").defaultTo(knex.fn.now());
    t.timestamp("updated_at").defaultTo(knex.fn.now());
  });

  // ─── tax_types ───
  await createTableIfNotExist(knex, "tax_types", (t) => {
    t.uuid("id").defaultTo(knex.raw("(UUID())")).primary();
    t.string("name", 100).notNullable();
    t.string("code", 50).unique();
    t.text("description").nullable();
    t.string("calculation_method", 20).notNullable().defaultTo("percentage");
    t.boolean("is_inclusive").defaultTo(false);
    t.boolean("is_active").defaultTo(true);
    t.boolean("voided").defaultTo(false);
    t.timestamp("created_at").defaultTo(knex.fn.now());
    t.timestamp("updated_at").defaultTo(knex.fn.now());
  });

  // ─── tax_rates (step tariff, year-aware) ───
  await createTableIfNotExist(knex, "tax_rates", (t) => {
    t.uuid("id").defaultTo(knex.raw("(UUID())")).primary();
    t.uuid("tax_type_id").notNullable();
    t.string("name", 100).notNullable();
    t.decimal("rate", 10, 4).notNullable();
    t.integer("year").notNullable();
    t.date("effective_from").notNullable();
    t.date("effective_to").nullable();
    t.text("description").nullable();
    t.boolean("is_active").defaultTo(true);
    t.boolean("voided").defaultTo(false);
    t.uuid("created_by").nullable();
    t.timestamp("created_at").defaultTo(knex.fn.now());
    t.timestamp("updated_at").defaultTo(knex.fn.now());
    t.foreign("tax_type_id").references("tax_types.id");
    t.index(["year", "is_active"]);
  });

  // ─── price_types ───
  await createTableIfNotExist(knex, "price_types", (t) => {
    t.uuid("id").defaultTo(knex.raw("(UUID())")).primary();
    t.string("name", 100).notNullable();
    t.string("code", 50).unique();
    t.text("description").nullable();
    t.integer("min_quantity").defaultTo(1);
    t.boolean("is_active").defaultTo(true);
    t.boolean("voided").defaultTo(false);
    t.timestamp("created_at").defaultTo(knex.fn.now());
    t.timestamp("updated_at").defaultTo(knex.fn.now());
  });

  // ─── inventory (master item table) ───
  await createTableIfNotExist(knex, "inventory", (t) => {
    t.uuid("id").defaultTo(knex.raw("(UUID())")).primary();
    t.uuid("category_id").nullable();
    t.uuid("type_id").nullable();
    t.uuid("unit_id").notNullable();
    t.string("name", 255).notNullable();
    t.string("slug", 255).unique();
    t.string("code", 100).unique();
    t.string("barcode", 255).nullable().unique();
    t.text("description").nullable();
    t.string("image_url", 500).nullable();
    t.string("brand", 150).nullable();
    t.string("manufacturer", 150).nullable();
    t.string("country_of_origin", 100).nullable();
    t.boolean("is_perishable").defaultTo(false);
    t.boolean("is_serial_tracked").defaultTo(false);
    t.boolean("is_batch_tracked").defaultTo(false);
    t.boolean("is_active").defaultTo(true);
    t.boolean("voided").defaultTo(false);
    t.uuid("created_by").nullable();
    t.timestamp("created_at").defaultTo(knex.fn.now());
    t.timestamp("updated_at").defaultTo(knex.fn.now());
    t.foreign("category_id").references("inventory_categories.id").onDelete("SET NULL");
    t.foreign("type_id").references("inventory_types.id").onDelete("SET NULL");
    t.foreign("unit_id").references("units_of_measure.id");
    t.index(["is_active", "voided"]);
    t.index(["name"]);
  });

  // ─── tax_applicability ───
  await createTableIfNotExist(knex, "tax_applicability", (t) => {
    t.uuid("id").defaultTo(knex.raw("(UUID())")).primary();
    t.uuid("tax_rate_id").notNullable();
    t.uuid("inventory_category_id").nullable();
    t.uuid("inventory_type_id").nullable();
    t.uuid("inventory_id").nullable();
    t.integer("priority").defaultTo(0);
    t.boolean("is_exempt").defaultTo(false);
    t.date("effective_from").notNullable();
    t.date("effective_to").nullable();
    t.boolean("voided").defaultTo(false);
    t.timestamp("created_at").defaultTo(knex.fn.now());
    t.timestamp("updated_at").defaultTo(knex.fn.now());
    t.foreign("tax_rate_id").references("tax_rates.id");
    t.foreign("inventory_category_id").references("inventory_categories.id").onDelete("SET NULL");
    t.foreign("inventory_type_id").references("inventory_types.id").onDelete("SET NULL");
    t.foreign("inventory_id").references("inventory.id").onDelete("SET NULL");
  });

  // ─── price_partition_registry ───
  await createTableIfNotExist(knex, "price_partition_registry", (t) => {
    t.uuid("id").defaultTo(knex.raw("(UUID())")).primary();
    t.integer("partition_year").notNullable().unique();
    t.string("table_name", 100).notNullable();
    t.boolean("is_active").defaultTo(true);
    t.timestamp("created_at").defaultTo(knex.fn.now());
  });

  // ─── inventory_current_prices (denormalized fast-read) ───
  await createTableIfNotExist(knex, "inventory_current_prices", (t) => {
    t.uuid("id").defaultTo(knex.raw("(UUID())")).primary();
    t.uuid("inventory_id").notNullable();
    t.uuid("price_type_id").notNullable();
    t.uuid("current_price_id").notNullable();
    t.decimal("current_price", 12, 4).notNullable();
    t.uuid("currency_id").notNullable();
    t.timestamp("effective_from").notNullable();
    t.boolean("voided").defaultTo(false);
    t.timestamp("updated_at").defaultTo(knex.fn.now());
    t.foreign("inventory_id").references("inventory.id").onDelete("CASCADE");
    t.foreign("price_type_id").references("price_types.id");
    t.foreign("currency_id").references("currencies.id");
    t.unique(["inventory_id", "price_type_id"]);
  });

  // ─── inventory_stock (stock levels per branch) ───
  await createTableIfNotExist(knex, "inventory_stock", (t) => {
    t.uuid("id").defaultTo(knex.raw("(UUID())")).primary();
    t.uuid("inventory_id").notNullable();
    t.uuid("branch_id").notNullable();
    t.decimal("quantity", 12, 4).notNullable().defaultTo(0);
    t.decimal("reserved_quantity", 12, 4).defaultTo(0);
    t.decimal("warning_level", 12, 4).defaultTo(10);
    t.decimal("critical_low_level", 12, 4).defaultTo(5);
    t.date("expiration_date").nullable();
    t.integer("days_to_warn_before_expiry").defaultTo(30);
    t.string("batch_number", 100).nullable();
    t.string("serial_number", 255).nullable();
    t.string("location_in_store", 150).nullable();
    t.timestamp("last_restocked_at").nullable();
    t.timestamp("last_sold_at").nullable();
    t.boolean("voided").defaultTo(false);
    t.timestamp("created_at").defaultTo(knex.fn.now());
    t.timestamp("updated_at").defaultTo(knex.fn.now());
    t.foreign("inventory_id").references("inventory.id").onDelete("CASCADE");
    t.foreign("branch_id").references("branches.id").onDelete("CASCADE");
    t.unique(["inventory_id", "branch_id", "batch_number", "serial_number"]);
    t.index(["branch_id"]);
    t.index(["expiration_date"]);
  });

  // ─── Create first price partition table (current year) ───
  const currentYear = new Date().getFullYear();
  const partitionTableName = `inventory_prices_${currentYear}`;

  await createTableIfNotExist(knex, partitionTableName, (t) => {
    t.uuid("id").defaultTo(knex.raw("(UUID())")).primary();
    t.uuid("inventory_id").notNullable();
    t.uuid("price_type_id").notNullable();
    t.decimal("price", 12, 4).notNullable();
    t.uuid("currency_id").notNullable();
    t.timestamp("effective_from").notNullable();
    t.timestamp("effective_to").nullable();
    t.boolean("is_active").defaultTo(true);
    t.boolean("voided").defaultTo(false);
    t.uuid("created_by").nullable();
    t.timestamp("created_at").defaultTo(knex.fn.now());
    t.timestamp("updated_at").defaultTo(knex.fn.now());
    t.index(["inventory_id", "price_type_id", "is_active"]);
    t.index(["effective_from", "effective_to"]);
  });

  // Ensure registry entry exists
  const registryExists = await knex("price_partition_registry")
    .where({ partition_year: currentYear })
    .first();

  if (!registryExists) {
    await knex("price_partition_registry").insert({
      partition_year: currentYear,
      table_name: partitionTableName,
      is_active: true,
    });
  }
};

export const down = async (knex: Knex): Promise<void> => {
  const currentYear = new Date().getFullYear();
  
  await dropTableIfExists(knex, `inventory_prices_${currentYear}`);
  await dropTableIfExists(knex, "inventory_stock");
  await dropTableIfExists(knex, "inventory_current_prices");
  await dropTableIfExists(knex, "price_partition_registry");
  await dropTableIfExists(knex, "tax_applicability");
  await dropTableIfExists(knex, "inventory");
  await dropTableIfExists(knex, "price_types");
  await dropTableIfExists(knex, "tax_rates");
  await dropTableIfExists(knex, "tax_types");
  await dropTableIfExists(knex, "units_of_measure");
  await dropTableIfExists(knex, "inventory_types");
  await dropTableIfExists(knex, "inventory_categories");
  await dropTableIfExists(knex, "currencies");
};