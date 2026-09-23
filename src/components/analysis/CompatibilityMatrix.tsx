import type { PortVesselFeasibility } from '../../types';
import { Check, AlertTriangle, X } from 'lucide-react';

interface CompatibilityMatrixProps {
  feasibility: PortVesselFeasibility[];
  originName: string;
  destinationName: string;
}

export const CompatibilityMatrix: React.FC<CompatibilityMatrixProps> = ({
  feasibility,
  originName,
  destinationName
}) => {
  const renderStatus = (status: 'Compatible' | 'Restricted' | 'Incompatible', reason?: string) => {
    if (status === 'Compatible') {
      return (
        <div className="flex items-center gap-1.5 text-emerald-700">
          <span className="p-0.5 bg-emerald-100 rounded-full">
            <Check className="w-3 h-3 text-emerald-700 stroke-[2.5]" />
          </span>
          <span className="font-medium text-xs">Compatible</span>
        </div>
      );
    }
    if (status === 'Restricted') {
      return (
        <div>
          <div className="flex items-center gap-1.5 text-amber-700">
            <span className="p-0.5 bg-amber-100 rounded-full">
              <AlertTriangle className="w-3 h-3 text-amber-700 stroke-[2.5]" />
            </span>
            <span className="font-medium text-xs">Restricted</span>
          </div>
          {reason && <p className="text-[11px] text-slate-500 mt-0.5 leading-tight">{reason}</p>}
        </div>
      );
    }
    return (
      <div>
        <div className="flex items-center gap-1.5 text-rose-700">
          <span className="p-0.5 bg-rose-100 rounded-full">
            <X className="w-3 h-3 text-rose-700 stroke-[2.5]" />
          </span>
          <span className="font-medium text-xs">Incompatible</span>
        </div>
        {reason && <p className="text-[11px] text-slate-500 mt-0.5 leading-tight">{reason}</p>}
      </div>
    );
  };

  return (
    <div className="bg-white border border-slate-200 rounded-md p-5 shadow-xs">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div>
          <h3 className="text-sm font-semibold text-slate-900">Vessel & Port Constraints Matrix</h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Two-sided engineering feasibility check: Draft, LOA, Beam, and tidal berths for {originName} → {destinationName}
          </p>
        </div>
      </div>

      <div className="overflow-x-auto mt-3">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50/75 text-slate-600 font-semibold uppercase text-[11px] tracking-wider">
              <th className="py-2.5 px-3">Vessel Class</th>
              <th className="py-2.5 px-3">Max Draft</th>
              <th className="py-2.5 px-3">Max LOA</th>
              <th className="py-2.5 px-3">Beam</th>
              <th className="py-2.5 px-3">Origin ({originName})</th>
              <th className="py-2.5 px-3">Destination ({destinationName})</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {(feasibility || []).length === 0 ? (
              <tr>
                <td colSpan={6} className="py-6 text-center text-xs text-slate-500">
                  Port and vessel compatibility matrix data unavailable
                </td>
              </tr>
            ) : (
              (feasibility || []).map((item) => {
                const draft =
                  item.draftMeters != null
                    ? Number(item.draftMeters).toFixed(1)
                    : '14.0';
                const loa =
                  item.loaMeters != null
                    ? Number(item.loaMeters).toFixed(1)
                    : '225.0';
                const beam =
                  item.beamMeters != null
                    ? Number(item.beamMeters).toFixed(1)
                    : '32.0';

                return (
                  <tr key={item.vesselClass} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-2.5 px-3 font-semibold text-slate-900">
                      {item.vesselClass}
                    </td>
                    <td className="py-2.5 px-3 tabular-nums text-slate-600">
                      {draft}m
                    </td>
                    <td className="py-2.5 px-3 tabular-nums text-slate-600">
                      {loa}m
                    </td>
                    <td className="py-2.5 px-3 tabular-nums text-slate-600">
                      {beam}m
                    </td>
                    <td className="py-2.5 px-3">
                      {renderStatus(item.originStatus, item.originReason)}
                    </td>
                    <td className="py-2.5 px-3">
                      {renderStatus(item.destinationStatus, item.destinationReason)}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
