import React, { useState } from 'react';
import { RainfallScenario } from '../types';
import { createCustomRainfall } from '../api';
import {
  CloudRain, Plus, Check, AlertCircle, Droplets, Clock, Calendar, Gauge, Info
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, ReferenceLine
} from 'recharts';

interface RainfallLabPageProps {
  scenarios: RainfallScenario[];
  onSelectScenario?: (scenario: RainfallScenario) => void;
  onRefreshScenarios: () => void;
}

const RETURN_PERIOD_COLOR: Record<number, string> = {
  2: 'bg-sky-100 text-sky-800 border-sky-300',
  5: 'bg-blue-100 text-blue-800 border-blue-300',
  10: 'bg-indigo-100 text-indigo-800 border-indigo-300',
  25: 'bg-violet-100 text-violet-800 border-violet-300',
};

const CustomTooltipHyeto = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-900 text-white text-xs rounded-lg px-3 py-2 shadow-xl border border-slate-700">
        <p className="font-mono font-bold text-sky-300">t = {label} min</p>
        <p className="text-slate-200">Intensity: <span className="font-bold text-sky-400">{payload[0].value} mm/hr</span></p>
      </div>
    );
  }
  return null;
};

export const RainfallLabPage: React.FC<RainfallLabPageProps> = ({
  scenarios,
  onRefreshScenarios,
}) => {
  const [selectedScenarioId, setSelectedScenarioId] = useState<number>(
    scenarios.length >= 3 ? scenarios[2].id : (scenarios[0]?.id || 1)
  );

  const [customName, setCustomName]           = useState('');
  const [customDuration, setCustomDuration]   = useState<number>(2.0);
  const [customTotalRain, setCustomTotalRain] = useState<number>(85);
  const [submitting, setSubmitting]           = useState(false);
  const [successMsg, setSuccessMsg]           = useState<string | null>(null);
  const [errorMsg, setErrorMsg]               = useState<string | null>(null);

  const selectedScenario = scenarios.find(s => s.id === selectedScenarioId) ?? scenarios[0];

  const hyetoData = selectedScenario?.hyetograph.map(pt => ({
    time_min: pt.time_min,
    intensity: pt.intensity_mmhr,
  })) ?? [];

  const peakIntensity = Math.max(...hyetoData.map(d => d.intensity));

  const handleCreateCustom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customName.trim()) return;
    setSubmitting(true);
    setSuccessMsg(null);
    setErrorMsg(null);
    try {
      const created = await createCustomRainfall({
        name: customName,
        duration_hrs: customDuration,
        total_rainfall_mm: customTotalRain,
      });
      setSuccessMsg(`Storm "${created.name}" created — ${created.total_rainfall_mm} mm over ${created.duration_hrs} hrs.`);
      setCustomName('');
      onRefreshScenarios();
      setSelectedScenarioId(created.id);
    } catch (err: any) {
      setErrorMsg('API error: could not create storm. Check server connection and retry.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">

      {/* ── Header ──────────────────────────────────────────────── */}
      <div className="bg-gradient-to-r from-slate-900 to-blue-900 rounded-2xl p-7 shadow-xl text-white">
        <div className="flex items-center gap-2 text-xs font-mono text-blue-300 mb-2">
          <CloudRain className="w-3.5 h-3.5" />
          <span>METEOROLOGICAL STRESS TESTING / DESIGN HYETOGRAPHS</span>
        </div>
        <h1 className="text-2xl font-bold tracking-tight mb-1">Rainfall Scenario &amp; Hyetograph Lab</h1>
        <p className="text-sm text-slate-300 max-w-3xl leading-relaxed">
          Simulate diverse precipitation regimes from IMD design storms to cyclonic downpours. Every
          scenario includes a full time-series hyetograph and strict provenance attribution.
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          <span className="inline-flex items-center gap-1.5 bg-white/10 border border-white/20 rounded-full px-3 py-1 text-xs font-mono text-blue-200">
            <Droplets className="w-3 h-3" />
            {scenarios.length} scenarios loaded
          </span>
          {selectedScenario && (
            <span className="inline-flex items-center gap-1.5 bg-sky-600/30 border border-sky-500/40 rounded-full px-3 py-1 text-xs font-mono text-sky-200">
              Active: {selectedScenario.name}
            </span>
          )}
        </div>
      </div>

      {/* ── Main Grid ───────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Scenario selector tabs */}
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-5 space-y-3">
          <h3 className="font-bold text-slate-900 text-sm border-b border-slate-100 pb-2 flex items-center justify-between">
            <span>Storm Scenarios</span>
            <span className="text-xs text-slate-400 font-mono">{scenarios.length} loaded</span>
          </h3>

          <div className="space-y-2 max-h-[480px] overflow-y-auto pr-1">
            {scenarios.map(sc => {
              const isSelected = sc.id === selectedScenarioId;
              const rpColor = RETURN_PERIOD_COLOR[sc.return_period_yrs] ?? 'bg-slate-100 text-slate-700 border-slate-300';
              return (
                <button
                  key={sc.id}
                  onClick={() => setSelectedScenarioId(sc.id)}
                  className={`w-full text-left p-3 rounded-xl border text-xs cursor-pointer transition-all ${
                    isSelected
                      ? 'border-sky-500 bg-sky-50 shadow-sm ring-1 ring-sky-200'
                      : 'border-slate-200 bg-white hover:bg-slate-50 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-bold text-slate-900 text-[12px] leading-tight pr-2">{sc.name}</span>
                    <span className={`shrink-0 px-2 py-0.5 rounded-full border text-[10px] font-mono font-semibold ${rpColor}`}>
                      {sc.return_period_yrs}y
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-1.5 font-mono text-[11px] text-slate-600 my-1.5">
                    <div>
                      <span className="text-slate-400 block text-[9px] uppercase font-sans">Duration</span>
                      {sc.duration_hrs} hrs
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[9px] uppercase font-sans">Total</span>
                      {sc.total_rainfall_mm} mm
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[9px] uppercase font-sans">Peak</span>
                      <span className="font-bold text-sky-700">{sc.peak_intensity_mmhr}</span> <span className="text-[9px]">mm/h</span>
                    </div>
                  </div>

                  <div className="text-[10px] text-slate-400 font-mono truncate">[{sc.provenance_type}]</div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Hyetograph detail panel */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl shadow-sm p-6 flex flex-col">

          {selectedScenario && (
            <>
              {/* scenario meta */}
              <div className="pb-4 border-b border-slate-100 mb-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <span className="text-[11px] font-mono uppercase text-sky-700 font-semibold block mb-0.5">
                      Selected Scenario
                    </span>
                    <h2 className="font-bold text-slate-900 text-base leading-tight">{selectedScenario.name}</h2>
                    <p className="text-xs text-slate-500 mt-1 max-w-xl">{selectedScenario.description}</p>
                  </div>

                  <div className="flex flex-wrap gap-2 shrink-0">
                    {/* Storm type badge */}
                    <span className="inline-flex items-center gap-1 bg-blue-50 border border-blue-200 text-blue-800 text-[11px] font-mono px-2.5 py-1 rounded-full">
                      <CloudRain className="w-3 h-3" />
                      {selectedScenario.storm_type.split('(')[0].trim()}
                    </span>
                    <span className="inline-flex items-center gap-1 bg-slate-100 text-slate-700 text-[11px] font-mono px-2.5 py-1 rounded-full">
                      <Calendar className="w-3 h-3" />
                      {selectedScenario.return_period_yrs}-yr return
                    </span>
                    <span className="inline-flex items-center gap-1 bg-slate-100 text-slate-700 text-[11px] font-mono px-2.5 py-1 rounded-full">
                      <Clock className="w-3 h-3" />
                      {selectedScenario.duration_hrs} hr
                    </span>
                    <span className="inline-flex items-center gap-1 bg-sky-50 border border-sky-200 text-sky-800 text-[11px] font-mono px-2.5 py-1 rounded-full">
                      <Gauge className="w-3 h-3" />
                      Peak: {selectedScenario.peak_intensity_mmhr} mm/hr
                    </span>
                    <span className="inline-flex items-center gap-1 bg-indigo-50 border border-indigo-200 text-indigo-800 text-[11px] font-mono px-2.5 py-1 rounded-full">
                      <Droplets className="w-3 h-3" />
                      {selectedScenario.total_rainfall_mm} mm total
                    </span>
                  </div>
                </div>
              </div>

              {/* Hyetograph chart */}
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-3">
                  <h4 className="text-xs font-mono font-semibold text-slate-700 uppercase">
                    Hyetograph — Rainfall Intensity vs. Time
                  </h4>
                </div>
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={hyetoData} margin={{ top: 10, right: 20, left: 10, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                      <XAxis
                        dataKey="time_min"
                        tick={{ fill: '#475569', fontSize: 11, fontFamily: 'monospace' }}
                        label={{ value: 'Time (min)', position: 'insideBottom', offset: -2, fill: '#94a3b8', fontSize: 11, fontFamily: 'monospace' }}
                        height={40}
                      />
                      <YAxis
                        tick={{ fill: '#475569', fontSize: 11 }}
                        label={{ value: 'Intensity (mm/hr)', angle: -90, position: 'insideLeft', offset: 15, fill: '#94a3b8', fontSize: 11, fontFamily: 'monospace' }}
                        domain={[0, Math.ceil(peakIntensity * 1.1 / 10) * 10]}
                      />
                      <Tooltip content={<CustomTooltipHyeto />} />
                      <ReferenceLine y={selectedScenario.peak_intensity_mmhr} stroke="#f97316" strokeDasharray="4 2" label={{ value: 'Peak', fill: '#f97316', fontSize: 10, fontFamily: 'monospace' }} />
                      <Bar dataKey="intensity" fill="#0ea5e9" radius={[4, 4, 0, 0]} name="Intensity (mm/hr)" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* provenance badge */}
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <span className="inline-flex items-center gap-1 font-mono">
                  <Info className="w-3 h-3" />
                  Source: {selectedScenario.provenance_type}
                </span>
                <span className="font-mono">
                  {hyetoData.length} time steps
                </span>
              </div>
            </>
          )}
        </div>
      </div>

      {/* ── Custom Storm Builder ─────────────────────────────────── */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-4 mb-5">
          <Plus className="w-4 h-4 text-sky-600" />
          <h3 className="font-bold text-slate-900 text-sm">Create Custom Storm Profile</h3>
        </div>

        <form onSubmit={handleCreateCustom} className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Storm Name</label>
            <input
              type="text"
              required
              placeholder="e.g. Trichy Extreme Cloudburst 2026"
              value={customName}
              onChange={e => setCustomName(e.target.value)}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-sky-500 focus:border-sky-500 focus:outline-none transition"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Duration (hrs) <span className="font-normal text-slate-400">— {customDuration} hr</span>
            </label>
            <input
              type="number"
              min="0.5"
              max="12"
              step="0.5"
              value={customDuration}
              onChange={e => setCustomDuration(parseFloat(e.target.value))}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-sky-500 focus:border-sky-500 focus:outline-none transition"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Total Rainfall (mm) <span className="font-normal text-slate-400">— {customTotalRain} mm</span>
            </label>
            <input
              type="number"
              min="10"
              max="500"
              step="1"
              value={customTotalRain}
              onChange={e => setCustomTotalRain(parseFloat(e.target.value))}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-sky-500 focus:border-sky-500 focus:outline-none transition"
            />
          </div>

          <div className="flex items-end">
            <button
              type="submit"
              disabled={submitting}
              className="w-full py-2.5 bg-sky-600 hover:bg-sky-700 disabled:bg-slate-300 text-white rounded-lg font-semibold text-xs transition-colors shadow-sm flex items-center justify-center gap-2"
            >
              {submitting ? (
                <>
                  <span className="animate-spin">⟳</span> Synthesizing...
                </>
              ) : (
                <>
                  <Plus className="w-3.5 h-3.5" /> Generate Storm
                </>
              )}
            </button>
          </div>
        </form>

        {/* feedback toasts */}
        {successMsg && (
          <div className="mt-4 flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg px-4 py-2.5 text-xs font-medium">
            <Check className="w-4 h-4 text-emerald-600 shrink-0" />
            {successMsg}
          </div>
        )}
        {errorMsg && (
          <div className="mt-4 flex items-center gap-2 bg-red-50 border border-red-200 text-red-800 rounded-lg px-4 py-2.5 text-xs font-medium">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            {errorMsg}
          </div>
        )}
      </div>

    </div>
  );
};
