import { Request, Response } from 'express';
import type { MarketSnapshot, MarketAlert } from '../types/index.js';

export const marketController = {
  async getBalticSnapshot(req: Request, res: Response): Promise<void> {
    const snapshot: MarketSnapshot[] = [
      {
        balticIndexName: 'Baltic Panamax (BPI 82)',
        currentRate: '$16,420 / day',
        sevenDayMovement: '+4.2%',
        direction: 'up',
        updatedAt: 'Today 11:00 UTC'
      },
      {
        balticIndexName: 'Baltic Supramax (BSI 58)',
        currentRate: '$14,180 / day',
        sevenDayMovement: '+1.8%',
        direction: 'up',
        updatedAt: 'Today 11:00 UTC'
      },
      {
        balticIndexName: 'Baltic Capesize (BCI 180)',
        currentRate: '$24,650 / day',
        sevenDayMovement: '-2.1%',
        direction: 'down',
        updatedAt: 'Today 11:00 UTC'
      },
      {
        balticIndexName: 'VLSFO Bunker (Singapore)',
        currentRate: '$622.50 / MT',
        sevenDayMovement: '-0.4%',
        direction: 'flat',
        updatedAt: 'Today 10:30 UTC'
      }
    ];

    res.status(200).json(snapshot);
  },

  async getMarketAlerts(req: Request, res: Response): Promise<void> {
    const alerts: MarketAlert[] = [
      {
        id: 'alt-01',
        type: 'rate',
        severity: 'warning',
        headline: 'Freight rates trending upward',
        details: 'Pacific Panamax spot index increased 4.2% over 7 days, driven by active East Coast India thermal coal replenishment.',
        timestamp: '2 hours ago'
      },
      {
        id: 'alt-02',
        type: 'congestion',
        severity: 'warning',
        headline: 'Destination congestion elevated',
        details: 'Paradip Port average waiting time increased to 36 hours due to monsoon handling slowdown and high coal discharge queue.',
        timestamp: '5 hours ago'
      },
      {
        id: 'alt-03',
        type: 'vessel',
        severity: 'alert',
        headline: 'Panamax availability tightening',
        details: 'Prompt open tonnage in South-East Asia basin down 14% week-on-week as Chinese grain fixtures absorb ballast fleet.',
        timestamp: '1 day ago'
      }
    ];

    res.status(200).json(alerts);
  }
};
