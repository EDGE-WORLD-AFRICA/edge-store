import { apiClient } from "../lib/apiClient";
import type { 
  InventoryItem, 
  InventoryBatch, 
  InventoryBatchItem,
  InventoryQueryParams,
  BatchQueryParams,
  PaginatedResponse
} from "@edge-store/shared";

export const inventoryService = {
  // Inventory Items
  getAll: async (params: InventoryQueryParams): Promise<PaginatedResponse<InventoryItem>> => {
    const response = await apiClient.get("/api/v1/inventory", { params });
    return response.data.data || response.data;
  },

  getById: async (id: string): Promise<InventoryItem> => {
    const response = await apiClient.get(`/api/v1/inventory/${id}`);
    return response.data.data || response.data;
  },

  create: async (payload: Partial<InventoryItem>) => {
    const response = await apiClient.post("/api/v1/inventory", payload);
    return response.data.data || response.data;
  },

  update: async (id: string, payload: Partial<InventoryItem>) => {
    const response = await apiClient.put(`/api/v1/inventory/${id}`, payload);
    return response.data.data || response.data;
  },

  void: async (id: string) => {
    const response = await apiClient.delete(`/api/v1/inventory/${id}`);
    return response.data.data || response.data;
  },

  checkSkuExists: async (sku: string, excludeId?: string): Promise<boolean> => {
    const response = await apiClient.get("/api/v1/inventory/check-sku", {
      params: { sku, excludeId },
    });
    return response.data.data?.exists || false;
  },

  // Batches
  getAllBatches: async (params: BatchQueryParams): Promise<PaginatedResponse<InventoryBatch>> => {
    const response = await apiClient.get("/api/v1/inventory/batches", { params });
    return response.data.data || response.data;
  },

  getBatchById: async (id: string): Promise<InventoryBatch> => {
    const response = await apiClient.get(`/api/v1/inventory/batches/${id}`);
    return response.data.data || response.data;
  },

  createBatch: async (payload: Partial<InventoryBatch>) => {
    const response = await apiClient.post("/api/v1/inventory/batches", payload);
    return response.data.data || response.data;
  },

  updateBatch: async (id: string, payload: Partial<InventoryBatch>) => {
    const response = await apiClient.put(`/api/v1/inventory/batches/${id}`, payload);
    return response.data.data || response.data;
  },

  voidBatch: async (id: string) => {
    const response = await apiClient.delete(`/api/v1/inventory/batches/${id}`);
    return response.data.data || response.data;
  },

  checkBatchNumberExists: async (batchNumber: string, excludeId?: string): Promise<boolean> => {
    const response = await apiClient.get("/api/v1/inventory/batches/check-number", {
      params: { batchNumber, excludeId },
    });
    return response.data.data?.exists || false;
  },

  // Batch Items
  getBatchItems: async (batchId: string): Promise<InventoryBatchItem[]> => {
    const response = await apiClient.get(`/api/v1/inventory/batches/${batchId}/items`);
    return response.data.data || response.data;
  },

  addBatchItem: async (payload: Partial<InventoryBatchItem>) => {
    const response = await apiClient.post("/api/v1/inventory/batch-items", payload);
    return response.data.data || response.data;
  },

  updateBatchItem: async (id: string, payload: Partial<InventoryBatchItem>) => {
    const response = await apiClient.put(`/api/v1/inventory/batch-items/${id}`, payload);
    return response.data.data || response.data;
  },

  removeBatchItem: async (id: string) => {
    const response = await apiClient.delete(`/api/v1/inventory/batch-items/${id}`);
    return response.data.data || response.data;
  },
};