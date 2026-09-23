import { Response, NextFunction } from 'express';
import { z } from 'zod';
import { adminService } from '../services/adminService.js';
import type { AuthenticatedRequest } from '../types/index.js';

const updateUserSchema = z.object({
  role: z.enum(['Admin', 'Charterer', 'Analyst']).optional(),
  status: z.enum(['Active', 'Suspended']).optional()
});

export const adminController = {
  async getDataHealth(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const dataHealth = await adminService.getDataHealth();
      res.status(200).json(dataHealth);
    } catch (err) {
      next(err);
    }
  },

  async getModelPerformance(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const perf = await adminService.getModelPerformance();
      res.status(200).json(perf);
    } catch (err) {
      next(err);
    }
  },

  async getUsage(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const usage = await adminService.getUsage();
      res.status(200).json(usage);
    } catch (err) {
      next(err);
    }
  },

  async getUsers(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const users = await adminService.getUsers();
      res.status(200).json(users);
    } catch (err) {
      next(err);
    }
  },

  async getOrganizations(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const orgs = await adminService.getOrganizations();
      res.status(200).json(orgs);
    } catch (err) {
      next(err);
    }
  },

  async getAnalyses(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const analyses = await adminService.getAnalyses();
      res.status(200).json(analyses);
    } catch (err) {
      next(err);
    }
  },

  async getDashboard(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const usage = await adminService.getUsage();
      res.status(200).json(usage);
    } catch (err) {
      next(err);
    }
  },

  async updateUser(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const validated = updateUserSchema.parse(req.body);
      const userId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const updated = await adminService.updateUser(userId, validated);
      res.status(200).json(updated);
    } catch (err) {
      next(err);
    }
  }
};
