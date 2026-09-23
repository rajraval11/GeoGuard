export interface VoyageCalculationParams {
  freightRatePerTon: number;
  distanceNM: number;
  cargoQuantityMT: number;
  vesselClass: string;
  dailyFuelMT?: number;
  bunkerPricePerMT?: number;
  waitingHours?: number;
  needsLightering?: boolean;
}

export const voyageCostService = {
  calculateBreakdown(params: VoyageCalculationParams) {
    const {
      freightRatePerTon,
      distanceNM,
      cargoQuantityMT,
      vesselClass,
      dailyFuelMT = 28.5,
      bunkerPricePerMT = 620.0,
      waitingHours = 24.0,
      needsLightering = false
    } = params;

    // Steaming days at economic transit speed (12.5 knots)
    const steamingDays = distanceNM / (12.5 * 24);

    // Bunker cost per ton
    const totalBunkerMT = steamingDays * dailyFuelMT;
    const totalBunkerCost = totalBunkerMT * bunkerPricePerMT;
    const bunkerCostPerTon = Number((totalBunkerCost / cargoQuantityMT).toFixed(2));

    // Port charges & dues
    const portChargesPerTon = Number((vesselClass === 'Capesize' ? 1.55 : 1.25).toFixed(2));

    // Waiting time cost based on daily charter hire rate (~$16,000/day)
    const dailyHire = vesselClass === 'Capesize' ? 24000 : 16000;
    const waitingCost = (waitingHours / 24) * dailyHire;
    const waitingCostPerTon = Number((waitingCost / cargoQuantityMT).toFixed(2));

    // Demurrage & weather laytime risk buffer
    const demurrageRiskPerTon = 0.45;

    // Ballast repositioning amortization
    const deadheadingPerTon = 0.45;

    // Lightering cost (only if vessel draft exceeds discharge port limit)
    const lighteringPerTon = needsLightering ? 2.50 : 0.0;

    const totalDelivered = Number((
      freightRatePerTon +
      bunkerCostPerTon +
      portChargesPerTon +
      waitingCostPerTon +
      demurrageRiskPerTon +
      deadheadingPerTon +
      lighteringPerTon
    ).toFixed(2));

    return {
      freightPerTon: Number(freightRatePerTon.toFixed(2)),
      bunkerCostPerTon,
      portChargesPerTon,
      waitingCostPerTon,
      demurrageRiskPerTon,
      deadheadingRepositioningPerTon: deadheadingPerTon,
      lighteringPerTon,
      totalDeliveredCostPerTon: totalDelivered
    };
  }
};
