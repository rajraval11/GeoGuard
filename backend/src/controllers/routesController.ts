import { Request, Response, NextFunction } from 'express';
import { prisma } from '../config/db.js';
import type { PortRecord, VesselRecord } from '../types/index.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATASET_DIR = path.resolve(__dirname, '../../../dataset_fixed');

export const routesController = {
  async getPorts(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      try {
        const dbPorts = await prisma.port.findMany({
          orderBy: { name: 'asc' }
        });

        if (dbPorts.length > 0) {
          const ports: PortRecord[] = dbPorts.map((p) => ({
            id: p.id,
            name: p.name,
            country: p.country,
            code: p.code,
            maxDraftMeters: p.maxDraftMeters,
            maxLoaMeters: p.maxLoaMeters,
            maxBeamMeters: p.maxBeamMeters,
            tideRestriction: p.tideRestriction,
            averageWaitingHours: p.averageWaitingHours,
            congestionIndex: p.congestionIndex as any
          }));
          res.status(200).json(ports);
          return;
        }
      } catch (dbErr) {
        // Fallback to canonical bulk reference ports if database is offline
      }

      // Canonical baseline ports for bulk cargo
      const defaultPorts: PortRecord[] = [
        {
          id: 'port-id-taboneo',
          name: 'Taboneo Anchorage',
          country: 'Indonesia',
          code: 'TABONEO',
          maxDraftMeters: 18.0,
          maxLoaMeters: 300.0,
          maxBeamMeters: 50.0,
          tideRestriction: false,
          averageWaitingHours: 8.0,
          congestionIndex: 'Low'
        },
        {
          id: 'port-in-paradip',
          name: 'Paradip Port',
          country: 'India',
          code: 'PARADIP',
          maxDraftMeters: 14.5,
          maxLoaMeters: 260.0,
          maxBeamMeters: 45.0,
          tideRestriction: true,
          averageWaitingHours: 36.0,
          congestionIndex: 'High'
        },
        {
          id: 'port-au-newcastle',
          name: 'Port of Newcastle',
          country: 'Australia',
          code: 'NEWCASTLE',
          maxDraftMeters: 15.2,
          maxLoaMeters: 300.0,
          maxBeamMeters: 50.0,
          tideRestriction: true,
          averageWaitingHours: 28.0,
          congestionIndex: 'Moderate'
        }
      ];

      res.status(200).json(defaultPorts);
    } catch (err) {
      next(err);
    }
  },

  async getVessels(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      try {
        const dbVessels = await prisma.vesselClass.findMany({
          orderBy: { dwtMax: 'asc' }
        });

        if (dbVessels.length > 0) {
          const vessels: VesselRecord[] = dbVessels.map((v) => ({
            id: v.id,
            vesselClass: v.name as any,
            dwtMin: v.dwtMin,
            dwtMax: v.dwtMax,
            typicalDraftM: v.typicalDraftM,
            typicalLoaM: v.typicalLoaM,
            typicalBeamM: v.typicalBeamM,
            dailyFuelConsumptionMT: v.dailyFuelConsumptionMT,
            suitableCargoes: v.suitableCargoes
          }));
          res.status(200).json(vessels);
          return;
        }
      } catch (dbErr) {
        // Fallback to canonical vessel classes if database is offline
      }

      // The four original GeoGuard vessel classes
      const defaultVessels: VesselRecord[] = [
        {
          id: 'vsl-01',
          vesselClass: 'Handysize',
          dwtMin: 28000,
          dwtMax: 40000,
          typicalDraftM: 10.2,
          typicalLoaM: 180,
          typicalBeamM: 28.5,
          dailyFuelConsumptionMT: 19.5,
          suitableCargoes: ['Fertilizer', 'Steel Products', 'Grains', 'Minerals', 'Agri-bulk']
        },
        {
          id: 'vsl-02',
          vesselClass: 'Supramax',
          dwtMin: 50000,
          dwtMax: 65000,
          typicalDraftM: 12.8,
          typicalLoaM: 200,
          typicalBeamM: 32.2,
          dailyFuelConsumptionMT: 26.0,
          suitableCargoes: ['Thermal Coal', 'Petcoke', 'Iron Ore Pellets', 'Bauxite', 'Grains']
        },
        {
          id: 'vsl-03',
          vesselClass: 'Panamax',
          dwtMin: 70000,
          dwtMax: 85000,
          typicalDraftM: 14.2,
          typicalLoaM: 225,
          typicalBeamM: 32.3,
          dailyFuelConsumptionMT: 31.0,
          suitableCargoes: ['Thermal Coal', 'Coking Coal', 'Iron Ore', 'Grains']
        },
        {
          id: 'vsl-04',
          vesselClass: 'Capesize',
          dwtMin: 160000,
          dwtMax: 210000,
          typicalDraftM: 18.2,
          typicalLoaM: 292,
          typicalBeamM: 45.0,
          dailyFuelConsumptionMT: 48.0,
          suitableCargoes: ['Iron Ore', 'Coking Coal']
        }
      ];

      res.status(200).json(defaultVessels);
    } catch (err) {
      next(err);
    }
  },

  async getLocations(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const dbPorts = await prisma.port.findMany({
        orderBy: { name: 'asc' }
      });

      const locations: Record<string, { id: string; name: string }[]> = {};

      if (dbPorts.length > 0) {
        dbPorts.forEach(p => {
          if (!locations[p.country]) locations[p.country] = [];
          locations[p.country].push({ id: p.id, name: p.name });
        });
      } else {
        // Fallback to CSV if DB is not seeded
        const csvPath = path.join(DATASET_DIR, 'port_specifications.csv');
        const content = fs.readFileSync(csvPath, 'utf8');
        const lines = content.split('\n').slice(1);
        lines.forEach(line => {
          const parts = line.split(',');
          if (parts.length >= 2) {
            const name = parts[0].trim();
            const country = parts[1].trim();
            if (name && country) {
              if (!locations[country]) locations[country] = [];
              locations[country].push({ id: name, name });
            }
          }
        });
      }

      // Sort countries and ports alphabetically
      const sortedLocations: Record<string, { id: string; name: string }[]> = {};
      Object.keys(locations).sort().forEach(country => {
        sortedLocations[country] = locations[country].sort((a, b) => a.name.localeCompare(b.name));
      });

      res.status(200).json(sortedLocations);
    } catch (err) {
      next(err);
    }
  },

  async getOrigins(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      let dbPorts: { id: string; name: string; country: string }[] = [];
      try {
        dbPorts = await prisma.port.findMany({
          where: { originRoutes: { some: {} } },
          select: { id: true, name: true, country: true },
          orderBy: { name: 'asc' }
        });
      } catch (e) {}

      if (dbPorts.length === 0) {
        const distancesPath = path.join(DATASET_DIR, 'sailing_distances.csv');
        const specsPath = path.join(DATASET_DIR, 'port_specifications.csv');
        const distContent = fs.readFileSync(distancesPath, 'utf8');
        const specsContent = fs.readFileSync(specsPath, 'utf8');

        const originNames = new Set<string>();
        distContent.split('\n').slice(1).forEach(line => {
          const parts = line.split(',');
          if (parts.length >= 2 && parts[0].trim()) {
            originNames.add(parts[0].trim());
          }
        });

        const portCountryMap: Record<string, string> = {};
        const portIdMap: Record<string, string> = {};
        specsContent.split('\n').slice(1).forEach(line => {
          const parts = line.split(',');
          if (parts.length >= 2) {
            const name = parts[0].trim();
            const country = parts[1].trim();
            const id = name; // use name as id in fallback
            if (name && country) {
              portCountryMap[name] = country;
              portIdMap[name] = id;
            }
          }
        });

        for (const name of originNames) {
          if (portCountryMap[name]) {
            dbPorts.push({ id: portIdMap[name], name, country: portCountryMap[name] });
          }
        }
      }

      const locations: Record<string, { id: string; name: string }[]> = {};
      dbPorts.forEach(p => {
        if (!locations[p.country]) locations[p.country] = [];
        locations[p.country].push({ id: p.id, name: p.name });
      });

      const sortedLocations: Record<string, { id: string; name: string }[]> = {};
      Object.keys(locations).sort().forEach(country => {
        sortedLocations[country] = locations[country].sort((a, b) => a.name.localeCompare(b.name));
      });

      res.status(200).json(sortedLocations);
    } catch (err) {
      next(err);
    }
  },

  async getDestinations(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      let dbPorts: { id: string; name: string; country: string }[] = [];
      try {
        dbPorts = await prisma.port.findMany({
          where: { destinationRoutes: { some: {} } },
          select: { id: true, name: true, country: true },
          orderBy: { name: 'asc' }
        });
      } catch (e) {}

      if (dbPorts.length === 0) {
        const distancesPath = path.join(DATASET_DIR, 'sailing_distances.csv');
        const specsPath = path.join(DATASET_DIR, 'port_specifications.csv');
        const distContent = fs.readFileSync(distancesPath, 'utf8');
        const specsContent = fs.readFileSync(specsPath, 'utf8');

        const destNames = new Set<string>();
        distContent.split('\n').slice(1).forEach(line => {
          const parts = line.split(',');
          if (parts.length >= 2 && parts[1].trim()) {
            destNames.add(parts[1].trim());
          }
        });

        const portCountryMap: Record<string, string> = {};
        const portIdMap: Record<string, string> = {};
        specsContent.split('\n').slice(1).forEach(line => {
          const parts = line.split(',');
          if (parts.length >= 2) {
            const name = parts[0].trim();
            const country = parts[1].trim();
            const id = name; // use name as id in fallback
            if (name && country) {
              portCountryMap[name] = country;
              portIdMap[name] = id;
            }
          }
        });

        for (const name of destNames) {
          if (portCountryMap[name]) {
            dbPorts.push({ id: portIdMap[name], name, country: portCountryMap[name] });
          }
        }
      }

      const locations: Record<string, { id: string; name: string }[]> = {};
      dbPorts.forEach(p => {
        if (!locations[p.country]) locations[p.country] = [];
        locations[p.country].push({ id: p.id, name: p.name });
      });

      const sortedLocations: Record<string, { id: string; name: string }[]> = {};
      Object.keys(locations).sort().forEach(country => {
        sortedLocations[country] = locations[country].sort((a, b) => a.name.localeCompare(b.name));
      });

      res.status(200).json(sortedLocations);
    } catch (err) {
      next(err);
    }
  },

  async getDistance(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const originPortId = req.query.originPortId as string;
      const destinationPortId = req.query.destinationPortId as string;

      if (!originPortId || !destinationPortId) {
        res.status(400).json({ error: 'originPortId and destinationPortId are required' });
        return;
      }

      try {
        const route = await prisma.route.findUnique({
          where: {
            originPortId_destinationPortId: {
              originPortId,
              destinationPortId
            }
          }
        });
        if (route) {
          res.status(200).json({ distanceNM: route.distanceNM });
          return;
        }
      } catch (e) {}

      // Fallback
      try {
        const csvPath = path.join(DATASET_DIR, 'sailing_distances.csv');
        const specPath = path.join(DATASET_DIR, 'port_specifications.csv');
        const distContent = fs.readFileSync(csvPath, 'utf8');
        const specContent = fs.readFileSync(specPath, 'utf8');

        // Since frontend might send ID, we need to map ID to name for CSV lookup if ID isn't name
        let originName = originPortId;
        let destName = destinationPortId;

        specContent.split('\n').slice(1).forEach(line => {
           const parts = line.split(',');
           if (parts.length >= 3) {
             const name = parts[0].trim();
             const id = parts[2].trim();
             if (id === originPortId) originName = name;
             if (id === destinationPortId) destName = name;
           }
        });

        const lines = distContent.split('\n').slice(1);
        for (const line of lines) {
          const parts = line.split(',');
          if (parts.length >= 3) {
            const o = parts[0].trim();
            const d = parts[1].trim();
            const dist = parseFloat(parts[2].trim());
            
            if (o === originName && d === destName) {
              res.status(200).json({ distanceNM: dist });
              return;
            }
          }
        }
        res.status(404).json({ error: 'GeoGuard does not currently have a supported sailing-distance record for this route.' });
      } catch (err) {
        res.status(500).json({ error: 'Failed to load distances from dataset' });
      }
    } catch (err) {
      next(err);
    }
  }
};
