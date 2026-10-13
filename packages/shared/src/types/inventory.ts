export interface InventoryItem {
  id: string;
  name: string;
  sku: string;
  category_id: string;
  category_name?: string;
  unit_id: string;
  unit_name?: string;
  unit_price: number;
  tax_enabled: boolean;
  tax_rate_id?: string | null;
  tax_rate_name?: string;
  target_stock_level: number;
  warning_level: number;
  critical_low_level: number;
  current_stock: number;
  is_active: boolean;
  voided: boolean;
  created_at: string;
  updated_at?: string;
}

export interface InventoryBatch {
  id: string;
  batch_number: string;
  name: string;
  description?: string | null;
  supplier?: string | null;
  manufacture_date?: string | null;
  expiry_date?: string | null;
  notes?: string | null;
  is_active: boolean;
  voided: boolean;
  created_at: string;
  updated_at?: string;
  total_items?: number;
  total_quantity?: number;
}

export interface InventoryBatchItem {
  id: string;
  inventory_id: string;
  batch_id: string;
  quantity: number;
  unit_cost?: number | null;
  location_in_store?: string | null;
  notes?: string | null;
  created_at: string;
  inventory_name?: string;
  inventory_sku?: string;
  batch_number?: string;
}

export interface InventoryQueryParams {
  page: number;
  limit: number;
  search?: string;
  category_id?: string;
  batch_id?: string;
  status?: 'all' | 'low_stock' | 'critical' | 'active';
  sort_by?: 'name' | 'sku' | 'unit_price' | 'current_stock' | 'created_at' | 'expiry_date';
  sort_order?: 'asc' | 'desc';
}

export interface BatchQueryParams {
  page: number;
  limit: number;
  search?: string;
  status?: 'all' | 'active' | 'expired' | 'expiring_soon';
  sort_by?: 'batch_number' | 'name' | 'expiry_date' | 'created_at';
  sort_order?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}