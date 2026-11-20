import React from 'react';
import {
  Compass, Map as MapIcon, Layers, CloudRain, Cpu,
  ShieldCheck, Sliders, Database, ArrowRight, Activity, CheckCircle2
} from 'lucide-react';
import { StudyArea, Subcatchment, ResilienceFingerprint } from '../types';

interface OverviewDashboardProps {
  studyArea: StudyArea | null;
  subcatchments: Subcatchment[];
  setActiveTab: (tab: string) => void;
  onOpenFingerprint: (code: string) => void;
  engineName: string;
}

export const OverviewDashboard: React.FC<OverviewDashboardProps> = ({
  studyArea,
  subcatchments,
  setActiveTab,
  onOpenFingerprint,
  engineName
}) => {
  const highRiskCount = subcatchments.filter(s => s.susceptibility_score >= 0.65).length;
  const modRiskCount = subcatchments.filter(s => s.susceptibility_score >= 0.40 && s.susceptibility_score < 0.65).length;
  const lowRiskCount = subcatchments.filter(s => s.susceptibility_score < 0.40).length;

  return (
    <div className="space-y-6">
      
      {/* Title & Research Scope Banner */}
      <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-5">
          <div>
            <div className="flex items-center space-x-2 text-xs font-mono text-slate-500 mb-1">
              <span>RESEARCH WORKFLOW</span>
              <span>/</span>
              <span className="font-semibold text-slate-800">TIRUCHIRAPPALLI URBAN BASIN</span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              An Explainable, Rainfall-Adaptive Urban Flood Digital Twin
            </h1>
            <p className="text-sm text-slate-600 mt-1 max-w-4xl">
              For Intelligent Green Infrastructure Planning in Tiruchirappalli, Tamil Nadu, India.
              A scientific decision-support system integrating topography, radar rainfall scenarios, hydrodynamic drainage stress tests, and Pareto-optimal multi-objective optimization.
            </p>
          </div>

          <div className="flex md:flex-col items-end justify-between shrink-0 gap-2 font-mono text-xs">
            <span className="inline-flex items-center space-x-1.5 px-3 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded font-medium">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Digital Twin Online</span>
            </span>
            <span className="text-slate-500 text-[11px]">
              Engine: {engineName.includes('SWMM') ? 'EPA SWMM 5.2' : 'SCS-CN & 1D Surrogate'}
            </span>
          </div>
        </div>

        {/* 5-Stage Core Research Workflow Pill Track */}
        <div className="mt-5 pt-2">
          <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 block mb-2 font-semibold">
            Digital Twin Core Lifecycle
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs">
            <div className="bg-slate-50 border border-slate-200 rounded p-2.5">
              <span className="font-mono text-sky-700 font-bold block">01 / PREDICT</span>
              <span className="text-slate-700 text-[11px]">DEM & impervious runoff forecasting</span>
            </div>
            <div className="bg-slate-50 border border-slate-200 rounded p-2.5">
              <span className="font-mono text-sky-700 font-bold block">02 / EXPLAIN</span>
              <span className="text-slate-700 text-[11px]">Resilience Fingerprint & factor weighting</span>
            </div>
            <div className="bg-slate-50 border border-slate-200 rounded p-2.5">
              <span className="font-mono text-sky-700 font-bold block">03 / SIMULATE</span>
              <span className="text-slate-700 text-[11px]">100% to 25% drainage stress hydrodynamics</span>
            </div>
            <div className="bg-slate-50 border border-slate-200 rounded p-2.5">
              <span className="font-mono text-sky-700 font-bold block">04 / OPTIMISE</span>
              <span className="text-slate-700 text-[11px]">Budget-constrained NSGA-II Pareto search</span>
            </div>
            <div className="bg-slate-50 border border-slate-200 rounded p-2.5 col-span-2 sm:col-span-1">
              <span className="font-mono text-emerald-700 font-bold block">05 / PREVENT</span>
              <span className="text-slate-700 text-[11px]">Green Infrastructure site deployment</span>
            </div>
          </div>
        </div>
      </div>

      {/* Primary Key Metric Tiles */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm">
          <span className="text-xs text-slate-500 uppercase font-mono block">Study Area</span>
          <div className="mt-1 flex items-baseline justify-between">
            <span className="text-2xl font-bold text-slate-900 font-mono">167.2</span>
            <span className="text-xs text-slate-500 font-mono">km²</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">12 Hydrological Subcatchments</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm">
          <span className="text-xs text-slate-500 uppercase font-mono block">High Susceptibility</span>
          <div className="mt-1 flex items-baseline justify-between">
            <span className="text-2xl font-bold text-red-600 font-mono">{highRiskCount}</span>
            <span className="text-xs text-slate-500 font-mono">/ 12 units</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Score ≥ 0.65 (Thillai Nagar, Koraiyar)</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm">
          <span className="text-xs text-slate-500 uppercase font-mono block">Moderate Susceptibility</span>
          <div className="mt-1 flex items-baseline justify-between">
            <span className="text-2xl font-bold text-amber-600 font-mono">{modRiskCount}</span>
            <span className="text-xs text-slate-500 font-mono">/ 12 units</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Score between 0.40 – 0.64</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm">
          <span className="text-xs text-slate-500 uppercase font-mono block">Low Susceptibility</span>
          <div className="mt-1 flex items-baseline justify-between">
            <span className="text-2xl font-bold text-emerald-600 font-mono">{lowRiskCount}</span>
            <span className="text-xs text-slate-500 font-mono">/ 12 units</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Steeper / pervious eastern zones</p>
        </div>
      </div>

      {/* Featured Signature Component: Quick Fingerprint Access */}
      <div className="bg-slate-900 text-white rounded-lg p-6 shadow-sm">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 text-xs font-mono text-sky-400 mb-1">
              <Activity className="w-3.5 h-3.5" />
              <span>SIGNATURE RESEARCH FEATURE</span>
            </div>
            <h2 className="text-lg font-bold tracking-tight">
              Flood Resilience Fingerprint Diagnostics
            </h2>
            <p className="text-xs text-slate-300 mt-1 max-w-2xl">
              Select any Tiruchirappalli subcatchment to view its unique hydraulic fingerprint across 4 drainage stress tests (100%, 75%, 50%, 25% capacity), dominant factors, and natural language explainability.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => onOpenFingerprint('TR-02')}
              className="px-3 py-1.5 bg-sky-600 hover:bg-sky-500 text-white rounded text-xs font-mono font-medium transition-colors"
            >
              Inspect TR-02 (Thillai Nagar)
            </button>
            <button
              onClick={() => onOpenFingerprint('TR-09')}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded text-xs font-mono font-medium transition-colors"
            >
              Inspect TR-09 (Edamalaipatti Pudur)
            </button>
            <button
              onClick={() => onOpenFingerprint('TR-01')}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded text-xs font-mono font-medium transition-colors"
            >
              Inspect TR-01 (Srirangam)
            </button>
          </div>
        </div>
      </div>

      {/* Quick Navigation Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        <div
          onClick={() => setActiveTab('map')}
          className="bg-white border border-slate-200 hover:border-sky-500 rounded-lg p-5 shadow-sm cursor-pointer transition-all group"
        >
          <div className="w-9 h-9 bg-sky-50 text-sky-700 rounded-md flex items-center justify-center mb-3 group-hover:bg-sky-600 group-hover:text-white transition-colors">
            <MapIcon className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-slate-900 text-sm flex items-center justify-between">
            <span>Interactive GIS Flood Map</span>
            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-sky-600 transition-colors" />
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Leaflet GIS viewer with study boundary, drainage channels (Uyyakondan, Kudamurutti), historical flood marks, and candidate GI sites.
          </p>
        </div>

        <div
          onClick={() => setActiveTab('susceptibility')}
          className="bg-white border border-slate-200 hover:border-sky-500 rounded-lg p-5 shadow-sm cursor-pointer transition-all group"
        >
          <div className="w-9 h-9 bg-sky-50 text-sky-700 rounded-md flex items-center justify-center mb-3 group-hover:bg-sky-600 group-hover:text-white transition-colors">
            <Layers className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-slate-900 text-sm flex items-center justify-between">
            <span>Flood Susceptibility & Weights</span>
            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-sky-600 transition-colors" />
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Ranked subcatchments, multicriteria weights (Elevation, Slope, Flow Accumulation, Imperviousness, Soil), and radar decompositions.
          </p>
        </div>

        <div
          onClick={() => setActiveTab('rainfall')}
          className="bg-white border border-slate-200 hover:border-sky-500 rounded-lg p-5 shadow-sm cursor-pointer transition-all group"
        >
          <div className="w-9 h-9 bg-sky-50 text-sky-700 rounded-md flex items-center justify-center mb-3 group-hover:bg-sky-600 group-hover:text-white transition-colors">
            <CloudRain className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-slate-900 text-sm flex items-center justify-between">
            <span>Rainfall Stress Lab</span>
            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-sky-600 transition-colors" />
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            IMD & GPM-calibrated design storms (2-yr to 50-yr return periods) with hyetograph generation and custom storm profile editor.
          </p>
        </div>

        <div
          onClick={() => setActiveTab('simulation')}
          className="bg-white border border-slate-200 hover:border-sky-500 rounded-lg p-5 shadow-sm cursor-pointer transition-all group"
        >
          <div className="w-9 h-9 bg-sky-50 text-sky-700 rounded-md flex items-center justify-center mb-3 group-hover:bg-sky-600 group-hover:text-white transition-colors">
            <Cpu className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-slate-900 text-sm flex items-center justify-between">
            <span>Drainage Stress Simulation</span>
            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-sky-600 transition-colors" />
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Test 100%, 75%, 50%, and 25% drainage capacity throttling with dynamic hydrograph generation and surcharge node counts.
          </p>
        </div>

        <div
          onClick={() => setActiveTab('interventions')}
          className="bg-white border border-slate-200 hover:border-sky-500 rounded-lg p-5 shadow-sm cursor-pointer transition-all group"
        >
          <div className="w-9 h-9 bg-sky-50 text-sky-700 rounded-md flex items-center justify-center mb-3 group-hover:bg-sky-600 group-hover:text-white transition-colors">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-slate-900 text-sm flex items-center justify-between">
            <span>Green Infrastructure Planner</span>
            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-sky-600 transition-colors" />
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Deploy rain gardens, permeable pavement, bioswales, and retention storage across 12 candidate sites in Tiruchirappalli.
          </p>
        </div>

        <div
          onClick={() => setActiveTab('optimisation')}
          className="bg-white border border-slate-200 hover:border-sky-500 rounded-lg p-5 shadow-sm cursor-pointer transition-all group"
        >
          <div className="w-9 h-9 bg-sky-50 text-sky-700 rounded-md flex items-center justify-center mb-3 group-hover:bg-sky-600 group-hover:text-white transition-colors">
            <Sliders className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-slate-900 text-sm flex items-center justify-between">
            <span>NSGA-II Multi-Objective Lab</span>
            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-sky-600 transition-colors" />
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Budget-constrained genetic algorithm search generating 3D Pareto frontier balancing Cost, Peak Runoff, and Runoff Volume.
          </p>
        </div>

      </div>

      {/* Subcatchment Quick Reference Table */}
      <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-bold text-slate-900 text-sm">
            Tiruchirappalli Subcatchments Baseline Overview (12 Delineated Basins)
          </h3>
          <button
            onClick={() => setActiveTab('susceptibility')}
            className="text-xs text-sky-700 hover:underline font-mono"
          >
            Adjust Multicriteria Weights →
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-100 text-slate-700 font-mono border-b border-slate-200">
                <th className="py-2 px-3">Code</th>
                <th className="py-2 px-3">Subcatchment Name</th>
                <th className="py-2 px-3">Area (ha)</th>
                <th className="py-2 px-3">Elevation</th>
                <th className="py-2 px-3">Slope</th>
                <th className="py-2 px-3">Impervious %</th>
                <th className="py-2 px-3">Susceptibility Score</th>
                <th className="py-2 px-3">Category</th>
                <th className="py-2 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono">
              {subcatchments.map((sub) => (
                <tr key={sub.code} className="hover:bg-slate-50">
                  <td className="py-2 px-3 font-bold text-slate-900">{sub.code}</td>
                  <td className="py-2 px-3 font-sans font-medium text-slate-800">{sub.name}</td>
                  <td className="py-2 px-3">{sub.area_ha}</td>
                  <td className="py-2 px-3">{sub.elevation_m} m</td>
                  <td className="py-2 px-3">{sub.slope_pct}%</td>
                  <td className="py-2 px-3">{sub.impervious_pct}%</td>
                  <td className="py-2 px-3 font-bold">{sub.susceptibility_score}</td>
                  <td className="py-2 px-3 font-sans">
                    <span className={`px-2 py-0.5 rounded text-[11px] font-semibold border ${
                      sub.susceptibility_score >= 0.65
                        ? 'bg-red-50 text-red-700 border-red-200'
                        : sub.susceptibility_score >= 0.40
                        ? 'bg-amber-50 text-amber-700 border-amber-200'
                        : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    }`}>
                      {sub.susceptibility_score >= 0.65 ? 'High' : sub.susceptibility_score >= 0.40 ? 'Moderate' : 'Low'}
                    </span>
                  </td>
                  <td className="py-2 px-3 text-right font-sans">
                    <button
                      onClick={() => onOpenFingerprint(sub.code)}
                      className="px-2 py-1 text-[11px] bg-slate-100 hover:bg-slate-900 hover:text-white rounded font-medium transition-colors"
                    >
                      Fingerprint
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
