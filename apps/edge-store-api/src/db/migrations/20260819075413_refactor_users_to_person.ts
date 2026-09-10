import type { Knex } from "knex";
import { createTableIfNotExist, dropTableIfExists } from "../helpers/migrationHelper";

export const up = async (knex: Knex): Promise<void> => {
  // Safely drop legacy tables if they exist
  await dropTableIfExists(knex, "sessions");
  await dropTableIfExists(knex, "user_roles");
  await dropTableIfExists(knex, "users");

  // Safely add 'voided' column to existing core tables if missing
  const existingTables = ["companies", "branches", "devices", "roles", "permissions", "role_permissions"];
  for (const table of existingTables) {
    if (await knex.schema.hasTable(table)) {
      const hasVoided = await knex.schema.hasColumn(table, "voided");
      if (!hasVoided) {
        await knex.schema.alterTable(table, (t) => {
          t.boolean("voided").defaultTo(false);
        });
      }
    }
  }

  // Create new tables idempotently
  await createTableIfNotExist(knex, "person", (table) => {
    table.uuid("id").primary().defaultTo(knex.raw("(UUID())"));
    table.string("first_name", 100).notNullable();
    table.string("other_names", 100).nullable();
    table.string("last_name", 100).notNullable();
    table.date("date_of_birth").nullable();
    table.string("gender", 20).nullable();
    table.boolean("voided").defaultTo(false);
    table.timestamp("created_at").defaultTo(knex.fn.now());
    table.timestamp("updated_at").defaultTo(knex.fn.now());
  });

  await createTableIfNotExist(knex, "contact_types", (table) => {
    table.uuid("id").primary().defaultTo(knex.raw("(UUID())"));
    table.string("name", 100).notNullable().unique();
    table.boolean("voided").defaultTo(false);
    table.timestamp("created_at").defaultTo(knex.fn.now());
    table.timestamp("updated_at").defaultTo(knex.fn.now());
  });

  await createTableIfNotExist(knex, "person_contacts", (table) => {
    table.uuid("id").primary().defaultTo(knex.raw("(UUID())"));
    table.uuid("person_id").notNullable();
    table.uuid("contact_type_id").notNullable();
    table.string("value", 255).notNullable();
    table.boolean("is_primary").defaultTo(false);
    table.boolean("voided").defaultTo(false);
    table.timestamp("created_at").defaultTo(knex.fn.now());
    table.timestamp("updated_at").defaultTo(knex.fn.now());

    table.foreign("person_id").references("person.id").onDelete("CASCADE");
    table.foreign("contact_type_id").references("contact_types.id").onDelete("CASCADE");
  });

  await createTableIfNotExist(knex, "user_accounts", (table) => {
    table.uuid("id").primary().defaultTo(knex.raw("(UUID())"));
    table.uuid("person_id").notNullable();
    table.uuid("company_id").notNullable();
    table.string("username", 100).notNullable();
    table.string("password_hash", 255).notNullable();
    table.boolean("is_super_admin").defaultTo(false);
    table.boolean("is_active").defaultTo(true);
    table.boolean("2fa_enabled").defaultTo(false);
    table.boolean("qr_code_scan_enabled").defaultTo(false);
    table.timestamp("last_login_at").nullable();
    table.boolean("voided").defaultTo(false);
    table.timestamp("created_at").defaultTo(knex.fn.now());
    table.timestamp("updated_at").defaultTo(knex.fn.now());

    table.foreign("person_id").references("person.id").onDelete("CASCADE");
    table.foreign("company_id").references("companies.id").onDelete("CASCADE");
    table.unique(["company_id", "username"]);
  });

  await createTableIfNotExist(knex, "user_roles", (table) => {
    table.uuid("id").primary().defaultTo(knex.raw("(UUID())"));
    table.uuid("user_id").notNullable();
    table.uuid("role_id").notNullable();
    table.uuid("branch_id").nullable();
    table.boolean("voided").defaultTo(false);
    table.timestamp("created_at").defaultTo(knex.fn.now());
    table.timestamp("updated_at").defaultTo(knex.fn.now());

    table.foreign("user_id").references("user_accounts.id").onDelete("CASCADE");
    table.foreign("role_id").references("roles.id").onDelete("CASCADE");
    table.foreign("branch_id").references("branches.id").onDelete("SET NULL");
    table.unique(["user_id", "role_id", "branch_id"]);
  });

  await createTableIfNotExist(knex, "sessions", (table) => {
    table.uuid("id").primary().defaultTo(knex.raw("(UUID())"));
    table.uuid("user_id").notNullable();
    table.uuid("device_id").nullable();
    table.string("refresh_token_hash", 255).notNullable();
    table.string("ip_address", 45).nullable();
    table.string("user_agent", 500).nullable();
    table.timestamp("expires_at").notNullable();
    table.boolean("voided").defaultTo(false);
    table.timestamp("created_at").defaultTo(knex.fn.now());

    table.foreign("user_id").references("user_accounts.id").onDelete("CASCADE");
    table.foreign("device_id").references("devices.id").onDelete("SET NULL");
  });
};

export const down = async (knex: Knex): Promise<void> => {
  await dropTableIfExists(knex, "sessions");
  await dropTableIfExists(knex, "user_roles");
  await dropTableIfExists(knex, "user_accounts");
  await dropTableIfExists(knex, "person_contacts");
  await dropTableIfExists(knex, "contact_types");
  await dropTableIfExists(knex, "person");
};