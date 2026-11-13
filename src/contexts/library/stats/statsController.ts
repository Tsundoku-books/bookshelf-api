import { Request, Response } from 'express';
import { bugOn } from '../../playground';
import { StatsService } from './statsService';

export const statsController = {
  async overview(req: Request, res: Response) {
    const stats = await StatsService.overview(req.userId as string);
    res.json({ stats: bugOn(req, 'api-stats-total-off-by-one') ? { ...stats, total: stats.total + 1 } : stats });
  },
};
