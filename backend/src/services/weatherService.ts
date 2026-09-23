import axios from 'axios';
import { prisma } from '../config/db.js';

const PORT_COORDS: Record<string, { lat: number, lon: number }> = {
  "Port Hedland": { lat: -20.31, lon: 118.57 },
  "Newcastle": { lat: -32.92, lon: 151.78 },
  "Gladstone": { lat: -23.83, lon: 151.25 },
  "Baltimore": { lat: 39.26, lon: -76.58 },
  "Norfolk": { lat: 36.85, lon: -76.33 },
  "Nacala": { lat: -14.54, lon: 40.67 },
  "Beira": { lat: -19.82, lon: 34.83 },
  "Vostochny": { lat: 42.73, lon: 133.08 },
  "Murmansk": { lat: 68.97, lon: 33.06 },
  "Kalimantan": { lat: -3.66, lon: 114.44 },
  "Tanjung Bara": { lat: 0.53, lon: 117.65 },
  "Paradip": { lat: 20.26, lon: 86.67 },
  "Vizag": { lat: 17.69, lon: 83.28 },
  "Gangavaram": { lat: 17.62, lon: 83.23 },
  "Gopalpur": { lat: 19.30, lon: 84.97 },
  "Dhamra": { lat: 20.82, lon: 86.96 },
  "Sagar-Sandheads": { lat: 21.06, lon: 88.02 },
  "Haldia": { lat: 22.02, lon: 88.06 }
};

