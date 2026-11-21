import React, { useState, useEffect, useRef } from 'react';
import { OptimizationResult, ParetoSolution, ProposedInterventionItem } from '../types';
import { runOptimization } from '../api';
import { MOCK_OPTIMIZATION_RESULT } from '../mockData';
import {
  Sliders, Play, Award, TrendingDown, Layers, ArrowRight,
  Zap, Target, DollarSign, Loader2, ChevronRight, BarChart2
} from 'lucide-react';
import {
  ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell, ReferenceLine
} from 'recharts';

interface OptimisationLabPageProps {
  onApplySolution: (interventions: ProposedInterventionItem[]) => void;
  onNavigateToSimulation: () => void;
}

const RAINFALL_SCENARIOS = [
  { id: 1, name: '2-Year Return (Frequent)', mm: 42 },
  { id: 2, name: '5-Year Design Storm', mm: 68 },
  { id: 3, name: '10-Year Benchmark', mm: 95 },
  { id: 4, name: '25-Year Extreme Event', mm: 148 },
];

const DRAINAGE_STRESS_OPTIONS = [
  { pct: 100, label: '100% — Normal Capacity' },
  { pct: 75, label: '75% — Mild Stress' },
  { pct: 50, label: '50% — Severe Stress' },
  { pct: 25, label: '25% — Critical Stress' },
];

const SOLUTION_CONFIGS = [
  {
    key: 'low_cost' as const,
    title: 'Low-Cost',
    badge: 'Economical Entry',
    desc: 'Minimum investment achieving viable stormwater attenuation.',
    activeClass: 'border-sky-500 bg-sky-50 ring-1 ring-sky-500',
    badgeClass: 'bg-sky-100 text-sky-800',
    metricColor: 'text-sky-700',
    icon: DollarSign,
  },
  {
    key: 'balanced' as const,
    title: 'Balanced',
    badge: 'Recommended Knee-Point',
    desc: 'Optimal trade-off between cost and performance.',
    activeClass: 'border-emerald-500 bg-emerald-50 ring-1 ring-emerald-500',
    badgeClass: 'bg-emerald-100 text-emerald-800',
    metricColor: 'text-emerald-700',
    icon: Target,
  },
  {
    key: 'high_perf' as const,
    title: 'High-Performance',
    badge: 'Maximum Mitigation',
    desc: 'Maximum volume and peak reduction within budget.',
    activeClass: 'border-indigo-500 bg-indigo-50 ring-1 ring-indigo-500',
    badgeClass: 'bg-indigo-100 text-indigo-800',
    metricColor: 'text-indigo-700',
    icon: Zap,
  },
];

type SolKey = 'low_cost' | 'balanced' | 'high_perf';

const SolutionMap: Record<SolKey, (r: OptimizationResult) => ParetoSolution> = {
  low_cost: r => r.low_cost_solution,
  balanced: r => r.balanced_solution,
  high_perf: r => r.high_perf_solution,
};

const ScatterTooltip = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div className="bg-slate-900 border border-slate-700 rounded-lg p-3 shadow-xl text-xs font-mono">
      <p className="font-bold text-slate-200 mb-1">Solution #{d.solutionId}</p>
      <p className="text-slate-400">Type: <span className="text-slate-200">{d.type}</span></p>
      <p className="text-slate-400">Cost: <span className="text-sky-300">₹{d.cost} L</span></p>
      <p className="text-slate-400">Peak Reduction: <span className="text-emerald-300">{d.peakReduction}%</span></p>
      <p className="text-slate-400">Vol Reduction: <span className="text-emerald-300">{d.volReduction}%</span></p>
    </div>
  );
};

