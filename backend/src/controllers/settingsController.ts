import { Response } from 'express';
import type { AuthenticatedRequest } from '../types/index.js';

let systemSettings = {
  feedCadence: 'hourly',
  retrainSchedule: 'weekly',
  logRetentionDays: 90
};

export const settingsController = {
  async getSettings(req: AuthenticatedRequest, res: Response): Promise<void> {
    res.status(200).json(systemSettings);
  },

  async updateSettings(req: AuthenticatedRequest, res: Response): Promise<void> {
    const { feedCadence, retrainSchedule, logRetentionDays } = req.body;
    if (feedCadence) systemSettings.feedCadence = feedCadence;
    if (retrainSchedule) systemSettings.retrainSchedule = retrainSchedule;
    if (logRetentionDays) systemSettings.logRetentionDays = Number(logRetentionDays);

    res.status(200).json({
      success: true,
      message: 'System administration parameters updated successfully.',
      settings: systemSettings
    });
  }
};
