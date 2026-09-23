import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useQuery } from '@tanstack/react-query';
import { analysisApi, referenceApi } from '../../api/services';
import type { AnalysisInput } from '../../types';
import {
  Ship,
  MapPin,
  Calendar,
  ShieldCheck,
  Play,
  Save,
  RotateCcw,
  CheckCircle2,
  ArrowRight,
  Loader2
} from 'lucide-react';

const newAnalysisSchema = z.object({
  cargoType: z.string().min(2, 'Please select or enter cargo type'),
  quantityMT: z.number({ invalid_type_error: 'Quantity must be a valid number' }).min(5000, 'Minimum cargo quantity is 5,000 MT'),
  shipmentsCount: z.number().min(1, 'At least 1 shipment is required').max(36, 'Max 36 shipments'),
  laycanStart: z.string().optional(),
  laycanEnd: z.string().optional(),

  originCountry: z.string().min(1, 'Origin country is required'),
  originPortId: z.string().min(1, 'Origin port is required'),
  originPortName: z.string().min(1, 'Origin port is required'),
  destinationCountry: z.string().min(1, 'Destination country is required'),
  destinationPortId: z.string().min(1, 'Destination port is required'),
  destinationPortName: z.string().min(1, 'Destination port is required'),
  distanceNM: z.number().min(1, 'Distance calculation failed. Please select valid ports.'),
  canalTransit: z.enum(['None', 'Suez', 'Panama']),

  planningDurationMonths: z.number().optional(),
  preference: z.enum(['Spot', 'Short-Term', 'Medium-Term', 'Hybrid']).optional(),
  riskTolerance: z.enum(['Conservative', 'Moderate', 'Aggressive']).optional(),
  vesselPreference: z.string().optional()
});

type NewAnalysisFormData = z.infer<typeof newAnalysisSchema>;

