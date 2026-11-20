import React, { useState } from 'react';
import { Subcatchment } from '../types';
import { recalculateSusceptibility } from '../api';
import { Layers, Sliders, Shield, AlertTriangle, Info, Check, RefreshCw } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend
} from 'recharts';

interface SusceptibilityPageProps {
  subcatchments: Subcatchment[];
  onOpenFingerprint: (code: string) => void;
  onUpdateSubcatchments: (updated: Subcatchment[]) => void;
}

export const SusceptibilityPage: React.FC<SusceptibilityPageProps> = ({
  subcatchments,
  onOpenFingerprint,
  onUpdateSubcatchments
}) => {
  // Weights state
  const [wElevation, setWElevation] = useState(0.20);
  const [wSlope, setWSlope] = useState(0.20);
  const [wFlow, setWFlow] = useState(0.25);
  const [wImpervious, setWImpervious] = useState(0.20);
  const [wSoil, setWSoil] = useState(0.15);
  const [loading, setLoading] = useState(false);
  const [recalcSummary, setRecalcSummary] = useState<string | null>(null);

  const totalWeight = Math.round((wElevation + wSlope + wFlow + wImpervious + wSoil) * 100) / 100;
  const isWeightValid = Math.abs(totalWeight - 1.0) < 0.01;

  const handleRecalculate = async () => {
    if (!isWeightValid) return;
    setLoading(true);
    try {
      const res = await recalculateSusceptibility({
        weight_elevation: wElevation,
        weight_slope: wSlope,
        weight_flow_accum: wFlow,
        weight_impervious: wImpervious,
        weight_soil: wSoil
      });

      // Update local subcatchments state
      const updatedList = subcatchments.map(s => {
        const found = res.subcatchments.find((item: any) => item.code === s.code);
        if (found) {
          return {
            ...s,
            susceptibility_score: found.normalized_score,
            dominant_factor: found.dominant_factor
          };
        }
        return s;
      });
      // Sort descending
      updatedList.sort((a, b) => b.susceptibility_score - a.susceptibility_score);
      onUpdateSubcatchments(updatedList);
      setRecalcSummary(`Successfully updated 12 subcatchments. High Risk: ${res.high_risk_count}, Moderate: ${res.moderate_risk_count}, Low: ${res.low_risk_count}.`);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleResetWeights = () => {
    setWElevation(0.20);
    setWSlope(0.20);
    setWFlow(0.25);
    setWImpervious(0.20);
    setWSoil(0.15);
  };

  const chartData = subcatchments.map(s => ({
    name: s.code,
    Score: s.susceptibility_score,
    Category: s.susceptibility_score >= 0.65 ? 'High' : s.susceptibility_score >= 0.40 ? 'Moderate' : 'Low'
  }));

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 text-xs font-mono text-slate-500 mb-1">
              <span>MULTICRITERIA EVALUATION</span>
              <span>/</span>
              <span className="font-semibold text-slate-800">LINEAR UTILITY NORMALIZATION</span>
            </div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              Flood Susceptibility Index & Explainability Engine
            </h1>
            <p className="text-xs text-slate-600 mt-1 max-w-3xl">
              Transparent, weight-adjustable multicriteria scoring across 5 physical determinants. Inspect dominant contributors and trigger individual subcatchment Flood Resilience Fingerprints.
            </p>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded p-3 text-xs font-mono shrink-0">
            <span className="text-slate-500 block text-[11px]">ACTIVE FORMULATION</span>
            <span className="font-semibold text-slate-800">
              S = ∑ (wᵢ · Norm(Fᵢ))
            </span>
          </div>
        </div>
      </div>

      {/* Interactive Weight Adjustment Panel */}
      <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center space-x-2">
            <Sliders className="w-4 h-4 text-sky-700" />
            <h3 className="font-bold text-slate-900 text-sm">
              Adjust Transparent Factor Weights (Sum = 1.00)
            </h3>
          </div>
          <div className="flex items-center space-x-3 text-xs font-mono">
            <span>
              Total: <strong className={isWeightValid ? 'text-emerald-700' : 'text-red-600'}>{totalWeight.toFixed(2)}</strong> / 1.00
            </span>
            <button
              onClick={handleResetWeights}
              className="text-slate-500 hover:text-slate-800 underline font-sans"
            >
              Reset Defaults
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-5 gap-4">
          
          <div className="bg-slate-50 p-3 rounded border border-slate-200 space-y-1">
            <div className="flex justify-between text-xs font-mono">
              <span className="font-sans text-slate-700 font-medium">Elevation</span>
              <span className="font-bold">{wElevation.toFixed(2)}</span>
            </div>
            <input
              type="range"
              min="0.0"
              max="0.5"
              step="0.05"
              value={wElevation}
              onChange={e => setWElevation(parseFloat(e.target.value))}
              className="w-full accent-sky-600 cursor-pointer"
            />
            <span className="text-[10px] text-slate-500 block">Low-lying elevation risk</span>
          </div>

          <div className="bg-slate-50 p-3 rounded border border-slate-200 space-y-1">
            <div className="flex justify-between text-xs font-mono">
              <span className="font-sans text-slate-700 font-medium">Slope Gradient</span>
              <span className="font-bold">{wSlope.toFixed(2)}</span>
            </div>
            <input
              type="range"
              min="0.0"
              max="0.5"
              step="0.05"
              value={wSlope}
              onChange={e => setWSlope(parseFloat(e.target.value))}
              className="w-full accent-sky-600 cursor-pointer"
            />
            <span className="text-[10px] text-slate-500 block">Flat slopes constrain flow</span>
          </div>

          <div className="bg-slate-50 p-3 rounded border border-slate-200 space-y-1">
            <div className="flex justify-between text-xs font-mono">
              <span className="font-sans text-slate-700 font-medium">Flow Accum.</span>
              <span className="font-bold">{wFlow.toFixed(2)}</span>
            </div>
            <input
              type="range"
              min="0.0"
              max="0.5"
              step="0.05"
              value={wFlow}
              onChange={e => setWFlow(parseFloat(e.target.value))}
              className="w-full accent-sky-600 cursor-pointer"
            />
            <span className="text-[10px] text-slate-500 block">Upstream contributing cells</span>
          </div>

          <div className="bg-slate-50 p-3 rounded border border-slate-200 space-y-1">
            <div className="flex justify-between text-xs font-mono">
              <span className="font-sans text-slate-700 font-medium">Imperviousness</span>
              <span className="font-bold">{wImpervious.toFixed(2)}</span>
            </div>
            <input
              type="range"
              min="0.0"
              max="0.5"
              step="0.05"
              value={wImpervious}
              onChange={e => setWImpervious(parseFloat(e.target.value))}
              className="w-full accent-sky-600 cursor-pointer"
            />
            <span className="text-[10px] text-slate-500 block">Built-up / concrete seal</span>
          </div>

          <div className="bg-slate-50 p-3 rounded border border-slate-200 space-y-1">
            <div className="flex justify-between text-xs font-mono">
              <span className="font-sans text-slate-700 font-medium">Soil Class</span>
              <span className="font-bold">{wSoil.toFixed(2)}</span>
            </div>
            <input
              type="range"
              min="0.0"
              max="0.5"
              step="0.05"
              value={wSoil}
              onChange={e => setWSoil(parseFloat(e.target.value))}
              className="w-full accent-sky-600 cursor-pointer"
            />
            <span className="text-[10px] text-slate-500 block">Low permeability impedance</span>
          </div>

        </div>

        <div className="flex items-center justify-between pt-2">
          <div>
            {recalcSummary && (
              <span className="text-xs font-medium text-emerald-800 flex items-center space-x-1">
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span>{recalcSummary}</span>
              </span>
            )}
          </div>
          <button
            onClick={handleRecalculate}
            disabled={!isWeightValid || loading}
            className={`px-4 py-2 rounded text-xs font-medium flex items-center space-x-2 transition-colors ${
              isWeightValid && !loading
                ? 'bg-slate-900 hover:bg-slate-800 text-white'
                : 'bg-slate-200 text-slate-400 cursor-not-allowed'
            }`}
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>{loading ? 'Recalculating...' : 'Recalculate Susceptibility Scores'}</span>
          </button>
        </div>
      </div>

      {/* Susceptibility Score Distribution Chart */}
      <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm">
        <h3 className="font-bold text-slate-900 text-sm mb-1 uppercase font-mono tracking-wider">
          Subcatchment Comparative Susceptibility Profile
        </h3>
        <p className="text-xs text-slate-500 mb-3">
          Relative ranking from high risk (≥0.65) to low risk (&lt;0.40).
        </p>
        <div className="h-56 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="name" tick={{ fill: '#475569', fontSize: 11, fontFamily: 'monospace' }} />
              <YAxis domain={[0, 1.0]} tick={{ fill: '#475569', fontSize: 11 }} />
              <Tooltip
                formatter={(val: any) => [val, 'Susceptibility Score']}
                contentStyle={{ backgroundColor: '#ffffff', borderColor: '#cbd5e1', fontSize: '12px' }}
              />
              <Bar dataKey="Score" fill="#0284c7" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Ranked Subcatchments Table */}
      <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-bold text-slate-900 text-sm">
            Ranked Subcatchment Breakdown & Explainability Attributes
          </h3>
          <span className="text-xs text-slate-500 font-mono">12 basins ranked</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-100 text-slate-700 font-mono border-b border-slate-200">
                <th className="py-2.5 px-3">Rank</th>
                <th className="py-2.5 px-3">Code</th>
                <th className="py-2.5 px-3">Subcatchment Name</th>
                <th className="py-2.5 px-3">Elevation</th>
                <th className="py-2.5 px-3">Slope</th>
                <th className="py-2.5 px-3">Impervious %</th>
                <th className="py-2.5 px-3">Soil Texture</th>
                <th className="py-2.5 px-3">Score</th>
                <th className="py-2.5 px-3">Dominant Factor</th>
                <th className="py-2.5 px-3 text-right">Diagnostic</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono">
              {subcatchments.map((sub, idx) => (
                <tr key={sub.code} className="hover:bg-slate-50">
                  <td className="py-2.5 px-3 font-bold text-slate-400">#{idx + 1}</td>
                  <td className="py-2.5 px-3 font-bold text-slate-900">{sub.code}</td>
                  <td className="py-2.5 px-3 font-sans font-medium text-slate-800">{sub.name}</td>
                  <td className="py-2.5 px-3">{sub.elevation_m} m</td>
                  <td className="py-2.5 px-3">{sub.slope_pct}%</td>
                  <td className="py-2.5 px-3">{sub.impervious_pct}%</td>
                  <td className="py-2.5 px-3 font-sans">{sub.soil_type}</td>
                  <td className="py-2.5 px-3 font-bold text-slate-900">{sub.susceptibility_score}</td>
                  <td className="py-2.5 px-3 font-sans text-slate-700">
                    <span className="inline-block bg-slate-100 px-2 py-0.5 rounded text-[11px]">
                      {sub.dominant_factor}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-right font-sans">
                    <button
                      onClick={() => onOpenFingerprint(sub.code)}
                      className="px-2.5 py-1 bg-sky-50 text-sky-800 hover:bg-sky-600 hover:text-white rounded text-[11px] font-medium transition-colors border border-sky-200"
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

      {/* Critical Scientific Limitations Notice */}
      <div className="bg-amber-50/70 border border-amber-200 rounded-lg p-4 flex items-start space-x-3 text-xs text-amber-900">
        <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div>
          <h4 className="font-bold text-amber-950 font-mono uppercase text-[11px] mb-1">
            Methodological Notice: Susceptibility Index vs. Calibrated Flood Probability
          </h4>
          <p className="leading-relaxed">
            The Flood Susceptibility Index presented here is an explainable multicriteria spatial index reflecting relative topographical, edaphic, and land-cover vulnerability. <strong>It does not represent a calibrated stochastic flood recurrence probability.</strong> Hydraulic inundation depths must be validated using hydrodynamic modeling (SWMM) or calibrated local gauge records.
          </p>
        </div>
      </div>

    </div>
  );
};
