export interface SyncStatus {
  entity: string;
  last_synced_at: string | null;
  status: 'pending' | 'syncing' | 'synced' | 'error';
}

export interface LocalCategory {
  id: string;
  parent_id: string | null;
  name: string;
  slug: string | null;
  code: string | null;
  description: string | null;
  icon_url: string | null;
  sort_order: number;
  is_active: boolean;
  voided: boolean;
  target_stock_level: number | null;
  synced_at: string;
}

export interface LocalCurrency {
  id: string;
  code: string;
  name: string;
  symbol: string;
  decimal_places: number;
  is_base: boolean;
  is_active: boolean;
  voided: boolean;
  synced_at: string;
}

export interface LocalInventoryType {
  id: string;
  name: string;
  code: string | null;
  description: string | null;
  is_active: boolean;
  voided: boolean;
  target_stock_level: number | null;
  synced_at: string;
}

export interface LocalUnit {
  id: string;
  name: string;
  abbreviation: string;
  description: string | null;
  is_active: boolean;
  voided: boolean;
  synced_at: string;
}

export interface LocalTaxType {
  id: string;
  name: string;
  code: string | null;
  description: string | null;
  calculation_method: string;
  is_inclusive: boolean;
  is_active: boolean;
  voided: boolean;
  synced_at: string;
}

export interface LocalTaxRate {
  id: string;
  tax_type_id: string;
  name: string;
  rate: number;
  year: number;
  effective_from: string;
  effective_to: string | null;
  description: string | null;
  is_active: boolean;
  voided: boolean;
  synced_at: string;
}

export interface LocalPriceType {
  id: string;
  name: string;
  code: string | null;
  description: string | null;
  min_quantity: number;
  is_active: boolean;
  voided: boolean;
  synced_at: string;
}