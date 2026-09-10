import type { Request, Response, NextFunction } from "express";
import { metadataService } from "@/services/metadataService";
import { sendSuccess, sendCreated, sendError } from "@/utils/response";

export const metadataController = {
  getAll: async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await metadataService.getAllMetadata();
      sendSuccess(res, data);
    } catch (e) {
      next(e);
    }
  },

  // Currencies 
  getCurrencies: async (_req: Request, res: Response, next: NextFunction) => {
    try{ sendSuccess(res, await metadataService.getCurrencies()); } catch (e) { next(e); }
  },
  createCurrency: async (req: Request, res: Response, next: NextFunction) => {
    try { sendCreated(res, await metadataService.createCurrency(req.body)); } catch (e) { next(e); }
  },
  updateCurrency: async (req: Request, res: Response, next: NextFunction) => {
    try { sendSuccess(res, await metadataService.updateCurrency(req.params.id, req.body)); } catch (e) { next(e); }
  },
  voidCurrency: async (req: Request, res: Response, next: NextFunction) => {
    try { await metadataService.voidCurrency(req.params.id); sendSuccess(res, null, "Currency voided"); } catch (e) { next(e); }
  },

  // Categories
  getCategories: async (_req: Request, res: Response, next: NextFunction) => {
    try { sendSuccess(res, await metadataService.getCategories()); } catch (e) { next(e); }
  },
  createCategory: async (req: Request, res: Response, next: NextFunction) => {
    try { sendCreated(res, await metadataService.createCategory(req.body)); } catch (e) { next(e); }
  },
  updateCategory: async (req: Request, res: Response, next: NextFunction) => {
    try { sendSuccess(res, await metadataService.updateCategory(req.params.id, req.body)); } catch (e) { next(e); }
  },
  voidCategory: async (req: Request, res: Response, next: NextFunction) => {
    try { await metadataService.voidCategory(req.params.id); sendSuccess(res, null, "Category voided"); } catch (e) { next(e); }
  },

  // Types
  getTypes: async (_req: Request, res: Response, next: NextFunction) => {
    try { sendSuccess(res, await metadataService.getTypes()); } catch (e) { next(e); }
  },
  createType: async (req: Request, res: Response, next: NextFunction) => {
    try { sendCreated(res, await metadataService.createType(req.body)); } catch (e) { next(e); }
  },
  updateType: async (req: Request, res: Response, next: NextFunction) => {
    try { sendSuccess(res, await metadataService.updateType(req.params.id, req.body)); } catch (e) { next(e); }
  },
  voidType: async (req: Request, res: Response, next: NextFunction) => {
    try { await metadataService.voidType(req.params.id); sendSuccess(res, null, "Type voided"); } catch (e) { next(e); }
  },

  // Units
  getUnits: async (_req: Request, res: Response, next: NextFunction) => {
    try { sendSuccess(res, await metadataService.getUnits()); } catch (e) { next(e); }
  },
  createUnit: async (req: Request, res: Response, next: NextFunction) => {
    try { sendCreated(res, await metadataService.createUnit(req.body)); } catch (e) { next(e); }
  },
  updateUnit: async (req: Request, res: Response, next: NextFunction) => {
    try { sendSuccess(res, await metadataService.updateUnit(req.params.id, req.body)); } catch (e) { next(e); }
  },
  voidUnit: async (req: Request, res: Response, next: NextFunction) => {
    try { await metadataService.voidUnit(req.params.id); sendSuccess(res, null, "Unit voided"); } catch (e) { next(e); }
  },

  // Tax
  getTaxTypes: async (_req: Request, res: Response, next: NextFunction) => {
    try { sendSuccess(res, await metadataService.getTaxTypes()); } catch (e) { next(e); }
  },
  getTaxRates: async (_req: Request, res: Response, next: NextFunction) => {
    try { sendSuccess(res, await metadataService.getTaxRates()); } catch (e) { next(e); }
  },
  createTaxRate: async (req: Request, res: Response, next: NextFunction) => {
    try { sendCreated(res, await metadataService.createTaxRate(req.body)); } catch (e) { next(e); }
  },
  updateTaxRate: async (req: Request, res: Response, next: NextFunction) => {
    try { sendSuccess(res, await metadataService.updateTaxRate(req.params.id, req.body)); } catch (e) { next(e); }
  },
  voidTaxRate: async (req: Request, res: Response, next: NextFunction) => {
    try { await metadataService.voidTaxRate(req.params.id); sendSuccess(res, null, "Tax rate voided"); } catch (e) { next(e); }
  },

  // Price Types
  getPriceTypes: async (_req: Request, res: Response, next: NextFunction) => {
    try { sendSuccess(res, await metadataService.getPriceTypes()); } catch (e) { next(e); }
  },
  createPriceType: async (req: Request, res: Response, next: NextFunction) => {
    try { sendCreated(res, await metadataService.createPriceType(req.body)); } catch (e) { next(e); }
  },
  updatePriceType: async (req: Request, res: Response, next: NextFunction) => {
    try { sendSuccess(res, await metadataService.updatePriceType(req.params.id, req.body)); } catch (e) { next(e); }
  },
  voidPriceType: async (req: Request, res: Response, next: NextFunction) => {
    try { await metadataService.voidPriceType(req.params.id); sendSuccess(res, null, "Price type voided"); } catch (e) { next(e); }
  },
};