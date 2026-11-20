import React, { useState } from 'react';
import { RainfallScenario } from '../types';
import { createCustomRainfall } from '../api';
import { CloudRain, Plus, Info, Check, Calendar, Clock, BarChart2 } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, AreaChart, Area
} from 'recharts';

interface RainfallLabPageProps {
  scenarios: RainfallScenario[];
  onSelectScenario?: (scenario: RainfallScenario) => void;
  onRefreshScenarios: () => void;
}

export const RainfallLabPage: React.FC<RainfallLabPageProps> = ({
  scenarios,
  onRefreshScenarios
}) => {
  const [selectedScenarioId, setSelectedScenarioId] = useState<number>(
    scenarios.length > 2 ? scenarios[2].id : (scenarios[0]?.id || 1)
  );

  // Custom storm builder state
  const [customName, setCustomName] = useState('');
  const [customDuration, setCustomDuration] = useState(2.0);
  const [customTotalRain, setCustomTotalRain] = useState(85.0);
  const [customPeakRatio, setCustomPeakRatio] = useState(0.4);
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const selectedScenario = scenarios.find(s => s.id === selectedScenarioId) || scenarios[0];

  const handleCreateCustom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customName.trim()) return;
    setSubmitting(true);
    try {
      const created = await createCustomRainfall({
        name: customName,
        duration_hrs: customDuration,
        total_rainfall_mm: customTotalRain,
        peak_ratio: customPeakRatio
      });
      setSuccessMsg(`Custom storm "${created.name}" generated.`);
      setCustomName('');
      onRefreshScenarios();
      setSelectedScenarioId(created.id);
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const hyetoChartData = selectedScenario ? selectedScenario.hyetograph.map(pt => ({
    time: `${pt.time_min}m`,
    time_min: pt.time_min,
    intensity: pt.intensity_mmhr
  })) : [];

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 text-xs font-mono text-slate-500 mb-1">
              <span>METEOROLOGICAL STRESS TESTING</span>
              <span>/</span>
              <span className="font-semibold text-slate-800">DESIGN HYETOGRAPHS</span>
            </div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              Rainfall Scenario & Hyetograph Lab
            </h1>
            <p className="text-xs text-slate-600 mt-1 max-w-3xl">
              Simulate diverse precipitation regimes from standard IMD design storms to high-intensity convective cloudbursts. Every scenario contains full hyetograph time-series and strict provenance attribution.
            </p>
          </div>

          <div className="flex items-center space-x-2 bg-slate-50 border border-slate-200 rounded px-3 py-1.5 text-xs font-mono">
            <CloudRain className="w-4 h-4 text-sky-700" />
            <span>Active: <strong>{selectedScenario?.name}</strong></span>
          </div>
        </div>
      </div>

      {/* Main Grid: Scenario Selector & Hyetograph Visualizer */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Scenario List */}
        <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm space-y-3">
          <h3 className="font-bold text-slate-900 text-sm flex items-center justify-between border-b border-slate-100 pb-2">
            <span>Available Storm Scenarios</span>
            <span className="text-xs text-slate-500 font-mono">{scenarios.length} loaded</span>
          </h3>

          <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
            {scenarios.map((sc) => {
              const isSelected = sc.id === selectedScenarioId;
              return (
                <div
                  key={sc.id}
                  onClick={() => setSelectedScenarioId(sc.id)}
                  className={`p-3 rounded-lg border text-xs cursor-pointer transition-all ${
                    isSelected
                      ? 'border-sky-600 bg-sky-50/70 shadow-sm'
                      : 'border-slate-200 bg-white hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between font-mono mb-1">
                    <span className="font-bold text-slate-900 truncate max-w-[190px]">{sc.name}</span>
                    <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[10px]">
                      {sc.return_period_yrs}y Return
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 font-mono text-[11px] text-slate-600 my-1.5">
                    <div>
                      <span className="text-slate-400 block text-[10px] font-sans">Duration</span>
                      <span>{sc.duration_hrs} hrs</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px] font-sans">Total Rain</span>
                      <span>{sc.total_rainfall_mm} mm</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px] font-sans">Peak Rate</span>
                      <span className="font-bold text-sky-700">{sc.peak_intensity_mmhr} mm/h</span>
                    </div>
                  </div>

                  <div className="text-[10px] text-slate-500 mt-1 truncate font-mono">
                    [{sc.provenance_type}]
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Selected Hyetograph Chart */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-lg p-5 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-2 mb-4">
              <div>
                <span className="text-[11px] font-mono uppercase text-sky-700 font-semibold block">
                  Scenario Profile
                </span>
                <h3 className="font-bold text-slate-900 text-base">{selectedScenario?.name}</h3>
                <p className="text-xs text-slate-500">{selectedScenario?.description}</p>
              </div>

              <div className="flex items-center space-x-3 text-xs font-mono shrink-0">
                <span className="bg-slate-100 px-2 py-1 rounded text-slate-800">
                  Total: <strong>{selectedScenario?.total_rainfall_mm} mm</strong>
                </span>
                <span className="bg-sky-50 text-sky-800 border border-sky-200 px-2 py-1 rounded">
                  Peak: <strong>{selectedScenario?.peak_intensity_mmhr} mm/h</strong>
                </span>
              </div>
            </div>

            {/* Hyetograph Recharts Bar Chart */}
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={hyetoChartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="time" tick={{ fill: '#475569', fontSize: 11, fontFamily: 'monospace' }} />
                  <YAxis unit=" mm/h" tick={{ fill: '#475569', fontSize: 11 }} />
                  <Tooltip
                    formatter={(val: any) => [`${val} mm/hr`, 'Rainfall Intensity']}
                    labelFormatter={(label) => `Time: ${label}`}
                    contentStyle={{ backgroundColor: '#ffffff', borderColor: '#cbd5e1', fontSize: '12px' }}
                  />
                  <Bar dataKey="intensity" fill="#0284c7" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span className="font-mono">Classification: {selectedScenario?.provenance_type}</span>
            <span className="font-mono">Time step: 15-minute intervals</span>
          </div>
        </div>

      </div>

      {/* Custom Storm Builder Form */}
      <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm">
        <div className="flex items-center space-x-2 border-b border-slate-100 pb-3 mb-4">
          <Plus className="w-4 h-4 text-sky-700" />
          <h3 className="font-bold text-slate-900 text-sm">
            Synthetic Storm Designer (User-Entered Hypothetical Regimes)
          </h3>
        </div>

        <form onSubmit={handleCreateCustom} className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs">
          <div>
            <label className="block text-slate-700 font-medium mb-1">Scenario Label</label>
            <input
              type="text"
              required
              placeholder="e.g. Trichy Extreme Cloudburst 2026"
              value={customName}
              onChange={e => setCustomName(e.target.value)}
              className="w-full border border-slate-300 rounded px-3 py-2 text-xs focus:ring-1 focus:ring-sky-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-slate-700 font-medium mb-1">Duration (Hours): {customDuration} hrs</label>
            <input
              type="range"
              min="0.5"
              max="6.0"
              step="0.5"
              value={customDuration}
              onChange={e => setCustomDuration(parseFloat(e.target.value))}
              className="w-full accent-sky-600 cursor-pointer mt-1"
            />
          </div>

          <div>
            <label className="block text-slate-700 font-medium mb-1">Total Rainfall Depth (mm): {customTotalRain} mm</label>
            <input
              type="number"
              min="10"
              max="350"
              value={customTotalRain}
              onChange={e => setCustomTotalRain(parseFloat(e.target.value))}
              className="w-full border border-slate-300 rounded px-3 py-2 text-xs focus:ring-1 focus:ring-sky-500 focus:outline-none"
            />
          </div>

          <div className="flex items-end">
            <button
              type="submit"
              disabled={submitting}
              className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white rounded font-medium transition-colors"
            >
              {submitting ? 'Synthesizing...' : 'Generate Design Storm'}
            </button>
          </div>
        </form>

        {successMsg && (
          <p className="mt-3 text-xs text-emerald-800 font-medium flex items-center space-x-1">
            <Check className="w-3.5 h-3.5 text-emerald-600" />
            <span>{successMsg}</span>
          </p>
        )}
      </div>

    </div>
  );
};
