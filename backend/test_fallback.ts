import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATASET_DIR = path.resolve(__dirname, '../../dataset_fixed');

async function run() {
  try {
    let dbPorts = [];
    if (dbPorts.length === 0) {
      const distancesPath = path.join(DATASET_DIR, 'sailing_distances.csv');
      const specsPath = path.join(DATASET_DIR, 'port_specifications.csv');
      console.log('Reading from', distancesPath, 'and', specsPath);
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
          const id = name; // using name as id since parts[2] is type
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

    const locations = {};
    dbPorts.forEach(p => {
      if (!locations[p.country]) locations[p.country] = [];
      locations[p.country].push({ id: p.id, name: p.name });
    });
    console.log(locations);
  } catch(e) {
    console.error(e);
  }
}
run();
