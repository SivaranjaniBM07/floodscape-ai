import React, { useState } from 'react';
import { InterventionSite, ProposedInterventionItem } from '../types';
import {
  ShieldCheck, Plus, Trash2, ArrowRight, Layers, DollarSign,
  Leaf, TrendingDown, AlertCircle, CheckCircle2, MapPin
} from 'lucide-react';

interface GiPlannerPageProps {
  interventionSites: InterventionSite[];
  activeInterventions: ProposedInterventionItem[];
  onUpdateInterventions: (interventions: ProposedInterventionItem[]) => void;
  onNavigateToSimulation: () => void;
}

const GI_COSTS: Record<string, number> = {
  'Rain Garden': 15,
  'Permeable Pavement': 25,
  'Bioswale': 10,
  'Retention Storage': 15,
};

const GI_TYPES = [
  {
    type: 'Rain Garden',
    icon: '🌿',
    cost: 15,
    unit: '₹15/m²',
    desc: 'Excavated vegetated basin with engineered sandy-organic filter bed for bioretention.',
    retention: '85%',
    depth: '250 mm',
    color: 'emerald',
  },
  {
    type: 'Permeable Pavement',
    icon: '🧱',
    cost: 25,
    unit: '₹25/m²',
    desc: 'Porous concrete or interlocking block paving over open-graded crushed stone reservoir.',
    retention: '80%',
    depth: '180 mm',
    color: 'sky',
  },
  {
    type: 'Bioswale',
    icon: '🌾',
    cost: 10,
    unit: '₹10/m²',
    desc: 'Linear vegetated channel to attenuate flow velocity and facilitate lateral infiltration.',
    retention: '70%',
    depth: '200 mm',
    color: 'teal',
  },
  {
    type: 'Retention Storage',
    icon: '💧',
    cost: 15,
    unit: '₹15/m²',
    desc: 'Excavated semi-subsurface retention pond for significant peak stormwater storage.',
    retention: '95%',
    depth: '1500 mm',
    color: 'indigo',
  },
];

const PRIORITY_STYLES: Record<string, { badge: string; label: string }> = {
  Critical: { badge: 'bg-red-100 text-red-800 border border-red-300', label: 'CRITICAL' },
  High: { badge: 'bg-amber-100 text-amber-800 border border-amber-300', label: 'HIGH' },
  Medium: { badge: 'bg-blue-100 text-blue-800 border border-blue-300', label: 'MEDIUM' },
  Low: { badge: 'bg-slate-100 text-slate-700 border border-slate-200', label: 'LOW' },
};

