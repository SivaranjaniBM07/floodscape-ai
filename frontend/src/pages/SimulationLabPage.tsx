import React, { useState } from 'react';
import { RainfallScenario, SimulationResult, ProposedInterventionItem } from '../types';
import { runSimulation } from '../api';
import { MOCK_SIMULATION_RESULT } from '../mockData';
import {
  Cpu, Play, AlertTriangle, TrendingDown, Droplets, Layers,
  CheckCircle2, XCircle, Loader2, BarChart2, Activity, DollarSign, Zap
} from 'lucide-react';
import {
  ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  Legend, ResponsiveContainer, ReferenceLine
} from 'recharts';

interface SimulationLabPageProps {
  scenarios: RainfallScenario[];
  activeInterventions: ProposedInterventionItem[];
}

const DRAINAGE_STRESS_OPTIONS = [
  {
    pct: 100,
    label: 'Normal',
    color: 'green',
    description: 'Full design capacity — baseline conditions',
    bgActive: 'bg-emerald-600 border-emerald-600 text-white',
    bgInactive: 'bg-white border-slate-200 text-slate-700 hover:bg-emerald-50 hover:border-emerald-300',
    badge: 'bg-emerald-100 text-emerald-800',
  },
  {
    pct: 75,
    label: 'Mild Stress',
    color: 'amber',
    description: 'Partial blockage or seasonal sediment buildup',
    bgActive: 'bg-amber-500 border-amber-500 text-white',
    bgInactive: 'bg-white border-slate-200 text-slate-700 hover:bg-amber-50 hover:border-amber-300',
    badge: 'bg-amber-100 text-amber-800',
  },
  {
    pct: 50,
    label: 'Severe Stress',
    color: 'orange',
    description: 'Heavy silting — common monsoonal condition',
    bgActive: 'bg-orange-500 border-orange-500 text-white',
    bgInactive: 'bg-white border-slate-200 text-slate-700 hover:bg-orange-50 hover:border-orange-300',
    badge: 'bg-orange-100 text-orange-800',
  },
  {
    pct: 25,
    label: 'Critical',
    color: 'red',
    description: 'Near-collapse — Cauvery backwater scenario',
    bgActive: 'bg-red-600 border-red-600 text-white',
    bgInactive: 'bg-white border-slate-200 text-slate-700 hover:bg-red-50 hover:border-red-300',
    badge: 'bg-red-100 text-red-800',
  },
];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-slate-900 border border-slate-700 rounded-lg p-3 shadow-xl text-xs">
      <p className="font-mono font-bold text-slate-300 mb-2">t = {label} min</p>
      {payload.map((p: any, i: number) => (
        <p key={i} style={{ color: p.color }} className="font-mono">
          {p.name}: <strong>{typeof p.value === 'number' ? p.value.toFixed(3) : p.value}</strong> {p.unit}
        </p>
      ))}
    </div>
  );
};

