import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding GeoGuard PostgreSQL database...');

  // 1. Organizations
  const adminOrg = await prisma.organization.upsert({
    where: { id: 'org-admin' },
    update: {},
    create: {
      id: 'org-admin',
      name: 'GeoGuard Systems',
      tier: 'ENTERPRISE',
      defaultCurrency: 'USD',
      defaultRiskTolerance: 'CONSERVATIVE'
    }
  });

  const pacificOrg = await prisma.organization.upsert({
    where: { id: 'org-pacific' },
    update: {},
    create: {
      id: 'org-pacific',
      name: 'Pacific Bulk Carriers Ltd.',
      tier: 'COMMERCIAL',
      defaultCurrency: 'USD',
      defaultRiskTolerance: 'MODERATE'
    }
  });

  const bharatOrg = await prisma.organization.upsert({
    where: { id: 'org-bharat' },
    update: {},
    create: {
      id: 'org-bharat',
      name: 'Bharat Power Imports',
      tier: 'COMMERCIAL',
      defaultCurrency: 'USD',
      defaultRiskTolerance: 'CONSERVATIVE'
    }
  });

  const nordicOrg = await prisma.organization.upsert({
    where: { id: 'org-nordic' },
    update: {},
    create: {
      id: 'org-nordic',
      name: 'Nordic Commodity Trading',
      tier: 'COMMERCIAL',
      defaultCurrency: 'USD',
      defaultRiskTolerance: 'MODERATE'
    }
  });

  // 2. Users (Hashed Passwords)
  const adminHash = await bcrypt.hash('AdminPass2026!', 10);
  const userHash = await bcrypt.hash('PacificPass2026!', 10);

  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@geoguard.io' },
    update: {
      role: 'ADMIN',
      status: 'ACTIVE'
    },
    create: {
      id: 'usr-admin',
      name: 'Elena Rostova',
      email: 'admin@geoguard.io',
      passwordHash: adminHash,
      role: 'ADMIN',
      status: 'ACTIVE',
      organizationId: adminOrg.id
    }
  });

  const chartererUser = await prisma.user.upsert({
    where: { email: 'm.vance@pacificbulk.com' },
    update: {
      role: 'CHARTERER',
      status: 'ACTIVE'
    },
    create: {
      id: 'usr-001',
      name: 'Marcus Vance',
      email: 'm.vance@pacificbulk.com',
      passwordHash: userHash,
      role: 'CHARTERER',
      status: 'ACTIVE',
      organizationId: pacificOrg.id
    }
  });

  const analystUser = await prisma.user.upsert({
    where: { email: 'h.lindqvist@nordictrade.se' },
    update: {
      role: 'ANALYST',
      status: 'ACTIVE'
    },
    create: {
      id: 'usr-002',
      name: 'Henrik Lindqvist',
      email: 'h.lindqvist@nordictrade.se',
      passwordHash: userHash,
      role: 'ANALYST',
      status: 'ACTIVE',
      organizationId: nordicOrg.id
    }
  });

  // 3. Vessel Classes (The Four Original GeoGuard Classes)
  const vessels = [
    {
      id: 'vsl-01',
      name: 'Handysize',
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
      name: 'Supramax',
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
      name: 'Panamax',
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
      name: 'Capesize',
      dwtMin: 160000,
      dwtMax: 210000,
      typicalDraftM: 18.2,
      typicalLoaM: 292,
      typicalBeamM: 45.0,
      dailyFuelConsumptionMT: 48.0,
      suitableCargoes: ['Iron Ore', 'Coking Coal']
    }
  ];

  for (const v of vessels) {
    await prisma.vesselClass.upsert({
      where: { name: v.name },
      update: v,
      create: v
    });
  }

  // 4. Reference Bulk Ports and Routes from Dataset
  const fs = await import('fs');
  const path = await import('path');
  const url = await import('url');
  
  const __dirname = path.dirname(url.fileURLToPath(import.meta.url));
  const datasetDir = path.join(__dirname, '..', 'dataset_fixed');
  const portsCsv = fs.readFileSync(path.join(datasetDir, 'port_specifications.csv'), 'utf8');
  const routesCsv = fs.readFileSync(path.join(datasetDir, 'sailing_distances.csv'), 'utf8');

  const portLines = portsCsv.split('\n').slice(1).filter((l: string) => l.trim().length > 0);
  const ports = portLines.map((line: string) => {
    const parts = line.split(',');
    return {
      id: `port-${parts[0].trim().toLowerCase().replace(/[\s\(\)]+/g, '-')}`,
      name: parts[0].trim(),
      country: parts[1].trim(),
      code: parts[0].trim().toUpperCase().substring(0, 10).replace(/[^A-Z]/g, ''),
      maxDraftMeters: parseFloat(parts[3]) || 15.0,
      maxLoaMeters: parseFloat(parts[4]) || 300.0,
      maxBeamMeters: parseFloat(parts[5]) || 45.0,
      tideRestriction: false,
      averageWaitingHours: 12.0,
      congestionIndex: 'Moderate'
    };
  });

  for (const p of ports) {
    await prisma.port.upsert({
      where: { code: p.code },
      update: p,
      create: p
    });
  }

  const routeLines = routesCsv.split('\n').slice(1).filter((l: string) => l.trim().length > 0);
  let routeCount = 0;
  for (const line of routeLines) {
    const parts = line.split(',');
    const originName = parts[0].trim();
    const destName = parts[1].trim();
    const distanceNM = parseFloat(parts[2]);
    const note = parts[4]?.trim() || "None";
    
    const originPort = ports.find((p: any) => p.name === originName);
    const destPort = ports.find((p: any) => p.name === destName);
    
    if (originPort && destPort && distanceNM) {
      await prisma.route.upsert({
        where: {
          originPortId_destinationPortId: {
            originPortId: originPort.id,
            destinationPortId: destPort.id
          }
        },
        update: { distanceNM, canalTransit: note },
        create: {
          id: `rte-${originPort.id}-${destPort.id}`,
          originPortId: originPort.id,
          destinationPortId: destPort.id,
          distanceNM,
          canalTransit: note
        }
      });
      routeCount++;
    }
  }

  // 5. DataHealth Feeds
  const feeds = [
    {
      id: 'dh-01',
      sourceName: 'Baltic Exchange Indices (BPI, BSI, BCI)',
      status: 'Healthy',
      recordsCount: 124500,
      frequency: 'Hourly (API)'
    },
    {
      id: 'dh-02',
      sourceName: 'Platts Bunker Singapore & Fujairah (VLSFO, LSMGO)',
      status: 'Healthy',
      recordsCount: 38200,
      frequency: 'Twice Daily'
    },
    {
      id: 'dh-03',
      sourceName: 'AIS Satellite Tonnage & Open Fleet Positioning',
      status: 'Healthy',
      recordsCount: 841200,
      frequency: 'Real-time (Streaming)'
    },
    {
      id: 'dh-04',
      sourceName: 'Port Terminal Authority Lineup & Congestion Logs',
      status: 'Healthy',
      recordsCount: 19400,
      frequency: 'Hourly'
    }
  ];

  for (const f of feeds) {
    await prisma.dataHealth.upsert({
      where: { id: f.id },
      update: f,
      create: f
    });
  }

  console.log('Seeding completed successfully:');
  console.log(`- Admin User: ${adminUser.email} (Password: AdminPass2026!)`);
  console.log(`- Charterer User: ${chartererUser.email} (Password: PacificPass2026!)`);
  console.log(`- Analyst User: ${analystUser.email} (Password: PacificPass2026!)`);
  console.log(`- Vessels: ${vessels.length} classes seeded`);
  console.log(`- Ports: ${ports.length} ports seeded`);
  console.log(`- Routes: ${routeCount} routes seeded`);
}

main()
  .catch((e) => {
    console.error('Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
