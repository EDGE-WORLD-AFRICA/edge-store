import type { Knex } from "knex";
import { v4 as uuidv4 } from "uuid";

export async function seed(knex: Knex): Promise<void> {
    // ─── Currencies ───
  const currencyCount = await knex("currencies").count("id as c").first();
  if (currencyCount && Number(currencyCount.c) === 0) {
    const currencies = [
      { id: uuidv4(), code: "MWK", name: "Malawian Kwacha", symbol: "MK", decimal_places: 2, is_base: true },
      { id: uuidv4(), code: "USD", name: "US Dollar", symbol: "$", decimal_places: 2, is_base: false },
      { id: uuidv4(), code: "GBP", name: "British Pound", symbol: "£", decimal_places: 2, is_base: false },
      { id: uuidv4(), code: "EUR", name: "Euro", symbol: "€", decimal_places: 2, is_base: false },
      { id: uuidv4(), code: "ZAR", name: "South African Rand", symbol: "R", decimal_places: 2, is_base: false },
      { id: uuidv4(), code: "TZS", name: "Tanzanian Shilling", symbol: "TSh", decimal_places: 2, is_base: false },
      { id: uuidv4(), code: "KES", name: "Kenyan Shilling", symbol: "KSh", decimal_places: 2, is_base: false },
      { id: uuidv4(), code: "ZMW", name: "Zambian Kwacha", symbol: "ZK", decimal_places: 2, is_base: false },
      { id: uuidv4(), code: "MZN", name: "Mozambican Metical", symbol: "MT", decimal_places: 2, is_base: false },
    ];
    await knex("currencies").insert(currencies);
    console.log("✅ Currencies seeded.");
  }


  // ─── Units of Measure ───
  const unitCount = await knex("units_of_measure").count("id as c").first();
  if (unitCount && Number(unitCount.c) === 0) {
    const units = [
      { id: uuidv4(), name: "Piece", abbreviation: "pcs" },
      { id: uuidv4(), name: "Kilogram", abbreviation: "kg" },
      { id: uuidv4(), name: "Gram", abbreviation: "g" },
      { id: uuidv4(), name: "Litre", abbreviation: "L" },
      { id: uuidv4(), name: "Millilitre", abbreviation: "ml" },
      { id: uuidv4(), name: "Box", abbreviation: "box" },
      { id: uuidv4(), name: "Carton", abbreviation: "ctn" },
      { id: uuidv4(), name: "Strip", abbreviation: "strip" },
      { id: uuidv4(), name: "Blister", abbreviation: "blister" },
      { id: uuidv4(), name: "Bottle", abbreviation: "btl" },
      { id: uuidv4(), name: "Pack", abbreviation: "pack" },
      { id: uuidv4(), name: "Dozen", abbreviation: "dz" },
      { id: uuidv4(), name: "Metre", abbreviation: "m" },
      { id: uuidv4(), name: "Roll", abbreviation: "roll" },
      { id: uuidv4(), name: "Bundle", abbreviation: "bundle" },
      { id: uuidv4(), name: "Sachet", abbreviation: "sachet" },
      { id: uuidv4(), name: "Tablet", abbreviation: "tab" },
      { id: uuidv4(), name: "Capsule", abbreviation: "cap" },
      { id: uuidv4(), name: "Vial", abbreviation: "vial" },
      { id: uuidv4(), name: "Ampoule", abbreviation: "amp" },
    ];
    await knex("units_of_measure").insert(units);
    console.log("✅ Units of measure seeded.");
  }


  // ─── Inventory Categories ───
  const catCount = await knex("inventory_categories").count("id as c").first();
  if (catCount && Number(catCount.c) === 0) {
    const generalId = uuidv4();
    await knex("inventory_categories").insert([
      { id: generalId, name: "General", slug: "general", code: "GEN", sort_order: 0 },
      { id: uuidv4(), parent_id: generalId, name: "Medicines", slug: "medicines", code: "MED", sort_order: 1 },
      { id: uuidv4(), parent_id: generalId, name: "Medical Supplies", slug: "medical-supplies", code: "MSUP", sort_order: 2 },
      { id: uuidv4(), parent_id: generalId, name: "Groceries", slug: "groceries", code: "GROC", sort_order: 3 },
      { id: uuidv4(), parent_id: generalId, name: "Beverages", slug: "beverages", code: "BEV", sort_order: 4 },
      { id: uuidv4(), parent_id: generalId, name: "Household Items", slug: "household-items", code: "HH", sort_order: 5 },
      { id: uuidv4(), parent_id: generalId, name: "Electronics", slug: "electronics", code: "ELEC", sort_order: 6 },
      { id: uuidv4(), parent_id: generalId, name: "Stationery", slug: "stationery", code: "STAT", sort_order: 7 },
    ]);
    console.log("✅ Inventory categories seeded.");
  }

  // ─── Inventory Types ───
  const typeCount = await knex("inventory_types").count("id as c").first();
  if (typeCount && Number(typeCount.c) === 0) {
    await knex("inventory_types").insert([
      { id: uuidv4(), name: "Finished Good", code: "FG", description: "Ready-to-sell item" },
      { id: uuidv4(), name: "Raw Material", code: "RM", description: "Input for production" },
      { id: uuidv4(), name: "Consumable", code: "CONS", description: "Used up during operations" },
      { id: uuidv4(), name: "Service", code: "SRV", description: "Non-physical service item" },
      { id: uuidv4(), name: "Equipment", code: "EQP", description: "Durable equipment" },
    ]);
    console.log("✅ Inventory types seeded.");
  }

  // ─── Tax Types ───
  const taxTypeCount = await knex("tax_types").count("id as c").first();
  let vatTypeId: string | null = null;
  if (taxTypeCount && Number(taxTypeCount.c) === 0) {
    vatTypeId = uuidv4();
    await knex("tax_types").insert([
      { id: vatTypeId, name: "Value Added Tax", code: "VAT", calculation_method: "percentage", is_inclusive: false },
      { id: uuidv4(), name: "Withholding Tax", code: "WHT", calculation_method: "percentage", is_inclusive: false },
      { id: uuidv4(), name: "Excise Duty", code: "EXC", calculation_method: "percentage", is_inclusive: true },
      { id: uuidv4(), name: "Consumption Tax", code: "CT", calculation_method: "percentage", is_inclusive: false },
    ]);
    console.log("✅ Tax types seeded.");
  } else {
    const vat = await knex("tax_types").where("code", "VAT").first();
    vatTypeId = vat ? vat.id : null;
  }

  // ─── Tax Rates (17.5% for current year — single step tariff) ───
  const taxRateCount = await knex("tax_rates").count("id as c").first();
  if (taxRateCount && Number(taxRateCount.c) === 0 && vatTypeId) {
    const currentYear = new Date().getFullYear();
    await knex("tax_rates").insert({
      id: uuidv4(),
      tax_type_id: vatTypeId,
      name: `Standard VAT ${currentYear}`,
      rate: 17.5000,
      year: currentYear,
      effective_from: `${currentYear}-01-01`,
      effective_to: null,
      description: `Single-step standard VAT rate of 17.5% for ${currentYear}`,
      is_active: true,
    });
    console.log(`✅ Tax rate seeded: 17.5% for ${currentYear}.`);
  }

  // ─── Price Types ───
  const priceTypeCount = await knex("price_types").count("id as c").first();
  if (priceTypeCount && Number(priceTypeCount.c) === 0) {
    await knex("price_types").insert([
      { id: uuidv4(), name: "Retail", code: "RETAIL", min_quantity: 1, description: "Standard retail price" },
      { id: uuidv4(), name: "Wholesale", code: "WHOLESALE", min_quantity: 10, description: "Wholesale price for bulk buyers" },
      { id: uuidv4(), name: "Bulk", code: "BULK", min_quantity: 100, description: "Deep bulk / distributor price" },
      { id: uuidv4(), name: "Employee", code: "EMP", min_quantity: 1, description: "Staff discounted price" },
    ]);
    console.log("✅ Price types seeded.");
  }

  console.log("✅ All metadata seeding complete.");
};
