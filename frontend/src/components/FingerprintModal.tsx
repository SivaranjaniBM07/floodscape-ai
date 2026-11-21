import React from 'react';
import {
  X, Shield, AlertTriangle, Info, TrendingUp,
  CheckCircle, Droplets, Activity, AlertCircle
} from 'lucide-react';
import { ResilienceFingerprint } from '../types';
import {
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid,
  Legend
} from 'recharts';

interface FingerprintModalProps {
  fingerprint: ResilienceFingerprint | null;
  onClose: () => void;
}

/* ── helpers ── */
const categoryColor = (cat: string) =>
  cat === 'High'     ? { badge: 'bg-red-900/40 text-red-300 border-red-700/50',    dot: 'bg-red-400'     } :
  cat === 'Moderate' ? { badge: 'bg-amber-900/40 text-amber-300 border-amber-700/50', dot: 'bg-amber-400' } :
                       { badge: 'bg-emerald-900/40 text-emerald-300 border-emerald-700/50', dot: 'bg-emerald-400' };

const riskColor = (risk: string) =>
  risk.includes('Critical') ? 'bg-red-900/40 text-red-300 border border-red-700/40' :
  risk.includes('High')     ? 'bg-amber-900/40 text-amber-300 border border-amber-700/40' :
  risk.includes('Moderate') ? 'bg-yellow-900/40 text-yellow-300 border border-yellow-700/40' :
                              'bg-emerald-900/40 text-emerald-300 border border-emerald-700/40';

const pondingColor = (cm: number) =>
  cm > 40 ? 'bg-red-900/40 text-red-300'  :
  cm > 20 ? 'bg-amber-900/40 text-amber-300' :
             'bg-emerald-900/40 text-emerald-300';

const ScenarioCapacityBadge = ({ pct }: { pct: number }) => {
  const colors =
    pct === 100 ? 'bg-sky-800/60 text-sky-200' :
    pct === 75  ? 'bg-blue-900/60 text-blue-200' :
    pct === 50  ? 'bg-amber-900/60 text-amber-200' :
                  'bg-red-900/60 text-red-200';
  return (
    <span className={`inline-block font-mono text-xs font-bold px-2 py-0.5 rounded ${colors}`}>
      {pct}%
    </span>
  );
};

/* Custom radar tooltip */
const RadarTooltipContent = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-xs shadow-xl">
      {payload.map((p: any) => (
        <div key={p.name} className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color }} />
          <span className="text-slate-300">{p.name}:</span>
          <span className="font-bold text-white">{p.value}</span>
        </div>
      ))}
    </div>
  );
};

