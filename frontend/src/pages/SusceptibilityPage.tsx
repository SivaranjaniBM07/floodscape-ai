import React, { useState } from 'react';
import { Subcatchment } from '../types';
import { recalculateSusceptibility } from '../api';
import { MOCK_SUBCATCHMENTS } from '../mockData';
import {
  Layers, Sliders, AlertTriangle, Info, Check, RefreshCw,
  Fingerprint, TrendingDown, ArrowUpDown
} from 'lucide-react';

interface SusceptibilityPageProps {
  subcatchments: Subcatchment[];
  onOpenFingerprint: (code: string) => void;
  onUpdateSubcatchments: (updated: Subcatchment[]) => void;
}

const FACTOR_INFO = [
  {
    key: 'Elevation',
    color: 'bg-sky-500',
    lightColor: 'bg-sky-100',
    textColor: 'text-sky-700',
    desc: 'Low-lying terrain accumulates surface water during high-stage events. Delta flats with elevation < 72 m are most vulnerable to waterlogging from Cauvery backwater.'
  },
  {
    key: 'Slope',
    color: 'bg-indigo-500',
    lightColor: 'bg-indigo-100',
    textColor: 'text-indigo-700',
    desc: 'Flat gradients (< 0.5%) retard gravitational drainage, causing pooling. Steep slopes (> 2%) drive rapid concentration but resist sustained ponding.'
  },
  {
    key: 'Flow Accum.',
    color: 'bg-violet-500',
    lightColor: 'bg-violet-100',
    textColor: 'text-violet-700',
    desc: 'DEM-derived upstream contributing cells. High accumulation indicates natural drainage convergence points — hydrologically critical nodes for trunk channel capacity.'
  },
  {
    key: 'Imperviousness',
    color: 'bg-amber-500',
    lightColor: 'bg-amber-100',
    textColor: 'text-amber-700',
    desc: 'Percentage of built-up / concrete-sealed surface. Impervious cover > 70% dramatically reduces infiltration and amplifies surface runoff during monsoonal bursts.'
  },
  {
    key: 'Soil Class',
    color: 'bg-rose-500',
    lightColor: 'bg-rose-100',
    textColor: 'text-rose-700',
    desc: 'Hydrologic Soil Group (A–D). Black Cotton Clay (HSG-D) and Clay Loam (HSG-C) have low permeability and poor internal drainage, increasing storm runoff generation.'
  },
];

