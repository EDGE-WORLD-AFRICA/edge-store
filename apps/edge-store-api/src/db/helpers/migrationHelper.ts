import { Knex } from "knex";

/**
 * Idempotent table creation/update helper for Knex migrations.
 * 
 * If the table does not exist, it creates it using the provided callback.
 * If the table exists, it inspects the callback to determine which columns 
 * are intended, and safely adds any missing columns without throwing errors.
 */
export async function createTableIfNotExist(
  knex: Knex,
  tableName: string,
  callback: (table: Knex.CreateTableBuilder) => void
): Promise<void> {
  const tableExists = await knex.schema.hasTable(tableName);

  if (!tableExists) {
    await knex.schema.createTable(tableName, callback);
    return;
  }

  // Capture the schema definition from the callback using a mock builder
  const schemaCapture: Array<{
    method: string;
    args: any[];
    modifiers: Array<{ method: string; args: any[] }>;
    isTableLevel?: boolean;
  }> = [];

  const createMockBuilder = (): any => {
    const mock: any = {};
    
    // Chainable column modifiers
    const chainableModifiers = [
      'nullable', 'notNullable', 'defaultTo', 'unsigned', 'primary', 'unique', 
      'index', 'references', 'inTable', 'onDelete', 'onUpdate', 'comment', 
      'alter', 'first', 'after', 'collate'
    ];

    const createChain = (method: string, args: any[]): any => {
      const chainRecord: any = { method, args, modifiers: [] };
      const chainProxy: any = {};

      chainableModifiers.forEach((mod) => {
        chainProxy[mod] = (...modArgs: any[]) => {
          chainRecord.modifiers.push({ method: mod, args: modArgs });
          return chainProxy;
        };
      });

      // Allow chaining into other column definitions
      Object.keys(mock).forEach((key) => {
        chainProxy[key] = mock[key];
      });

      schemaCapture.push(chainRecord);
      return chainProxy;
    };

    // Column creation methods
    const columnMethods = [
      'increments', 'integer', 'bigInteger', 'text', 'string', 'float', 'decimal',
      'boolean', 'date', 'datetime', 'time', 'timestamp', 'timestamps', 'binary',
      'json', 'jsonb', 'uuid', 'enum', 'specificType', 'geometry', 'geography'
    ];

    columnMethods.forEach((method) => {
      mock[method] = (...args: any[]) => createChain(method, args);
    });

    // Table-level methods (indexes, etc.)
    const tableMethods = [
      'primary', 'unique', 'index', 'dropColumn', 'renameColumn', 
      'dropPrimary', 'dropUnique', 'dropIndex', 'dropForeign'
    ];
    
    tableMethods.forEach((method) => {
      mock[method] = (...args: any[]) => {
        schemaCapture.push({ method, args, modifiers: [], isTableLevel: true });
        return mock;
      };
    });

    // ─── Mock the Foreign Key Builder specifically ───
    mock.foreign = (...args: any[]) => {
      const fkRecord: any = { method: 'foreign', args, modifiers: [], isTableLevel: true };
      schemaCapture.push(fkRecord);
      
      const fkMock: any = {};
      const fkMethods = ['references', 'inTable', 'onDelete', 'onUpdate', 'withKeyName'];
      
      fkMethods.forEach((m) => {
        fkMock[m] = (...mArgs: any[]) => {
          fkRecord.modifiers.push({ method: m, args: mArgs });
          return fkMock; // Return itself to allow chaining like .references().onDelete()
        };
      });
      
      return fkMock;
    };

    return mock;
  };

  const mockBuilder = createMockBuilder();
  
  // Run the callback against the mock to capture the schema
  callback(mockBuilder);

  // Apply missing columns to the existing table
  await knex.schema.alterTable(tableName, async (table) => {
    for (const record of schemaCapture) {
      // Table-level constraints like foreign keys are skipped in alter mode 
      // to avoid duplicate index/FK errors.
      if (record.isTableLevel) continue;

      const columnName = record.args[0];
      if (!columnName || typeof columnName !== 'string') continue;

      const hasColumn = await knex.schema.hasColumn(tableName, columnName);
      if (!hasColumn) {
        let colBuilder = (table as any)[record.method](...record.args);
        for (const mod of record.modifiers) {
          if (typeof colBuilder[mod.method] === 'function') {
            colBuilder = colBuilder[mod.method](...mod.args);
          }
        }
      }
    }
  });
}

/**
 * Safely drops a table if it exists.
 */
export async function dropTableIfExists(knex: Knex, tableName: string): Promise<void> {
  await knex.schema.dropTableIfExists(tableName);
}