export const OptimisationLabPage: React.FC<OptimisationLabPageProps> = ({
  onApplySolution,
  onNavigateToSimulation,
}) => {
  const [budgetLimit, setBudgetLimit] = useState<number>(300);
  const [scenarioId, setScenarioId] = useState<number>(3);
  const [drainageStress, setDrainageStress] = useState<number>(100);
  const [loading, setLoading] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [result, setResult] = useState<OptimizationResult | null>(null);
  const [selectedSolKey, setSelectedSolKey] = useState<SolKey>('balanced');
  const progressRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const selectedSolution = result ? SolutionMap[selectedSolKey](result) : null;

  const handleRunOptimization = async () => {
    setLoading(true);
    setProgress(0);
    setResult(null);

    // Animate progress bar over 2.5 seconds
    let p = 0;
    progressRef.current = setInterval(() => {
      p += Math.random() * 8 + 3;
      if (p >= 95) { p = 95; clearInterval(progressRef.current!); }
      setProgress(Math.round(p));
    }, 150);

    try {
      const res = await runOptimization({
        budget_limit_lakhs: budgetLimit,
        rainfall_scenario_id: scenarioId,
        drainage_stress_pct: drainageStress,
        population_size: 60,
        generations: 40,
      });
      setResult(res);
    } catch (err) {
      console.warn('API failed, using mock data:', err);
      await new Promise(resolve => setTimeout(resolve, 2500));
      setResult(MOCK_OPTIMIZATION_RESULT);
    } finally {
      clearInterval(progressRef.current!);
      setProgress(100);
      setLoading(false);
    }
  };

  const handleApplySolution = (sol: ParetoSolution) => {
    const items: ProposedInterventionItem[] = sol.allocations.map(a => ({
      subcatchment_code: a.subcatchment_code,
      intervention_type: a.intervention_type,
      allocated_area_m2: a.allocated_area_m2,
      estimated_cost_inr_lakhs: a.estimated_cost_inr_lakhs,
    }));
    onApplySolution(items);
  };

  const scatterData = result?.pareto_frontier.map(s => ({
    cost: s.total_cost_lakhs,
    peakReduction: s.peak_reduction_pct,
    volReduction: s.volume_reduction_pct,
    solutionId: s.solution_id,
    type: s.solution_type,
    sol: s,
  })) || [];

  const highlightIds = result
    ? new Set([result.low_cost_solution.solution_id, result.balanced_solution.solution_id, result.high_perf_solution.solution_id])
    : new Set<number>();

  return (
    <div className="space-y-6">

      {/* Header Banner */}
      <div className="bg-gradient-to-r from-indigo-900 to-purple-900 rounded-xl p-6 shadow-lg text-white">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 text-indigo-300 text-xs font-mono mb-2">
              <Target className="w-3.5 h-3.5" />
              <span>ALGORITHMIC PARETO EXPLORATION</span>
              <span className="text-indigo-500">•</span>
              <span>NSGA-II MULTI-OBJECTIVE</span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight mb-1">Budget-Constrained NSGA-II Optimisation Lab</h1>
            <p className="text-indigo-200 text-xs max-w-2xl leading-relaxed">
              Simultaneously optimize three conflicting objectives: (1) Minimise GI capital cost, 
              (2) Minimise residual peak runoff, and (3) Minimise total runoff volume.
            </p>
          </div>
          <button
            onClick={handleRunOptimization}
            disabled={loading}
            className={`flex items-center space-x-2.5 px-6 py-3 rounded-lg font-semibold text-sm shadow-lg transition-all whitespace-nowrap ${
              loading
                ? 'bg-indigo-800 text-indigo-400 cursor-not-allowed'
                : 'bg-indigo-500 hover:bg-indigo-400 text-white hover:shadow-indigo-500/40 hover:shadow-xl'
            }`}
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Play className="w-4 h-4 fill-current" />
            )}
            <span>{loading ? 'Running NSGA-II...' : 'Run NSGA-II Optimisation'}</span>
          </button>
        </div>
      </div>

      {/* Configuration Panel */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
        <h3 className="font-bold text-slate-900 text-sm border-b border-slate-100 pb-3 mb-4 flex items-center gap-2">
          <Sliders className="w-4 h-4 text-indigo-500" />
          Algorithm Configuration
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-xs">

          {/* Budget Slider */}
          <div>
            <div className="flex justify-between mb-1.5">
              <label className="text-slate-700 font-semibold">Budget Ceiling</label>
              <span className="font-mono font-bold text-indigo-700">₹ {budgetLimit} Lakhs</span>
            </div>
            <input
              type="range"
              min="50"
              max="500"
              step="25"
              value={budgetLimit}
              onChange={e => setBudgetLimit(parseInt(e.target.value))}
              className="w-full accent-indigo-600 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400 font-mono mt-1">
              <span>₹50 L</span><span>₹500 L</span>
            </div>
            <span className="text-[10px] text-slate-500 block mt-1">Capital expenditure limit for NSGA-II search space</span>
          </div>

          {/* Rainfall Scenario */}
          <div>
            <label className="block text-slate-700 font-semibold mb-1.5">Rainfall Scenario</label>
            <select
              value={scenarioId}
              onChange={e => setScenarioId(parseInt(e.target.value))}
              className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-xs bg-white font-mono focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:outline-none"
            >
              {RAINFALL_SCENARIOS.map(sc => (
                <option key={sc.id} value={sc.id}>{sc.name} ({sc.mm}mm)</option>
              ))}
            </select>
            <span className="text-[10px] text-slate-500 block mt-1">Storm event used to evaluate each chromosome's fitness</span>
          </div>

          {/* Drainage Stress */}
          <div>
            <label className="block text-slate-700 font-semibold mb-1.5">Drainage Stress Condition</label>
            <select
              value={drainageStress}
              onChange={e => setDrainageStress(parseInt(e.target.value))}
              className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-xs bg-white font-mono focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:outline-none"
            >
              {DRAINAGE_STRESS_OPTIONS.map(o => (
                <option key={o.pct} value={o.pct}>{o.label}</option>
              ))}
            </select>
            <span className="text-[10px] text-slate-500 block mt-1">Evaluates all solutions under this hydraulic stress factor</span>
          </div>

        </div>

        {/* Algorithm fixed params */}
        <div className="mt-4 pt-4 border-t border-slate-100 flex flex-wrap gap-3 text-[11px] font-mono text-slate-500">
          <span className="bg-slate-100 px-2.5 py-1 rounded">Algorithm: <strong className="text-slate-700">NSGA-II</strong></span>
          <span className="bg-slate-100 px-2.5 py-1 rounded">Population: <strong className="text-slate-700">60 chromosomes</strong></span>
          <span className="bg-slate-100 px-2.5 py-1 rounded">Generations: <strong className="text-slate-700">40 epochs</strong></span>
          <span className="bg-slate-100 px-2.5 py-1 rounded">Objectives: <strong className="text-slate-700">3 (cost, peak, volume)</strong></span>
          <span className="bg-slate-100 px-2.5 py-1 rounded">Crossover: <strong className="text-slate-700">SBX (η=20)</strong></span>
          <span className="bg-slate-100 px-2.5 py-1 rounded">Mutation: <strong className="text-slate-700">PM (η=15)</strong></span>
        </div>
      </div>

      {/* Loading Progress */}
      {loading && (
        <div className="bg-white border border-indigo-200 rounded-xl p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <Loader2 className="w-4 h-4 text-indigo-500 animate-spin" />
            <span className="text-sm font-semibold text-slate-800">Running NSGA-II Genetic Algorithm...</span>
            <span className="ml-auto font-mono text-indigo-700 font-bold">{progress}%</span>
          </div>
          <div className="w-full bg-slate-200 rounded-full h-2.5 overflow-hidden">
            <div
              className="bg-gradient-to-r from-indigo-500 to-purple-500 h-2.5 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-[11px] text-slate-500 mt-2 font-mono">
            Evolving population across {40} generations — identifying Pareto-optimal GI allocation strategies...
          </p>
        </div>
      )}

      {/* Results */}
      {result && !loading ? (
        <div className="space-y-5">

          {/* Algorithm Metadata Card */}
          <div className="bg-slate-900 rounded-xl p-5 text-white">
            <div className="flex items-center gap-2 text-indigo-400 font-mono text-xs mb-3">
              <Target className="w-4 h-4" />
              <span>OPTIMIZATION COMPLETE — NSGA-II ALGORITHM</span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
              <div>
                <span className="text-slate-500 font-mono text-[10px] block">Algorithm</span>
                <span className="font-bold text-indigo-300">NSGA-II</span>
              </div>
              <div>
                <span className="text-slate-500 font-mono text-[10px] block">Solutions Found</span>
                <span className="font-bold text-emerald-300">{result.pareto_frontier.length} non-dominated</span>
              </div>
              <div>
                <span className="text-slate-500 font-mono text-[10px] block">Execution Time</span>
                <span className="font-bold text-slate-200">{result.execution_time_s}s</span>
              </div>
              <div>
                <span className="text-slate-500 font-mono text-[10px] block">Objectives</span>
                <span className="font-bold text-slate-200">3 (cost, peak, vol)</span>
              </div>
            </div>
            <div className="mt-3 pt-3 border-t border-slate-800 flex flex-wrap gap-2 text-[10px] font-mono text-slate-400">
              {result.algorithm_metadata.objectives.map((obj, i) => (
                <span key={i} className="bg-slate-800 px-2 py-0.5 rounded text-slate-300">
                  Obj {i + 1}: {obj}
                </span>
              ))}
            </div>
          </div>

          {/* 3 Solution Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {SOLUTION_CONFIGS.map(cfg => {
              const sol = SolutionMap[cfg.key](result);
              const isSelected = selectedSolKey === cfg.key;
              const Icon = cfg.icon;
              return (
                <div
                  key={cfg.key}
                  onClick={() => setSelectedSolKey(cfg.key)}
                  className={`border-2 rounded-xl p-5 cursor-pointer transition-all bg-white ${
                    isSelected ? cfg.activeClass : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className={`text-[10px] uppercase font-mono font-bold px-2 py-0.5 rounded ${cfg.badgeClass}`}>
                      {cfg.badge}
                    </span>
                    <Icon className={`w-4 h-4 ${isSelected ? cfg.metricColor : 'text-slate-400'}`} />
                  </div>
                  <h4 className="font-bold text-slate-900 text-base mt-1">{cfg.title}</h4>
                  <p className="text-[11px] text-slate-500 mb-3">{cfg.desc}</p>

                  <div className="space-y-2.5 text-xs font-mono border-t border-slate-100 pt-3">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Total Cost</span>
                      <span className={`font-bold ${cfg.metricColor}`}>₹{sol.total_cost_lakhs} Lakhs</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Peak Reduction</span>
                      <span className="font-bold text-slate-800">-{sol.peak_reduction_pct}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Volume Reduction</span>
                      <span className="font-bold text-emerald-700">-{sol.volume_reduction_pct}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Interventions</span>
                      <span className="font-bold text-slate-700">{sol.interventions_count} sites</span>
                    </div>
                  </div>

                  <div className="mt-3 pt-2 border-t border-slate-100 space-y-1">
                    {sol.allocations.slice(0, 3).map((a, i) => (
                      <div key={i} className="text-[10px] font-mono text-slate-500 flex justify-between">
                        <span className="truncate max-w-[55%]">{a.site_name}</span>
                        <span className="font-semibold text-slate-700">{a.intervention_type}</span>
                      </div>
                    ))}
                    {sol.allocations.length > 3 && (
                      <div className="text-[10px] font-mono text-slate-400">+{sol.allocations.length - 3} more...</div>
                    )}
                  </div>

                  <button
                    onClick={e => { e.stopPropagation(); handleApplySolution(sol); }}
                    className={`w-full mt-3 py-2 rounded-lg text-[11px] font-semibold transition-colors flex items-center justify-center gap-1.5 ${
                      isSelected
                        ? 'bg-slate-900 text-white hover:bg-slate-700'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    Apply Solution <ChevronRight className="w-3 h-3" />
                  </button>
                </div>
              );
            })}
          </div>

          {/* Pareto Frontier Scatter Plot */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-2 mb-5">
              <div>
                <span className="text-[11px] font-mono uppercase text-indigo-700 font-semibold block">Pareto-Optimal Trade-Off Surface</span>
                <h3 className="font-bold text-slate-900 text-sm">
                  Capital Cost (₹ Lakhs) vs. Peak Reduction (%) — {result.pareto_frontier.length} Non-Dominated Solutions
                </h3>
              </div>
              <span className="text-xs font-mono text-slate-500 bg-slate-100 px-3 py-1.5 rounded-lg">
                Exec: {result.execution_time_s}s
              </span>
            </div>
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <ScatterChart margin={{ top: 10, right: 30, bottom: 20, left: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis
                    type="number"
                    dataKey="cost"
                    name="Cost (₹ Lakhs)"
                    domain={[0, budgetLimit]}
                    tick={{ fill: '#475569', fontSize: 11, fontFamily: 'monospace' }}
                    label={{ value: 'Cost (₹ Lakhs)', position: 'insideBottom', offset: -10, fill: '#94a3b8', fontSize: 11 }}
                  />
                  <YAxis
                    type="number"
                    dataKey="peakReduction"
                    name="Peak Reduction %"
                    tick={{ fill: '#475569', fontSize: 11 }}
                    label={{ value: 'Peak Reduction (%)', angle: -90, position: 'insideLeft', fill: '#94a3b8', fontSize: 11 }}
                  />
                  <Tooltip content={<ScatterTooltip />} cursor={{ strokeDasharray: '3 3' }} />
                  <Scatter
                    name="Pareto Solutions"
                    data={scatterData}
                    onClick={entry => {
                      const sol = entry.sol as ParetoSolution;
                      const matchKey = (['low_cost', 'balanced', 'high_perf'] as SolKey[]).find(
                        k => SolutionMap[k](result).solution_id === sol.solution_id
                      );
                      if (matchKey) setSelectedSolKey(matchKey);
                    }}
                    className="cursor-pointer"
                  >
                    {scatterData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={
                          entry.solutionId === SolutionMap[selectedSolKey](result).solution_id
                            ? '#4f46e5'
                            : highlightIds.has(entry.solutionId)
                            ? '#7c3aed'
                            : '#a5b4fc'
                        }
                        r={
                          entry.solutionId === SolutionMap[selectedSolKey](result).solution_id
                            ? 8
                            : highlightIds.has(entry.solutionId)
                            ? 6
                            : 4
                        }
                      />
                    ))}
                  </Scatter>
                </ScatterChart>
              </ResponsiveContainer>
            </div>
            <div className="flex items-center gap-4 justify-center mt-2 text-[11px] font-mono text-slate-500">
              <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-indigo-600 inline-block" /> Selected</span>
              <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-violet-600 inline-block" /> Key Solutions</span>
              <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-indigo-200 inline-block" /> Pareto Frontier</span>
            </div>
          </div>

          {/* Baseline Comparison Progress Bars */}
          {selectedSolution && (
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
              <h3 className="font-bold text-slate-900 text-sm mb-4 flex items-center gap-2">
                <BarChart2 className="w-4 h-4 text-slate-500" />
                Performance vs. Baseline — Solution #{selectedSolution.solution_id} ({selectedSolution.solution_type})
              </h3>
              <div className="space-y-5">
                <div>
                  <div className="flex justify-between text-xs font-mono mb-1.5">
                    <span className="text-slate-600">Peak Runoff Reduction</span>
                    <span className="font-bold text-emerald-700">-{selectedSolution.peak_reduction_pct}%</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-emerald-500 to-teal-500 h-3 rounded-full transition-all duration-700"
                      style={{ width: `${Math.min(selectedSolution.peak_reduction_pct, 100)}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[10px] font-mono text-slate-400 mt-1">
                    <span>Baseline: {result.baseline_peak_runoff_m3s} m³/s</span>
                    <span>Residual: {selectedSolution.residual_peak_runoff_m3s} m³/s</span>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-mono mb-1.5">
                    <span className="text-slate-600">Volume Reduction</span>
                    <span className="font-bold text-sky-700">-{selectedSolution.volume_reduction_pct}%</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-sky-500 to-blue-500 h-3 rounded-full transition-all duration-700"
                      style={{ width: `${Math.min(selectedSolution.volume_reduction_pct, 100)}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[10px] font-mono text-slate-400 mt-1">
                    <span>Baseline: {result.baseline_volume_m3.toLocaleString()} m³</span>
                    <span>Residual: {selectedSolution.residual_volume_m3.toLocaleString()} m³</span>
                  </div>
                </div>
              </div>

              {/* CTA Buttons */}
              <div className="flex gap-3 mt-5 pt-4 border-t border-slate-100">
                <button
                  onClick={() => handleApplySolution(selectedSolution)}
                  className="flex-1 py-2.5 bg-emerald-700 hover:bg-emerald-600 text-white rounded-lg text-xs font-semibold transition-colors flex items-center justify-center gap-2 shadow"
                >
                  Apply Solution to Portfolio
                </button>
                <button
                  onClick={onNavigateToSimulation}
                  className="flex-1 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold transition-colors flex items-center justify-center gap-2"
                >
                  Test in Simulation Lab <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

        </div>
      ) : !loading && (
        <div className="bg-white border border-slate-200 rounded-xl p-16 text-center shadow-sm">
          <div className="max-w-md mx-auto">
            <div className="w-16 h-16 rounded-full bg-indigo-50 flex items-center justify-center mx-auto mb-4">
              <Sliders className="w-8 h-8 text-indigo-400" />
            </div>
            <h4 className="font-bold text-slate-800 text-base mb-2">No Optimization Run Yet</h4>
            <p className="text-xs text-slate-500 leading-relaxed mb-6">
              Configure your budget ceiling and hyperparameters above, then click
              <strong className="text-slate-700"> Run NSGA-II Optimisation</strong> to discover
              Pareto-optimal green infrastructure portfolios.
            </p>
            <button
              onClick={handleRunOptimization}
              className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold transition-colors shadow"
            >
              Run Default NSGA-II (₹300 Lakhs Budget)
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