export const SusceptibilityPage: React.FC<SusceptibilityPageProps> = ({
  subcatchments,
  onOpenFingerprint,
  onUpdateSubcatchments,
}) => {
  const [wElevation, setWElevation]   = useState(0.20);
  const [wSlope, setWSlope]           = useState(0.20);
  const [wFlow, setWFlow]             = useState(0.25);
  const [wImpervious, setWImpervious] = useState(0.20);
  const [wSoil, setWSoil]             = useState(0.15);
  const [loading, setLoading]         = useState(false);
  const [recalcMsg, setRecalcMsg]     = useState<string | null>(null);
  const [errorMsg, setErrorMsg]       = useState<string | null>(null);

  const totalWeight   = Math.round((wElevation + wSlope + wFlow + wImpervious + wSoil) * 100) / 100;
  const isWeightValid = Math.abs(totalWeight - 1.0) < 0.01;

  const handleRecalculate = async () => {
    if (!isWeightValid) return;
    setLoading(true);
    setRecalcMsg(null);
    setErrorMsg(null);
    try {
      const res = await recalculateSusceptibility({
        weight_elevation: wElevation,
        weight_slope: wSlope,
        weight_flow_accum: wFlow,
        weight_impervious: wImpervious,
        weight_soil: wSoil,
      });
      const updated = subcatchments.map(s => {
        const found = res.subcatchments?.find((item: any) => item.code === s.code);
        if (found) return { ...s, susceptibility_score: found.normalized_score, dominant_factor: found.dominant_factor };
        return s;
      });
      updated.sort((a, b) => b.susceptibility_score - a.susceptibility_score);
      onUpdateSubcatchments(updated);
      setRecalcMsg(`Updated 12 subcatchments — High: ${res.high_risk_count}, Moderate: ${res.moderate_risk_count}, Low: ${res.low_risk_count}.`);
    } catch {
      // Fallback: sort mock data
      const fallback = [...MOCK_SUBCATCHMENTS].sort((a, b) => b.susceptibility_score - a.susceptibility_score);
      onUpdateSubcatchments(fallback);
      setErrorMsg('API unavailable — showing locally sorted mock data as fallback.');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setWElevation(0.20); setWSlope(0.20); setWFlow(0.25);
    setWImpervious(0.20); setWSoil(0.15);
    setRecalcMsg(null); setErrorMsg(null);
  };

  const sliders = [
    { label: 'Elevation', value: wElevation, setter: setWElevation, colorClass: 'accent-sky-600' },
    { label: 'Slope',     value: wSlope,     setter: setWSlope,     colorClass: 'accent-indigo-600' },
    { label: 'Flow Accum', value: wFlow,     setter: setWFlow,      colorClass: 'accent-violet-600' },
    { label: 'Impervious', value: wImpervious, setter: setWImpervious, colorClass: 'accent-amber-600' },
    { label: 'Soil',      value: wSoil,      setter: setWSoil,      colorClass: 'accent-rose-600' },
  ];

  const sortedList = [...subcatchments].sort((a, b) => b.susceptibility_score - a.susceptibility_score);

  return (
    <div className="space-y-6">

      {/* ── Header ──────────────────────────────────────────────── */}
      <div className="bg-gradient-to-r from-slate-900 to-indigo-900 rounded-2xl p-7 shadow-xl text-white">
        <div className="flex items-center gap-2 text-xs font-mono text-indigo-300 mb-2">
          <Layers className="w-3.5 h-3.5" />
          <span>MULTICRITERIA EVALUATION / LINEAR UTILITY NORMALIZATION</span>
        </div>
        <h1 className="text-2xl font-bold tracking-tight mb-1">
          Flood Susceptibility Index &amp; Explainability Engine
        </h1>
        <p className="text-sm text-slate-300 max-w-3xl leading-relaxed">
          Transparent, weight-adjustable multicriteria scoring across 5 physical determinants.
          Adjust weights, recalculate scores, and inspect individual Flood Resilience Fingerprints.
        </p>
        <div className="mt-3 inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-1.5 text-xs font-mono text-indigo-200">
          <span>S = ∑ (wᵢ · Norm(Fᵢ))</span>
          <span className="text-white/40">|</span>
          <span>5 factors · 12 subcatchments</span>
        </div>
      </div>

      {/* ── Weight Sliders Panel ─────────────────────────────────── */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-5">
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-indigo-600" />
            <h3 className="font-bold text-slate-900 text-sm">Factor Weights (must sum = 1.00)</h3>
          </div>
          <div className="flex items-center gap-4 text-xs font-mono">
            <span>
              Total:{' '}
              <strong className={isWeightValid ? 'text-emerald-700' : 'text-red-600'}>
                {totalWeight.toFixed(2)}
              </strong>
              {' '}/ 1.00
            </span>
            <button onClick={handleReset} className="text-slate-500 hover:text-slate-800 underline font-sans text-xs">
              Reset
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-5 gap-4">
          {sliders.map(sl => (
            <div key={sl.label} className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2">
              <div className="flex justify-between items-center text-xs font-mono">
                <span className="font-semibold text-slate-700">{sl.label}</span>
                <span className="text-slate-900 font-bold bg-white border border-slate-200 rounded px-1.5 py-0.5">
                  {sl.value.toFixed(2)}
                </span>
              </div>
              <input
                type="range" min="0.0" max="0.5" step="0.05"
                value={sl.value}
                onChange={e => sl.setter(parseFloat(e.target.value))}
                className={`w-full ${sl.colorClass} cursor-pointer`}
              />
              {/* visual weight bar */}
              <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-indigo-500 to-sky-500 rounded-full transition-all"
                  style={{ width: `${(sl.value / 0.5) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>

        {/* weight balance bar */}
        <div className="mt-5 flex items-center gap-3">
          <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden flex">
            {sliders.map((sl, i) => {
              const colors = ['bg-sky-500', 'bg-indigo-500', 'bg-violet-500', 'bg-amber-500', 'bg-rose-500'];
              return (
                <div
                  key={sl.label}
                  className={`${colors[i]} transition-all`}
                  style={{ width: `${(sl.value / Math.max(totalWeight, 0.01)) * 100}%` }}
                />
              );
            })}
          </div>
          <span className={`text-xs font-mono font-bold ${isWeightValid ? 'text-emerald-700' : 'text-red-600'}`}>
            {totalWeight.toFixed(2)}
          </span>
        </div>

        <div className="flex items-center justify-between pt-4 mt-2">
          <div className="text-xs">
            {recalcMsg && (
              <span className="flex items-center gap-1 text-emerald-700 font-medium">
                <Check className="w-3.5 h-3.5" /> {recalcMsg}
              </span>
            )}
            {errorMsg && (
              <span className="flex items-center gap-1 text-amber-700 font-medium">
                <AlertTriangle className="w-3.5 h-3.5" /> {errorMsg}
              </span>
            )}
          </div>
          <button
            onClick={handleRecalculate}
            disabled={!isWeightValid || loading}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-xs font-semibold transition-colors shadow-sm ${
              isWeightValid && !loading
                ? 'bg-indigo-600 hover:bg-indigo-700 text-white'
                : 'bg-slate-200 text-slate-400 cursor-not-allowed'
            }`}
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            {loading ? 'Recalculating...' : 'Recalculate Susceptibility'}
          </button>
        </div>
      </div>

      {/* ── Ranked Table ─────────────────────────────────────────── */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <ArrowUpDown className="w-4 h-4 text-slate-500" />
            <h3 className="font-bold text-slate-900 text-sm">Ranked Subcatchment Susceptibility</h3>
            <span className="text-xs text-slate-400 font-mono">(12 basins, descending)</span>
          </div>
          <TrendingDown className="w-4 h-4 text-slate-400" />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-600 font-mono border-b border-slate-200">
                <th className="py-3 px-4">#</th>
                <th className="py-3 px-4">Code</th>
                <th className="py-3 px-4">Subcatchment</th>
                <th className="py-3 px-4 min-w-[160px]">Score (bar)</th>
                <th className="py-3 px-4">Elev (m)</th>
                <th className="py-3 px-4">Imperv %</th>
                <th className="py-3 px-4 min-w-[200px]">Factor Bars</th>
                <th className="py-3 px-4">Dominant Factor</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {sortedList.map((sub, idx) => {
                const isHigh = sub.susceptibility_score >= 0.65;
                const isMod  = sub.susceptibility_score >= 0.40;
                const scoreColor = isHigh ? 'bg-red-500' : isMod ? 'bg-amber-500' : 'bg-emerald-500';
                const badgeColor = isHigh
                  ? 'bg-red-100 text-red-700'
                  : isMod
                  ? 'bg-amber-100 text-amber-700'
                  : 'bg-emerald-100 text-emerald-700';

                // normalize factor values to 0-1 scale for display bars
                const elevNorm  = Math.max(0, (80 - sub.elevation_m) / 20);       // lower = more risky
                const impNorm   = sub.impervious_pct / 100;
                const flowNorm  = Math.min(sub.flow_accumulation / 70000, 1);
                const slopeNorm = Math.max(0, 1 - sub.slope_pct / 5);
                const soilNorm  = Math.max(0, 1 - sub.hydraulic_conductivity_mmhr / 32);

                return (
                  <tr key={sub.code} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-4 font-bold text-slate-400 font-mono">#{idx + 1}</td>
                    <td className="py-3 px-4 font-bold text-slate-800 font-mono">{sub.code}</td>
                    <td className="py-3 px-4 font-medium text-slate-700">{sub.name}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-3 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className={`${scoreColor} h-full rounded-full transition-all`}
                            style={{ width: `${sub.susceptibility_score * 100}%` }}
                          />
                        </div>
                        <span className={`text-[11px] font-bold font-mono px-2 py-0.5 rounded-full ${badgeColor}`}>
                          {sub.susceptibility_score.toFixed(2)}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-600">{sub.elevation_m}</td>
                    <td className="py-3 px-4 font-mono text-slate-600">{sub.impervious_pct}%</td>
                    <td className="py-3 px-4">
                      <div className="flex flex-col gap-1">
                        {[
                          { label: 'Elev', val: elevNorm, color: 'bg-sky-400' },
                          { label: 'Imperv', val: impNorm, color: 'bg-amber-400' },
                          { label: 'Flow', val: flowNorm, color: 'bg-violet-400' },
                          { label: 'Slope', val: slopeNorm, color: 'bg-indigo-400' },
                          { label: 'Soil', val: soilNorm, color: 'bg-rose-400' },
                        ].map(fb => (
                          <div key={fb.label} className="flex items-center gap-1.5">
                            <span className="text-[9px] font-mono text-slate-400 w-10">{fb.label}</span>
                            <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                              <div className={`${fb.color} h-full rounded-full`} style={{ width: `${fb.val * 100}%` }} />
                            </div>
                          </div>
                        ))}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-slate-600">
                      <span className="inline-block bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-[11px]">
                        {sub.dominant_factor}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => onOpenFingerprint(sub.code)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-indigo-50 text-indigo-700 hover:bg-indigo-600 hover:text-white rounded-lg text-[11px] font-semibold transition-colors border border-indigo-200"
                      >
                        <Fingerprint className="w-3 h-3" />
                        Fingerprint
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Explanation Panel ────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-5">
          <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-100">
            <Info className="w-4 h-4 text-indigo-600" />
            <h3 className="font-bold text-slate-900 text-sm">Factor Explanations</h3>
          </div>
          <div className="space-y-3">
            {FACTOR_INFO.map(f => (
              <div key={f.key} className="flex gap-3">
                <div className={`mt-0.5 w-2 h-2 rounded-full ${f.color} shrink-0`} />
                <div>
                  <span className={`text-xs font-bold ${f.textColor}`}>{f.key}</span>
                  <p className="text-[11px] text-slate-500 leading-relaxed mt-0.5">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5">
            <h4 className="font-bold text-slate-900 text-sm mb-3">Index Computation</h4>
            <div className="bg-white border border-slate-200 rounded-lg p-3 font-mono text-xs text-slate-800 space-y-1">
              <div>S = w₁·Norm(Elevation) + w₂·Norm(Slope)</div>
              <div className="pl-4">+ w₃·Norm(FlowAccum) + w₄·Norm(Impervious)</div>
              <div className="pl-4">+ w₅·Norm(SoilClass)</div>
              <div className="mt-2 text-slate-500">Norm(x) = (x − xₘᵢₙ) / (xₘₐₓ − xₘᵢₙ)</div>
            </div>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 flex items-start gap-3 text-xs text-amber-900">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-amber-950 font-mono uppercase text-[11px] mb-1">
                Limitations Disclaimer
              </h4>
              <p className="leading-relaxed">
                The Flood Susceptibility Index is an{' '}
                <strong>uncalibrated multicriteria decision tool</strong> for comparative spatial ranking only.
                It does <em>not</em> represent a stochastic flood return period probability. Hydraulic inundation depths
                require calibrated SWMM or gauge validation.
              </p>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};
