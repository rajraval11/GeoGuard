import { Response, NextFunction } from 'express';
import { z } from 'zod';
import { analysisService } from '../services/analysisService.js';
import type { AuthenticatedRequest } from '../types/index.js';

const analysisInputSchema = z.object({
  cargo: z.object({
    cargoType: z.string().min(1, 'Cargo type is required'),
    quantityMT: z.number().positive('Quantity must be greater than 0'),
    shipmentsCount: z.number().int().min(1, 'Shipments count must be at least 1'),
    laycanStart: z.string().optional(),
    laycanEnd: z.string().optional(),
    specialHandling: z.string().optional()
  }),
  route: z.object({
    originPortId: z.string().min(1, 'Origin port required'),
    originPortName: z.string().optional(),
    originCountry: z.string().optional(),
    destinationPortId: z.string().min(1, 'Destination port required'),
    destinationPortName: z.string().optional(),
    destinationCountry: z.string().optional()
  }),
  contract: z.object({
    planningDurationMonths: z.number().int().min(1).max(24),
    preference: z.enum(['Spot', 'Short-Term', 'Medium-Term', 'Hybrid']),
    riskTolerance: z.enum(['Conservative', 'Moderate', 'Aggressive'])
  })
});

export const analysisController = {
  async createAnalysis(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'User must be authenticated.' } });
        return;
      }
      const validatedInput = analysisInputSchema.parse(req.body);
      const result = await analysisService.createAnalysis(validatedInput as any, req.user);
      res.status(201).json(result);
    } catch (err) {
      next(err);
    }
  },

  async listAnalyses(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'User must be authenticated.' } });
        return;
      }
      const results = await analysisService.listAnalyses(req.user);
      res.status(200).json(results);
    } catch (err) {
      next(err);
    }
  },

  async getAnalysisById(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'User must be authenticated.' } });
        return;
      }
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const result = await analysisService.getAnalysisById(id, req.user);
      res.status(200).json(result);
    } catch (err) {
      next(err);
    }
  },

  async deleteAnalysis(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'User must be authenticated.' } });
        return;
      }
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const result = await analysisService.deleteAnalysis(id, req.user);
      res.status(200).json(result);
    } catch (err) {
      next(err);
    }
  }
};
