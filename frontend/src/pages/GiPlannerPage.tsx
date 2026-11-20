import React, { useState } from 'react';
import { InterventionSite, ProposedInterventionItem } from '../types';
import { ShieldCheck, Plus, Trash2, CheckCircle2, TrendingUp, Layers } from 'lucide-react';

interface GiPlannerPageProps {
  interventionSites: InterventionSite[];
  activeInterventions: ProposedInterventionItem[];
  onUpdateInterventions: (interventions: ProposedInterventionItem[]) => void;
  onNavigateToSimulation: () => void;
}

const GI_TYPES_INFO = [
  {
    type: 'Rain Garden',
    unitCostLakhsPerM2: 0.030,
    costFormatted: '₹ 3,000 / m²',
    storageDepth: '250 mm',
    retention: '85%',
    desc: 'Excavated vegetated basin with engineered sandy-organic soil filter bed and native plants for high bioretention.'
  },
  {
    type: 'Permeable Pavement',
    unitCostLakhsPerM2: 0.025,
    costFormatted: '₹ 2,500 / m²',
    storageDepth: '180 mm',
    retention: '80%',
    desc: 'Porous concrete / interlocking permeable block paving over an open-graded crushed stone reservoir bed.'
  },
  {
    type: 'Bioswale',
    unitCostLakhsPerM2: 0.020,
    costFormatted: '₹ 2,000 / m²',
    storageDepth: '200 mm',
    retention: '70%',
    desc: 'Linear gently-sloped vegetated ditch designed to attenuate flow velocities and facilitate rapid lateral infiltration.'
  },
  {
    type: 'Retention Storage',
    unitCostLakhsPerM2: 0.015,
    costFormatted: '₹ 1,500 / m²',
    storageDepth: '1500 mm',
    retention: '95%',
    desc: 'Excavated surface or semi-subsurface retention pond providing significant peak stormwater storage and peak attenuation.'
  }
];

