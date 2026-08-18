import type { Knex } from "knex";

export const up = async (knex: Knex): Promise<void> => {
  // Companies table
  await knex.schema.createTable("companies", (table) => {
    table.uuid("id").primary().defaultTo(knex.raw("(UUID())"));
    table.string("name", 255).notNullable();
    table.string("legal_name", 255).nullable();
    table.string("t_pin", 100).nullable();
    table.string("business_reg_no", 100).nullable();
    table.text("logo").nullable();
    table.json("business_types").nullable();
    table.string("country", 100).nullable();
    table.string("province", 100).nullable();
    table.string("district", 100).nullable();
    table.string("location", 255).nullable();
    table.string("source", 50).defaultTo("local");
    table.timestamp("created_at").defaultTo(knex.fn.now());
    table.timestamp("updated_at").defaultTo(knex.fn.now());
  });

  // Branches table
  await knex.schema.createTable("branches", (table) => {
    table.uuid("id").primary().defaultTo(knex.raw("(UUID())"));
    table.uuid("company_id").notNullable();
    table.string("code", 50).notNullable();
    table.string("name", 255).notNullable();
    table.string("location", 255).nullable();
    table.string("device_location", 255).nullable();
    table.boolean("is_main").defaultTo(false);
    table.timestamp("created_at").defaultTo(knex.fn.now());
    table.timestamp("updated_at").defaultTo(knex.fn.now());

    table.foreign("company_id").references("companies.id").onDelete("CASCADE");
    table.unique(["company_id", "code"]);
  });

  // Devices table
  await knex.schema.createTable("devices", (table) => {
    table.uuid("id").primary().defaultTo(knex.raw("(UUID())"));
    table.uuid("company_id").notNullable();
    table.uuid("branch_id").nullable();
    table.string("device_name", 255).notNullable();
    table.string("station_number", 50).nullable();
    table.string("location", 255).nullable();
    table.string("machine_code", 500).notNullable();
    table.string("status", 50).defaultTo("active");
    table.timestamp("last_seen_at").nullable();
    table.timestamp("created_at").defaultTo(knex.fn.now());
    table.timestamp("updated_at").defaultTo(knex.fn.now());

    table.foreign("company_id").references("companies.id").onDelete("CASCADE");
    table.foreign("branch_id").references("branches.id").onDelete("SET NULL");
    table.unique(["machine_code"]);
  });

  // Users table
  await knex.schema.createTable("users", (table) => {
    table.uuid("id").primary().defaultTo(knex.raw("(UUID())"));
    table.uuid("company_id").notNullable();
    table.string("username", 100).notNullable();
    table.string("email", 255).notNullable();
    table.string("name", 255).notNullable();
    table.string("password_hash", 255).notNullable();
    table.boolean("is_super_admin").defaultTo(false);
    table.boolean("is_active").defaultTo(true);
    table.timestamp("last_login_at").nullable();
    table.timestamp("created_at").defaultTo(knex.fn.now());
    table.timestamp("updated_at").defaultTo(knex.fn.now());

    table.foreign("company_id").references("companies.id").onDelete("CASCADE");
    table.unique(["company_id", "username"]);
    table.unique(["company_id", "email"]);
  });

  // Roles table
  await knex.schema.createTable("roles", (table) => {
    table.uuid("id").primary().defaultTo(knex.raw("(UUID())"));
    table.uuid("company_id").nullable();
    table.string("name", 100).notNullable();
    table.string("description", 255).nullable();
    table.boolean("is_system").defaultTo(false);
    table.timestamp("created_at").defaultTo(knex.fn.now());
    table.timestamp("updated_at").defaultTo(knex.fn.now());

    table.foreign("company_id").references("companies.id").onDelete("CASCADE");
  });

  // Permissions table
  await knex.schema.createTable("permissions", (table) => {
    table.uuid("id").primary().defaultTo(knex.raw("(UUID())"));
    table.string("key", 100).notNullable().unique();
    table.string("name", 255).notNullable();
    table.string("module", 100).notNullable();
    table.string("description", 255).nullable();
    table.timestamp("created_at").defaultTo(knex.fn.now());
  });

  // Role-Permission mapping
  await knex.schema.createTable("role_permissions", (table) => {
    table.uuid("role_id").notNullable();
    table.uuid("permission_id").notNullable();
    table.primary(["role_id", "permission_id"]);

    table.foreign("role_id").references("roles.id").onDelete("CASCADE");
    table.foreign("permission_id").references("permissions.id").onDelete("CASCADE");
  });

  // User-Role mapping (with branch scope)
  await knex.schema.createTable("user_roles", (table) => {
    table.uuid("id").primary().defaultTo(knex.raw("(UUID())"));
    table.uuid("user_id").notNullable();
    table.uuid("role_id").notNullable();
    table.uuid("branch_id").nullable();
    table.timestamp("assigned_at").defaultTo(knex.fn.now());

    table.foreign("user_id").references("users.id").onDelete("CASCADE");
    table.foreign("role_id").references("roles.id").onDelete("CASCADE");
    table.foreign("branch_id").references("branches.id").onDelete("CASCADE");
    table.unique(["user_id", "role_id", "branch_id"]);
  });

  // Sessions table for token management
  await knex.schema.createTable("sessions", (table) => {
    table.uuid("id").primary().defaultTo(knex.raw("(UUID())"));
    table.uuid("user_id").notNullable();
    table.uuid("device_id").nullable();
    table.string("refresh_token_hash", 255).notNullable();
    table.string("ip_address", 45).nullable();
    table.string("user_agent", 500).nullable();
    table.timestamp("expires_at").notNullable();
    table.timestamp("created_at").defaultTo(knex.fn.now());

    table.foreign("user_id").references("users.id").onDelete("CASCADE");
    table.foreign("device_id").references("devices.id").onDelete("SET NULL");
    table.index(["user_id", "device_id"]);
  });
};

export const down = async (knex: Knex): Promise<void> => {
  await knex.schema.dropTableIfExists("sessions");
  await knex.schema.dropTableIfExists("user_roles");
  await knex.schema.dropTableIfExists("role_permissions");
  await knex.schema.dropTableIfExists("permissions");
  await knex.schema.dropTableIfExists("roles");
  await knex.schema.dropTableIfExists("users");
  await knex.schema.dropTableIfExists("devices");
  await knex.schema.dropTableIfExists("branches");
  await knex.schema.dropTableIfExists("companies");
};