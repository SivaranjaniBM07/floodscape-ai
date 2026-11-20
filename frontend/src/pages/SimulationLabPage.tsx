import React, { useState } from 'react';
import { RainfallScenario, SimulationResult, ProposedInterventionItem } from '../types';
import { runSimulation } from '../api';
import { Cpu, Play, AlertTriangle, TrendingUp, Droplets, CheckCircle, Clock } from 'lucide-react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area
} from 'recharts';

interface SimulationLabPageProps {
  scenarios: RainfallScenario[];
  activeInterventions: ProposedInterventionItem[];
}

export const SimulationLabPage: React.FC<SimulationLabPageProps> = ({
  scenarios,
  activeInterventions
}) => {
  const [selectedScenarioId, setSelectedScenarioId] = useState<number>(
    scenarios.length > 2 ? scenarios[2].id : (scenarios[0]?.id || 1)
  );
  const [drainageStress, setDrainageStress] = useState<number>(100); // 100, 75, 50, 25
  const [applyGI, setApplyGI] = useState<boolean>(true);
  const [loading, setLoading] = useState<boolean>(false);
  const [simulationResult, setSimulationResult] = useState<SimulationResult | null>(null);

  const handleRunSimulation = async () => {
    setLoading(true);
    try {
      const res = await runSimulation({
        scenario_id: selectedScenarioId,
        drainage_stress_pct: drainageStress,
        interventions: applyGI ? activeInterventions : []
      });
      setSimulationResult(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const hydrographChartData = simulationResult ? simulationResult.hydrograph.map(pt => ({
    time: `${pt.time_min}m`,
    time_min: pt.time_min,
    Runoff: pt.runoff_rate_m3s,
    Outfall: pt.outfall_discharge_m3s,
    Waterlogging: Math.round(pt.waterlog_storage_m3 / 100) / 10, // 1000 m3
    Rainfall: pt.rainfall_depth_mm
  })) : [];

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 text-xs font-mono text-slate-500 mb-1">
              <span>HYDRODYNAMIC SIMULATION</span>
              <span>/</span>
              <span className="font-semibold text-slate-800">DRAINAGE STRESS & HYDRAULIC ROUTING</span>
            </div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              Simulation Lab & Stress-Testing Sandbox
            </h1>
            <p className="text-xs text-slate-600 mt-1 max-w-3xl">
              Simulate catchment-wide peak runoff, outfall hydraulic throttle limits, and surface waterlogging surcharge across 4 drainage capacity stress scenarios (100%, 75%, 50%, 25%).
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleRunSimulation}
              disabled={loading}
              className={`px-5 py-2.5 rounded font-medium text-xs flex items-center space-x-2 shadow-sm transition-all ${
                loading
                  ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                  : 'bg-sky-600 hover:bg-sky-500 text-white'
              }`}
            >
              <Play className={`w-4 h-4 fill-current ${loading ? 'animate-spin' : ''}`} />
              <span>{loading ? 'Simulating Runoff...' : 'Execute Simulation'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Control Configuration Matrix */}
      <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm space-y-4">
        <h3 className="font-bold text-slate-900 text-sm border-b border-slate-100 pb-2">
          Scenario Configuration & Stress Stressors
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 text-xs">
          
          {/* Select Rainfall Scenario */}
          <div>
            <label className="block text-slate-700 font-medium mb-1.5">Rainfall Storm Scenario</label>
            <select
              value={selectedScenarioId}
              onChange={e => setSelectedScenarioId(parseInt(e.target.value))}
              className="w-full border border-slate-300 rounded px-3 py-2 text-xs bg-white font-mono focus:ring-1 focus:ring-sky-500 focus:outline-none"
            >
              {scenarios.map(sc => (
                <option key={sc.id} value={sc.id}>
                  {sc.name} ({sc.total_rainfall_mm} mm, {sc.duration_hrs}h)
                </option>
              ))}
            </select>
            <p className="text-[11px] text-slate-500 mt-1">
              Provides hyetograph rainfall intensity steps for routing.
            </p>
          </div>

          {/* Select Drainage Stress Condition */}
          <div>
            <label className="block text-slate-700 font-medium mb-1.5">
              Drainage Capacity Scenario (Stress Factor)
            </label>
            <div className="grid grid-cols-4 gap-1.5 font-mono">
              {[100, 75, 50, 25].map(pct => (
                <button
                  key={pct}
                  type="button"
                  onClick={() => setDrainageStress(pct)}
                  className={`py-2 px-1 rounded border text-center transition-all ${
                    drainageStress === pct
                      ? pct === 100
                        ? 'bg-slate-900 text-white border-slate-900 font-bold'
                        : pct >= 50
                        ? 'bg-amber-600 text-white border-amber-600 font-bold'
                        : 'bg-red-600 text-white border-red-600 font-bold'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <span className="block text-xs">{pct}%</span>
                  <span className="text-[9px] block font-sans">
                    {pct === 100 ? 'Normal' : 'Stress'}
                  </span>
                </button>
              ))}
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              Simulates hydraulic throttling / backwater from Cauvery during high flood stage.
            </p>
          </div>

          {/* GI Interventions Inclusion Toggle */}
          <div>
            <label className="block text-slate-700 font-medium mb-1.5">
              Active Green Infrastructure Portfolio
            </label>
            <div className="bg-slate-50 border border-slate-200 rounded p-3 space-y-2">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={applyGI}
                  onChange={e => setApplyGI(e.target.checked)}
                  className="rounded text-sky-600 focus:ring-sky-500"
                />
                <span className="text-slate-800 font-medium">Apply Proposed GI Interventions</span>
              </label>
              <div className="text-[11px] text-slate-500 font-mono">
                {applyGI
                  ? `${activeInterventions.length} intervention sites applied`
                  : 'Zero intervention (Baseline condition)'}
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Simulation Results Section */}
      {simulationResult ? (
        <div className="space-y-6 animate-in fade-in duration-200">
          
          {/* Key Simulation KPI Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
            
            <div className="bg-white border border-slate-200 rounded-lg p-3.5 shadow-sm">
              <span className="text-[11px] text-slate-500 uppercase font-mono block">Peak Inflow</span>
              <span className="text-xl font-bold text-slate-900 font-mono mt-0.5 block">
                {simulationResult.peak_inflow_m3s} <span className="text-xs font-normal text-slate-500">m³/s</span>
              </span>
              <span className="text-[10px] text-slate-400">Total generated peak</span>
            </div>

            <div className="bg-white border border-slate-200 rounded-lg p-3.5 shadow-sm">
              <span className="text-[11px] text-slate-500 uppercase font-mono block">Net Peak Runoff</span>
              <span className="text-xl font-bold text-sky-700 font-mono mt-0.5 block">
                {simulationResult.peak_runoff_m3s} <span className="text-xs font-normal text-slate-500">m³/s</span>
              </span>
              <span className="text-[10px] text-emerald-700 font-medium">
                {simulationResult.peak_reduction_pct > 0 ? `-${simulationResult.peak_reduction_pct}% peak reduction` : 'Unattenuated'}
              </span>
            </div>

            <div className="bg-white border border-slate-200 rounded-lg p-3.5 shadow-sm">
              <span className="text-[11px] text-slate-500 uppercase font-mono block">Total Runoff Vol</span>
              <span className="text-xl font-bold text-slate-900 font-mono mt-0.5 block">
                {Math.round(simulationResult.total_runoff_volume_m3 / 1000).toLocaleString()} <span className="text-xs font-normal text-slate-500">k·m³</span>
              </span>
              <span className="text-[10px] text-slate-500 font-mono">
                {simulationResult.total_runoff_volume_m3.toLocaleString()} m³
              </span>
            </div>

            <div className="bg-white border border-slate-200 rounded-lg p-3.5 shadow-sm">
              <span className="text-[11px] text-slate-500 uppercase font-mono block">GI Vol Retention</span>
              <span className="text-xl font-bold text-emerald-700 font-mono mt-0.5 block">
                {Math.round(simulationResult.volume_retention_m3 / 1000).toLocaleString()} <span className="text-xs font-normal text-slate-500">k·m³</span>
              </span>
              <span className="text-[10px] text-emerald-700 font-medium">
                {simulationResult.volume_reduction_pct}% retained
              </span>
            </div>

            <div className="bg-white border border-slate-200 rounded-lg p-3.5 shadow-sm">
              <span className="text-[11px] text-slate-500 uppercase font-mono block">Surcharged Nodes</span>
              <span className={`text-xl font-bold font-mono mt-0.5 block ${
                simulationResult.flooded_nodes_count > 6 ? 'text-red-600' : 'text-amber-600'
              }`}>
                {simulationResult.flooded_nodes_count} <span className="text-xs font-normal text-slate-500">/ 12</span>
              </span>
              <span className="text-[10px] text-slate-500">Depressions &gt;15cm</span>
            </div>

            <div className="bg-white border border-slate-200 rounded-lg p-3.5 shadow-sm">
              <span className="text-[11px] text-slate-500 uppercase font-mono block">Max Surcharge Depth</span>
              <span className={`text-xl font-bold font-mono mt-0.5 block ${
                simulationResult.max_surcharge_depth_m > 0.5 ? 'text-red-600' : 'text-amber-600'
              }`}>
                {simulationResult.max_surcharge_depth_m} <span className="text-xs font-normal text-slate-500">m</span>
              </span>
              <span className="text-[10px] text-slate-500">Street waterlogging</span>
            </div>

          </div>

          {/* Dynamic Hydrograph Chart */}
          <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-2 mb-4">
              <div>
                <span className="text-[11px] font-mono uppercase text-sky-700 font-semibold block">
                  Hydrograph Output
                </span>
                <h3 className="font-bold text-slate-900 text-sm">
                  Catchment Hydrograph & Outfall Discharge Over Storm Duration
                </h3>
              </div>
              <div className="flex items-center space-x-3 text-xs font-mono">
                <span className="flex items-center space-x-1">
                  <span className="w-3 h-0.5 bg-sky-600"></span>
                  <span>Runoff Rate (m³/s)</span>
                </span>
                <span className="flex items-center space-x-1">
                  <span className="w-3 h-0.5 bg-emerald-600"></span>
                  <span>Outfall Discharge (m³/s)</span>
                </span>
                <span className="flex items-center space-x-1">
                  <span className="w-3 h-0.5 bg-amber-500"></span>
                  <span>Surface Waterlog (10³ m³)</span>
                </span>
              </div>
            </div>

            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={hydrographChartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="time" tick={{ fill: '#475569', fontSize: 11, fontFamily: 'monospace' }} />
                  <YAxis tick={{ fill: '#475569', fontSize: 11 }} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#ffffff', borderColor: '#cbd5e1', fontSize: '12px' }}
                  />
                  <Line type="monotone" dataKey="Runoff" stroke="#0284c7" strokeWidth={2.5} dot={false} />
                  <Line type="monotone" dataKey="Outfall" stroke="#10b981" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="Waterlogging" stroke="#f59e0b" strokeWidth={1.5} strokeDasharray="4 4" dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Subcatchment Surcharge Breakdown Table */}
          <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm">
            <h3 className="font-bold text-slate-900 text-sm mb-3">
              Subcatchment Performance & Inundation Status under {simulationResult.drainage_capacity_pct}% Drainage Capacity
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-100 text-slate-700 font-mono border-b border-slate-200">
                    <th className="py-2.5 px-3">Code</th>
                    <th className="py-2.5 px-3">Subcatchment Name</th>
                    <th className="py-2.5 px-3">Area (ha)</th>
                    <th className="py-2.5 px-3">Peak Runoff (m³/s)</th>
                    <th className="py-2.5 px-3">Runoff Volume (m³)</th>
                    <th className="py-2.5 px-3">GI Retained (m³)</th>
                    <th className="py-2.5 px-3">Ponding Depth</th>
                    <th className="py-2.5 px-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono">
                  {simulationResult.subcatchment_summaries.map(sub => (
                    <tr key={sub.code} className="hover:bg-slate-50">
                      <td className="py-2 px-3 font-bold text-slate-900">{sub.code}</td>
                      <td className="py-2 px-3 font-sans font-medium text-slate-800">{sub.name}</td>
                      <td className="py-2 px-3">{sub.area_ha}</td>
                      <td className="py-2 px-3 font-semibold">{sub.peak_runoff_m3s}</td>
                      <td className="py-2 px-3">{sub.total_volume_m3.toLocaleString()}</td>
                      <td className="py-2 px-3 text-emerald-700 font-semibold">{sub.gi_retained_m3.toLocaleString()}</td>
                      <td className="py-2 px-3">{sub.surcharge_depth_m} m</td>
                      <td className="py-2 px-3 font-sans">
                        <span className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                          sub.is_flooded
                            ? 'bg-red-50 text-red-700 border border-red-200'
                            : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        }`}>
                          {sub.is_flooded ? 'Surcharged' : 'Within Limits'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Engine Authenticity & Methodology Caveat Card */}
          <div className="bg-slate-50 border border-slate-300 rounded-lg p-4 text-xs space-y-1">
            <div className="flex items-center space-x-2 text-slate-900 font-mono font-bold">
              <Cpu className="w-4 h-4 text-sky-700" />
              <span>Computational Engine Status: {simulationResult.engine_name}</span>
            </div>
            <p className="text-slate-600 leading-relaxed">
              {simulationResult.methodology_caveat}
            </p>
            <div className="pt-2 text-[11px] text-slate-500 font-mono">
              Execution latency: {simulationResult.execution_time_ms} ms | Native SWMM executable: {simulationResult.is_swmm_native ? 'Active' : 'Standby / Surrogate Mode'}
            </div>
          </div>

        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-lg p-12 text-center text-slate-400">
          <Cpu className="w-10 h-10 mx-auto mb-3 opacity-30 text-slate-600" />
          <h4 className="font-bold text-slate-700 text-sm mb-1">No Simulation Executed Yet</h4>
          <p className="text-xs text-slate-500 max-w-md mx-auto mb-4">
            Select a rainfall event and drainage capacity stress condition above, then click Execute Simulation to generate dynamic system hydrographs.
          </p>
          <button
            onClick={handleRunSimulation}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded text-xs font-medium transition-colors"
          >
            Run Baseline Simulation (100% Capacity)
          </button>
        </div>
      )}

    </div>
  );
};
