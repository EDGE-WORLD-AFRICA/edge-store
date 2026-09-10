import { db } from "../config/dbconnection";
import { v4 as uuidv4 } from "uuid";

export const metadataService = {
   // ─── Currencies ───
  getCurrencies: async () => {
    return db("currencies").where("voided", false).orderBy("is_base", "desc").orderBy("name");
  },

  createCurrency: async (data: any) => {
    const id = uuidv4();
    await db("currencies").insert({ id, ...data });
    return db("currencies").where("id", id).first();
  },

  updateCurrency: async (id: string, data: any) => {
    await db("currencies").where("id", id).update({ ...data, updated_at: db.fn.now() });
    return db("currencies").where("id", id).first();
  },

  voidCurrency: async (id: string) => {
    await db("currencies").where("id", id).update({ voided: true, updated_at: db.fn.now() });
  },


  // -- Inventory Category
  getCategories: async () => {
    const rows = await db("inventory_categories as c")
      .where("c.voided", false)
      .orderBy("c.name");

    const map = new Map<string, any>();
    const tree: any[] = [];
    rows.forEach((r) => { map.set(r.id, { ...r, children: [] }); });
    rows.forEach((r) => {
      if(r.parent_id && map.has(r.parent_id)){
        map.get(r.parent_id).children.push(map.get(r.id));
      } else {
        tree.push(map.get(r.id));
      }
    });
    return tree;
  },

  createCategory: async (data: any) => {
    const id = uuidv4();
    const slug = (data.name || "").toLowerCase().replace(/\s+/g, "-");
    await db("inventory_categories").insert({ id, slug, ...data });
    return db("inventory_categories").where("id", id).first();
  },

  updateCategory: async (id: string, data: any) => {
    await db("inventory_categories").where("id", id).update({ ...data, updated_at: db.fn.now() });
    return db("inventory_categories").where("id", id).first();
  },

  voidCategory: async (id: string) => {
    await db("inventory_categories").where("id", id).update({ voided: true, updated_at: db.fn.now() });
  },

  // -- Inventory Types
  getTypes: async () => {
    return db("inventory_types").where("voided", false).orderBy("name");
  },

  createType: async (data: any) => {
    const id = uuidv4();
    await db("inventory_types").insert({ id, ...data });
    return db("inventory_types").where("id", id).first();
  },

  updateType: async (id: string, data: any) => {
    await db("inventory_types").where("id", id).update({ ...data, updated_at: db.fn.now() });
    return db("inventory_types").where("id", id).first();
  },

  voidType: async (id: string) => {
    await db("inventory_types").where("id", id).update({ voided: true, updated_at: db.fn.now() });
  },

  // Units of Measure
  getUnits: async () => {
    return db("units_of_measure").where("voided", false).orderBy("name");
  },

  createUnit: async (data: any) => {
    const id = uuidv4();
    await db("units_of_measure").insert({ id, ...data });
    return db("units_of_measure").where("id", id).first();
  },

  updateUnit: async (id: string, data: any) => {
    await db("units_of_measure").where("id", id).update({...data, updated_at: db.fn.now() });
    return db("units_of_measure").where("id", id).first();
  },

  voidUnit: async(id: string) => {
    await db("units_of_measure").where("id", id).update({ voided: true, updated_at: db.fn.now() });
  },

  // Tax Types
  getTaxTypes: async () => {
    return db("tax_types").where("voided", false).orderBy("name");
  },

  // Tax Rates
  getTaxRates: async () => {
    return db("tax_rates")
    .join("tax_types", "tax_rates.tax_type_id", "tax_types.id")
    .where("tax_rates.voided", false)
    .select("tax_rates.*", "tax_types.name as tax_type_name", "tax_types.code as tax_type_code")
    .orderBy("tax_rates.year", "desc")
    .orderBy("tax_rates.created_at", "desc");
  },

  createTaxRate: async (data: any) => {
    const id = uuidv4();
    await db("tax_rates").insert({ id, ...data });
    return db("tax_rates").where("id", id).first();
  },

  updateTaxRate: async (id: string, data: any) => {
    await db("tax_rates").where("id", id).update({ ...data, updated_at: db.fn.now() });
    return db("tax_rates").where("id", id).first();
  },

  voidTaxRate: async (id: string) => {
    await db("tax_rates").where("id", id).update({ voided: true, updated_at: db.fn.now() });
  },

  // Price Types
  getPriceTypes: async() => {
    return db("price_types").where("voided", false).orderBy("min_quantity");
  },

  createPriceType: async (data: any) => {
    const id = uuidv4();
    await db("price_types").insert({ id, ...data });
    return db("price_types").where("id", id).first();
  },

  updatePriceType: async (id: string, data: any) => {
    await db("price_types").where("id", id).update({ ...data, updated_at: db.fn.now() });
    return db("price_types").where("id", id).first();
  },

  voidPriceType: async (id: string) => {
    await db("price_types").where("id", id).update({ voided: true, updated_at: db.fn.now() });
  },

  // -- Aggregate: all metadata in one call (for config dashboard)
  getAllMetadata: async () => {
    const [currencies, categories, types, units, taxTypes, taxRates, priceTypes] = await Promise.all([
      metadataService.getCurrencies(),
      metadataService.getCategories(),
      metadataService.getTypes(),
      metadataService.getUnits(),
      metadataService.getTaxTypes(),
      metadataService.getTaxRates,
      metadataService.getPriceTypes(),
    ]);

    return { currencies, categories, types, units, taxTypes, taxRates, priceTypes }
  }
};