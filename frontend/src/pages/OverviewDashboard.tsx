import React from 'react';
import {
  Map as MapIcon, Layers, CloudRain, Cpu,
  ShieldCheck, Sliders, Database, ArrowRight,
  Activity, Droplets, AlertTriangle, TrendingUp,
  Fingerprint, ChevronRight, Globe, Zap
} from 'lucide-react';
import { StudyArea, Subcatchment } from '../types';

interface OverviewDashboardProps {
  studyArea: StudyArea | null;
  subcatchments: Subcatchment[];
  setActiveTab: (tab: string) => void;
  onOpenFingerprint: (code: string) => void;
  engineName: string;
}

const PIPELINE_STAGES = [
  { step: '01', label: 'PREDICT', desc: 'DEM & Soil Runoff', color: 'from-sky-600 to-sky-700' },
  { step: '02', label: 'EXPLAIN', desc: 'Resilience Index', color: 'from-indigo-600 to-indigo-700' },
  { step: '03', label: 'SIMULATE', desc: 'Stress Hydro', color: 'from-violet-600 to-violet-700' },
  { step: '04', label: 'OPTIMISE', desc: 'NSGA-II Pareto', color: 'from-purple-600 to-purple-700' },
  { step: '05', label: 'PREVENT', desc: 'GI Deployment', color: 'from-emerald-600 to-emerald-700' },
];

const NAV_CARDS = [
  {
    tab: 'map', icon: MapIcon, label: 'Interactive GIS Map', iconBg: 'bg-sky-100', iconColor: 'text-sky-700',
    desc: 'Leaflet GIS viewer with study boundary, drainage channels, historical flood marks, and candidate GI sites.'
  },
  {
    tab: 'susceptibility', icon: Layers, label: 'Susceptibility Index', iconBg: 'bg-indigo-100', iconColor: 'text-indigo-700',
    desc: 'Multicriteria weights (Elevation, Slope, Flow Accum, Imperviousness, Soil) with radar decompositions.'
  },
  {
    tab: 'rainfall', icon: CloudRain, label: 'Rainfall Stress Lab', iconBg: 'bg-blue-100', iconColor: 'text-blue-700',
    desc: 'IMD & GPM-calibrated design storms (2-yr to 25-yr return periods) with hyetograph generation and custom editor.'
  },
  {
    tab: 'simulation', icon: Cpu, label: 'Simulation Engine', iconBg: 'bg-violet-100', iconColor: 'text-violet-700',
    desc: 'Test 100%–25% drainage capacity throttling with dynamic hydrograph and surcharge node counts.'
  },
  {
    tab: 'interventions', icon: ShieldCheck, label: 'GI Planner', iconBg: 'bg-emerald-100', iconColor: 'text-emerald-700',
    desc: 'Deploy rain gardens, permeable pavement, bioswales & retention storage across 12 candidate sites.'
  },
  {
    tab: 'optimisation', icon: Sliders, label: 'NSGA-II Lab', iconBg: 'bg-amber-100', iconColor: 'text-amber-700',
    desc: 'Budget-constrained genetic algorithm generating 3D Pareto frontier — Cost vs. Peak Runoff vs. Volume.'
  },
];

