import React, { useState, useEffect } from 'react';
import { DataProvenanceItem } from '../types';
import { fetchDataProvenance } from '../api';
import { Database, ShieldAlert, BookOpen, Layers, CheckCircle2, ExternalLink } from 'lucide-react';

export const DataMethodologyPage: React.FC = () => {
  const [provenanceList, setProvenanceList] = useState<DataProvenanceItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDataProvenance()
      .then(data => setProvenanceList(data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      
      {/* Research Title & Executive Scope */}
      <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-sm space-y-3">
        <div className="flex items-center space-x-2 text-xs font-mono text-slate-500">
          <span>RESEARCH DISCLOSURE</span>
          <span>/</span>
          <span className="font-semibold text-slate-800">SCIENTIFIC PROVENANCE & METHODOLOGY</span>
        </div>
        <h1 className="text-xl font-bold text-slate-900 tracking-tight">
          An Explainable, Rainfall-Adaptive Urban Flood Digital Twin for Intelligent Green Infrastructure Planning
        </h1>
        <p className="text-xs text-slate-600 leading-relaxed max-w-4xl">
          Study Location: <strong>Tiruchirappalli Urban Agglomeration, Tamil Nadu, India (Cauvery Delta Basin).</strong>
          This document details the spatial data layers, mathematical formulations, algorithmic models, computational assumptions, and operational constraints governing FloodScape AI.
        </p>
      </div>

      {/* The 5-Stage Scientific Architecture */}
      <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-sm">
        <h3 className="font-bold text-slate-900 text-sm mb-4 uppercase font-mono tracking-wider">
          Core Research Framework: PREDICT → EXPLAIN → SIMULATE → OPTIMISE → PREVENT
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-3 text-xs">
          <div className="bg-slate-50 border border-slate-200 rounded p-3 space-y-1">
            <span className="font-mono text-sky-700 font-bold block text-sm">01 / PREDICT</span>
            <h4 className="font-bold text-slate-800">Topographic Infiltration</h4>
            <p className="text-[11px] text-slate-600 leading-normal">
              Delineation of 12 deltaic subcatchments using Copernicus GLO-30 DEM and SoilGrids edaphic classes. Computes distributed SCS Curve Numbers.
            </p>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded p-3 space-y-1">
            <span className="font-mono text-sky-700 font-bold block text-sm">02 / EXPLAIN</span>
            <h4 className="font-bold text-slate-800">Resilience Fingerprint</h4>
            <p className="text-[11px] text-slate-600 leading-normal">
              Linear utility decomposition isolating dominant physical risk drivers (elevation, slope, imperviousness, soil, flow accumulation).
            </p>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded p-3 space-y-1">
            <span className="font-mono text-sky-700 font-bold block text-sm">03 / SIMULATE</span>
            <h4 className="font-bold text-slate-800">Drainage Stress Testing</h4>
            <p className="text-[11px] text-slate-600 leading-normal">
              Dynamic wave routing under 100%, 75%, 50%, and 25% drainage capacity stress tests to observe backwater waterlogging and node surcharge.
            </p>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded p-3 space-y-1">
            <span className="font-mono text-sky-700 font-bold block text-sm">04 / OPTIMISE</span>
            <h4 className="font-bold text-slate-800">NSGA-II Multi-Objective</h4>
            <p className="text-[11px] text-slate-600 leading-normal">
              Fast non-dominated sorting genetic search across budget limits, extracting Low-Cost, Balanced, and High-Performance Pareto solutions.
            </p>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded p-3 space-y-1">
            <span className="font-mono text-emerald-700 font-bold block text-sm">05 / PREVENT</span>
            <h4 className="font-bold text-slate-800">GI Implementation</h4>
            <p className="text-[11px] text-slate-600 leading-normal">
              Spatially allocates bioretention rain gardens, permeable pavements, bioswales, and retention ponds across candidate municipal sites.
            </p>
          </div>
        </div>
      </div>

      {/* Data Provenance Table */}
      <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center space-x-2">
            <Database className="w-4 h-4 text-sky-700" />
            <h3 className="font-bold text-slate-900 text-sm">
              Scientific Dataset Registry & Provenance Attribution
            </h3>
          </div>
          <span className="text-xs text-slate-500 font-mono">
            {provenanceList.length} registered datasets
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-100 text-slate-700 font-mono border-b border-slate-200">
                <th className="py-2.5 px-3">Dataset Name</th>
                <th className="py-2.5 px-3">Domain</th>
                <th className="py-2.5 px-3">Source & Authority</th>
                <th className="py-2.5 px-3">Resolution & CRS</th>
                <th className="py-2.5 px-3">Processing Method</th>
                <th className="py-2.5 px-3">Data Classification</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono">
              {provenanceList.map(item => (
                <tr key={item.id} className="hover:bg-slate-50">
                  <td className="py-2.5 px-3 font-bold text-slate-900">{item.dataset_name}</td>
                  <td className="py-2.5 px-3 font-sans text-slate-600">{item.category}</td>
                  <td className="py-2.5 px-3 font-sans">
                    {item.source_url ? (
                      <a
                        href={item.source_url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-sky-700 hover:underline flex items-center space-x-1"
                      >
                        <span>{item.source_name}</span>
                        <ExternalLink className="w-3 h-3 inline" />
                      </a>
                    ) : (
                      item.source_name
                    )}
                  </td>
                  <td className="py-2.5 px-3">{item.resolution} | {item.crs}</td>
                  <td className="py-2.5 px-3 font-sans text-slate-600 max-w-xs">{item.processing_method}</td>
                  <td className="py-2.5 px-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                      item.data_classification.includes('Public')
                        ? 'bg-blue-50 text-blue-700 border border-blue-200'
                        : item.data_classification.includes('Official')
                        ? 'bg-purple-50 text-purple-700 border border-purple-200'
                        : 'bg-amber-50 text-amber-700 border border-amber-200'
                    }`}>
                      {item.data_classification}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mathematical Formulations Section */}
      <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-sm space-y-4">
        <div className="flex items-center space-x-2 border-b border-slate-100 pb-2">
          <BookOpen className="w-4 h-4 text-sky-700" />
          <h3 className="font-bold text-slate-900 text-sm">
            Hydrological & Optimization Mathematical Formulations
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono text-slate-700">
          
          <div className="bg-slate-50 border border-slate-200 rounded p-4 space-y-2">
            <span className="font-bold text-slate-900 block font-sans">
              1. USDA SCS Curve Number Direct Runoff Equation
            </span>
            <p className="font-mono bg-white p-2 rounded border border-slate-200 text-slate-900">
              Q = (P - Iₐ)² / (P - Iₐ + S)  for P &gt; Iₐ
            </p>
            <p className="text-[11px] font-sans text-slate-600 leading-normal">
              Where P is cumulative precipitation (mm), S is maximum soil water retention potential S = (25400/CN) - 254 mm, and Iₐ = 0.2·S is initial abstraction.
            </p>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded p-4 space-y-2">
            <span className="font-bold text-slate-900 block font-sans">
              2. Kirpich Hydraulic Time of Concentration (Tc)
            </span>
            <p className="font-mono bg-white p-2 rounded border border-slate-200 text-slate-900">
              T_c = 0.01947 · L^0.77 · S_slope^-0.385
            </p>
            <p className="text-[11px] font-sans text-slate-600 leading-normal">
              Where L is the longest hydraulic flow length (m) and S_slope is the dimensionless surface gradient (m/m) derived from Copernicus DEM.
            </p>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded p-4 space-y-2">
            <span className="font-bold text-slate-900 block font-sans">
              3. NSGA-II Multi-Objective Optimization Problem
            </span>
            <p className="font-mono bg-white p-2 rounded border border-slate-200 text-slate-900">
              min f₁(x) = ∑ (Areaᵢ · UnitCostᵢ)<br />
              min f₂(x) = PeakRunoff(x, P, C_drain)<br />
              min f₃(x) = TotalRunoffVolume(x, P)<br />
              s.t. f₁(x) ≤ BudgetLimit
            </p>
            <p className="text-[11px] font-sans text-slate-600 leading-normal">
              Solved using Deb et al. (2002) fast non-dominated sorting and crowding distance niching to preserve diversity on the Pareto front.
            </p>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded p-4 space-y-2">
            <span className="font-bold text-slate-900 block font-sans">
              4. Drainage Hydraulic Throttling & Surcharge
            </span>
            <p className="font-mono bg-white p-2 rounded border border-slate-200 text-slate-900">
              Q_outfall = min(Q_inflow, C_drain · η_stress)<br />
              V_ponding(t) = ∫ max(0, Q_inflow - Q_outfall) dt
            </p>
            <p className="text-[11px] font-sans text-slate-600 leading-normal">
              Where η_stress ∈ {'{'}1.00, 0.75, 0.50, 0.25{'}'} represents assumed drainage capacity scenarios during monsoonal high-stage conditions.
            </p>
          </div>

        </div>
      </div>

      {/* Critical Assumptions & Known Limitations */}
      <div className="bg-amber-50/70 border border-amber-200 rounded-lg p-5 shadow-sm space-y-2 text-xs text-amber-950">
        <div className="flex items-center space-x-2 font-mono font-bold uppercase text-[11px] text-amber-900">
          <ShieldAlert className="w-4 h-4 text-amber-600" />
          <span>Explicit Scientific Limitations & Boundary Conditions</span>
        </div>
        <ul className="list-disc list-inside space-y-1.5 leading-relaxed text-slate-700">
          <li>
            <strong>Susceptibility Index Disclaimer:</strong> The Weighted Susceptibility Index is an uncalibrated multi-criteria decision tool intended for comparative ranking, not a stochastic flood return period probability.
          </li>
          <li>
            <strong>Demonstration Drainage Infrastructure:</strong> In the absence of published municipal pipe invert GIS databases, minor underground conduits are represented using synthetic demonstration trunk channels parameterized from surface slope and cross-sections.
          </li>
          <li>
            <strong>Rainfall Downscaling:</strong> NASA GPM IMERG 0.1° satellite grids provide regional convective storm envelopes but do not capture hyper-local street-level microburst dynamics.
          </li>
          <li>
            <strong>Computational Engine Transparency:</strong> When running in lightweight cloud server environments without compiled EPA SWMM 5.2 C binaries, the system transparently utilizes the verified SCS-CN & Saint-Venant 1D surrogate engine and explicitly labels all output accordingly.
          </li>
        </ul>
      </div>

    </div>
  );
};