export const FingerprintModal: React.FC<FingerprintModalProps> = ({ fingerprint, onClose }) => {
  if (!fingerprint) return null;

  const cat = categoryColor(fingerprint.susceptibility_category);

  const barData = fingerprint.stress_scenarios.map(s => ({
    scenario: `${s.capacity_pct}%`,
    'Peak Runoff (m³/s)': s.peak_runoff_m3s,
    'Ponding Depth (cm)': s.waterlog_depth_cm,
  }));

  /* Percentage fill for stat cells */
  const statFill = (val: number, max: number) =>
    `${Math.min(100, Math.round((val / max) * 100))}%`;

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto flex items-start sm:items-center justify-center p-3 sm:p-6"
      style={{ backgroundColor: 'rgba(2, 6, 23, 0.85)', backdropFilter: 'blur(6px)' }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="relative w-full max-w-5xl max-h-[95vh] flex flex-col rounded-2xl overflow-hidden shadow-2xl"
        style={{ backgroundColor: '#0f172a', border: '1px solid rgba(14,165,233,0.2)' }}
      >
        {/* ════════════ HEADER ════════════ */}
        <div
          className="flex items-center justify-between px-6 py-4 border-b flex-shrink-0"
          style={{ borderColor: 'rgba(14,165,233,0.15)', background: 'linear-gradient(135deg, #0f1f35 0%, #0f172a 100%)' }}
        >
          <div className="flex items-center gap-4 min-w-0">
            {/* Icon */}
            <div className="flex-shrink-0 w-11 h-11 rounded-xl flex items-center justify-center"
                 style={{ background: 'linear-gradient(135deg,#0ea5e9,#0369a1)', boxShadow: '0 0 18px rgba(14,165,233,0.4)' }}>
              <Shield className="w-5 h-5 text-white" />
            </div>
            {/* Title */}
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="font-bold text-white text-base sm:text-lg truncate">
                  Flood Resilience Fingerprint
                </h3>
                <span className="font-mono text-sky-400 text-sm font-bold">
                  {fingerprint.subcatchment_code}
                </span>
                <span className={`text-xs px-2.5 py-0.5 rounded-full border font-semibold ${cat.badge}`}>
                  <span className={`inline-block w-1.5 h-1.5 rounded-full mr-1.5 ${cat.dot}`} />
                  {fingerprint.susceptibility_category} Susceptibility
                  <span className="ml-1.5 font-mono opacity-80">({fingerprint.baseline_susceptibility_score})</span>
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5 truncate">
                {fingerprint.name} — Transparent Diagnostic & Drainage Stress Analysis
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="flex-shrink-0 ml-3 p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700/60 transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* ════════════ BODY ════════════ */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">

          {/* ── Physical characteristics grid ── */}
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
            {[
              { label: 'Basin Area',       value: `${fingerprint.area_ha} ha`,         icon: null },
              { label: 'Elevation',        value: `${fingerprint.elevation_m} m`,       icon: null },
              { label: 'Slope',            value: `${fingerprint.slope_pct}%`,          icon: null },
              { label: 'Impervious Cover', value: `${fingerprint.impervious_pct}%`,     icon: null },
              { label: 'Dominant Driver',  value: fingerprint.dominant_factor,          icon: null, small: true },
              { label: 'Soil Class',       value: fingerprint.soil_type,                icon: null, small: true },
            ].map(({ label, value, small }) => (
              <div key={label}
                   className="rounded-xl px-3 py-2.5 flex flex-col gap-0.5"
                   style={{ backgroundColor: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
                <span className="text-[10px] text-slate-500 uppercase font-mono tracking-wider">{label}</span>
                <span className={`font-bold text-slate-100 ${small ? 'text-[11px] leading-snug' : 'text-sm font-mono'}`}
                      title={value}>
                  {value}
                </span>
              </div>
            ))}
          </div>

          {/* ── Drainage stress scenario cards ── */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp className="w-4 h-4 text-sky-400" />
              <h4 className="font-bold text-slate-200 text-sm">Drainage Capacity Stress-Testing Matrix</h4>
              <span className="text-[11px] text-slate-500 ml-auto hidden sm:block">
                Hypothetical hydraulic throttling — not surveyed pipe blockage data
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {fingerprint.stress_scenarios.map((st) => {
                const isWorst = st.capacity_pct === 25;
                const isBest  = st.capacity_pct === 100;
                return (
                  <div
                    key={st.capacity_pct}
                    className="rounded-xl p-4 flex flex-col gap-2.5"
                    style={{
                      backgroundColor: isWorst ? 'rgba(220,38,38,0.08)' : isBest ? 'rgba(16,185,129,0.06)' : 'rgba(255,255,255,0.04)',
                      border: isWorst ? '1px solid rgba(220,38,38,0.25)' : isBest ? '1px solid rgba(16,185,129,0.2)' : '1px solid rgba(255,255,255,0.07)',
                    }}
                  >
                    {/* Card title row */}
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-xs font-semibold text-slate-200 leading-snug">{st.label}</span>
                      <ScenarioCapacityBadge pct={st.capacity_pct} />
                    </div>

                    {/* Metrics */}
                    <div className="space-y-1.5 text-xs font-mono">
                      <div className="flex justify-between text-slate-400">
                        <span>Peak Runoff</span>
                        <span className="text-slate-200 font-bold">{st.peak_runoff_m3s} m³/s</span>
                      </div>
                      <div className="flex justify-between text-slate-400">
                        <span>Volume</span>
                        <span className="text-slate-200 font-bold">{st.runoff_volume_m3.toLocaleString()} m³</span>
                      </div>
                      <div className="flex justify-between items-center text-slate-400">
                        <span>Ponding</span>
                        <span className={`px-1.5 py-0.5 rounded text-[11px] font-bold ${pondingColor(st.waterlog_depth_cm)}`}>
                          {st.waterlog_depth_cm} cm
                        </span>
                      </div>
                    </div>

                    {/* Risk badge */}
                    <span className={`text-[11px] px-2 py-1 rounded-lg font-medium text-center ${riskColor(st.drainage_surcharge_risk)}`}>
                      {st.drainage_surcharge_risk}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ── Charts row ── */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

            {/* Radar chart */}
            <div className="rounded-xl p-4"
                 style={{ backgroundColor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
              <h5 className="font-semibold text-slate-300 text-xs uppercase font-mono tracking-wider mb-0.5 flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-sky-400" />
                Contributing Factor Decomposition
              </h5>
              <p className="text-[11px] text-slate-500 mb-3">
                Normalised factor intensity (0–100) vs. Trichy urban median (50).
              </p>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={fingerprint.radar_metrics} outerRadius="72%">
                    <PolarGrid stroke="rgba(100,116,139,0.3)" />
                    <PolarAngleAxis
                      dataKey="dimension"
                      tick={{ fill: '#94a3b8', fontSize: 10 }}
                    />
                    <PolarRadiusAxis
                      angle={30}
                      domain={[0, 100]}
                      tick={{ fontSize: 9, fill: '#64748b' }}
                      axisLine={false}
                    />
                    <Radar
                      name="Subcatchment"
                      dataKey="value"
                      stroke="#0ea5e9"
                      fill="#0ea5e9"
                      fillOpacity={0.3}
                      strokeWidth={2}
                    />
                    <Radar
                      name="Trichy Median"
                      dataKey="baseline"
                      stroke="#64748b"
                      fill="#475569"
                      fillOpacity={0.08}
                      strokeDasharray="4 3"
                      strokeWidth={1.5}
                    />
                    <Tooltip content={<RadarTooltipContent />} />
                    <Legend
                      wrapperStyle={{ fontSize: '11px', color: '#94a3b8', paddingTop: '4px' }}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Bar chart: Ponding depth under drainage stress */}
            <div className="rounded-xl p-4"
                 style={{ backgroundColor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
              <h5 className="font-semibold text-slate-300 text-xs uppercase font-mono tracking-wider mb-0.5 flex items-center gap-1.5">
                <Droplets className="w-3.5 h-3.5 text-sky-400" />
                Ponding & Peak Runoff Under Drainage Stress
              </h5>
              <p className="text-[11px] text-slate-500 mb-3">
                Response as drainage capacity degrades from 100% → 25%.
              </p>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={barData} margin={{ top: 8, right: 8, left: -8, bottom: 0 }} barGap={4}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(100,116,139,0.15)" vertical={false} />
                    <XAxis dataKey="scenario" tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#1e293b',
                        border: '1px solid rgba(14,165,233,0.2)',
                        borderRadius: '8px',
                        fontSize: '12px',
                        color: '#e2e8f0',
                      }}
                    />
                    <Legend wrapperStyle={{ fontSize: '11px', color: '#94a3b8' }} />
                    <Bar dataKey="Ponding Depth (cm)" fill="#0ea5e9" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="Peak Runoff (m³/s)" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* ── GI Intervention benefit panel ── */}
          <div className="rounded-xl p-4"
               style={{ background: 'linear-gradient(135deg, rgba(16,185,129,0.06), rgba(14,165,233,0.06))', border: '1px solid rgba(16,185,129,0.2)' }}>
            <h5 className="font-semibold text-emerald-300 text-xs uppercase font-mono tracking-wider mb-3 flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-400" />
              Green Infrastructure Mitigation Capacity & Remaining Risk
            </h5>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                {
                  label: 'GI Allocation',
                  value: `${fingerprint.intervention_coverage_m2.toLocaleString()} m²`,
                  bar: statFill(fingerprint.intervention_coverage_m2, 10000),
                  color: 'bg-sky-500',
                },
                {
                  label: 'Volume Retained',
                  value: `${fingerprint.potential_volume_retention_m3.toLocaleString()} m³`,
                  bar: statFill(fingerprint.potential_volume_retention_m3, 15000),
                  color: 'bg-emerald-500',
                },
                {
                  label: 'Peak Attenuation',
                  value: `-${fingerprint.potential_peak_reduction_pct}%`,
                  bar: `${fingerprint.potential_peak_reduction_pct}%`,
                  color: 'bg-blue-400',
                },
                {
                  label: 'Residual Risk Index',
                  value: fingerprint.remaining_risk_score.toString(),
                  bar: statFill(fingerprint.remaining_risk_score, 1),
                  color: fingerprint.remaining_risk_score > 0.6 ? 'bg-red-500' : fingerprint.remaining_risk_score > 0.35 ? 'bg-amber-500' : 'bg-emerald-500',
                },
              ].map(({ label, value, bar, color }) => (
                <div key={label}
                     className="rounded-lg px-3 py-2.5"
                     style={{ backgroundColor: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                  <span className="text-[10px] text-slate-500 uppercase font-mono tracking-wider block mb-1">{label}</span>
                  <span className="text-sm font-bold text-white font-mono">{value}</span>
                  {/* progress bar */}
                  <div className="mt-2 h-1.5 rounded-full bg-slate-700/60 overflow-hidden">
                    <div className={`h-full rounded-full ${color} transition-all`} style={{ width: bar }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ── Scientific explanation ── */}
          <div className="rounded-xl p-4"
               style={{ backgroundColor: 'rgba(14,165,233,0.05)', borderLeft: '3px solid #0ea5e9', border: '1px solid rgba(14,165,233,0.15)' }}>
            <h5 className="font-bold text-slate-300 text-xs uppercase font-mono tracking-wider mb-2 flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5 text-sky-400" />
              Scientific Explainability Narrative
            </h5>
            <p className="text-xs leading-relaxed text-slate-400">
              {fingerprint.scientific_explanation}
            </p>
          </div>

          {/* ── Limitations note ── */}
          <div className="rounded-xl p-3 flex items-start gap-2.5"
               style={{ backgroundColor: 'rgba(245,158,11,0.07)', border: '1px solid rgba(245,158,11,0.2)' }}>
            <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
            <p className="text-[11px] leading-relaxed text-amber-200/80">
              {fingerprint.limitations_note}
            </p>
          </div>

        </div>

        {/* ════════════ FOOTER ════════════ */}
        <div
          className="px-6 py-3 border-t flex items-center justify-between flex-shrink-0"
          style={{ borderColor: 'rgba(14,165,233,0.15)', backgroundColor: 'rgba(0,0,0,0.3)' }}
        >
          <span className="text-[11px] font-mono text-slate-500 hidden sm:block">
            FloodScape AI · Fingerprint v2 · {fingerprint.subcatchment_code}
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-lg text-sm font-medium text-white transition-all hover:opacity-90 active:scale-95"
            style={{ background: 'linear-gradient(135deg, #0ea5e9, #0369a1)' }}
          >
            Close Fingerprint
          </button>
        </div>
      </div>
    </div>
  );
};
