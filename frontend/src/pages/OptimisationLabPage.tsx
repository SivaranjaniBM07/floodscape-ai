import React, { useState } from 'react';
import { OptimizationResult, ParetoSolution, ProposedInterventionItem } from '../types';
import { runOptimization } from '../api';
import { Sliders, Play, Award, CheckCircle, TrendingDown, Layers, ArrowRight } from 'lucide-react';
import {
  ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, ZAxis
} from 'recharts';

interface OptimisationLabPageProps {
  onApplySolution: (interventions: ProposedInterventionItem[]) => void;
  onNavigateToSimulation: () => void;
}

export const OptimisationLabPage: React.FC<OptimisationLabPageProps> = ({
  onApplySolution,
  onNavigateToSimulation
}) => {
  const [budgetLimit, setBudgetLimit] = useState<number>(300);
  const [drainageStress, setDrainageStress] = useState<number>(100);
  const [popSize, setPopSize] = useState<number>(30);
  const [generations, setGenerations] = useState<number>(20);
  const [loading, setLoading] = useState<boolean>(false);
  const [result, setResult] = useState<OptimizationResult | null>(null);
  const [selectedSolution, setSelectedSolution] = useState<ParetoSolution | null>(null);

  const handleRunOptimization = async () => {
    setLoading(true);
    try {
      const res = await runOptimization({
        budget_limit_lakhs: budgetLimit,
        rainfall_scenario_id: 3, // 10-Yr Benchmark
        drainage_stress_pct: drainageStress,
        population_size: popSize,
        generations: generations
      });
      setResult(res);
      setSelectedSolution(res.balanced_solution);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleApplyToActive = (sol: ParetoSolution) => {
    const items: ProposedInterventionItem[] = sol.allocations.map(a => ({
      subcatchment_code: a.subcatchment_code,
      intervention_type: a.intervention_type,
      allocated_area_m2: a.allocated_area_m2,
      estimated_cost_inr_lakhs: a.estimated_cost_inr_lakhs
    }));
    onApplySolution(items);
  };

  const scatterData = result ? result.pareto_frontier.map(s => ({
    cost: s.total_cost_lakhs,
    peakRunoff: s.residual_peak_runoff_m3s,
    volumeM3: Math.round(s.residual_volume_m3),
    solutionId: s.solution_id,
    type: s.solution_type,
    sol: s
  })) : [];

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 text-xs font-mono text-slate-500 mb-1">
              <span>ALGORITHMIC PARETO EXPLORATION</span>
              <span>/</span>
              <span className="font-semibold text-slate-800">NSGA-II MULTI-OBJECTIVE SEARCH</span>
            </div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              Budget-Constrained NSGA-II Optimisation Lab
            </h1>
            <p className="text-xs text-slate-600 mt-1 max-w-3xl">
              Simultaneously optimize three conflicting objectives: (1) Minimise intervention cost (₹ Lakhs), (2) Minimise residual peak runoff (m³/s), and (3) Minimise residual runoff volume (m³).
            </p>
          </div>

          <button
            onClick={handleRunOptimization}
            disabled={loading}
            className={`px-5 py-2.5 rounded font-medium text-xs flex items-center space-x-2 shadow-sm transition-all ${
              loading
                ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                : 'bg-slate-900 hover:bg-slate-800 text-white'
            }`}
          >
            <Play className={`w-4 h-4 fill-current ${loading ? 'animate-spin' : ''}`} />
            <span>{loading ? 'Running NSGA-II Generations...' : 'Execute Optimisation'}</span>
          </button>
        </div>
      </div>

      {/* Control Configuration Parameters */}
      <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm space-y-4">
        <h3 className="font-bold text-slate-900 text-sm border-b border-slate-100 pb-2">
          Budget Constraints & Genetic Algorithm Hyperparameters
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs">
          
          <div>
            <div className="flex justify-between mb-1">
              <label className="text-slate-700 font-medium">Budget Ceiling</label>
              <span className="font-mono font-bold text-slate-900">₹ {budgetLimit} Lakhs</span>
            </div>
            <input
              type="range"
              min="50"
              max="600"
              step="25"
              value={budgetLimit}
              onChange={e => setBudgetLimit(parseInt(e.target.value))}
              className="w-full accent-sky-600 cursor-pointer"
            />
            <span className="text-[10px] text-slate-500 block mt-1">Capital expenditure limit</span>
          </div>

          <div>
            <label className="block text-slate-700 font-medium mb-1">Drainage Stress Condition</label>
            <select
              value={drainageStress}
              onChange={e => setDrainageStress(parseInt(e.target.value))}
              className="w-full border border-slate-300 rounded px-3 py-2 text-xs bg-white font-mono focus:ring-1 focus:ring-sky-500 focus:outline-none"
            >
              <option value={100}>100% Normal Capacity</option>
              <option value={75}>75% Drainage Stress</option>
              <option value={50}>50% Drainage Stress</option>
              <option value={25}>25% Critical Stress</option>
            </select>
            <span className="text-[10px] text-slate-500 block mt-1">Evaluates solutions under stress</span>
          </div>

          <div>
            <div className="flex justify-between mb-1">
              <label className="text-slate-700 font-medium">Population Size</label>
              <span className="font-mono font-bold">{popSize} individuals</span>
            </div>
            <input
              type="range"
              min="20"
              max="50"
              step="5"
              value={popSize}
              onChange={e => setPopSize(parseInt(e.target.value))}
              className="w-full accent-sky-600 cursor-pointer"
            />
            <span className="text-[10px] text-slate-500 block mt-1">Chromosomes per generation</span>
          </div>

          <div>
            <div className="flex justify-between mb-1">
              <label className="text-slate-700 font-medium">Generations</label>
              <span className="font-mono font-bold">{generations} epochs</span>
            </div>
            <input
              type="range"
              min="10"
              max="30"
              step="5"
              value={generations}
              onChange={e => setGenerations(parseInt(e.target.value))}
              className="w-full accent-sky-600 cursor-pointer"
            />
            <span className="text-[10px] text-slate-500 block mt-1">Evolutionary iterations</span>
          </div>

        </div>
      </div>

      {result ? (
        <div className="space-y-6 animate-in fade-in duration-200">
          
          {/* Curated Solutions Cards: Low-Cost, Balanced, High-Perf */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            
            {/* Low-Cost Solution */}
            <div
              onClick={() => setSelectedSolution(result.low_cost_solution)}
              className={`border rounded-lg p-5 cursor-pointer transition-all ${
                selectedSolution?.solution_id === result.low_cost_solution.solution_id
                  ? 'border-sky-600 bg-sky-50/50 ring-1 ring-sky-600 shadow-sm'
                  : 'border-slate-200 bg-white hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] uppercase font-mono font-bold px-2 py-0.5 rounded bg-sky-100 text-sky-800">
                  Economical Entry
                </span>
                <span className="font-mono font-bold text-slate-900 text-sm">
                  ₹ {result.low_cost_solution.total_cost_lakhs} L
                </span>
              </div>
              <h4 className="font-bold text-slate-900 text-base mb-1">Low-Cost Solution</h4>
              <p className="text-xs text-slate-500 mb-3">
                Minimum investment achieving viable stormwater attenuation.
              </p>
              <div className="grid grid-cols-2 gap-2 text-xs font-mono border-t border-slate-100 pt-3">
                <div>
                  <span className="text-slate-400 block text-[10px] font-sans">Peak Reduction</span>
                  <span className="font-bold text-slate-800">-{result.low_cost_solution.peak_reduction_pct}%</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] font-sans">Vol. Retention</span>
                  <span className="font-bold text-emerald-700">-{result.low_cost_solution.volume_reduction_pct}%</span>
                </div>
              </div>
            </div>

            {/* Balanced Solution (Knee-Point) */}
            <div
              onClick={() => setSelectedSolution(result.balanced_solution)}
              className={`border rounded-lg p-5 cursor-pointer transition-all ${
                selectedSolution?.solution_id === result.balanced_solution.solution_id
                  ? 'border-emerald-600 bg-emerald-50/50 ring-1 ring-emerald-600 shadow-sm'
                  : 'border-slate-200 bg-white hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] uppercase font-mono font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                  Recommended Knee-Point
                </span>
                <span className="font-mono font-bold text-slate-900 text-sm">
                  ₹ {result.balanced_solution.total_cost_lakhs} L
                </span>
              </div>
              <h4 className="font-bold text-slate-900 text-base mb-1">Balanced Solution</h4>
              <p className="text-xs text-slate-500 mb-3">
                Optimal trade-off minimizing distance to ideal objective vector.
              </p>
              <div className="grid grid-cols-2 gap-2 text-xs font-mono border-t border-slate-100 pt-3">
                <div>
                  <span className="text-slate-400 block text-[10px] font-sans">Peak Reduction</span>
                  <span className="font-bold text-slate-800">-{result.balanced_solution.peak_reduction_pct}%</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] font-sans">Vol. Retention</span>
                  <span className="font-bold text-emerald-700">-{result.balanced_solution.volume_reduction_pct}%</span>
                </div>
              </div>
            </div>

            {/* High-Performance Solution */}
            <div
              onClick={() => setSelectedSolution(result.high_perf_solution)}
              className={`border rounded-lg p-5 cursor-pointer transition-all ${
                selectedSolution?.solution_id === result.high_perf_solution.solution_id
                  ? 'border-indigo-600 bg-indigo-50/50 ring-1 ring-indigo-600 shadow-sm'
                  : 'border-slate-200 bg-white hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] uppercase font-mono font-bold px-2 py-0.5 rounded bg-indigo-100 text-indigo-800">
                  Maximum Mitigation
                </span>
                <span className="font-mono font-bold text-slate-900 text-sm">
                  ₹ {result.high_perf_solution.total_cost_lakhs} L
                </span>
              </div>
              <h4 className="font-bold text-slate-900 text-base mb-1">High-Performance Solution</h4>
              <p className="text-xs text-slate-500 mb-3">
                Maximum volume & peak reduction within allowable budget.
              </p>
              <div className="grid grid-cols-2 gap-2 text-xs font-mono border-t border-slate-100 pt-3">
                <div>
                  <span className="text-slate-400 block text-[10px] font-sans">Peak Reduction</span>
                  <span className="font-bold text-slate-800">-{result.high_perf_solution.peak_reduction_pct}%</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] font-sans">Vol. Retention</span>
                  <span className="font-bold text-emerald-700">-{result.high_perf_solution.volume_reduction_pct}%</span>
                </div>
              </div>
            </div>

          </div>

          {/* Pareto Frontier Scatter Plot */}
          <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-2 mb-4">
              <div>
                <span className="text-[11px] font-mono uppercase text-sky-700 font-semibold block">
                  Pareto-Optimal Trade-Off Surface
                </span>
                <h3 className="font-bold text-slate-900 text-sm">
                  Capital Cost (₹ Lakhs) vs. Residual Peak Runoff (m³/s)
                </h3>
              </div>
              <span className="text-xs font-mono text-slate-500">
                {result.pareto_frontier.length} non-dominated solutions discovered ({result.execution_time_s}s)
              </span>
            </div>

            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <ScatterChart margin={{ top: 10, right: 20, bottom: 10, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis
                    type="number"
                    dataKey="cost"
                    name="Cost"
                    unit=" L"
                    tick={{ fill: '#475569', fontSize: 11 }}
                    domain={[0, budgetLimit]}
                  />
                  <YAxis
                    type="number"
                    dataKey="peakRunoff"
                    name="Peak Runoff"
                    unit=" m³/s"
                    tick={{ fill: '#475569', fontSize: 11 }}
                  />
                  <Tooltip
                    cursor={{ strokeDasharray: '3 3' }}
                    content={({ payload }) => {
                      if (!payload || !payload.length) return null;
                      const d = payload[0].payload;
                      return (
                        <div className="bg-white border border-slate-300 p-2.5 rounded shadow-lg text-xs font-mono">
                          <p className="font-bold text-slate-900 font-sans mb-1">Solution #{d.solutionId} ({d.type})</p>
                          <p>Cost: ₹{d.cost} Lakhs</p>
                          <p>Residual Peak: {d.peakRunoff} m³/s</p>
                          <p>Residual Vol: {d.volumeM3.toLocaleString()} m³</p>
                        </div>
                      );
                    }}
                  />
                  <Scatter
                    name="Pareto Solutions"
                    data={scatterData}
                    fill="#0284c7"
                    onClick={(entry) => setSelectedSolution(entry.sol)}
                    className="cursor-pointer"
                  >
                    {scatterData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={
                          entry.solutionId === selectedSolution?.solution_id
                            ? '#0f172a'
                            : '#0284c7'
                        }
                        r={entry.solutionId === selectedSolution?.solution_id ? 7 : 4.5}
                      />
                    ))}
                  </Scatter>
                </ScatterChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Detailed Selected Solution Breakdown Table */}
          {selectedSolution && (
            <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-3">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-mono text-xs text-sky-700 font-bold">
                      Solution #{selectedSolution.solution_id}
                    </span>
                    <span className="text-xs px-2 py-0.5 rounded font-mono bg-slate-100 text-slate-800">
                      {selectedSolution.solution_type}
                    </span>
                  </div>
                  <h3 className="font-bold text-slate-900 text-sm mt-0.5">
                    Spatial Intervention Allocations across Tiruchirappalli
                  </h3>
                </div>

                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => handleApplyToActive(selectedSolution)}
                    className="px-4 py-2 bg-emerald-700 hover:bg-emerald-600 text-white rounded text-xs font-medium transition-colors"
                  >
                    Apply to Active Portfolio
                  </button>
                  <button
                    onClick={onNavigateToSimulation}
                    className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded text-xs font-medium transition-colors"
                  >
                    Test in Simulation Lab →
                  </button>
                </div>
              </div>

              {selectedSolution.allocations.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-100 text-slate-700 font-mono border-b border-slate-200">
                        <th className="py-2.5 px-3">Site Location</th>
                        <th className="py-2.5 px-3">Subcatchment</th>
                        <th className="py-2.5 px-3">GI Technology</th>
                        <th className="py-2.5 px-3">Allocated Area</th>
                        <th className="py-2.5 px-3 font-semibold">Estimated Cost</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-mono">
                      {selectedSolution.allocations.map((alloc, idx) => (
                        <tr key={idx} className="hover:bg-slate-50">
                          <td className="py-2 px-3 font-sans font-medium text-slate-900">{alloc.site_name}</td>
                          <td className="py-2 px-3 font-bold">{alloc.subcatchment_code}</td>
                          <td className="py-2 px-3 font-sans">{alloc.intervention_type}</td>
                          <td className="py-2 px-3">{alloc.allocated_area_m2.toLocaleString()} m²</td>
                          <td className="py-2 px-3 font-bold text-slate-900">₹ {alloc.estimated_cost_inr_lakhs} L</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-xs text-slate-500 py-3">
                  Zero intervention portfolio (Baseline condition).
                </p>
              )}
            </div>
          )}

        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-lg p-12 text-center text-slate-400">
          <Sliders className="w-10 h-10 mx-auto mb-3 opacity-30 text-slate-600" />
          <h4 className="font-bold text-slate-700 text-sm mb-1">No Optimization Run Yet</h4>
          <p className="text-xs text-slate-500 max-w-md mx-auto mb-4">
            Configure your budget ceiling and hyperparameters above, then click Execute Optimisation to run the multi-objective genetic algorithm.
          </p>
          <button
            onClick={handleRunOptimization}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded text-xs font-medium transition-colors"
          >
            Run Default NSGA-II Search (₹ 300 Lakhs Budget)
          </button>
        </div>
      )}

    </div>
  );
};
