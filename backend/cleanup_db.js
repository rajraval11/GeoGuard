import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const validPortNames = [
  "Port Hedland", "Newcastle", "Gladstone",
  "Baltimore", "Norfolk",
  "Nacala", "Beira",
  "Vostochny", "Murmansk",
  "Kalimantan", "Tanjung Bara",
  "Paradip", "Vizag", "Gangavaram", "Gopalpur", "Dhamra", "Sagar-Sandheads", "Haldia"
];

async function cleanup() {
  const allPorts = await prisma.port.findMany();
  let deleted = 0;
  for (const port of allPorts) {
    if (!validPortNames.includes(port.name)) {
      console.log(`Deleting invalid port: ${port.name} (${port.country})`);
      // Since ports have relations to routes, delete routes involving this port first if any
      await prisma.route.deleteMany({
        where: {
          OR: [
            { originPortId: port.id },
            { destinationPortId: port.id }
          ]
        }
      });
      await prisma.port.delete({ where: { id: port.id } });
      deleted++;
    }
  }
  console.log(`Deleted ${deleted} legacy ports.`);
  await prisma.$disconnect();
}

cleanup().catch(e => {
  console.error(e);
  process.exit(1);
});
