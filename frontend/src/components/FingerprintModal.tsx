import React from 'react';
import { X, Shield, AlertTriangle, Info, TrendingUp, Droplets, CheckCircle, ArrowDown } from 'lucide-react';
import { ResilienceFingerprint } from '../types';
import {
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid
} from 'recharts';

interface FingerprintModalProps {
  fingerprint: ResilienceFingerprint | null;
  onClose: () => void;
}

export const FingerprintModal: React.FC<FingerprintModalProps> = ({
  fingerprint,
  onClose
}) => {
  if (!fingerprint) return null;

  const barData = fingerprint.stress_scenarios.map(s => ({
    scenario: `${s.capacity_pct}% Cap.`,
    peakRunoff: s.peak_runoff_m3s,
    pondingDepth: s.waterlog_depth_cm,
    volumeM3: Math.round(s.runoff_volume_m3 / 1000), // in 1,000 m3
    risk: s.drainage_surcharge_risk
  }));

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5">
      <div className="bg-white rounded-lg shadow-2xl border border-slate-200 max-w-4xl w-full max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-sky-100 text-sky-800 rounded-md">
              <Shield className="w-5 h-5 text-sky-700" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="font-bold text-slate-900 text-lg">
                  Flood Resilience Fingerprint: {fingerprint.name} ({fingerprint.subcatchment_code})
                </h3>
                <span className={`text-xs px-2.5 py-0.5 rounded font-semibold border ${
                  fingerprint.susceptibility_category === 'High'
                    ? 'bg-red-50 text-red-700 border-red-200'
                    : fingerprint.susceptibility_category === 'Moderate'
                    ? 'bg-amber-50 text-amber-700 border-amber-200'
                    : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                }`}>
                  {fingerprint.susceptibility_category} Susceptibility ({fingerprint.baseline_susceptibility_score})
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Signature Research Feature — Transparent Diagnostic & Drainage Stress Testing
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-1.5 rounded-md hover:bg-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-slate-700 text-sm">
          
          {/* Subcatchment Physical Metrics Summary */}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
            <div className="bg-slate-50 p-2.5 rounded border border-slate-200">
              <span className="text-[11px] text-slate-500 block uppercase font-mono">Basin Area</span>
              <span className="text-base font-bold text-slate-900 font-mono">{fingerprint.area_ha} ha</span>
            </div>
            <div className="bg-slate-50 p-2.5 rounded border border-slate-200">
              <span className="text-[11px] text-slate-500 block uppercase font-mono">Elevation</span>
              <span className="text-base font-bold text-slate-900 font-mono">{fingerprint.elevation_m} m</span>
            </div>
            <div className="bg-slate-50 p-2.5 rounded border border-slate-200">
              <span className="text-[11px] text-slate-500 block uppercase font-mono">Slope</span>
              <span className="text-base font-bold text-slate-900 font-mono">{fingerprint.slope_pct}%</span>
            </div>
            <div className="bg-slate-50 p-2.5 rounded border border-slate-200">
              <span className="text-[11px] text-slate-500 block uppercase font-mono">Impervious Cover</span>
              <span className="text-base font-bold text-slate-900 font-mono">{fingerprint.impervious_pct}%</span>
            </div>
            <div className="bg-slate-50 p-2.5 rounded border border-slate-200">
              <span className="text-[11px] text-slate-500 block uppercase font-mono">Dominant Driver</span>
              <span className="text-xs font-semibold text-slate-800 truncate block mt-0.5" title={fingerprint.dominant_factor}>
                {fingerprint.dominant_factor}
              </span>
            </div>
            <div className="bg-slate-50 p-2.5 rounded border border-slate-200">
              <span className="text-[11px] text-slate-500 block uppercase font-mono">Soil Class</span>
              <span className="text-xs font-semibold text-slate-800 truncate block mt-0.5" title={fingerprint.soil_type}>
                {fingerprint.soil_type}
              </span>
            </div>
          </div>

          {/* 4 Drainage Stress Scenarios Comparison */}
          <div className="border border-slate-200 rounded-lg p-4 bg-white">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h4 className="font-bold text-slate-900 text-sm flex items-center space-x-1.5">
                  <TrendingUp className="w-4 h-4 text-sky-600" />
                  <span>Drainage Capacity Stress-Testing Matrix (Hypothetical Scenarios)</span>
                </h4>
                <p className="text-xs text-slate-500">
                  Tests hydraulic throttling response (100% normal down to 25% stress). These are hypothetical stress tests, NOT surveyed pipe blockage.
                </p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-100 text-slate-700 font-mono border-b border-slate-200">
                    <th className="py-2 px-3">Drainage Scenario</th>
                    <th className="py-2 px-3">Assumed Capacity</th>
                    <th className="py-2 px-3">Peak Runoff (m³/s)</th>
                    <th className="py-2 px-3">Runoff Volume (m³)</th>
                    <th className="py-2 px-3">Depression Ponding</th>
                    <th className="py-2 px-3">Surcharge Risk Level</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {fingerprint.stress_scenarios.map((st) => (
                    <tr key={st.capacity_pct} className="hover:bg-slate-50 font-mono">
                      <td className="py-2.5 px-3 font-sans font-semibold text-slate-800">
                        {st.label}
                      </td>
                      <td className="py-2.5 px-3">{st.capacity_pct}% of Design</td>
                      <td className="py-2.5 px-3 font-semibold">{st.peak_runoff_m3s}</td>
                      <td className="py-2.5 px-3">{st.runoff_volume_m3.toLocaleString()}</td>
                      <td className="py-2.5 px-3">
                        <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                          st.waterlog_depth_cm > 40
                            ? 'bg-red-100 text-red-800'
                            : st.waterlog_depth_cm > 20
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}>
                          {st.waterlog_depth_cm} cm
                        </span>
                      </td>
                      <td className="py-2.5 px-3 font-sans">
                        <span className={`inline-flex items-center text-[11px] px-2 py-0.5 rounded font-medium ${
                          st.drainage_surcharge_risk.includes('Critical')
                            ? 'bg-red-50 text-red-700 border border-red-200'
                            : st.drainage_surcharge_risk.includes('High')
                            ? 'bg-amber-50 text-amber-700 border border-amber-200'
                            : 'bg-blue-50 text-blue-700 border border-blue-200'
                        }`}>
                          {st.drainage_surcharge_risk}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Charts Row: Radar Factor Fingerprint & Stress Bar Chart */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Radar Chart */}
            <div className="border border-slate-200 rounded-lg p-4 bg-white">
              <h5 className="font-semibold text-slate-800 text-xs mb-1 uppercase font-mono tracking-wider">
                Contributing Factor Decomposition (Radar)
              </h5>
              <p className="text-[11px] text-slate-500 mb-2">
                Normalized factor intensity (0-100) compared against Trichy urban baseline (50).
              </p>
              <div className="h-60 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={fingerprint.radar_metrics} outerRadius="75%">
                    <PolarGrid stroke="#cbd5e1" />
                    <PolarAngleAxis dataKey="dimension" tick={{ fill: '#475569', fontSize: 10 }} />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 9 }} />
                    <Radar name="Subcatchment Score" dataKey="value" stroke="#0284c7" fill="#0284c7" fillOpacity={0.4} />
                    <Radar name="Baseline Average" dataKey="baseline" stroke="#94a3b8" fill="#94a3b8" fillOpacity={0.1} strokeDasharray="3 3" />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Stress Response Bar Chart */}
            <div className="border border-slate-200 rounded-lg p-4 bg-white">
              <h5 className="font-semibold text-slate-800 text-xs mb-1 uppercase font-mono tracking-wider">
                Ponding Depth Response Under Drainage Stress
              </h5>
              <p className="text-[11px] text-slate-500 mb-2">
                Simulated waterlogging depth (cm) in local depression zones as drainage capacity drops.
              </p>
              <div className="h-60 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={barData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="scenario" tick={{ fill: '#475569', fontSize: 11 }} />
                    <YAxis unit="cm" tick={{ fill: '#475569', fontSize: 11 }} />
                    <Tooltip
                      formatter={(val: any) => [`${val} cm`, 'Ponding Depth']}
                      contentStyle={{ backgroundColor: '#ffffff', borderColor: '#cbd5e1', fontSize: '12px' }}
                    />
                    <Bar dataKey="pondingDepth" fill="#0284c7" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

          </div>

          {/* Intervention Mitigation & Remaining Risk Card */}
          <div className="bg-sky-50/60 border border-sky-200 rounded-lg p-4">
            <h5 className="font-semibold text-sky-950 text-xs uppercase font-mono tracking-wider mb-2 flex items-center space-x-1.5">
              <CheckCircle className="w-4 h-4 text-emerald-600" />
              <span>Green Infrastructure Mitigation Capacity & Remaining Risk</span>
            </h5>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
              <div className="bg-white p-2.5 rounded border border-sky-100">
                <span className="text-[11px] text-slate-500 block font-sans">GI Allocation</span>
                <span className="text-sm font-bold text-slate-900">{fingerprint.intervention_coverage_m2.toLocaleString()} m²</span>
              </div>
              <div className="bg-white p-2.5 rounded border border-sky-100">
                <span className="text-[11px] text-slate-500 block font-sans">Storage Retention</span>
                <span className="text-sm font-bold text-emerald-700">{fingerprint.potential_volume_retention_m3.toLocaleString()} m³</span>
              </div>
              <div className="bg-white p-2.5 rounded border border-sky-100">
                <span className="text-[11px] text-slate-500 block font-sans">Peak Attenuation</span>
                <span className="text-sm font-bold text-sky-700">-{fingerprint.potential_peak_reduction_pct}%</span>
              </div>
              <div className="bg-white p-2.5 rounded border border-sky-100">
                <span className="text-[11px] text-slate-500 block font-sans">Remaining Risk Index</span>
                <span className="text-sm font-bold text-slate-900">{fingerprint.remaining_risk_score}</span>
              </div>
            </div>
          </div>

          {/* Explainability Scientific Narrative */}
          <div className="border-l-4 border-sky-600 pl-4 py-1 bg-slate-50 rounded-r-md">
            <h5 className="font-bold text-slate-900 text-xs uppercase font-mono tracking-wider mb-1 flex items-center space-x-1">
              <Info className="w-3.5 h-3.5 text-sky-700" />
              <span>Scientific Explainability Narrative</span>
            </h5>
            <p className="text-xs leading-relaxed text-slate-700">
              {fingerprint.scientific_explanation}
            </p>
          </div>

          {/* Methodological Transparency Note */}
          <div className="bg-amber-50/70 border border-amber-200 rounded p-3 text-[11px] text-amber-900 flex items-start space-x-2">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <p className="leading-normal">
              {fingerprint.limitations_note}
            </p>
          </div>

        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-200 bg-slate-50 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded text-xs font-medium transition-colors"
          >
            Close Fingerprint
          </button>
        </div>

      </div>
    </div>
  );
};
