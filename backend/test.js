import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const routes = await prisma.route.findMany({
    where: {
      originPortId: 'port-kalimantan',
      destinationPortId: 'port-paradip'
    }
  });
  console.log("ROUTES:", routes);

  const analysis = await prisma.analysis.findMany({});
  console.log("ANALYSIS:", analysis.length);
}
main().catch(console.error).finally(() => prisma.$disconnect());