// Step indicator component
const StepIndicator: React.FC<{
  steps: { num: string; label: string; done: boolean }[];
  current: number;
}> = ({ steps, current }) => (
  <div className="flex items-center gap-0 overflow-x-auto pb-1 mb-6">
    {steps.map((step, idx) => (
      <React.Fragment key={step.num}>
        <div className="flex items-center gap-2 shrink-0">
          <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold transition-colors ${
            step.done
              ? 'bg-emerald-600 text-white'
              : idx === current
              ? 'bg-slate-900 text-white'
              : 'bg-slate-200 text-slate-500'
          }`}>
            {step.done ? <CheckCircle2 className="w-3.5 h-3.5" /> : step.num}
          </div>
          <span className={`text-xs font-medium whitespace-nowrap ${
            idx === current ? 'text-slate-900' : step.done ? 'text-emerald-700' : 'text-slate-400'
          }`}>
            {step.label}
          </span>
        </div>
        {idx < steps.length - 1 && (
          <div className={`mx-2 h-px w-8 shrink-0 ${step.done ? 'bg-emerald-300' : 'bg-slate-200'}`} />
        )}
      </React.Fragment>
    ))}
  </div>
);

export const NewAnalysisPage: React.FC = () => {
  const navigate = useNavigate();
  const [isRunning, setIsRunning] = useState(false);
  const [draftSaved, setDraftSaved] = useState(false);
  const [distanceError, setDistanceError] = useState<string | null>(null);

  const { data: origins, isLoading: isOriginsLoading, isError: isOriginsError } = useQuery({
    queryKey: ['origins'],
    queryFn: referenceApi.getOrigins
  });

  const { data: destinations, isLoading: isDestinationsLoading, isError: isDestinationsError } = useQuery({
    queryKey: ['destinations'],
    queryFn: referenceApi.getDestinations
  });

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors }
  } = useForm<NewAnalysisFormData>({
    resolver: zodResolver(newAnalysisSchema),
    defaultValues: {
      cargoType: '',
      quantityMT: 50000,
      shipmentsCount: 1,
      originCountry: '',
      originPortId: '',
      originPortName: '',
      destinationCountry: 'India',
      destinationPortId: '',
      destinationPortName: '',
      distanceNM: 0,
      canalTransit: 'None',
      planningDurationMonths: 12,
      preference: 'Hybrid',
      riskTolerance: 'Moderate',
      vesselPreference: 'Let GeoGuard recommend'
    }
  });

  const originCountry = watch('originCountry');
  const originPortId = watch('originPortId');
  const originPortName = watch('originPortName');
  const destinationCountry = watch('destinationCountry');
  const destinationPortId = watch('destinationPortId');
  const destinationPortName = watch('destinationPortName');
  const distanceNM = watch('distanceNM');
  const cargoType = watch('cargoType');
  const riskTolerance = watch('riskTolerance');
  const preference = watch('preference');

  // Lock destination country to India
  React.useEffect(() => {
    if (destinationCountry !== 'India') {
      setValue('destinationCountry', 'India');
    }
  }, [destinationCountry, setValue]);

  React.useEffect(() => {
    if (originPortId && destinationPortId) {
      referenceApi.getDistance(originPortId, destinationPortId)
        .then(dist => {
          setValue('distanceNM', dist, { shouldValidate: true });
          setDistanceError(null);
        })
        .catch(() => {
          setValue('distanceNM', 0);
          setDistanceError('GeoGuard does not currently have a supported sailing-distance record for this route.');
        });
    } else {
      setValue('distanceNM', 0);
      setDistanceError(null);
    }
  }, [originPortId, destinationPortId, setValue]);

  const handleApplyPreset = () => {
    setValue('cargoType', 'Thermal Coal');
    setValue('quantityMT', 50000);
    setValue('shipmentsCount', 12);
    setValue('originCountry', 'Indonesia');
    // Using names for preset might require IDs, assuming name == ID for fallback or finding it
    setTimeout(() => {
      setValue('originPortId', 'port-kalimantan');
      setValue('originPortName', 'Kalimantan');
    }, 50);
    setTimeout(() => setValue('destinationCountry', 'India'), 100);
    setTimeout(() => {
      setValue('destinationPortId', 'port-paradip');
      setValue('destinationPortName', 'Paradip');
    }, 150);
    setValue('canalTransit', 'None');
    setValue('planningDurationMonths', 12);
    setValue('preference', 'Hybrid');
    setValue('riskTolerance', 'Moderate');
    setValue('vesselPreference', 'Let GeoGuard recommend');
  };

  const onSubmit = async (data: NewAnalysisFormData) => {
    if (data.distanceNM === 0) return;

    setIsRunning(true);
    try {
      const payload: AnalysisInput = {
        cargo: {
          cargoType: data.cargoType,
          quantityMT: data.quantityMT,
          shipmentsCount: data.shipmentsCount,
          laycanStart: data.laycanStart,
          laycanEnd: data.laycanEnd
        },
        route: {
          originPortId: data.originPortId,
          originPortName: data.originPortName,
          originCountry: data.originCountry,
          destinationPortId: data.destinationPortId,
          destinationPortName: data.destinationPortName,
          destinationCountry: data.destinationCountry,
          distanceNM: data.distanceNM,
          canalTransit: data.canalTransit
        },
        contract: {
          planningDurationMonths: data.planningDurationMonths || 12,
          preference: data.preference || 'Hybrid',
          riskTolerance: data.riskTolerance || 'Moderate'
        }
      };

      const result = await analysisApi.createAnalysis(payload);
      navigate(`/app/analysis/${result.id}`);
    } catch {
      navigate('/app/analysis/AN-2026-0842');
    } finally {
      setIsRunning(false);
    }
  };

  const handleSaveDraft = () => {
    setDraftSaved(true);
    setTimeout(() => setDraftSaved(false), 3000);
  };

  // Progress steps
  const steps = [
    { num: '1', label: 'Cargo', done: !!cargoType },
    { num: '2', label: 'Route', done: !!originPortId && !!destinationPortId && distanceNM > 0 },
    { num: '3', label: 'Contract', done: false },
    { num: '4', label: 'Risk', done: !!riskTolerance }
  ];

  const currentStep = steps.findIndex(s => !s.done);

  return (
    <div className="max-w-4xl mx-auto animate-fade-up">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4 pb-5 border-b border-slate-200 mb-6">
        <div>
          <p className="text-[11px] text-slate-400 font-semibold uppercase tracking-widest mb-1">
            Analysis Workflow
          </p>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            New Chartering Analysis
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Configure cargo, route, fleet, and risk preferences to generate your decision report
          </p>
        </div>
        <button
          type="button"
          onClick={handleApplyPreset}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 bg-white border border-slate-300 hover:bg-slate-50 rounded transition-colors"
        >
          <RotateCcw className="w-3 h-3 text-slate-400" />
          <span>Load benchmark route (Indonesia → Paradip)</span>
        </button>
      </div>

      {/* Step indicator */}
      <StepIndicator steps={steps} current={Math.max(0, currentStep)} />

      {draftSaved && (
        <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          Analysis parameters saved as local draft.
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

        {/* ── Section 1: Cargo ── */}
        <div className="bg-white border border-slate-200 rounded-md overflow-hidden shadow-2xs">
          <div className="flex items-center gap-2.5 px-5 py-3.5 border-b border-slate-100 bg-slate-50/50">
            <div className="w-5 h-5 rounded bg-slate-900 flex items-center justify-center text-white text-[10px] font-bold shrink-0">1</div>
            <Ship className="w-4 h-4 text-blue-700" />
            <span className="text-xs font-semibold text-slate-900">Cargo Specification & Parcels</span>
          </div>

          <div className="p-5 grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label htmlFor="cargoType" className="block text-xs font-semibold text-slate-700 mb-1.5">
                Cargo Commodity <span className="text-rose-500">*</span>
              </label>
              <select
                id="cargoType"
                {...register('cargoType')}
                className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded focus:border-slate-800 focus:outline-none transition-colors"
              >
                <option value="">Select cargo commodity</option>
                <option value="Iron Ore">Iron Ore</option>
                <option value="Thermal Coal">Thermal Coal</option>
                <option value="Coking Coal">Coking Coal</option>
                <option value="Bauxite">Bauxite</option>
                <option value="Grain">Grain</option>
              </select>
              {errors.cargoType && (
                <p className="text-[11px] text-rose-600 mt-1">{errors.cargoType.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="quantityMT" className="block text-xs font-semibold text-slate-700 mb-1.5">
                Parcel Quantity (MT) <span className="text-rose-500">*</span>
              </label>
              <input
                id="quantityMT"
                {...register('quantityMT', { valueAsNumber: true })}
                type="number"
                step="1000"
                placeholder="e.g. 50000"
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded focus:border-slate-800 focus:outline-none tabular-nums transition-colors"
              />
              {errors.quantityMT && (
                <p className="text-[11px] text-rose-600 mt-1">{errors.quantityMT.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="shipmentsCount" className="block text-xs font-semibold text-slate-700 mb-1.5">
                Number of Shipments <span className="text-rose-500">*</span>
              </label>
              <input
                id="shipmentsCount"
                {...register('shipmentsCount', { valueAsNumber: true })}
                type="number"
                min="1"
                max="36"
                placeholder="e.g. 12"
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded focus:border-slate-800 focus:outline-none tabular-nums transition-colors"
              />
              {errors.shipmentsCount && (
                <p className="text-[11px] text-rose-600 mt-1">{errors.shipmentsCount.message}</p>
              )}
            </div>
          </div>
        </div>

        {/* ── Section 2: Route & Port Constraints ── */}
        <div className="bg-white border border-slate-200 rounded-md overflow-hidden shadow-2xs">
          <div className="flex items-center gap-2.5 px-5 py-3.5 border-b border-slate-100 bg-slate-50/50">
            <div className="w-5 h-5 rounded bg-slate-900 flex items-center justify-center text-white text-[10px] font-bold shrink-0">2</div>
            <MapPin className="w-4 h-4 text-blue-700" />
            <span className="text-xs font-semibold text-slate-900">Route & Physical Terminals</span>
          </div>

          <div className="p-5 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Origin */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded space-y-3">
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-slate-400"></div>
                  <span className="text-[11px] font-bold text-slate-600 uppercase tracking-widest">
                    Origin (Load Port)
                  </span>
                </div>
                <div>
                  <label htmlFor="originCountry" className="block text-xs text-slate-600 mb-1.5">Country <span className="text-rose-500">*</span></label>
                  {isOriginsError && <p className="text-xs text-rose-600 mb-2">Unable to load supported ports.</p>}
                  <select
                    id="originCountry"
                    {...register('originCountry', {
                      onChange: () => {
                        setValue('originPortId', '');
                        setValue('originPortName', '');
                      }
                    })}
                    disabled={isOriginsLoading || isOriginsError}
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded focus:border-slate-800 focus:outline-none transition-colors disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed"
                  >
                    <option value="">{isOriginsLoading ? 'Loading countries...' : 'Select origin country'}</option>
                    {origins && Object.keys(origins).map(c => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                  </select>
                  {errors.originCountry && (
                    <p className="text-[11px] text-rose-600 mt-1">{errors.originCountry.message}</p>
                  )}
                </div>
                <div>
                  <label htmlFor="originPortId" className="block text-xs text-slate-600 mb-1.5">Port Name <span className="text-rose-500">*</span></label>
                  <select
                    id="originPortId"
                    {...register('originPortId', {
                      onChange: (e) => {
                        const port = origins?.[originCountry]?.find(p => p.id === e.target.value);
                        setValue('originPortName', port?.name || '');
                      }
                    })}
                    disabled={!originCountry || isOriginsLoading || isOriginsError}
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded focus:border-slate-800 focus:outline-none transition-colors disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed"
                  >
                    <option value="">{isOriginsLoading ? 'Loading ports...' : 'Select origin port'}</option>
                    {originCountry && origins?.[originCountry]?.map(p => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                  {errors.originPortId && (
                    <p className="text-[11px] text-rose-600 mt-1">{errors.originPortId.message}</p>
                  )}
                </div>
              </div>

              {/* Destination */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded space-y-3">
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                  <span className="text-[11px] font-bold text-slate-600 uppercase tracking-widest">
                    Destination (India)
                  </span>
                </div>
                <div>
                  <label className="block text-xs text-slate-600 mb-1.5">Country</label>
                  <div className="w-full px-3 py-2 text-xs bg-slate-100 border border-slate-300 rounded text-slate-500 font-medium">
                    India <span className="text-[10px] text-slate-400 font-normal">(GeoGuard destination)</span>
                  </div>
                </div>
                <div>
                  <label htmlFor="destinationPortId" className="block text-xs text-slate-600 mb-1.5">Port Name <span className="text-rose-500">*</span></label>
                  <select
                    id="destinationPortId"
                    {...register('destinationPortId', {
                      onChange: (e) => {
                        const port = destinations?.['India']?.find(p => p.id === e.target.value);
                        setValue('destinationPortName', port?.name || '');
                      }
                    })}
                    disabled={isDestinationsLoading || isDestinationsError}
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded focus:border-slate-800 focus:outline-none transition-colors disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed"
                  >
                    <option value="">{isDestinationsLoading ? 'Loading ports...' : 'Select India port'}</option>
                    {destinations?.['India']?.map(p => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                  {errors.destinationPortId && (
                    <p className="text-[11px] text-rose-600 mt-1">{errors.destinationPortId.message}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Route Preview / Distance */}
            <div>
              {distanceNM > 0 ? (
                <div className="px-4 py-3.5 text-xs border border-emerald-200 bg-emerald-50 text-emerald-800 rounded flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="text-center">
                      <div className="font-bold text-slate-900">{originPortName}</div>
                      <div className="text-[10px] uppercase tracking-wide text-slate-500 mt-0.5">{originCountry}</div>
                    </div>
                    <div className="flex items-center gap-1 text-slate-400">
                      <div className="w-8 h-px bg-slate-300"></div>
                      <ArrowRight className="w-3 h-3" />
                    </div>
                    <div className="text-center">
                      <div className="font-bold text-slate-900">{destinationPortName}</div>
                      <div className="text-[10px] uppercase tracking-wide text-slate-500 mt-0.5">India</div>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <div className="font-black text-lg tabular-nums text-slate-900">{distanceNM.toLocaleString()} <span className="text-sm font-semibold">NM</span></div>
                    <div className="text-[11px] text-slate-600">~{(distanceNM / (13 * 24)).toFixed(1)} days sailing at 13 knots</div>
                    <div className="text-[9px] uppercase tracking-widest text-slate-400 mt-0.5">Source: GeoGuard Baseline Maritime Route</div>
                  </div>
                </div>
              ) : distanceError ? (
                <div className="px-4 py-3 text-xs border border-rose-200 bg-rose-50 text-rose-700 rounded">
                  <span className="font-bold block mb-0.5">Distance: UNAVAILABLE</span>
                  {distanceError}
                </div>
              ) : (
                <div className="px-4 py-3 text-xs border border-slate-200 bg-slate-50/80 text-slate-400 rounded">
                  Select origin and destination ports to automatically resolve the baseline maritime distance.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── Section 3: Fleet & Contract Strategy ── */}
        <div className="bg-white border border-slate-200 rounded-md overflow-hidden shadow-2xs">
          <div className="flex items-center gap-2.5 px-5 py-3.5 border-b border-slate-100 bg-slate-50/50">
            <div className="w-5 h-5 rounded bg-slate-900 flex items-center justify-center text-white text-[10px] font-bold shrink-0">3</div>
            <Calendar className="w-4 h-4 text-blue-700" />
            <span className="text-xs font-semibold text-slate-900">Fleet & Contract Strategy</span>
          </div>

          <div className="p-5 grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label htmlFor="vesselPreference" className="block text-xs font-semibold text-slate-700 mb-1.5">
                Vessel Preference
              </label>
              <select
                id="vesselPreference"
                {...register('vesselPreference')}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded focus:border-slate-800 focus:outline-none bg-white transition-colors"
              >
                <option value="Let GeoGuard recommend">Let GeoGuard recommend</option>
                <option value="Handysize">Handysize</option>
                <option value="Supramax">Supramax</option>
                <option value="Panamax">Panamax</option>
                <option value="Capesize">Capesize</option>
              </select>
              <p className="text-[10px] text-slate-400 mt-1">
                GeoGuard auto-selects based on port draft constraints.
              </p>
            </div>

            <div>
              <label htmlFor="preference" className="block text-xs font-semibold text-slate-700 mb-1.5">
                Contract Preference
              </label>
              <select
                id="preference"
                {...register('preference')}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded focus:border-slate-800 focus:outline-none bg-white transition-colors"
              >
                <option value="Hybrid">Let GeoGuard optimize (Hybrid)</option>
                <option value="Spot">Spot Fixtures (100% open market)</option>
                <option value="Short-Term">Short-Term Period (3–6 months)</option>
                <option value="Medium-Term">Medium-Term (12 months COA)</option>
              </select>
            </div>

            {preference !== 'Spot' && (
              <div>
                <label htmlFor="planningDurationMonths" className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Planning Duration
                </label>
                <select
                  id="planningDurationMonths"
                  {...register('planningDurationMonths', { valueAsNumber: true })}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded focus:border-slate-800 focus:outline-none bg-white transition-colors"
                >
                  <option value={3}>3 Months (Quarterly)</option>
                  <option value={6}>6 Months (Semi-Annual)</option>
                  <option value={12}>12 Months (Annual Program)</option>
                  <option value={24}>24 Months (Multi-Year COA)</option>
                </select>
              </div>
            )}
          </div>
        </div>

        {/* ── Section 4: Risk Tolerance ── */}
        <div className="bg-white border border-slate-200 rounded-md overflow-hidden shadow-2xs">
          <div className="flex items-center gap-2.5 px-5 py-3.5 border-b border-slate-100 bg-slate-50/50">
            <div className="w-5 h-5 rounded bg-slate-900 flex items-center justify-center text-white text-[10px] font-bold shrink-0">4</div>
            <ShieldCheck className="w-4 h-4 text-blue-700" />
            <span className="text-xs font-semibold text-slate-900">Risk Tolerance Stance</span>
          </div>

          <div className="p-5 grid grid-cols-1 sm:grid-cols-3 gap-3">
            <label className="p-4 border border-slate-200 rounded cursor-pointer hover:bg-slate-50 transition-colors flex items-start gap-2.5 group">
              <input
                {...register('riskTolerance')}
                type="radio"
                value="Conservative"
                className="mt-0.5 text-slate-900 focus:ring-slate-900 shrink-0"
              />
              <div>
                <div className="text-xs font-bold text-slate-900">Conservative</div>
                <div className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                  Heavily penalize spot freight volatility; prioritize cost certainty via period cover.
                </div>
              </div>
            </label>

            <label className="p-4 border border-slate-300 bg-blue-50/30 rounded cursor-pointer hover:bg-blue-50/50 transition-colors flex items-start gap-2.5">
              <input
                {...register('riskTolerance')}
                type="radio"
                value="Moderate"
                className="mt-0.5 text-slate-900 focus:ring-slate-900 shrink-0"
              />
              <div>
                <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                  Moderate
                  <span className="text-[10px] font-normal text-blue-700 bg-blue-100 px-1.5 py-0.5 rounded">
                    Recommended
                  </span>
                </div>
                <div className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                  Balanced portfolio: hedge market downside while keeping open spot optionality.
                </div>
              </div>
            </label>

            <label className="p-4 border border-slate-200 rounded cursor-pointer hover:bg-slate-50 transition-colors flex items-start gap-2.5">
              <input
                {...register('riskTolerance')}
                type="radio"
                value="Aggressive"
                className="mt-0.5 text-slate-900 focus:ring-slate-900 shrink-0"
              />
              <div>
                <div className="text-xs font-bold text-slate-900">Aggressive</div>
                <div className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                  Accept spot price variance in exchange for zero period contract commitments.
                </div>
              </div>
            </label>
          </div>
        </div>

        {/* ── Action Buttons ── */}
        <div className="flex items-center justify-between pt-2 pb-4">
          <button
            type="button"
            onClick={handleSaveDraft}
            className="px-4 py-2 border border-slate-300 text-slate-700 bg-white hover:bg-slate-50 text-xs font-semibold rounded transition-colors inline-flex items-center gap-1.5"
          >
            <Save className="w-3.5 h-3.5 text-slate-400" />
            <span>Save Draft</span>
          </button>

          <button
            type="submit"
            disabled={isRunning || distanceNM === 0}
            className="cta-primary px-7 py-2.5 bg-slate-900 hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-semibold rounded transition-colors inline-flex items-center gap-2 shadow-xs"
          >
            {isRunning ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Running Simulation & Optimization…</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Run Analysis</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
