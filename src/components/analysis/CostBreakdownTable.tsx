import type { VoyageCostBreakdown } from '../../types';

interface CostBreakdownTableProps {
  breakdown: VoyageCostBreakdown;
  quantityMT: number;
}

export const CostBreakdownTable: React.FC<CostBreakdownTableProps> = ({ breakdown, quantityMT }) => {
  const bd = breakdown || ({} as any);
  const safeQty = quantityMT ?? 70000;
  const totalDelivered =
    bd.totalDeliveredCostPerTon != null
      ? Number(bd.totalDeliveredCostPerTon)
      : 19.10;

  const lineItems = [
    { label: 'Base Ocean Freight', costPerTon: Number(bd.freightPerTon ?? 14.20), note: 'Time-charter equivalent baseline' },
    { label: 'Bunker Consumption (VLSFO / LSMGO)', costPerTon: Number(bd.bunkerCostPerTon ?? 2.41), note: 'Speed-optimized consumption at $622/MT' },
    { label: 'Port Disbursements (D/A)', costPerTon: Number(bd.portChargesPerTon ?? 1.25), note: 'Pilotage, tugs, berthage & wharfage' },
    { label: 'Estimated Waiting & Canal Tolls', costPerTon: Number(bd.waitingCostPerTon ?? 0.34), note: 'Congestion buffer & queue holding' },
    { label: 'Demurrage Risk Allowance', costPerTon: Number(bd.demurrageRiskPerTon ?? 0.45), note: 'Historical turnaround variance factor' },
    { label: 'Deadheading / Repositioning', costPerTon: Number(bd.deadheadingRepositioningPerTon ?? 0.45), note: 'Ballast leg adjustment' },
    { label: 'Lightering / Anchorage Transshipment', costPerTon: Number(bd.lighteringPerTon ?? 0), note: 'Draft reduction / barging (if applicable)' }
  ];

  return (
    <div className="bg-white border border-slate-200 rounded-md p-5 shadow-xs">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div>
          <h3 className="text-sm font-semibold text-slate-900">Auditable Voyage Cost Breakdown</h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Delivered landed cost per metric ton across ocean freight, fuel, port disbursements, and operational buffers
          </p>
        </div>
        <div className="text-xs font-mono text-slate-600 bg-slate-100 px-2 py-1 rounded">
          Shipment: {safeQty.toLocaleString()} MT
        </div>
      </div>

      <div className="overflow-x-auto mt-3">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50/75 text-slate-600 font-semibold uppercase text-[11px] tracking-wider">
              <th className="py-2.5 px-3">Cost Component</th>
              <th className="py-2.5 px-3">Accounting Note</th>
              <th className="py-2.5 px-3 text-right">Cost ($/MT)</th>
              <th className="py-2.5 px-3 text-right">Total Voyage Cost (USD)</th>
              <th className="py-2.5 px-3 text-right">Cost Share</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {lineItems.map((item) => {
              const totalLineCost = item.costPerTon * safeQty;
              const sharePercent = totalDelivered > 0
                ? (item.costPerTon / totalDelivered) * 100
                : 0;

              return (
                <tr key={item.label} className="hover:bg-slate-50/60 transition-colors">
                  <td className="py-2.5 px-3 font-medium text-slate-800">{item.label}</td>
                  <td className="py-2.5 px-3 text-slate-500">{item.note}</td>
                  <td className="py-2.5 px-3 text-right tabular-nums font-semibold text-slate-900">
                    ${item.costPerTon.toFixed(2)}
                  </td>
                  <td className="py-2.5 px-3 text-right tabular-nums text-slate-600">
                    ${totalLineCost.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                  </td>
                  <td className="py-2.5 px-3 text-right tabular-nums text-slate-500">
                    {sharePercent.toFixed(1)}%
                  </td>
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            <tr className="border-t-2 border-slate-300 bg-slate-100/70 font-bold text-slate-900 text-xs">
              <td className="py-3 px-3">Total Delivered Landed Cost</td>
              <td className="py-3 px-3 text-slate-500 font-normal">All-in landed cost into discharge silo</td>
              <td className="py-3 px-3 text-right tabular-nums text-blue-900 text-sm">
                ${totalDelivered.toFixed(2)} / MT
              </td>
              <td className="py-3 px-3 text-right tabular-nums text-slate-900 text-sm">
                ${(totalDelivered * safeQty).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
              </td>
              <td className="py-3 px-3 text-right">100.0%</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
};
