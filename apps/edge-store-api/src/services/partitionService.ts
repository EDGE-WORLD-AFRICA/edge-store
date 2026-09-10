import { db } from "../config/dbconnection";
import { v4 as uuidv4 } from "uuid";

const PRICE_PARTITION_PREFIX = "inventory_prices_";
const TRANSACTION_PERTITION_PREFIX = "inventory_transactions_";

export const partitionService = {
  // --- Get or create a price partition for a given year
  ensurePricePartition: async (year: number): Promise<string> => {
    const tableName = `${PRICE_PARTITION_PREFIX}${year}`;

    const existing = await db("price_partition_registry")
    .where("partition_year", year)
    .first();

    if(existing) return tableName;

    const hasTable = await db.schema.hasTable(tableName);
    if(!hasTable){
      await db.schema.createTable(tableName, (t) => {
        t.uuid("id").primary().defaultTo(db.raw("(UUID())"));
        t.uuid("inventory_id").notNullable();
        t.uuid("price_type_id").notNullable();
        t.decimal("price", 12, 4).notNullable();
        t.uuid("currency_id").notNullable();
        t.timestamp("effective_from").notNullable();
        t.timestamp("effective_to").nullable();
        t.boolean("is_active").defaultTo(true);
        t.boolean("voided").defaultTo(false);
        t.uuid("created_by").nullable();
        t.timestamp("created_at").defaultTo(db.fn.now());
        t.timestamp("updated_at").defaultTo(db.fn.now());
        t.index(["inventory_id", "price_type_id", "is_active"]);
        t.index(["effective_from", "effective_to"]);
      });
    }

    await db("price_partition_registry").insert({
      id: uuidv4(),
      partition_year: year,
      table_name: tableName,
      is_active: true
    });

    return tableName;
  },

  // --- Get all registered partition years, sorted descending
  getPartitionYears: async (): Promise<number[]> => {
    const rows = await db("price_partition_registry")
    .where("is_active", true)
    .orderBy("partition_year", "desc")
    .select("partition_year");

    return rows.map((row) => row.partition_year);
  },

  // -- Insert a price record into the correct year partition ---
  insertPrice: async (data: {
    inventory_id: string;
    price_type_id: string;
    price: number;
    currency_id: string;
    effective_from: Date;
    created_by?: string;
  }): Promise<string> => {
    const year = new Date(data.effective_from).getFullYear();
    const tableName = await partitionService.ensurePricePartition(year);
    const id = uuidv4();

    await db(tableName).insert({
      id,
      inventory_id: data.inventory_id,
      price_type_id: data.price_type_id,
      price: data.price,
      currency_id: data.currency_id,
      effective_from: data.effective_from,
      effective_to: null,
      is_active: true,
      voided: false,
      created_by: data.created_by || null,
    });

    return id;
  },


  // -- Fetch current  prices for an item across price types --
  // Searches from most recent partition backwards for seed
  getCurrentPrices: async (inventory_id: string): Promise<any[]> => {
    const years = await partitionService.getPartitionYears();

    for(const year of years){
      const tableName = `${PRICE_PARTITION_PREFIX}${year}`;
      const rows = await db(tableName)
      .where("inventory_id", inventory_id)
      .where("is_active", true)
      .where("voided", false)
      .orderBy("effective_from", "desc");

      if(rows.length > 0) return rows;
    }

    return [];
  },

  // -- Fetch full price histiry for an item -- 
  getPriceHistory: async (inventory_id: string): Promise<any[]> => {
    const years = await partitionService.getPartitionYears();
    let allRows: any[] = [];

    for(const year of years){
      const tableName = `${PRICE_PARTITION_PREFIX}${year}`;
      const rows = await db(tableName)
      .where("inventory_id", inventory_id)
      .where("voided", false)
      .orderBy("effective_from", "desc");

      allRows = allRows.concat(rows.map((r) => ({ ...r, partition_year: year })));
    }

    allRows.sort((a,b) => new Date(b.effective_from).getTime() - new Date(a.effective_from).getTime());

    return allRows;
  },


  // -- Deactivate old price and insert new one --
  updatePrice: async (inventory_id: string, price_type_id: string, new_price: number, effective_from: Date, currency_id: string, created_by?: string, user_id?: string): Promise<void> => {
    const now = new Date().toISOString();
    const currentYear = new Date().getFullYear();

    // Deactivate current active price in current year partition
    const currentTableName = `${PRICE_PARTITION_PREFIX}${currentYear}`;
    const hasCurrentTable = await db.schema.hasTable(currentTableName);

    if(hasCurrentTable){
      await db(currentTableName)
      .where("inventory_id", inventory_id)
      .where("price_type_id", price_type_id)
      .where("is_active", true)
      .update({
        is_active: false,
        effective_to: now,
        updated_at: now,
      });
    }

    // Also check previous year partitions for any still-active rows
    const years = await partitionService.getPartitionYears();
    for(const year of years){
      if(year === currentYear) continue;
      const tableName = `${PRICE_PARTITION_PREFIX}${year}`;
      await db(tableName)
      .where("inventory_id", inventory_id)
      .where("price_type_id", price_type_id)
      .where("is_active", true)
      .update({
        is_active: false,
        effective_to: now,
        updated_at: now,
      });
    }

    // INsert new price 
    const newPriceId = await partitionService.insertPrice({
      inventory_id,
      price_type_id,
      price: new_price,
      currency_id,
      effective_from: effective_from || now,
      created_by: user_id,
    });

    // Update denormalized current price 
    await db("inventory_current_prices")
    .where("inventory_id", inventory_id)
    .where("price_type_id", price_type_id)
    .update({
      current_price_id: newPriceId,
      current_price: new_price,
      current_id: currency_id,
      effective_from: now,
      updated_at: now
    });
  },
};