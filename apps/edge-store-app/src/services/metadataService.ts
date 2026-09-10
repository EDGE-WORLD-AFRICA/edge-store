import { apiClient } from "../lib/apiClient";

export const metadataService = {
  getAll: () => apiClient.get("/metadata").then((r) => r.data.data ),

  getCurrencies: () => apiClient.get("/metadata/currencies").then((r) => r.data.data),
  createCurrency: (data: any) => apiClient.post("/metadata/currencies", data).then((r) => r.data.data),
  updateCurrency: (id: string, data: any) => apiClient.put(`/metadata/currencies/${id}`, data).then((r) => r.data.data),
  voidCurrency: (id: string) => apiClient.delete(`/metadata/currencies/${id}`),

  getCategories: () => apiClient.get("/metadata/categories").then((r) => r.data.data),
  createCategory: (data: any) => apiClient.post("/metadata/categories", data).then((r) => r.data.data),
  updateCategory: (id: string, data: any) => apiClient.put(`/metadata/categories/${id}`, data).then((r) => r.data.data),
  voidCategory: (id: string) => apiClient.delete(`/metadata/categories/${id}`),

  getTypes: () => apiClient.get("/metadata/types").then((r) => r.data.data),
  createType: (data: any) => apiClient.post("/metadata/types", data).then((r) => r.data.data),
  updateType: (id: string, data: any) => apiClient.put(`/metadata/types/${id}`, data).then((r) => r.data.data),
  voidType: (id: string) => apiClient.delete(`/metadata/types/${id}`),

  getUnits: () => apiClient.get("/metadata/units").then((r) => r.data.data),
  createUnit: (data: any) => apiClient.post("/metadata/units", data).then((r) => r.data.data),
  updateUnit: (id: string, data: any) => apiClient.put(`/metadata/units/${id}`, data).then((r) => r.data.data),
  voidUnit: (id: string) => apiClient.delete(`/metadata/units/${id}`),

  getTaxTypes: () => apiClient.get("/metadata/tax-types").then((r) => r.data.data),
  getTaxRates: () => apiClient.get("/metadata/tax-rates").then((r) => r.data.data),
  createTaxRate: (data: any) => apiClient.post("/metadata/tax-rates", data).then((r) => r.data.data),
  updateTaxRate: (id: string, data: any) => apiClient.put(`/metadata/tax-rates/${id}`, data).then((r) => r.data.data),
  voidTaxRate: (id: string) => apiClient.delete(`/metadata/tax-rates/${id}`),

  getPriceTypes: () => apiClient.get("/metadata/price-types").then((r) => r.data.data),
  createPriceType: (data: any) => apiClient.post("/metadata/price-types", data).then((r) => r.data.data),
  updatePriceType: (id: string, data: any) => apiClient.put(`/metadata/price-types/${id}`, data).then((r) => r.data.data),
  voidPriceType: (id: string) => apiClient.delete(`/metadata/price-types/${id}`)
};