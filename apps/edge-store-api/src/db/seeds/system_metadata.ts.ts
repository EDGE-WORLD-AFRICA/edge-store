import type { Knex } from "knex";
import { v4 as uuidv4 } from "uuid";

const PERMISSIONS = [
  { key: "system.manage", name: "Manage System", module: "system" },
  { key: "users.view", name: "View Users", module: "users" },
  { key: "users.create", name: "Create Users", module: "users" },
  { key: "users.edit", name: "Edit Users", module: "users" },
  { key: "users.delete", name: "Delete Users", module: "users" },
  { key: "roles.view", name: "View Roles", module: "roles" },
  { key: "roles.manage", name: "Manage Roles", module: "roles" },
  { key: "products.view", name: "View Products", module: "products" },
  { key: "products.create", name: "Create Products", module: "products" },
  { key: "products.edit", name: "Edit Products", module: "products" },
  { key: "products.delete", name: "Delete Products", module: "products" },
  { key: "sales.view", name: "View Sales", module: "sales" },
  { key: "sales.create", name: "Create Sales", module: "sales" },
  { key: "inventory.view", name: "View Inventory", module: "inventory" },
  { key: "inventory.manage", name: "Manage Inventory", module: "inventory" },
  { key: "reports.view", name: "View Reports", module: "reports" },
  { key: "reports.export", name: "Export Reports", module: "reports" },
  { key: "settings.view", name: "View Settings", module: "settings" },
  { key: "settings.manage", name: "Manage Settings", module: "settings" },
];

const ROLES = [
  { name: "Super Admin", description: "Full system access", is_system: true },
  { name: "Manager", description: "Branch management access", is_system: true },
  { name: "Cashier", description: "Point of sale access", is_system: true },
  { name: "Viewer", description: "Read-only access", is_system: true },
];

const ROLE_PERMISSIONS_MAP: Record<string, string[]> = {
  "Super Admin": ["*"],
  "Manager": [
    "users.view", "users.create", "users.edit",
    "products.view", "products.create", "products.edit", "products.delete",
    "sales.view", "sales.create",
    "inventory.view", "inventory.manage",
    "reports.view", "reports.export",
    "settings.view",
  ],
  "Cashier": ["products.view", "sales.view", "sales.create"],
  "Viewer": ["products.view", "sales.view", "inventory.view", "reports.view"],
};

const CONTACT_TYPES = ["phone", "email", "physical_address", "postal_address"];

export const seed = async (knex: Knex): Promise<void> => {
  const existingPermissions = await knex("permissions").count("id as count").first();
  if (existingPermissions && Number(existingPermissions.count) > 0) {
    console.log("Permissions already seeded. Skipping.");
    return;
  }

  console.log("Seeding permissions...");
  const permissionIds: Record<string, string> = {};
  for (const perm of PERMISSIONS) {
    const id = uuidv4();
    permissionIds[perm.key] = id;
    await knex("permissions").insert({ id, ...perm });
  }

  console.log("Seeding roles...");
  const roleIds: Record<string, string> = {};
  for (const role of ROLES) {
    const id = uuidv4();
    roleIds[role.name] = id;
    await knex("roles").insert({ id, ...role });
  }

  console.log("Seeding role-permission mappings...");
  for (const [roleName, permKeys] of Object.entries(ROLE_PERMISSIONS_MAP)) {
    const roleId = roleIds[roleName];
    if (permKeys.includes("*")) {
      for (const permId of Object.values(permissionIds)) {
        await knex("role_permissions").insert({ role_id: roleId, permission_id: permId });
      }
    } else {
      for (const key of permKeys) {
        if (permissionIds[key]) {
          await knex("role_permissions").insert({ role_id: roleId, permission_id: permissionIds[key] });
        }
      }
    }
  }

  console.log("Seeding contact types...");
  for (const name of CONTACT_TYPES) {
    await knex("contact_types").insert({ id: uuidv4(), name });
  }

  console.log("✅ System metadata seeded successfully.");
};