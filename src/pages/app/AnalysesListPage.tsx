import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { analysisApi } from '../../api/services';
import { StatusBadge } from '../../components/common/StatusBadge';
import { LoadingSkeleton, EmptyState } from '../../components/common/StateViews';
import { PlusCircle, Search, ArrowRight, Ship, Filter } from 'lucide-react';

export const AnalysesListPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [cargoFilter, setCargoFilter] = useState('ALL');

  const { data: analyses, isLoading } = useQuery({
    queryKey: ['all-analyses'],
    queryFn: analysisApi.listAnalyses
  });

  const filteredAnalyses = (analyses || []).filter((item) => {
    if (!item) return false;
    const origin = item.input?.route?.originPortName || '';
    const dest = item.input?.route?.destinationPortName || '';
    const cargo =
      item.input?.cargo?.cargoType ||
      (item.input?.cargo as any)?.commodity ||
      '';
    const id = item.id || '';
    const term = (searchTerm || '').toLowerCase();

    const routeMatch =
      origin.toLowerCase().includes(term) ||
      dest.toLowerCase().includes(term) ||
      cargo.toLowerCase().includes(term) ||
      id.toLowerCase().includes(term);

    const cargoMatch =
      cargoFilter === 'ALL' ||
      cargo.toLowerCase().includes(cargoFilter.toLowerCase());

    return routeMatch && cargoMatch;
  });

  return (
    <div className="max-w-6xl mx-auto space-y-5 animate-fade-up">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4 pb-3 border-b border-slate-200">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Chartering Analyses Directory
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Historical decision reports, contract allocations, and evaluated routes
          </p>
        </div>
        <Link
          to="/app/analysis/new"
          className="cta-primary inline-flex items-center gap-1.5 px-3.5 py-2 bg-slate-900 text-white rounded text-xs font-semibold hover:bg-slate-800 transition-colors shadow-2xs"
        >
          <PlusCircle className="w-3.5 h-3.5" />
          <span>New Analysis</span>
        </Link>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white border border-slate-200 rounded-md p-3 shadow-2xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex-1 min-w-[200px] relative">
          <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-slate-400">
            <Search className="w-3.5 h-3.5" />
          </div>
          <input
            id="analyses-search"
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search port, commodity, or analysis ID..."
            className="w-full pl-8 pr-3 py-1.5 text-xs border border-slate-300 rounded focus:border-slate-800 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <select
            value={cargoFilter}
            onChange={(e) => setCargoFilter(e.target.value)}
            className="px-2.5 py-1.5 text-xs border border-slate-300 rounded bg-white focus:outline-none"
          >
            <option value="ALL">All Commodities</option>
            <option value="Coal">Coal</option>
            <option value="Ore">Iron Ore</option>
            <option value="Bauxite">Bauxite</option>
          </select>
        </div>

        {(searchTerm || cargoFilter !== 'ALL') && (
          <div className="text-[11px] text-slate-500">
            {filteredAnalyses.length} result{filteredAnalyses.length !== 1 ? 's' : ''}
          </div>
        )}
      </div>

      {/* Table */}
      <div className="bg-white border border-slate-200 rounded-md shadow-2xs overflow-hidden">
        {isLoading ? (
          <div className="p-6">
            <LoadingSkeleton rows={5} />
          </div>
        ) : filteredAnalyses.length === 0 ? (
          <EmptyState
            title="No matching analyses found"
            description="Try adjusting your search criteria or create a new chartering analysis."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-slate-500 font-semibold uppercase text-[10px] tracking-wider">
                  <th className="py-3 px-4">ID & Date</th>
                  <th className="py-3 px-4">Trade Route</th>
                  <th className="py-3 px-4">Cargo & Volume</th>
                  <th className="py-3 px-4">Vessel Class</th>
                  <th className="py-3 px-4">Recommended Strategy</th>
                  <th className="py-3 px-4 text-right">Delivered Cost</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredAnalyses.map((item) => {
                  const dateStr = item.createdAt
                    ? new Date(item.createdAt).toLocaleDateString('en-GB', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric'
                      })
                    : 'Recent';

                  const distance = item.input?.route?.distanceNM ?? 2850;
                  const originPort = item.input?.route?.originPortName || 'Load Terminal';
                  const destPort = item.input?.route?.destinationPortName || 'Discharge Terminal';
                  const cargoType =
                    item.input?.cargo?.cargoType ||
                    (item.input?.cargo as any)?.commodity ||
                    'Dry Bulk';
                  const quantityMT = item.input?.cargo?.quantityMT ?? 50000;
                  const shipmentsCount = item.input?.cargo?.shipmentsCount ?? 1;
                  const vessel = item.recommendation?.recommendedVessel || 'Panamax';
                  const mix = item.recommendation?.mixAllocation || 'Hybrid Portfolio';
                  const strategy = item.recommendation?.strategyName || 'Optimal Mix';
                  const costPerTon = item.recommendation?.expectedDeliveredCostPerTon ?? 19.1;
                  const savingsPerTon = item.recommendation?.expectedSavingsVsSpotPerTon ?? 1.17;

                  return (
                    <tr key={item.id} className="hover:bg-slate-50/70 transition-colors group">
                      <td className="py-3.5 px-4">
                        <div className="font-mono font-semibold text-slate-900 text-[11px]">{item.id}</div>
                        <div className="text-[10px] text-slate-400 mt-0.5">{dateStr}</div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-900">
                          {originPort} → {destPort}
                        </div>
                        <div className="text-[10px] text-slate-500 tabular-nums mt-0.5">
                          {distance.toLocaleString()} NM
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-medium text-slate-900">{cargoType}</div>
                        <div className="text-[10px] text-slate-500 tabular-nums mt-0.5">
                          {quantityMT.toLocaleString()} MT · {shipmentsCount} {shipmentsCount === 1 ? 'shipment' : 'shipments'}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-slate-700">
                        <span className="inline-flex items-center gap-1 font-medium">
                          <Ship className="w-3.5 h-3.5 text-slate-400" />
                          {vessel}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-blue-900">{mix}</div>
                        <div className="text-[10px] text-slate-500 mt-0.5">{strategy}</div>
                      </td>
                      <td className="py-3.5 px-4 text-right tabular-nums">
                        <div className="font-bold text-slate-900">${costPerTon.toFixed(2)}/t</div>
                        <div className="text-[10px] text-emerald-700 font-medium mt-0.5">
                          Save ${savingsPerTon.toFixed(2)}/t
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <StatusBadge status={item.status || 'Completed'} />
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <Link
                          to={`/app/analysis/${item.id}`}
                          className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded font-semibold text-xs inline-flex items-center gap-1 transition-colors"
                        >
                          <span>Open</span>
                          <ArrowRight className="w-3 h-3" />
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
