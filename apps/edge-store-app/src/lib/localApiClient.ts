import Database from '@tauri-apps/plugin-sql';
import { 
  SyncStatus, 
  LocalCategory, 
  LocalCurrency, 
  LocalInventoryType, 
  LocalUnit, 
  LocalTaxType, 
  LocalTaxRate, 
  LocalPriceType 
} from '@edge-store/shared';

let dbInstance: Database | null = null;

export async function getLocalDb(): Promise<Database> {
  if (!dbInstance) {
    dbInstance = await Database.load('sqlite:metadata.db');
    await initializeSchema(dbInstance);
  }
  return dbInstance;
}

async function initializeSchema(db: Database): Promise<void> {
  await db.execute(`
    CREATE TABLE IF NOT EXISTS sync_status (
      entity TEXT PRIMARY KEY,
      last_synced_at TEXT,
      status TEXT DEFAULT 'pending'
    );
  `);

  await db.execute(`
    CREATE TABLE IF NOT EXISTS inventory_categories (
      id TEXT PRIMARY KEY,
      parent_id TEXT,
      name TEXT NOT NULL,
      slug TEXT,
      code TEXT,
      description TEXT,
      icon_url TEXT,
      sort_order INTEGER DEFAULT 0,
      is_active INTEGER DEFAULT 1,
      voided INTEGER DEFAULT 0,
      target_stock_level INTEGER,
      synced_at TEXT NOT NULL
    );
  `);

  await db.execute(`
    CREATE TABLE IF NOT EXISTS currencies (
      id TEXT PRIMARY KEY,
      code TEXT NOT NULL,
      name TEXT NOT NULL,
      symbol TEXT NOT NULL,
      decimal_places INTEGER DEFAULT 2,
      is_base INTEGER DEFAULT 0,
      is_active INTEGER DEFAULT 1,
      voided INTEGER DEFAULT 0,
      synced_at TEXT NOT NULL
    );
  `);

  await db.execute(`
    CREATE TABLE IF NOT EXISTS inventory_types (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      code TEXT,
      description TEXT,
      is_active INTEGER DEFAULT 1,
      voided INTEGER DEFAULT 0,
      target_stock_level INTEGER,
      synced_at TEXT NOT NULL
    );
  `);

  await db.execute(`
    CREATE TABLE IF NOT EXISTS units_of_measure (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      abbreviation TEXT NOT NULL,
      description TEXT,
      is_active INTEGER DEFAULT 1,
      voided INTEGER DEFAULT 0,
      synced_at TEXT NOT NULL
    );
  `);

  await db.execute(`
    CREATE TABLE IF NOT EXISTS tax_types (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      code TEXT,
      description TEXT,
      calculation_method TEXT DEFAULT 'percentage',
      is_inclusive INTEGER DEFAULT 0,
      is_active INTEGER DEFAULT 1,
      voided INTEGER DEFAULT 0,
      synced_at TEXT NOT NULL
    );
  `);

  await db.execute(`
    CREATE TABLE IF NOT EXISTS tax_rates (
      id TEXT PRIMARY KEY,
      tax_type_id TEXT NOT NULL,
      name TEXT NOT NULL,
      rate REAL NOT NULL,
      year INTEGER NOT NULL,
      effective_from TEXT NOT NULL,
      effective_to TEXT,
      description TEXT,
      is_active INTEGER DEFAULT 1,
      voided INTEGER DEFAULT 0,
      synced_at TEXT NOT NULL
    );
  `);

  await db.execute(`
    CREATE TABLE IF NOT EXISTS price_types (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      code TEXT,
      description TEXT,
      min_quantity INTEGER DEFAULT 1,
      is_active INTEGER DEFAULT 1,
      voided INTEGER DEFAULT 0,
      synced_at TEXT NOT NULL
    );
  `);
}

export async function getLocalMetadata<T>(entity: string): Promise<T[]> {
  const db = await getLocalDb();
  const query = `SELECT * FROM ${entity} WHERE voided = 0 ORDER BY sort_order ASC, name ASC`;
  return await db.select<T[]>(query);
}

export async function upsertLocalMetadata(entity: string, records: any[]): Promise<void> {
  const db = await getLocalDb();
  const now = new Date().toISOString();

  if (records.length === 0) return;

  const columns = Object.keys(records[0]);
  const placeholders = columns.map(() => '?').join(', ');
  const updateAssignments = columns
    .filter((col) => col !== 'id')
    .map((col) => `${col} = excluded.${col}`)
    .join(', ');

  const recordsWithSync = records.map((r) => {
    const mapped: any = { synced_at: now };
    for (const key in r) {
      mapped[key] = typeof r[key] === 'boolean' ? (r[key] ? 1 : 0) : r[key];
    }
    return mapped;
  });

  await db.execute('BEGIN TRANSACTION');
  try {
    for (const record of recordsWithSync) {
      const values = columns.map((col) => record[col]);
      await db.execute(
        `INSERT INTO ${entity} (${columns.join(', ')}) 
         VALUES (${placeholders}) 
         ON CONFLICT(id) DO UPDATE SET ${updateAssignments}, synced_at = excluded.synced_at`,
        values
      );
    }
    
    await db.execute(
      `INSERT INTO sync_status (entity, last_synced_at, status) 
       VALUES (?, ?, 'synced')
       ON CONFLICT(entity) DO UPDATE SET last_synced_at = excluded.last_synced_at, status = 'synced'`,
      [entity, now]
    );
    
    await db.execute('COMMIT');
  } catch (error) {
    await db.execute('ROLLBACK');
    console.error(`Failed to upsert ${entity}:`, error);
    throw error;
  }
}

export async function getSyncStatus(): Promise<SyncStatus[]> {
  const db = await getLocalDb();
  return await db.select<SyncStatus[]>('SELECT * FROM sync_status');
}

export async function updateSyncStatus(entity: string, status: 'pending' | 'syncing' | 'synced' | 'error'): Promise<void> {
  const db = await getLocalDb();
  const now = new Date().toISOString();
  await db.execute(
    `INSERT INTO sync_status (entity, last_synced_at, status) 
     VALUES (?, ?, ?)
     ON CONFLICT(entity) DO UPDATE SET last_synced_at = excluded.last_synced_at, status = excluded.status`,
    [entity, now, status]
  );
}