export const weatherService = {
  async getRouteWeather(routeId: string, originName: string, destName: string, distanceNM: number) {
    try {
      // 1. Check cache first
      const cached = await prisma.weatherCache.findUnique({
        where: { routeId }
      });

      const now = new Date();
      if (cached) {
        if (cached.expiresAt > now) {
          return {
            status: 'SUCCESS',
            exposureLevel: cached.exposureLevel,
            freshness: 'CURRENT',
            maxWaveM: cached.waveHeightM,
            maxSwellM: cached.maxSwellM,
            maxCurrentKt: cached.maxCurrentKt,
            worstSegment: cached.worstSegment,
            affectedSegments: cached.affectedSegments as string[] | null,
            riskScore: cached.riskScore,
            retrievedAt: cached.retrievedAt
          };
        } else if (cached.expiresAt > new Date(now.getTime() - 24 * 60 * 60 * 1000)) {
          return {
            status: 'SUCCESS',
            exposureLevel: cached.exposureLevel,
            freshness: 'STALE',
            maxWaveM: cached.waveHeightM,
            maxSwellM: cached.maxSwellM,
            maxCurrentKt: cached.maxCurrentKt,
            worstSegment: cached.worstSegment,
            affectedSegments: cached.affectedSegments as string[] | null,
            riskScore: cached.riskScore,
            retrievedAt: cached.retrievedAt,
            message: `Using cached marine forecast from ${cached.retrievedAt.toISOString()}.`
          };
        }
      }

      // 2. Generate Corridor Points
      const originCoord = PORT_COORDS[originName];
      const destCoord = PORT_COORDS[destName];
      
      if (!originCoord || !destCoord) {
        throw new Error('Coordinates not found for ports');
      }

      const pointCount = 6;
      const corridorPoints = [];
      const voyageHours = distanceNM / 13.0; // 13 knots

      for (let i = 0; i < pointCount; i++) {
        const progress = i / (pointCount - 1);
        const lat = originCoord.lat + (destCoord.lat - originCoord.lat) * progress;
        const lon = originCoord.lon + (destCoord.lon - originCoord.lon) * progress;
        
        const etaHours = voyageHours * progress;
        const expectedTime = new Date(now.getTime() + etaHours * 60 * 60 * 1000);
        
        corridorPoints.push({
          lat: lat.toFixed(4),
          lon: lon.toFixed(4),
          progress,
          etaHours,
          expectedTime,
          segmentName: `Segment ${i + 1} (${Math.round(progress * 100)}%)`
        });
      }

      const lats = corridorPoints.map(p => p.lat).join(',');
      const lons = corridorPoints.map(p => p.lon).join(',');

      // 3. Fetch from Open-Meteo
      const url = `https://marine-api.open-meteo.com/v1/marine?latitude=${lats}&longitude=${lons}&hourly=wave_height,wave_direction,wave_period,swell_wave_height,wind_wave_height,ocean_current_velocity`;
      
      const res = await axios.get(url, { timeout: 10000 });
      const data = res.data;

      // Ensure data is array (multiple locations return array)
      const locationResults = Array.isArray(data) ? data : [data];

      let maxWaveM = 0;
      let maxSwellM = 0;
      let maxCurrentKt = 0;
      let worstSegment = '';
      let worstExposureLevel = 'LOW';
      let riskScore = 0;
      const affectedSegments: string[] = [];

      for (let i = 0; i < corridorPoints.length; i++) {
        const point = corridorPoints[i];
        const locationData = locationResults[i];
        
        if (!locationData || !locationData.hourly || !locationData.hourly.time) continue;

        // Find closest hour
        const expectedIso = point.expectedTime.toISOString();
        let closestIndex = 0;
        let minDiff = Infinity;

        for (let j = 0; j < locationData.hourly.time.length; j++) {
          const forecastTime = new Date(locationData.hourly.time[j]);
          const diff = Math.abs(forecastTime.getTime() - point.expectedTime.getTime());
          if (diff < minDiff) {
            minDiff = diff;
            closestIndex = j;
          }
        }

        const waveHeight = locationData.hourly.wave_height?.[closestIndex] || 0;
        const swellHeight = locationData.hourly.swell_wave_height?.[closestIndex] || 0;
        
        // Convert current from m/s to knots if available (1 m/s = 1.94384 knots)
        const currentMs = locationData.hourly.ocean_current_velocity?.[closestIndex] || 0;
        const currentKt = currentMs * 1.94384;

        if (waveHeight > maxWaveM) {
          maxWaveM = waveHeight;
          worstSegment = point.segmentName;
        }

        if (swellHeight > maxSwellM) maxSwellM = swellHeight;
        if (currentKt > maxCurrentKt) maxCurrentKt = currentKt;

        let segmentExposure = 'LOW';
        let segmentScore = 0;
        if (waveHeight > 6.0) { segmentExposure = 'SEVERE'; segmentScore = 10; }
        else if (waveHeight > 4.0) { segmentExposure = 'HIGH'; segmentScore = 7; }
        else if (waveHeight > 2.5) { segmentExposure = 'MODERATE'; segmentScore = 4; }
        else { segmentScore = 1; }

        if (segmentScore > riskScore) {
          riskScore = segmentScore;
          worstExposureLevel = segmentExposure;
          if (!worstSegment) worstSegment = point.segmentName;
        }

        if (segmentExposure !== 'LOW') {
          affectedSegments.push(`${point.segmentName} (${segmentExposure})`);
        }
      }

      // Format maxCurrentKt carefully
      maxCurrentKt = Number(maxCurrentKt.toFixed(2));

      const expiresAt = new Date(now.getTime() + 6 * 60 * 60 * 1000);

      await prisma.weatherCache.upsert({
        where: { routeId },
        update: {
          exposureLevel: worstExposureLevel,
          waveHeightM: maxWaveM,
          maxSwellM,
          maxCurrentKt,
          worstSegment,
          affectedSegments,
          riskScore,
          retrievedAt: now,
          expiresAt,
          rawPayload: res.data
        },
        create: {
          routeId,
          exposureLevel: worstExposureLevel,
          waveHeightM: maxWaveM,
          maxSwellM,
          maxCurrentKt,
          worstSegment,
          affectedSegments,
          riskScore,
          forecastTime: now,
          retrievedAt: now,
          expiresAt,
          rawPayload: res.data
        }
      });

      return {
        status: 'SUCCESS',
        exposureLevel: worstExposureLevel,
        freshness: 'CURRENT',
        maxWaveM,
        maxSwellM,
        maxCurrentKt,
        worstSegment,
        affectedSegments,
        riskScore,
        retrievedAt: now
      };

    } catch (err: any) {
      console.error('Weather API Error:', err.message);
      return {
        status: 'UNAVAILABLE',
        exposureLevel: 'UNAVAILABLE',
        freshness: 'UNAVAILABLE',
        message: 'Weather data is currently unavailable. The baseline route remains unchanged and the core analysis is still valid.'
      };
    }
  }
};
