import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { CheckCircle2, Send, Building2, Mail, User } from 'lucide-react';

const contactSchema = z.object({
  fullName: z.string().min(2, 'Full name is required'),
  workEmail: z.string().email('Please enter a valid work email'),
  organizationName: z.string().min(2, 'Organization name is required'),
  cargoVolume: z.string().min(1, 'Please select your annual cargo volume'),
  routesOfInterest: z.string().optional(),
  message: z.string().optional()
});

type ContactFormData = z.infer<typeof contactSchema>;

export const ContactPage: React.FC = () => {
  const [submitted, setSubmitted] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema)
  });

  const onSubmit = async (_data: ContactFormData) => {
    // Simulate brief network submission
    await new Promise((resolve) => setTimeout(resolve, 600));
    setSubmitted(true);
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
      <div className="text-center mb-8">
        <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">
          Institutional Access
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
          Request GeoGuard Terminal Access
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 mt-2 max-w-lg mx-auto leading-relaxed">
          GeoGuard is deployed directly to bulk commodity importers, charterers, and industrial freight desks. Submit your institutional details to schedule an operational onboarding.
        </p>
      </div>

      <div className="bg-white border border-slate-200 rounded-md p-6 sm:p-8 shadow-xs">
        {submitted ? (
          <div className="text-center py-8">
            <div className="w-12 h-12 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto mb-3">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h2 className="text-base font-bold text-slate-900">Request Received</h2>
            <p className="text-xs text-slate-600 mt-1 max-w-md mx-auto leading-relaxed">
              Our freight deployment specialist will contact you at your work email to configure terminal credentials and review your trade lane data feeds.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Full Name *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-slate-400">
                    <User className="w-3.5 h-3.5" />
                  </div>
                  <input
                    {...register('fullName')}
                    type="text"
                    placeholder="e.g. Johnathan Miller"
                    className="w-full pl-8 pr-3 py-2 text-xs border border-slate-300 rounded focus:border-slate-800 focus:outline-hidden"
                  />
                </div>
                {errors.fullName && (
                  <p className="text-[11px] text-rose-600 mt-1">{errors.fullName.message}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Corporate Work Email *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-slate-400">
                    <Mail className="w-3.5 h-3.5" />
                  </div>
                  <input
                    {...register('workEmail')}
                    type="email"
                    placeholder="name@company.com"
                    className="w-full pl-8 pr-3 py-2 text-xs border border-slate-300 rounded focus:border-slate-800 focus:outline-hidden"
                  />
                </div>
                {errors.workEmail && (
                  <p className="text-[11px] text-rose-600 mt-1">{errors.workEmail.message}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Organization / Entity *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-slate-400">
                    <Building2 className="w-3.5 h-3.5" />
                  </div>
                  <input
                    {...register('organizationName')}
                    type="text"
                    placeholder="e.g. Pacific Bulk Logistics Ltd."
                    className="w-full pl-8 pr-3 py-2 text-xs border border-slate-300 rounded focus:border-slate-800 focus:outline-hidden"
                  />
                </div>
                {errors.organizationName && (
                  <p className="text-[11px] text-rose-600 mt-1">{errors.organizationName.message}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Annual Bulk Volume *
                </label>
                <select
                  {...register('cargoVolume')}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded focus:border-slate-800 focus:outline-hidden bg-white"
                >
                  <option value="">Select annual volume</option>
                  <option value="under_500k">Under 500,000 MT / year</option>
                  <option value="500k_2m">500,000 – 2,000,000 MT / year</option>
                  <option value="2m_10m">2,000,000 – 10,000,000 MT / year</option>
                  <option value="over_10m">Over 10,000,000 MT / year</option>
                </select>
                {errors.cargoVolume && (
                  <p className="text-[11px] text-rose-600 mt-1">{errors.cargoVolume.message}</p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Primary Trade Routes / Cargoes
              </label>
              <input
                {...register('routesOfInterest')}
                type="text"
                placeholder="e.g. Indonesia / Australia coal into East Coast India; Guinea bauxite"
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded focus:border-slate-800 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Specific Operational Needs (Optional)
              </label>
              <textarea
                {...register('message')}
                rows={3}
                placeholder="Mention specific vessel classes, COA structuring requirements, or port constraint inquiries..."
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded focus:border-slate-800 focus:outline-hidden"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-2.5 px-4 bg-slate-900 text-white rounded text-xs font-semibold hover:bg-slate-800 transition-colors flex items-center justify-center gap-1.5"
              >
                {isSubmitting ? (
                  <span>Submitting request...</span>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    <span>Submit Access Request</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
