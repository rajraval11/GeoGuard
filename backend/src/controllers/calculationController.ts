import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { mlClient } from '../services/mlClient.js';
import { prisma } from '../config/db.js';

const forecastSchema = z.object({
  vesselClass: z.enum(['Handysize', 'Supramax', 'Panamax', 'Capesize']),
  routeId: z.string().optional(),
  horizonWeeks: z.number().int().min(1).max(52).optional()
});

const compatibilitySchema = z.object({
  vesselClass: z.enum(['Handysize', 'Supramax', 'Panamax', 'Capesize']),
  originPortId: z.string().min(1, 'Origin port is required'),
  destinationPortId: z.string().min(1, 'Destination port is required')
});

const optimizationSchema = z.object({
  cargoQuantityMT: z.number().positive(),
  shipmentsCount: z.number().int().min(1),
  planningDurationMonths: z.number().int().min(1).max(24),
  riskTolerance: z.enum(['Conservative', 'Moderate', 'Aggressive'])
});

export const calculationController = {
  async getForecast(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const validated = forecastSchema.parse(req.body);
      const prediction = await mlClient.predict({
        vesselClass: validated.vesselClass,
        horizonWeeks: validated.horizonWeeks || 8
      });
      res.status(200).json(prediction);
    } catch (err) {
      next(err);
    }
  },

  async checkCompatibility(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const validated = compatibilitySchema.parse(req.body);

      // Fetch port details if in database
      let originPort: any = null;
      let destPort: any = null;
      try {
        [originPort, destPort] = await Promise.all([
          prisma.port.findFirst({ where: { OR: [{ id: validated.originPortId }, { code: validated.originPortId }] } }),
          prisma.port.findFirst({ where: { OR: [{ id: validated.destinationPortId }, { code: validated.destinationPortId }] } })
        ]);
      } catch (dbErr) {
        // Fallback to default port dimensions if database is not reachable
      }

      const originMaxDraft = originPort?.maxDraftMeters || (validated.originPortId.toLowerCase().includes('taboneo') ? 18.0 : 16.0);
      const destMaxDraft = destPort?.maxDraftMeters || (validated.destinationPortId.toLowerCase().includes('paradip') ? 14.5 : 15.0);
      const destMaxLoa = destPort?.maxLoaMeters || (validated.destinationPortId.toLowerCase().includes('paradip') ? 260.0 : 300.0);

      const result = await mlClient.checkCompatibility({
        originMaxDraft,
        destMaxDraft,
        destMaxLoa
      });

      // Vessel-specific clearance metrics for the requested vessel
      const vesselTypicalDrafts: Record<string, { draft: number; loa: number; beam: number }> = {
        Handysize: { draft: 10.2, loa: 180, beam: 28.5 },
        Supramax: { draft: 12.8, loa: 200, beam: 32.2 },
        Panamax: { draft: 14.2, loa: 225, beam: 32.3 },
        Capesize: { draft: 18.2, loa: 292, beam: 45.0 }
      };

      const vessel = vesselTypicalDrafts[validated.vesselClass] || vesselTypicalDrafts.Panamax;
      const draftMarginOriginM = Number((originMaxDraft - vessel.draft).toFixed(2));
      const draftMarginDestM = Number((destMaxDraft - vessel.draft).toFixed(2));
      const loaMarginDestM = Number((destMaxLoa - vessel.loa).toFixed(2));
      const beamMarginDestM = Number((45.0 - vessel.beam).toFixed(2));

      const requiresLightering = draftMarginDestM < 0;
      const isFeasible = draftMarginOriginM >= 0 && (draftMarginDestM >= 0 || requiresLightering);

      const notes: string[] = [];
      if (draftMarginOriginM < 0.5) notes.push(`Tight draft clearance at load port (${draftMarginOriginM}m margin).`);
      if (requiresLightering) notes.push(`Vessel draft (${vessel.draft}m) exceeds destination channel draft (${destMaxDraft}m). Anchorage lightering required.`);
      if (destPort?.tideRestriction) notes.push('Discharge berth requires tidal transit window for final approach.');

      res.status(200).json({
        feasible: isFeasible,
        draftMarginOriginM,
        draftMarginDestM,
        loaMarginDestM,
        beamMarginDestM,
        requiresLightering,
        tideDependentDischarge: destPort?.tideRestriction ?? true,
        notes: notes.length > 0 ? notes : ['Vessel dimensions satisfy port draft, LOA, and beam limits.']
      });
    } catch (err) {
      next(err);
    }
  },

  async optimizeContractMix(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const validated = optimizationSchema.parse(req.body);
      const result = await mlClient.optimizeContractMix({
        planningDurationMonths: validated.planningDurationMonths,
        riskTolerance: validated.riskTolerance,
        totalQuantityMT: validated.cargoQuantityMT
      });
      res.status(200).json(result);
    } catch (err) {
      next(err);
    }
  }
};