export const SimulationLabPage: React.FC<SimulationLabPageProps> = ({
  scenarios,
  activeInterventions,
}) => {
  const [selectedScenarioId, setSelectedScenarioId] = useState<number>(
    scenarios.length > 2 ? scenarios[2].id : (scenarios[0]?.id || 1)
  );
  const [drainageStress, setDrainageStress] = useState<number>(100);
  const [applyGI, setApplyGI] = useState<boolean>(true);
  const [loading, setLoading] = useState<boolean>(false);
  const [simulationResult, setSimulationResult] = useState<SimulationResult | null>(null);

  const selectedScenario = scenarios.find(s => s.id === selectedScenarioId) || scenarios[0];
  const totalGICost = activeInterventions.reduce((sum, i) => sum + (i.estimated_cost_inr_lakhs || 0), 0);
  const selectedStressOption = DRAINAGE_STRESS_OPTIONS.find(o => o.pct === drainageStress)!;

  const handleRunSimulation = async () => {
    setLoading(true);
    try {
      const res = await runSimulation({
        scenario_id: selectedScenarioId,
        drainage_stress_pct: drainageStress,
        interventions: applyGI ? activeInterventions : [],
      });
      setSimulationResult(res);
    } catch (err) {
      console.warn('API failed, using mock data:', err);
      setSimulationResult(MOCK_SIMULATION_RESULT);
    } finally {
      setLoading(false);
    }
  };

  const hydrographData = simulationResult?.hydrograph.map(pt => ({
    time: pt.time_min,
    'Rainfall (mm)': pt.rainfall_depth_mm,
    'Runoff Rate': pt.runoff_rate_m3s,
    'Outfall Discharge': pt.outfall_discharge_m3s,
  })) || [];

  return (
    <div className="space-y-6">

      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 to-sky-900 rounded-xl p-6 shadow-lg text-white">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 text-sky-300 text-xs font-mono mb-2">
              <Activity className="w-3.5 h-3.5" />
              <span>HYDRODYNAMIC SIMULATION ENGINE</span>
              <span className="text-sky-500">•</span>
              <span>SCS-CN SURROGATE</span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight mb-1">Simulation Lab &amp; Stress-Testing Sandbox</h1>
            <p className="text-sky-200 text-xs max-w-2xl leading-relaxed">
              Simulate catchment-wide peak runoff, outfall hydraulic routing, and surface waterlogging
              surcharge across 4 drainage capacity stress scenarios. Integrates GI portfolio from the Planner.
            </p>
          </div>
          <button
            onClick={handleRunSimulation}
            disabled={loading}
            className={`flex items-center space-x-2.5 px-6 py-3 rounded-lg font-semibold text-sm shadow-lg transition-all whitespace-nowrap ${
              loading
                ? 'bg-slate-600 text-slate-400 cursor-not-allowed'
                : 'bg-sky-500 hover:bg-sky-400 text-white hover:shadow-sky-500/40 hover:shadow-xl'
            }`}
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Play className="w-4 h-4 fill-current" />
            )}
            <span>{loading ? 'Simulating Runoff...' : 'Run Simulation'}</span>
          </button>
        </div>
      </div>

      {/* Configuration Panel */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
        <h3 className="font-bold text-slate-900 text-sm border-b border-slate-100 pb-3 mb-4 flex items-center space-x-2">
          <Layers className="w-4 h-4 text-sky-600" />
          <span>Scenario Configuration</span>
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">

          {/* Rainfall Scenario Selector */}
          <div>
            <label className="block text-slate-700 font-semibold mb-2">Rainfall Storm Scenario</label>
            <select
              value={selectedScenarioId}
              onChange={e => setSelectedScenarioId(parseInt(e.target.value))}
              className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-xs bg-white font-mono focus:ring-2 focus:ring-sky-500 focus:border-sky-500 focus:outline-none"
            >
              {scenarios.map(sc => (
                <option key={sc.id} value={sc.id}>
                  {sc.name} — {sc.total_rainfall_mm}mm / {sc.duration_hrs}h / {sc.return_period_yrs}-Yr
                </option>
              ))}
            </select>
            {selectedScenario && (
              <div className="mt-2 p-2.5 bg-sky-50 border border-sky-100 rounded-lg space-y-1">
                <div className="flex justify-between font-mono text-[11px]">
                  <span className="text-slate-500">Storm type:</span>
                  <span className="font-semibold text-slate-800">{selectedScenario.storm_type}</span>
                </div>
                <div className="flex justify-between font-mono text-[11px]">
                  <span className="text-slate-500">Peak intensity:</span>
                  <span className="font-semibold text-sky-700">{selectedScenario.peak_intensity_mmhr} mm/hr</span>
                </div>
              </div>
            )}
          </div>

          {/* Drainage Capacity Stress */}
          <div>
            <label className="block text-slate-700 font-semibold mb-2">Drainage Capacity Stress</label>
            <div className="space-y-2">
              {DRAINAGE_STRESS_OPTIONS.map(opt => (
                <label
                  key={opt.pct}
                  className={`flex items-center gap-3 p-2.5 rounded-lg border cursor-pointer transition-all ${
                    drainageStress === opt.pct ? opt.bgActive : opt.bgInactive
                  }`}
                >
                  <input
                    type="radio"
                    name="drainage_stress"
                    value={opt.pct}
                    checked={drainageStress === opt.pct}
                    onChange={() => setDrainageStress(opt.pct)}
                    className="sr-only"
                  />
                  <span className={`inline-flex items-center px-2 py-0.5 rounded font-mono font-bold text-[11px] shrink-0 ${
                    drainageStress === opt.pct ? 'bg-white/20 text-white' : opt.badge
                  }`}>
                    {opt.pct}%
                  </span>
                  <div className="min-w-0">
                    <div className="font-semibold text-[11px]">{opt.label}</div>
                    <div className={`text-[10px] leading-tight ${drainageStress === opt.pct ? 'text-white/80' : 'text-slate-500'}`}>
                      {opt.description}
                    </div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* GI Interventions Summary Panel */}
          <div>
            <label className="block text-slate-700 font-semibold mb-2">Green Infrastructure Portfolio</label>
            <div className="border border-slate-200 rounded-lg overflow-hidden">
              <div className="bg-slate-50 px-3 py-2 border-b border-slate-200 flex items-center justify-between">
                <span className="text-slate-600 font-medium">Active Interventions</span>
                <span className={`font-mono font-bold text-sm ${activeInterventions.length > 0 ? 'text-emerald-700' : 'text-slate-400'}`}>
                  {activeInterventions.length}
                </span>
              </div>
              <div className="p-3 space-y-2">
                <div className="flex justify-between text-[11px]">
                  <span className="text-slate-500 font-sans">Total estimated cost:</span>
                  <span className="font-mono font-bold text-slate-900">₹ {totalGICost.toFixed(1)} Lakhs</span>
                </div>
                <div className="flex justify-between text-[11px]">
                  <span className="text-slate-500 font-sans">Total area covered:</span>
                  <span className="font-mono font-bold text-emerald-700">
                    {activeInterventions.reduce((s, i) => s + i.allocated_area_m2, 0).toLocaleString()} m²
                  </span>
                </div>
                <div className="pt-2 border-t border-slate-100">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={applyGI}
                      onChange={e => setApplyGI(e.target.checked)}
                      className="w-3.5 h-3.5 rounded accent-emerald-600"
                    />
                    <span className={`text-[11px] font-semibold ${applyGI ? 'text-emerald-700' : 'text-slate-500'}`}>
                      {applyGI ? 'GI interventions applied' : 'Baseline (no GI)'}
                    </span>
                  </label>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Results Panel */}
      {simulationResult ? (
        <div className="space-y-5">

          {/* 4 Key Metric Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Peak Runoff */}
            <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm border-l-4 border-l-sky-500">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[11px] text-slate-500 uppercase font-mono font-semibold">Peak Runoff</span>
                <Activity className="w-3.5 h-3.5 text-sky-500" />
              </div>
              <div className="text-2xl font-bold text-sky-700 font-mono">
                {simulationResult.peak_runoff_m3s}
                <span className="text-xs font-normal text-slate-500 ml-1">m³/s</span>
              </div>
              <div className="text-[11px] text-slate-500 mt-1 font-mono">
                Baseline: {simulationResult.baseline_peak_runoff_m3s} m³/s
              </div>
            </div>

            {/* Volume Retention */}
            <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm border-l-4 border-l-emerald-500">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[11px] text-slate-500 uppercase font-mono font-semibold">Volume Retention</span>
                <Droplets className="w-3.5 h-3.5 text-emerald-500" />
              </div>
              <div className="text-2xl font-bold text-emerald-700 font-mono">
                {Math.round(simulationResult.volume_retention_m3 / 1000).toLocaleString()}
                <span className="text-xs font-normal text-slate-500 ml-1">k·m³</span>
              </div>
              <div className="text-[11px] text-emerald-600 mt-1 font-mono font-semibold">
                {simulationResult.volume_reduction_pct}% retained by GI
              </div>
            </div>

            {/* Flooded Nodes */}
            <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm border-l-4 border-l-red-500">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[11px] text-slate-500 uppercase font-mono font-semibold">Flooded Nodes</span>
                <XCircle className="w-3.5 h-3.5 text-red-500" />
              </div>
              <div className={`text-2xl font-bold font-mono ${simulationResult.flooded_nodes_count > 5 ? 'text-red-600' : 'text-amber-600'}`}>
                {simulationResult.flooded_nodes_count}
                <span className="text-xs font-normal text-slate-500 ml-1">/ 12 nodes</span>
              </div>
              <div className="text-[11px] text-slate-500 mt-1 font-mono">
                Max surcharge: {simulationResult.max_surcharge_depth_m}m
              </div>
            </div>

            {/* Peak Reduction % */}
            <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm border-l-4 border-l-indigo-500">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[11px] text-slate-500 uppercase font-mono font-semibold">Peak Reduction</span>
                <TrendingDown className="w-3.5 h-3.5 text-indigo-500" />
              </div>
              <div className="text-2xl font-bold text-indigo-700 font-mono">
                -{simulationResult.peak_reduction_pct}
                <span className="text-xs font-normal text-slate-500 ml-1">%</span>
              </div>
              <div className="text-[11px] text-slate-500 mt-1 font-mono">
                GI-induced peak attenuation
              </div>
            </div>
          </div>

          {/* Hydrograph ComposedChart */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-2 mb-5">
              <div>
                <span className="text-[11px] font-mono uppercase text-sky-700 font-semibold block">Hydrograph Output</span>
                <h3 className="font-bold text-slate-900 text-sm">
                  Storm Hydrograph — Rainfall, Runoff &amp; Outfall Discharge
                </h3>
              </div>
              <div className="flex items-center flex-wrap gap-3 text-[11px] font-mono">
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded bg-blue-300 inline-block" />
                  <span className="text-slate-600">Rainfall Depth (mm) [Left]</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-5 h-0.5 bg-sky-600 inline-block rounded" />
                  <span className="text-slate-600">Runoff Rate (m³/s) [Right]</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-5 h-0.5 bg-emerald-500 inline-block rounded" />
                  <span className="text-slate-600">Outfall Discharge (m³/s) [Right]</span>
                </span>
              </div>
            </div>
            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={hydrographData} margin={{ top: 10, right: 55, left: 5, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis
                    dataKey="time"
                    tick={{ fill: '#475569', fontSize: 11, fontFamily: 'monospace' }}
                    label={{ value: 'Time (min)', position: 'insideBottom', offset: -2, fill: '#94a3b8', fontSize: 11 }}
                  />
                  <YAxis
                    yAxisId="left"
                    tick={{ fill: '#475569', fontSize: 11 }}
                    label={{ value: 'Rainfall (mm)', angle: -90, position: 'insideLeft', fill: '#93c5fd', fontSize: 10, offset: 10 }}
                  />
                  <YAxis
                    yAxisId="right"
                    orientation="right"
                    tick={{ fill: '#475569', fontSize: 11 }}
                    label={{ value: 'Discharge (m³/s)', angle: 90, position: 'insideRight', fill: '#94a3b8', fontSize: 10, offset: 10 }}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend
                    wrapperStyle={{ fontSize: '11px', fontFamily: 'monospace', paddingTop: '8px' }}
                  />
                  <Bar
                    yAxisId="left"
                    dataKey="Rainfall (mm)"
                    fill="#93c5fd"
                    opacity={0.75}
                    barSize={8}
                    name="Rainfall (mm)"
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="Runoff Rate"
                    stroke="#0284c7"
                    strokeWidth={2.5}
                    dot={false}
                    name="Runoff Rate (m³/s)"
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="Outfall Discharge"
                    stroke="#10b981"
                    strokeWidth={2}
                    strokeDasharray="5 3"
                    dot={false}
                    name="Outfall Discharge (m³/s)"
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Subcatchment Flooding Table */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
            <h3 className="font-bold text-slate-900 text-sm mb-4 flex items-center gap-2">
              <BarChart2 className="w-4 h-4 text-slate-600" />
              Subcatchment Performance — {simulationResult.drainage_capacity_pct}% Drainage Capacity
            </h3>
            <div className="overflow-x-auto rounded-lg border border-slate-200">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-900 text-slate-200 font-mono text-[11px]">
                    <th className="py-2.5 px-3">Code</th>
                    <th className="py-2.5 px-3">Subcatchment</th>
                    <th className="py-2.5 px-3">Area (ha)</th>
                    <th className="py-2.5 px-3">Peak Runoff (m³/s)</th>
                    <th className="py-2.5 px-3">Runoff Vol (m³)</th>
                    <th className="py-2.5 px-3">GI Retained (m³)</th>
                    <th className="py-2.5 px-3">Ponding</th>
                    <th className="py-2.5 px-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono">
                  {simulationResult.subcatchment_summaries.map(sub => (
                    <tr
                      key={sub.code}
                      className={sub.is_flooded ? 'bg-red-50 hover:bg-red-100' : 'hover:bg-slate-50'}
                    >
                      <td className="py-2 px-3 font-bold text-slate-900">{sub.code}</td>
                      <td className="py-2 px-3 font-sans font-medium text-slate-800">{sub.name}</td>
                      <td className="py-2 px-3 text-slate-600">{sub.area_ha}</td>
                      <td className={`py-2 px-3 font-semibold ${sub.is_flooded ? 'text-red-700' : 'text-slate-700'}`}>
                        {sub.peak_runoff_m3s}
                      </td>
                      <td className="py-2 px-3 text-slate-600">{sub.total_volume_m3.toLocaleString()}</td>
                      <td className="py-2 px-3 text-emerald-700 font-semibold">{sub.gi_retained_m3.toLocaleString()}</td>
                      <td className={`py-2 px-3 font-semibold ${sub.surcharge_depth_m > 0.5 ? 'text-red-600' : 'text-slate-600'}`}>
                        {sub.surcharge_depth_m} m
                      </td>
                      <td className="py-2 px-3 font-sans">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                          sub.is_flooded
                            ? 'bg-red-100 text-red-700 border border-red-300'
                            : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        }`}>
                          {sub.is_flooded ? <XCircle className="w-3 h-3" /> : <CheckCircle2 className="w-3 h-3" />}
                          {sub.is_flooded ? 'Flooded' : 'Within Limits'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Engine Badge + Methodology Caveat */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-slate-900 rounded-xl p-4 text-xs space-y-2">
              <div className="flex items-center gap-2 text-sky-400 font-mono font-bold">
                <Cpu className="w-4 h-4" />
                <span>COMPUTATIONAL ENGINE</span>
              </div>
              <div className="flex items-center gap-2 mt-1">
                <span className="bg-red-500 text-white px-2.5 py-1 rounded-md font-mono font-bold text-[11px] uppercase tracking-wide">
                  NOT EPA SWMM
                </span>
                <span className="bg-sky-800 text-sky-200 px-2.5 py-1 rounded-md font-mono font-bold text-[11px]">
                  SCS-CN Surrogate
                </span>
              </div>
              <p className="text-slate-400 leading-relaxed mt-2">
                Engine: <strong className="text-slate-200">{simulationResult.engine_name}</strong>
              </p>
              <p className="text-slate-500 text-[11px] font-mono">
                {simulationResult.engine_verification_badge} •
                Exec time: {simulationResult.execution_time_ms} ms •
                Native SWMM: {simulationResult.is_swmm_native ? '✓ Active' : '✗ Standby'}
              </p>
            </div>

            <div className="bg-amber-50 border border-amber-300 rounded-xl p-4 text-xs space-y-2">
              <div className="flex items-center gap-2 text-amber-800 font-semibold">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                <span>METHODOLOGY CAVEAT</span>
              </div>
              <p className="text-amber-800 leading-relaxed text-[11px]">
                {simulationResult.methodology_caveat}
              </p>
              <div className="border-t border-amber-200 pt-2 text-amber-700 font-mono text-[10px]">
                Results are for DEMONSTRATION PURPOSES ONLY. Do not use for engineering design or municipal planning without site survey data and licensed hydraulic modelling software.
              </div>
            </div>
          </div>

        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-xl p-16 text-center shadow-sm">
          <div className="max-w-md mx-auto">
            <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
              <Cpu className="w-8 h-8 text-slate-400" />
            </div>
            <h4 className="font-bold text-slate-800 text-base mb-2">No Simulation Executed Yet</h4>
            <p className="text-xs text-slate-500 leading-relaxed mb-6">
              Select a rainfall storm event and drainage capacity stress condition above, then click
              <strong className="text-slate-700"> Run Simulation</strong> to generate dynamic hydrographs.
              The engine will use GI interventions from your Planner portfolio.
            </p>
            <button
              onClick={handleRunSimulation}
              className="px-6 py-2.5 bg-sky-600 hover:bg-sky-500 text-white rounded-lg text-xs font-semibold transition-colors shadow"
            >
              Run Baseline Simulation
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