export const GiPlannerPage: React.FC<GiPlannerPageProps> = ({
  interventionSites,
  activeInterventions,
  onUpdateInterventions,
  onNavigateToSimulation,
}) => {
  const [selectedSiteId, setSelectedSiteId] = useState<number | null>(null);
  const [selectedGiType, setSelectedGiType] = useState<string>('Rain Garden');
  const [allocatedArea, setAllocatedArea] = useState<number>(1500);

  const selectedSite = selectedSiteId
    ? interventionSites.find(s => s.id === selectedSiteId)
    : null;

  const maxArea = selectedSite?.available_area_m2 || 5000;
  const costPerM2 = GI_COSTS[selectedGiType] || 15;
  const calculatedCostLakhs = parseFloat(((allocatedArea * costPerM2) / 100000).toFixed(2));

  const totalArea = activeInterventions.reduce((s, i) => s + i.allocated_area_m2, 0);
  const totalCost = activeInterventions.reduce((s, i) => s + (i.estimated_cost_inr_lakhs || 0), 0);
  const avgPeakReduction = Math.min(Math.round((totalArea / 2000) * 10), 40);

  const handleSelectSite = (siteId: number) => {
    setSelectedSiteId(siteId === selectedSiteId ? null : siteId);
    const site = interventionSites.find(s => s.id === siteId);
    if (site) {
      setAllocatedArea(Math.min(1500, site.available_area_m2));
    }
  };

  const handleAddIntervention = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSite) return;
    const newItem: ProposedInterventionItem = {
      subcatchment_code: selectedSite.subcatchment_code,
      intervention_type: selectedGiType,
      allocated_area_m2: allocatedArea,
      estimated_cost_inr_lakhs: calculatedCostLakhs,
    };
    onUpdateInterventions([...activeInterventions, newItem]);
    setSelectedSiteId(null);
  };

  const handleRemove = (idx: number) => {
    onUpdateInterventions(activeInterventions.filter((_, i) => i !== idx));
  };

  return (
    <div className="space-y-6">

      {/* Header Banner */}
      <div className="bg-gradient-to-r from-emerald-900 to-teal-800 rounded-xl p-6 shadow-lg text-white">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 text-emerald-300 text-xs font-mono mb-2">
              <Leaf className="w-3.5 h-3.5" />
              <span>NATURE-BASED SOLUTIONS</span>
              <span className="text-emerald-500">•</span>
              <span>SPATIAL ALLOCATION PLANNER</span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight mb-1">Green Infrastructure (GI) Planner</h1>
            <p className="text-emerald-200 text-xs max-w-2xl leading-relaxed">
              Design tailored sponge-city portfolios across Tiruchirappalli's public parcels.
              Evaluate unit costs, retention capacity, and deploy interventions for hydrodynamic testing.
            </p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold font-mono text-emerald-300">
              ₹{totalCost.toFixed(1)}
            </div>
            <div className="text-emerald-400 text-xs font-mono">Lakhs — Portfolio Cost</div>
          </div>
        </div>
      </div>

      {/* GI Technology Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {GI_TYPES.map(gi => (
          <div
            key={gi.type}
            onClick={() => setSelectedGiType(gi.type)}
            className={`border rounded-xl p-4 cursor-pointer transition-all ${
              selectedGiType === gi.type
                ? 'border-emerald-500 bg-emerald-50 shadow ring-1 ring-emerald-500'
                : 'border-slate-200 bg-white hover:border-emerald-200 hover:bg-slate-50'
            }`}
          >
            <div className="text-xl mb-1.5">{gi.icon}</div>
            <h4 className="font-bold text-slate-900 text-xs mb-1">{gi.type}</h4>
            <p className="text-[10px] text-slate-500 leading-snug mb-2">{gi.desc}</p>
            <div className="flex items-center justify-between pt-2 border-t border-slate-100">
              <span className="text-[11px] font-mono font-bold text-emerald-700">{gi.unit}</span>
              <span className="text-[10px] font-mono text-slate-500">Ret: {gi.retention}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Main 2-panel layout */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

        {/* LEFT: Intervention Sites List */}
        <div className="lg:col-span-2 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <MapPin className="w-4 h-4 text-slate-500" />
              Candidate Intervention Sites
            </h3>
            <span className="text-xs text-slate-500 font-mono">{interventionSites.length} sites</span>
          </div>
          <div className="space-y-2 max-h-[700px] overflow-y-auto pr-1">
            {interventionSites.map(site => {
              const priorityStyle = PRIORITY_STYLES[site.priority_level] || PRIORITY_STYLES['Medium'];
              const isSelected = selectedSiteId === site.id;
              return (
                <div
                  key={site.id}
                  className={`bg-white border rounded-xl p-3.5 transition-all ${
                    isSelected ? 'border-emerald-500 ring-1 ring-emerald-400 shadow' : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="min-w-0">
                      <h4 className="font-semibold text-slate-900 text-xs leading-tight">{site.name}</h4>
                      <div className="flex items-center gap-1.5 mt-1">
                        <span className="font-mono font-bold text-[10px] bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded">
                          {site.subcatchment_code}
                        </span>
                        <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold font-mono ${priorityStyle.badge}`}>
                          {priorityStyle.label}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-1.5 text-[10px] font-mono text-slate-500 mb-2.5">
                    <div><span className="text-slate-400">Land use:</span> <span className="font-semibold text-slate-700">{site.land_use}</span></div>
                    <div><span className="text-slate-400">Area:</span> <span className="font-semibold text-slate-700">{site.available_area_m2.toLocaleString()} m²</span></div>
                    <div className="col-span-2 text-[10px] text-slate-400 truncate">
                      Types: {site.allowed_types}
                    </div>
                  </div>
                  <button
                    onClick={() => handleSelectSite(site.id)}
                    className={`w-full py-1.5 rounded-lg text-[11px] font-semibold transition-colors flex items-center justify-center gap-1.5 ${
                      isSelected
                        ? 'bg-emerald-600 text-white hover:bg-emerald-500'
                        : 'bg-slate-900 text-white hover:bg-slate-700'
                    }`}
                  >
                    <Plus className="w-3 h-3" />
                    {isSelected ? 'Selected — Fill form →' : 'Add Intervention'}
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* RIGHT: Form + Portfolio */}
        <div className="lg:col-span-3 space-y-4">

          {/* Add Intervention Form */}
          {selectedSite ? (
            <div className="bg-white border-2 border-emerald-400 rounded-xl p-5 shadow-sm">
              <h3 className="font-bold text-emerald-800 text-sm mb-4 flex items-center gap-2">
                <Plus className="w-4 h-4" />
                Add Intervention — <span className="text-slate-800">{selectedSite.name}</span>
              </h3>
              <form onSubmit={handleAddIntervention} className="space-y-4 text-xs">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1.5">Intervention Type</label>
                  <select
                    value={selectedGiType}
                    onChange={e => setSelectedGiType(e.target.value)}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-xs bg-white font-mono focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 focus:outline-none"
                  >
                    {GI_TYPES.map(g => (
                      <option key={g.type} value={g.type}>
                        {g.type} — {g.unit} (Retention: {g.retention})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <div className="flex justify-between mb-1.5">
                    <label className="text-slate-700 font-semibold">
                      Allocated Area: <span className="font-mono font-bold text-emerald-700">{allocatedArea.toLocaleString()} m²</span>
                    </label>
                    <span className="text-slate-400 font-mono text-[11px]">
                      Max: {maxArea.toLocaleString()} m²
                    </span>
                  </div>
                  <input
                    type="range"
                    min="100"
                    max={maxArea}
                    step="100"
                    value={allocatedArea}
                    onChange={e => setAllocatedArea(parseInt(e.target.value))}
                    className="w-full accent-emerald-600 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] font-mono text-slate-400 mt-1">
                    <span>100 m²</span>
                    <span>{maxArea.toLocaleString()} m²</span>
                  </div>
                </div>

                <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3.5 font-mono space-y-2">
                  <div className="flex justify-between text-[11px]">
                    <span className="text-slate-600">Unit cost rate:</span>
                    <span className="font-bold text-slate-800">₹{costPerM2}/m²</span>
                  </div>
                  <div className="flex justify-between text-[11px]">
                    <span className="text-slate-600">Estimated capital cost:</span>
                    <span className="font-bold text-emerald-800 text-sm">
                      ₹{calculatedCostLakhs} Lakhs
                    </span>
                  </div>
                  <div className="flex justify-between text-[11px]">
                    <span className="text-slate-600">Peak reduction est.:</span>
                    <span className="font-bold text-emerald-700">
                      ~{Math.min(Math.round((allocatedArea / 2000) * 10), 15)}%
                    </span>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    type="submit"
                    className="flex-1 py-2.5 bg-emerald-700 hover:bg-emerald-600 text-white rounded-lg font-semibold text-xs transition-colors flex items-center justify-center gap-1.5 shadow"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Add to Portfolio
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedSiteId(null)}
                    className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-semibold text-xs transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <div className="bg-slate-50 border border-dashed border-slate-300 rounded-xl p-5 text-center text-slate-400">
              <Plus className="w-6 h-6 mx-auto mb-2 opacity-40" />
              <p className="text-xs">Select a site from the left panel to configure and add an intervention.</p>
            </div>
          )}

          {/* Active Portfolio */}
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-slate-100">
              <div>
                <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  Active GI Portfolio
                </h3>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  {activeInterventions.length} interventions configured
                </p>
              </div>
              {activeInterventions.length > 0 && (
                <button
                  onClick={() => onUpdateInterventions([])}
                  className="text-xs text-red-500 hover:text-red-700 font-medium transition-colors"
                >
                  Clear All
                </button>
              )}
            </div>

            {activeInterventions.length > 0 ? (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-100 text-slate-600 font-mono text-[11px]">
                        <th className="py-2 px-3">Subcatchment</th>
                        <th className="py-2 px-3">Type</th>
                        <th className="py-2 px-3">Area (m²)</th>
                        <th className="py-2 px-3">Cost (₹ Lakhs)</th>
                        <th className="py-2 px-3 text-right">Remove</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-mono">
                      {activeInterventions.map((item, idx) => (
                        <tr key={idx} className="hover:bg-slate-50">
                          <td className="py-2 px-3">
                            <span className="font-bold text-slate-900 bg-slate-100 px-1.5 py-0.5 rounded text-[11px]">
                              {item.subcatchment_code}
                            </span>
                          </td>
                          <td className="py-2 px-3 font-sans text-slate-700">{item.intervention_type}</td>
                          <td className="py-2 px-3 text-slate-600">{item.allocated_area_m2.toLocaleString()}</td>
                          <td className="py-2 px-3">
                            <span className="font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded text-[11px]">
                              ₹{item.estimated_cost_inr_lakhs} L
                            </span>
                          </td>
                          <td className="py-2 px-3 text-right">
                            <button
                              onClick={() => handleRemove(idx)}
                              className="text-slate-400 hover:text-red-600 p-1 rounded transition-colors"
                              title="Remove"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Portfolio Summary */}
                <div className="p-4 bg-slate-50 border-t border-slate-100 space-y-3">
                  <div className="grid grid-cols-3 gap-3">
                    <div className="bg-white border border-slate-200 rounded-lg p-3 text-center">
                      <div className="text-xs font-mono font-bold text-emerald-700">₹{totalCost.toFixed(1)} L</div>
                      <div className="text-[10px] text-slate-500 mt-0.5">Total Cost</div>
                    </div>
                    <div className="bg-white border border-slate-200 rounded-lg p-3 text-center">
                      <div className="text-xs font-mono font-bold text-sky-700">{totalArea.toLocaleString()} m²</div>
                      <div className="text-[10px] text-slate-500 mt-0.5">Total Area</div>
                    </div>
                    <div className="bg-white border border-slate-200 rounded-lg p-3 text-center">
                      <div className="text-xs font-mono font-bold text-indigo-700">~{avgPeakReduction}%</div>
                      <div className="text-[10px] text-slate-500 mt-0.5">Peak Reduction Est.</div>
                    </div>
                  </div>

                  <button
                    onClick={onNavigateToSimulation}
                    className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold transition-colors flex items-center justify-center gap-2 shadow"
                  >
                    <span>Proceed to Simulation Lab</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </>
            ) : (
              <div className="py-14 text-center text-slate-400">
                <ShieldCheck className="w-9 h-9 mx-auto mb-3 opacity-30 text-emerald-600" />
                <p className="text-xs text-slate-500 max-w-xs mx-auto">
                  No interventions configured yet. Select a site from the left panel to add GI infrastructure.
                </p>
              </div>
            )}
          </div>

        </div>
      </div>

    </div>
  );
};
