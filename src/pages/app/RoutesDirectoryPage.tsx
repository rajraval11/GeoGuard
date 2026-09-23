import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { vesselPortApi } from '../../api/services';
import { StatusBadge } from '../../components/common/StatusBadge';
import { LoadingSkeleton } from '../../components/common/StateViews';
import { Anchor, Search, Ship, Info } from 'lucide-react';

export const RoutesDirectoryPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const { data: ports, isLoading: isPortsLoading } = useQuery({
    queryKey: ['ports-directory'],
    queryFn: vesselPortApi.getPorts
  });

  const { data: vessels, isLoading: isVesselsLoading } = useQuery({
    queryKey: ['vessels-directory'],
    queryFn: vesselPortApi.getVessels
  });

  const filteredPorts = (ports || []).filter(
    (p) =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.country.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const originPorts = filteredPorts.filter(p => p.country !== 'India');
  const destPorts = filteredPorts.filter(p => p.country === 'India');

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-fade-up">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4 pb-3 border-b border-slate-200">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Routes & Port Constraints
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Supported origin and destination terminals with engineering baselines for draft, LOA, and congestion
          </p>
        </div>
        <div className="relative w-64">
          <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-slate-400">
            <Search className="w-3.5 h-3.5" />
          </div>
          <input
            id="port-search"
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search port or country..."
            className="w-full pl-8 pr-3 py-1.5 text-xs bg-white border border-slate-300 rounded focus:border-slate-800 focus:outline-none"
          />
        </div>
      </div>

      {/* Scope notice */}
      <div className="flex items-start gap-2.5 p-3.5 bg-slate-100 border border-slate-200 rounded text-xs text-slate-600">
        <Info className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
        <div>
          <span className="font-semibold text-slate-800">GeoGuard Scope:</span>{' '}
          11 origin ports across 5 countries (Australia, United States, Mozambique, Russia, Indonesia) → 7 Indian destination ports. Total of 77 validated baseline routes.
        </div>
      </div>

      {/* Origin Ports */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-slate-400">
          <Anchor className="w-3.5 h-3.5" />
          <span>Origin Ports (Load Terminals)</span>
          {!isPortsLoading && <span className="font-mono text-[10px] text-slate-300">· {originPorts.length} ports</span>}
        </div>

        <div className="bg-white border border-slate-200 rounded-md shadow-2xs overflow-hidden">
          {isPortsLoading ? (
            <div className="p-5">
              <LoadingSkeleton rows={6} />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-slate-500 font-semibold uppercase text-[10px] tracking-wider">
                    <th className="py-3 px-4">Port Name</th>
                    <th className="py-3 px-4">Country & Code</th>
                    <th className="py-3 px-4 text-right">Max Draft</th>
                    <th className="py-3 px-4 text-right">Max LOA</th>
                    <th className="py-3 px-4 text-right">Max Beam</th>
                    <th className="py-3 px-4 text-center">Tidal Window</th>
                    <th className="py-3 px-4 text-right">Avg Queue</th>
                    <th className="py-3 px-4 text-center">Congestion</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {originPorts.map((port) => (
                    <tr key={port.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-4 font-semibold text-slate-900">{port.name}</td>
                      <td className="py-3 px-4 text-slate-600">
                        <span>{port.country}</span>{' '}
                        <span className="font-mono text-[10px] text-slate-400">({port.code})</span>
                      </td>
                      <td className="py-3 px-4 text-right tabular-nums font-bold text-slate-900">
                        {port.maxDraftMeters.toFixed(1)}m
                      </td>
                      <td className="py-3 px-4 text-right tabular-nums text-slate-600">
                        {port.maxLoaMeters}m
                      </td>
                      <td className="py-3 px-4 text-right tabular-nums text-slate-600">
                        {port.maxBeamMeters}m
                      </td>
                      <td className="py-3 px-4 text-center">
                        {port.tideRestriction ? (
                          <span className="text-[10px] text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 font-semibold">
                            Required
                          </span>
                        ) : (
                          <span className="text-[10px] text-slate-400">All-Tide</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right tabular-nums text-slate-700 font-medium">
                        {port.averageWaitingHours} hrs
                      </td>
                      <td className="py-3 px-4 text-center">
                        <StatusBadge status={port.congestionIndex} />
                      </td>
                    </tr>
                  ))}
                  {originPorts.length === 0 && !isPortsLoading && (
                    <tr>
                      <td colSpan={8} className="py-8 text-center text-xs text-slate-400">
                        No matching origin ports found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Destination Ports (India) */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-slate-400">
          <Anchor className="w-3.5 h-3.5" />
          <span>Destination Ports (India — Discharge Terminals)</span>
          {!isPortsLoading && <span className="font-mono text-[10px] text-slate-300">· {destPorts.length} ports</span>}
        </div>

        <div className="bg-white border border-slate-200 rounded-md shadow-2xs overflow-hidden">
          {isPortsLoading ? (
            <div className="p-5">
              <LoadingSkeleton rows={4} />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-slate-500 font-semibold uppercase text-[10px] tracking-wider">
                    <th className="py-3 px-4">Port Name</th>
                    <th className="py-3 px-4">Country & Code</th>
                    <th className="py-3 px-4 text-right">Max Draft</th>
                    <th className="py-3 px-4 text-right">Max LOA</th>
                    <th className="py-3 px-4 text-right">Max Beam</th>
                    <th className="py-3 px-4 text-center">Tidal Window</th>
                    <th className="py-3 px-4 text-right">Avg Queue</th>
                    <th className="py-3 px-4 text-center">Congestion</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {destPorts.map((port) => (
                    <tr key={port.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-4 font-semibold text-slate-900">{port.name}</td>
                      <td className="py-3 px-4 text-slate-600">
                        <span>{port.country}</span>{' '}
                        <span className="font-mono text-[10px] text-slate-400">({port.code})</span>
                      </td>
                      <td className="py-3 px-4 text-right tabular-nums font-bold text-slate-900">
                        {port.maxDraftMeters.toFixed(1)}m
                      </td>
                      <td className="py-3 px-4 text-right tabular-nums text-slate-600">
                        {port.maxLoaMeters}m
                      </td>
                      <td className="py-3 px-4 text-right tabular-nums text-slate-600">
                        {port.maxBeamMeters}m
                      </td>
                      <td className="py-3 px-4 text-center">
                        {port.tideRestriction ? (
                          <span className="text-[10px] text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 font-semibold">
                            Required
                          </span>
                        ) : (
                          <span className="text-[10px] text-slate-400">All-Tide</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right tabular-nums text-slate-700 font-medium">
                        {port.averageWaitingHours} hrs
                      </td>
                      <td className="py-3 px-4 text-center">
                        <StatusBadge status={port.congestionIndex} />
                      </td>
                    </tr>
                  ))}
                  {destPorts.length === 0 && !isPortsLoading && (
                    <tr>
                      <td colSpan={8} className="py-8 text-center text-xs text-slate-400">
                        No matching destination ports found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Vessel Class Reference */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-slate-400">
          <Ship className="w-3.5 h-3.5" />
          <span>Vessel Class Reference Dimensions</span>
        </div>

        <div className="bg-white border border-slate-200 rounded-md shadow-2xs overflow-hidden">
          {isVesselsLoading ? (
            <div className="p-5">
              <LoadingSkeleton rows={4} />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-slate-500 font-semibold uppercase text-[10px] tracking-wider">
                    <th className="py-3 px-4">Class</th>
                    <th className="py-3 px-4">DWT Range</th>
                    <th className="py-3 px-4 text-right">Typical Draft</th>
                    <th className="py-3 px-4 text-right">Typical LOA</th>
                    <th className="py-3 px-4 text-right">Typical Beam</th>
                    <th className="py-3 px-4 text-right">Fuel Consumption</th>
                    <th className="py-3 px-4">Primary Cargoes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {(vessels || []).map((v) => (
                    <tr key={v.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-4 font-semibold text-slate-900">{v.vesselClass}</td>
                      <td className="py-3 px-4 text-slate-500 font-mono text-[11px] tabular-nums">
                        {v.dwtMin.toLocaleString()} – {v.dwtMax.toLocaleString()} DWT
                      </td>
                      <td className="py-3 px-4 text-right tabular-nums font-bold text-slate-900">
                        {v.typicalDraftM.toFixed(1)}m
                      </td>
                      <td className="py-3 px-4 text-right tabular-nums text-slate-600">
                        {v.typicalLoaM}m
                      </td>
                      <td className="py-3 px-4 text-right tabular-nums text-slate-600">
                        {v.typicalBeamM.toFixed(1)}m
                      </td>
                      <td className="py-3 px-4 text-right tabular-nums text-slate-700">
                        {v.dailyFuelConsumptionMT} MT/day
                      </td>
                      <td className="py-3 px-4 text-slate-500 text-[11px]">
                        {v.suitableCargoes.join(', ')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