export const OverviewDashboard: React.FC<OverviewDashboardProps> = ({
  studyArea,
  subcatchments,
  setActiveTab,
  onOpenFingerprint,
  engineName,
}) => {
  const highRiskCount = subcatchments.filter(s => s.susceptibility_score >= 0.65).length;
  const modRiskCount  = subcatchments.filter(s => s.susceptibility_score >= 0.40 && s.susceptibility_score < 0.65).length;
  const lowRiskCount  = subcatchments.filter(s => s.susceptibility_score < 0.40).length;
  const totalArea     = studyArea?.total_area_sqkm ?? 167.2;

  return (
    <div className="space-y-6">

      {/* ── Hero Banner ─────────────────────────────────────────── */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 to-sky-900 text-white shadow-xl">
        {/* subtle grid overlay */}
        <div
          className="absolute inset-0 opacity-10"
          style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,.08) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.08) 1px,transparent 1px)', backgroundSize: '40px 40px' }}
        />

        <div className="relative z-10 p-8">
          {/* breadcrumb */}
          <div className="flex items-center gap-2 text-xs font-mono text-sky-300 mb-2">
            <Globe className="w-3.5 h-3.5" />
            <span>TIRUCHIRAPPALLI URBAN BASIN</span>
            <ChevronRight className="w-3 h-3 opacity-60" />
            <span className="text-white font-semibold">FLOOD DIGITAL TWIN</span>
          </div>

          <h1 className="text-3xl font-extrabold tracking-tight mb-1">
            FloodScape <span className="text-sky-400">AI</span>
          </h1>
          <p className="text-sm text-slate-300 max-w-2xl leading-relaxed">
            An Explainable, Rainfall-Adaptive Urban Flood Digital Twin for Intelligent Green Infrastructure Planning in
            Tiruchirappalli, Tamil Nadu, India.
          </p>

          {/* engine badge */}
          <div className="mt-3 inline-flex items-center gap-1.5 bg-white/10 border border-white/20 rounded-full px-3 py-1 text-xs font-mono text-sky-200">
            <Zap className="w-3 h-3 text-yellow-400" />
            Engine: {engineName.includes('SWMM') ? 'EPA SWMM 5.2' : 'SCS-CN & 1D Saint-Venant Surrogate'}
          </div>

          {/* Pipeline arrow steps */}
          <div className="mt-7 flex flex-wrap gap-1 items-center">
            {PIPELINE_STAGES.map((stage, i) => (
              <React.Fragment key={stage.step}>
                <div className={`bg-gradient-to-b ${stage.color} rounded-lg px-4 py-2.5 shadow-md min-w-[100px]`}>
                  <span className="block text-[10px] font-mono text-white/70">{stage.step}</span>
                  <span className="block text-sm font-bold text-white leading-tight">{stage.label}</span>
                  <span className="block text-[11px] text-white/80">{stage.desc}</span>
                </div>
                {i < PIPELINE_STAGES.length - 1 && (
                  <ArrowRight className="w-5 h-5 text-white/40 shrink-0" />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>

      {/* ── Stat Cards ──────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {/* Study Area */}
        <div className="relative overflow-hidden bg-white rounded-xl border border-slate-200 shadow-sm p-5 border-l-4 border-l-sky-500">
          <div className="flex items-center gap-2 text-xs font-mono text-slate-500 uppercase mb-1">
            <Globe className="w-3.5 h-3.5" /> Study Area
          </div>
          <div className="text-4xl font-black text-slate-900 font-mono tracking-tight">{totalArea}</div>
          <div className="text-xs text-slate-500 font-mono mt-0.5">km² · 12 Subcatchments</div>
          <div className="text-[11px] text-slate-400 mt-1">Cauvery Delta Basin</div>
          <TrendingUp className="absolute right-4 bottom-4 w-8 h-8 text-sky-100" />
        </div>

        {/* High Risk */}
        <div className="relative overflow-hidden bg-red-50 rounded-xl border border-red-200 shadow-sm p-5 border-l-4 border-l-red-500">
          <div className="flex items-center gap-2 text-xs font-mono text-red-600 uppercase mb-1">
            <AlertTriangle className="w-3.5 h-3.5" /> High Risk
          </div>
          <div className="text-4xl font-black text-red-700 font-mono tracking-tight">{highRiskCount}</div>
          <div className="text-xs text-red-600 font-mono mt-0.5">/ 12 subcatchments</div>
          <div className="text-[11px] text-red-400 mt-1">Score ≥ 0.65</div>
          <AlertTriangle className="absolute right-4 bottom-4 w-8 h-8 text-red-100" />
        </div>

        {/* Moderate Risk */}
        <div className="relative overflow-hidden bg-amber-50 rounded-xl border border-amber-200 shadow-sm p-5 border-l-4 border-l-amber-500">
          <div className="flex items-center gap-2 text-xs font-mono text-amber-700 uppercase mb-1">
            <Activity className="w-3.5 h-3.5" /> Moderate
          </div>
          <div className="text-4xl font-black text-amber-700 font-mono tracking-tight">{modRiskCount}</div>
          <div className="text-xs text-amber-600 font-mono mt-0.5">/ 12 subcatchments</div>
          <div className="text-[11px] text-amber-400 mt-1">Score 0.40 – 0.64</div>
          <Activity className="absolute right-4 bottom-4 w-8 h-8 text-amber-100" />
        </div>

        {/* Low Risk */}
        <div className="relative overflow-hidden bg-emerald-50 rounded-xl border border-emerald-200 shadow-sm p-5 border-l-4 border-l-emerald-500">
          <div className="flex items-center gap-2 text-xs font-mono text-emerald-700 uppercase mb-1">
            <ShieldCheck className="w-3.5 h-3.5" /> Low Risk
          </div>
          <div className="text-4xl font-black text-emerald-700 font-mono tracking-tight">{lowRiskCount}</div>
          <div className="text-xs text-emerald-600 font-mono mt-0.5">/ 12 subcatchments</div>
          <div className="text-[11px] text-emerald-400 mt-1">Steeper eastern zones</div>
          <ShieldCheck className="absolute right-4 bottom-4 w-8 h-8 text-emerald-100" />
        </div>
      </div>

      {/* ── Flood Resilience Fingerprint Panel ──────────────────── */}
      <div className="bg-slate-900 rounded-2xl p-7 shadow-xl border border-slate-800">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-sky-400 mb-2">
              <Fingerprint className="w-3.5 h-3.5" />
              <span>SIGNATURE RESEARCH FEATURE</span>
            </div>
            <h2 className="text-xl font-bold text-white tracking-tight">
              Flood Resilience Fingerprint Diagnostics
            </h2>
            <p className="text-xs text-slate-400 mt-1.5 max-w-2xl leading-relaxed">
              Select any Tiruchirappalli subcatchment to view its unique hydraulic fingerprint across 4 drainage stress
              tests (100%, 75%, 50%, 25% capacity), dominant risk factors, and natural-language explainability radar.
            </p>
          </div>

          <div className="flex flex-wrap gap-2 shrink-0">
            <button
              onClick={() => onOpenFingerprint('TR-02')}
              className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-lg text-xs font-mono font-semibold transition-colors shadow"
            >
              TR-02 Thillai Nagar
            </button>
            <button
              onClick={() => onOpenFingerprint('TR-09')}
              className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-200 border border-slate-600 rounded-lg text-xs font-mono font-semibold transition-colors"
            >
              TR-09 Edamalaipatti
            </button>
            <button
              onClick={() => onOpenFingerprint('TR-01')}
              className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-200 border border-slate-600 rounded-lg text-xs font-mono font-semibold transition-colors"
            >
              TR-01 Srirangam
            </button>
          </div>
        </div>

        {/* mini metric strip */}
        <div className="mt-5 grid grid-cols-3 gap-3">
          {[
            { label: 'Stress Tests', value: '4 scenarios' },
            { label: 'Risk Dimensions', value: '5 factors' },
            { label: 'Basins Covered', value: '12 units' },
          ].map(m => (
            <div key={m.label} className="bg-slate-800 rounded-lg px-4 py-3">
              <div className="text-[10px] font-mono text-slate-500 uppercase mb-0.5">{m.label}</div>
              <div className="text-sm font-bold text-sky-300 font-mono">{m.value}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Navigation Cards ─────────────────────────────────────── */}
      <div>
        <h3 className="text-xs font-mono uppercase tracking-widest text-slate-500 mb-3 font-semibold">
          Module Navigation
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {NAV_CARDS.map(card => {
            const Icon = card.icon;
            return (
              <div
                key={card.tab}
                onClick={() => setActiveTab(card.tab)}
                className="bg-white border border-slate-200 hover:border-sky-500 hover:shadow-md rounded-xl p-5 cursor-pointer transition-all group"
              >
                <div className={`w-10 h-10 ${card.iconBg} ${card.iconColor} rounded-lg flex items-center justify-center mb-3 group-hover:bg-sky-600 group-hover:text-white transition-colors`}>
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-slate-900 text-sm flex items-center justify-between mb-1">
                  <span>{card.label}</span>
                  <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-sky-600 group-hover:translate-x-0.5 transition-all" />
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">{card.desc}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Subcatchments Table ──────────────────────────────────── */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Database className="w-4 h-4 text-slate-500" />
            <h3 className="font-bold text-slate-900 text-sm">
              Tiruchirappalli Subcatchments — Baseline Overview
            </h3>
            <span className="text-xs text-slate-400 font-mono">(12 basins)</span>
          </div>
          <button
            onClick={() => setActiveTab('susceptibility')}
            className="text-xs text-sky-700 hover:underline font-mono"
          >
            Adjust Weights →
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-600 font-mono border-b border-slate-200">
                <th className="py-3 px-4">Code</th>
                <th className="py-3 px-4">Subcatchment</th>
                <th className="py-3 px-4">Area (ha)</th>
                <th className="py-3 px-4">Elev (m)</th>
                <th className="py-3 px-4">Slope %</th>
                <th className="py-3 px-4">Imperv %</th>
                <th className="py-3 px-4">Score</th>
                <th className="py-3 px-4">Risk</th>
                <th className="py-3 px-4 text-right">Fingerprint</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {subcatchments.map(sub => {
                const isHigh = sub.susceptibility_score >= 0.65;
                const isMod  = sub.susceptibility_score >= 0.40 && sub.susceptibility_score < 0.65;
                const rowBg  = isHigh ? 'bg-red-50/40' : isMod ? 'bg-amber-50/30' : '';
                return (
                  <tr key={sub.code} className={`${rowBg} hover:bg-sky-50/40 transition-colors`}>
                    <td className="py-2.5 px-4 font-bold font-mono text-slate-800">{sub.code}</td>
                    <td className="py-2.5 px-4 font-medium text-slate-700">{sub.name}</td>
                    <td className="py-2.5 px-4 font-mono text-slate-600">{sub.area_ha}</td>
                    <td className="py-2.5 px-4 font-mono text-slate-600">{sub.elevation_m}</td>
                    <td className="py-2.5 px-4 font-mono text-slate-600">{sub.slope_pct}</td>
                    <td className="py-2.5 px-4 font-mono text-slate-600">{sub.impervious_pct}%</td>
                    <td className="py-2.5 px-4 font-mono font-bold text-slate-900">{sub.susceptibility_score.toFixed(2)}</td>
                    <td className="py-2.5 px-4">
                      <span className={`px-2.5 py-1 rounded-full text-[11px] font-semibold ${
                        isHigh ? 'bg-red-100 text-red-700'
                        : isMod ? 'bg-amber-100 text-amber-700'
                        : 'bg-emerald-100 text-emerald-700'
                      }`}>
                        {isHigh ? 'High' : isMod ? 'Moderate' : 'Low'}
                      </span>
                    </td>
                    <td className="py-2.5 px-4 text-right">
                      <button
                        onClick={() => onOpenFingerprint(sub.code)}
                        className="inline-flex items-center gap-1 px-3 py-1 bg-slate-100 hover:bg-slate-900 hover:text-white text-slate-700 rounded-lg text-[11px] font-semibold transition-colors"
                      >
                        <Fingerprint className="w-3 h-3" />
                        View
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