export const GiPlannerPage: React.FC<GiPlannerPageProps> = ({
  interventionSites,
  activeInterventions,
  onUpdateInterventions,
  onNavigateToSimulation
}) => {
  const [selectedSiteId, setSelectedSiteId] = useState<number>(
    interventionSites[0]?.id || 1
  );
  const [selectedGiType, setSelectedGiType] = useState<string>('Rain Garden');
  const [allocatedArea, setAllocatedArea] = useState<number>(1500);

  const selectedSite = interventionSites.find(s => s.id === selectedSiteId) || interventionSites[0];
  const maxAvailableArea = selectedSite ? selectedSite.available_area_m2 : 5000;

  const currentGiSpec = GI_TYPES_INFO.find(g => g.type === selectedGiType) || GI_TYPES_INFO[0];
  const calculatedCostLakhs = Math.round(allocatedArea * currentGiSpec.unitCostLakhsPerM2 * 100) / 100;
  const estimatedStorageM3 = Math.round(allocatedArea * parseFloat(currentGiSpec.storageDepth) / 1000 * 0.85);

  const handleAddIntervention = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSite) return;

    const newItem: ProposedInterventionItem = {
      subcatchment_code: selectedSite.subcatchment_code,
      intervention_type: selectedGiType,
      allocated_area_m2: allocatedArea,
      estimated_cost_inr_lakhs: calculatedCostLakhs
    };

    onUpdateInterventions([...activeInterventions, newItem]);
  };

  const handleRemoveIntervention = (index: number) => {
    const updated = activeInterventions.filter((_, idx) => idx !== index);
    onUpdateInterventions(updated);
  };

  const handleClearAll = () => {
    onUpdateInterventions([]);
  };

  const totalPortfolioAreaM2 = activeInterventions.reduce((sum, item) => sum + item.allocated_area_m2, 0);
  const totalPortfolioCostLakhs = Math.round(activeInterventions.reduce((sum, item) => sum + (item.estimated_cost_inr_lakhs || 0), 0) * 100) / 100;
  const totalPortfolioRetentionM3 = Math.round(totalPortfolioAreaM2 * 0.22);

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 text-xs font-mono text-slate-500 mb-1">
              <span>NATURE-BASED SOLUTIONS</span>
              <span>/</span>
              <span className="font-semibold text-slate-800">SPATIAL ALLOCATION</span>
            </div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              Green Infrastructure (GI) Planner
            </h1>
            <p className="text-xs text-slate-600 mt-1 max-w-3xl">
              Design tailored sponge city portfolios across Tiruchirappalli's public parcels. Evaluate unit costs, retention capacity, and deploy interventions to test in the hydrodynamic simulator.
            </p>
          </div>

          <div className="flex items-center space-x-3 font-mono text-xs">
            <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 px-3 py-1.5 rounded font-medium">
              Portfolio Cost: <strong>₹ {totalPortfolioCostLakhs} Lakhs</strong>
            </span>
          </div>
        </div>
      </div>

      {/* GI Technologies Catalog Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {GI_TYPES_INFO.map(gi => (
          <div
            key={gi.type}
            onClick={() => setSelectedGiType(gi.type)}
            className={`border rounded-lg p-4 cursor-pointer transition-all ${
              selectedGiType === gi.type
                ? 'border-emerald-600 bg-emerald-50/50 shadow-sm'
                : 'border-slate-200 bg-white hover:bg-slate-50'
            }`}
          >
            <div className="flex items-center justify-between mb-1.5">
              <h4 className="font-bold text-slate-900 text-sm">{gi.type}</h4>
              <span className="text-[11px] font-mono font-semibold text-emerald-700 bg-emerald-100/60 px-2 py-0.5 rounded">
                {gi.costFormatted}
              </span>
            </div>
            <p className="text-[11px] text-slate-600 leading-snug mb-3">
              {gi.desc}
            </p>
            <div className="grid grid-cols-2 gap-2 text-[10px] font-mono border-t border-slate-100 pt-2 text-slate-500">
              <div>
                <span>Depth:</span> <strong className="text-slate-800">{gi.storageDepth}</strong>
              </div>
              <div>
                <span>Retention:</span> <strong className="text-emerald-700">{gi.retention}</strong>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Intervention Builder & Allocation Form */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Form */}
        <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm space-y-4">
          <h3 className="font-bold text-slate-900 text-sm border-b border-slate-100 pb-2 flex items-center space-x-1.5">
            <Plus className="w-4 h-4 text-emerald-600" />
            <span>Add GI Intervention to Candidate Site</span>
          </h3>

          <form onSubmit={handleAddIntervention} className="space-y-3.5 text-xs">
            <div>
              <label className="block text-slate-700 font-medium mb-1">Select Candidate Site</label>
              <select
                value={selectedSiteId}
                onChange={e => {
                  const id = parseInt(e.target.value);
                  setSelectedSiteId(id);
                  const site = interventionSites.find(s => s.id === id);
                  if (site && allocatedArea > site.available_area_m2) {
                    setAllocatedArea(Math.min(2000, site.available_area_m2));
                  }
                }}
                className="w-full border border-slate-300 rounded px-3 py-2 text-xs bg-white font-mono focus:ring-1 focus:ring-sky-500 focus:outline-none"
              >
                {interventionSites.map(s => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.subcatchment_code} - {s.available_area_m2.toLocaleString()} m²)
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-slate-700 font-medium mb-1">Intervention Technology</label>
              <select
                value={selectedGiType}
                onChange={e => setSelectedGiType(e.target.value)}
                className="w-full border border-slate-300 rounded px-3 py-2 text-xs bg-white font-mono focus:ring-1 focus:ring-sky-500 focus:outline-none"
              >
                {GI_TYPES_INFO.map(g => (
                  <option key={g.type} value={g.type}>
                    {g.type} ({g.costFormatted})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <div className="flex justify-between mb-1">
                <label className="text-slate-700 font-medium">
                  Allocated Footprint: <span className="font-mono font-bold">{allocatedArea.toLocaleString()} m²</span>
                </label>
                <span className="text-slate-500 font-mono text-[11px]">
                  Max: {maxAvailableArea.toLocaleString()} m²
                </span>
              </div>
              <input
                type="range"
                min="100"
                max={maxAvailableArea}
                step="100"
                value={allocatedArea}
                onChange={e => setAllocatedArea(parseInt(e.target.value))}
                className="w-full accent-emerald-600 cursor-pointer"
              />
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded p-3 space-y-1.5 font-mono text-[11px]">
              <div className="flex justify-between">
                <span className="text-slate-500 font-sans">Estimated Capital Cost:</span>
                <span className="font-bold text-slate-900">₹ {calculatedCostLakhs} Lakhs</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-sans">Storage Retention Capacity:</span>
                <span className="font-bold text-emerald-700">~{estimatedStorageM3.toLocaleString()} m³</span>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2 bg-emerald-700 hover:bg-emerald-600 text-white rounded font-medium text-xs transition-colors flex items-center justify-center space-x-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Add to Active Portfolio</span>
            </button>
          </form>
        </div>

        {/* Active Portfolio Table */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-lg p-5 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
              <div>
                <h3 className="font-bold text-slate-900 text-sm">
                  Active Green Infrastructure Portfolio
                </h3>
                <p className="text-xs text-slate-500">
                  {activeInterventions.length} intervention sites configured for simulation and testing.
                </p>
              </div>

              {activeInterventions.length > 0 && (
                <button
                  onClick={handleClearAll}
                  className="text-xs text-red-600 hover:text-red-800 font-medium font-sans"
                >
                  Clear Portfolio
                </button>
              )}
            </div>

            {activeInterventions.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-100 text-slate-700 font-mono border-b border-slate-200">
                      <th className="py-2 px-3">Subcatchment</th>
                      <th className="py-2 px-3">Technology</th>
                      <th className="py-2 px-3">Area (m²)</th>
                      <th className="py-2 px-3">Est. Cost (₹ Lakhs)</th>
                      <th className="py-2 px-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-mono">
                    {activeInterventions.map((item, idx) => (
                      <tr key={idx} className="hover:bg-slate-50">
                        <td className="py-2 px-3 font-bold text-slate-900">{item.subcatchment_code}</td>
                        <td className="py-2 px-3 font-sans font-medium text-slate-800">{item.intervention_type}</td>
                        <td className="py-2 px-3">{item.allocated_area_m2.toLocaleString()}</td>
                        <td className="py-2 px-3 font-bold text-slate-900">₹ {item.estimated_cost_inr_lakhs} L</td>
                        <td className="py-2 px-3 text-right">
                          <button
                            onClick={() => handleRemoveIntervention(idx)}
                            className="text-slate-400 hover:text-red-600 p-1 rounded"
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
            ) : (
              <div className="py-12 text-center text-slate-400">
                <ShieldCheck className="w-8 h-8 mx-auto mb-2 opacity-40 text-emerald-600" />
                <p className="text-xs">
                  No interventions configured yet. Add interventions from the left form or run NSGA-II optimization to generate optimal portfolios.
                </p>
              </div>
            )}
          </div>

          {activeInterventions.length > 0 && (
            <div className="mt-4 pt-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="text-xs font-mono space-x-3 text-slate-600">
                <span>Total Area: <strong>{totalPortfolioAreaM2.toLocaleString()} m²</strong></span>
                <span>•</span>
                <span>Est. Retention: <strong className="text-emerald-700">~{totalPortfolioRetentionM3.toLocaleString()} m³</strong></span>
              </div>
              <button
                onClick={onNavigateToSimulation}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded text-xs font-medium font-sans transition-colors"
              >
                Test in Simulation Lab →
              </button>
            </div>
          )}
        </div>

      </div>

    </div>
  );
};
