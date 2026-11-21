import React, { useState, useEffect } from 'react';
import { DataProvenanceItem } from '../types';
import { fetchDataProvenance } from '../api';
import { MOCK_DATA_PROVENANCE } from '../mockData';
import {
  Database, ShieldAlert, BookOpen, ExternalLink, ArrowRight,
  Layers, CloudRain, Cpu, ShieldCheck, Sliders, Info, AlertTriangle
} from 'lucide-react';

const WORKFLOW_STAGES = [
  {
    step: '01', label: 'PREDICT',
    icon: Layers, color: 'from-sky-500 to-sky-700', iconBg: 'bg-sky-50', iconColor: 'text-sky-700',
    title: 'Topographic Infiltration',
    desc: 'Delineation of 12 deltaic subcatchments using Copernicus GLO-30 DEM and SoilGrids edaphic classes. Computes distributed SCS Curve Numbers per basin.',
  },
  {
    step: '02', label: 'EXPLAIN',
    icon: Info, color: 'from-indigo-500 to-indigo-700', iconBg: 'bg-indigo-50', iconColor: 'text-indigo-700',
    title: 'Resilience Fingerprint',
    desc: 'Linear utility decomposition isolating dominant physical risk drivers: elevation, slope, imperviousness, soil class, and flow accumulation.',
  },
  {
    step: '03', label: 'SIMULATE',
    icon: Cpu, color: 'from-violet-500 to-violet-700', iconBg: 'bg-violet-50', iconColor: 'text-violet-700',
    title: 'Drainage Stress Testing',
    desc: 'Dynamic wave routing under 100%, 75%, 50%, and 25% drainage capacity stress to observe backwater waterlogging and node surcharge events.',
  },
  {
    step: '04', label: 'OPTIMISE',
    icon: Sliders, color: 'from-purple-500 to-purple-700', iconBg: 'bg-purple-50', iconColor: 'text-purple-700',
    title: 'NSGA-II Multi-Objective',
    desc: 'Fast non-dominated sorting across budget limits, extracting Low-Cost, Balanced, and High-Performance Pareto solutions for GI allocation.',
  },
  {
    step: '05', label: 'PREVENT',
    icon: ShieldCheck, color: 'from-emerald-500 to-emerald-700', iconBg: 'bg-emerald-50', iconColor: 'text-emerald-700',
    title: 'GI Site Deployment',
    desc: 'Spatial allocation of bioretention rain gardens, permeable pavements, bioswales, and retention ponds across 12 candidate municipal sites.',
  },
];

const MATH_BLOCKS = [
  {
    title: '1. USDA SCS Curve Number Direct Runoff',
    formula: 'Q = (P − Iₐ)² / (P − Iₐ + S)  for P > Iₐ',
    desc: 'P = cumulative precipitation (mm); S = (25400/CN) − 254 mm (max soil retention); Iₐ = 0.2·S (initial abstraction). CN derived from SoilGrids + imperviousness mapping.',
  },
  {
    title: '2. Kirpich Time of Concentration',
    formula: 'Tₒ = 0.01947 · L⁰·⁷⁷ · S_slope⁻⁰·³⁸⁵',
    desc: 'L = longest hydraulic flow length (m); S_slope = dimensionless surface gradient (m/m) from Copernicus 30m DEM. Used to shape the synthetic design storm time-distribution.',
  },
  {
    title: '3. NSGA-II Multi-Objective Optimization',
    formula: 'min f₁(x) = ΣAreaᵢ·CostᵢUnit\nmin f₂(x) = PeakRunoff(x,P,Cdrain)\nmin f₃(x) = TotalVolume(x,P)\ns.t. f₁(x) ≤ Budget',
    desc: 'Deb et al. (2002) fast non-dominated sorting with crowding distance niching. Population = 60, Generations = 40. Uniform crossover p=0.9, bit-flip mutation p=1/n.',
  },
  {
    title: '4. Drainage Throttling & Surcharge',
    formula: 'Q_outfall = min(Q_inflow, C_drain·η_stress)\nV_ponding(t) = ∫ max(0, Q_in − Q_out) dt',
    desc: 'η_stress ∈ {1.00, 0.75, 0.50, 0.25} simulates high-stage channel conditions. Ponding volume integrates over storm duration to compute maximum waterlogging depth.',
  },
];

const LIMITATIONS = [
  {
    title: 'Susceptibility Index',
    text: 'The weighted index is an uncalibrated multicriteria tool for comparative spatial ranking. It does not represent a stochastic flood return-period probability — calibrated gauge data or EPA SWMM hydraulic output is required for that.',
  },
  {
    title: 'Demonstration Drainage Network',
    text: 'In the absence of published municipal pipe-invert GIS databases, minor underground conduits are represented as synthetic demonstration trunk channels parameterized from surface slope and channel cross-sections.',
  },
  {
    title: 'Rainfall Spatial Downscaling',
    text: 'NASA GPM IMERG 0.1° (~10 km) grids provide regional convective storm envelopes but do not capture hyper-local street-level microburst dynamics at the 30 m subcatchment scale.',
  },
  {
    title: 'Computational Engine Transparency',
    text: 'Without compiled EPA SWMM 5.2 C binaries, the system uses the SCS-CN & 1D Saint-Venant surrogate engine. All outputs are explicitly labelled "SURROGATE MODEL — NOT EPA SWMM" to maintain scientific transparency.',
  },
];

function classifyBadge(classification: string) {
  if (classification.toLowerCase().includes('public') || classification.toLowerCase().includes('open') || classification.toLowerCase().includes('satellite')) {
    return 'bg-emerald-50 text-emerald-700 border border-emerald-200';
  }
  if (classification.toLowerCase().includes('official') || classification.toLowerCase().includes('policy')) {
    return 'bg-blue-50 text-blue-700 border border-blue-200';
  }
  return 'bg-amber-50 text-amber-700 border border-amber-200';
}

export const DataMethodologyPage: React.FC = () => {
  const [provenanceList, setProvenanceList] = useState<DataProvenanceItem[]>([]);
  const [loading, setLoading]               = useState(true);
  const [usingFallback, setUsingFallback]   = useState(false);

  useEffect(() => {
    fetchDataProvenance()
      .then(data => { setProvenanceList(data); })
      .catch(() => {
        setProvenanceList(MOCK_DATA_PROVENANCE);
        setUsingFallback(true);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">

      {/* ── Header ──────────────────────────────────────────────── */}
      <div className="bg-gradient-to-r from-slate-900 to-teal-900 rounded-2xl p-7 shadow-xl text-white">
        <div className="flex items-center gap-2 text-xs font-mono text-teal-300 mb-2">
          <BookOpen className="w-3.5 h-3.5" />
          <span>RESEARCH DISCLOSURE / SCIENTIFIC PROVENANCE & METHODOLOGY</span>
        </div>
        <h1 className="text-2xl font-bold tracking-tight mb-1">
          Data Sources, Methodology &amp; Scientific Limitations
        </h1>
        <p className="text-sm text-slate-300 max-w-3xl leading-relaxed">
          Study Location: <strong className="text-white">Tiruchirappalli Urban Agglomeration, Tamil Nadu, India</strong> (Cauvery Delta Basin).
          Full transparency on spatial datasets, hydrological formulations, algorithmic models, and known constraints.
        </p>
        <div className="mt-3 inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-3 py-1 text-xs font-mono text-teal-200">
          Engine: SCS-CN &amp; 1D Saint-Venant Surrogate (EPA SWMM 5.2 compatible interface)
        </div>
      </div>

      {/* ── 5-Stage Workflow Diagram ─────────────────────────────── */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-7">
        <h3 className="font-bold text-slate-900 text-sm mb-5 uppercase font-mono tracking-widest">
          Core Research Framework
        </h3>

        <div className="flex flex-col md:flex-row gap-2 items-stretch">
          {WORKFLOW_STAGES.map((stage, i) => {
            const Icon = stage.icon;
            return (
              <React.Fragment key={stage.step}>
                <div className="flex-1 bg-slate-50 border border-slate-200 rounded-xl p-4 hover:shadow-md hover:border-slate-300 transition-all">
                  <div className={`w-9 h-9 ${stage.iconBg} ${stage.iconColor} rounded-lg flex items-center justify-center mb-3`}>
                    <Icon className="w-4.5 h-4.5" />
                  </div>
                  <div className={`inline-block text-[10px] font-mono font-bold text-white bg-gradient-to-r ${stage.color} rounded-full px-2.5 py-0.5 mb-2`}>
                    {stage.step} · {stage.label}
                  </div>
                  <h4 className="font-bold text-slate-800 text-xs mb-1.5">{stage.title}</h4>
                  <p className="text-[11px] text-slate-500 leading-relaxed">{stage.desc}</p>
                </div>
                {i < WORKFLOW_STAGES.length - 1 && (
                  <div className="hidden md:flex items-center justify-center shrink-0">
                    <ArrowRight className="w-5 h-5 text-slate-300" />
                  </div>
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* ── Data Sources Table ───────────────────────────────────── */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Database className="w-4 h-4 text-teal-600" />
            <h3 className="font-bold text-slate-900 text-sm">Scientific Dataset Registry &amp; Provenance</h3>
            {usingFallback && (
              <span className="text-[10px] font-mono bg-amber-100 text-amber-700 border border-amber-200 px-2 py-0.5 rounded-full">
                MOCK DATA (API offline)
              </span>
            )}
          </div>
          <span className="text-xs font-mono text-slate-400">
            {loading ? 'Loading…' : `${provenanceList.length} datasets`}
          </span>
        </div>

        {loading ? (
          <div className="p-10 text-center text-sm text-slate-400 font-mono">Loading provenance data…</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-600 font-mono border-b border-slate-200 text-[11px]">
                  <th className="py-3 px-4">Dataset Name</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Source Authority</th>
                  <th className="py-3 px-4">Resolution</th>
                  <th className="py-3 px-4">CRS</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Classification</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {provenanceList.map(item => (
                  <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-900">{item.dataset_name}</div>
                      {item.known_limitations && (
                        <div className="text-[10px] text-slate-400 mt-0.5 font-sans">{item.known_limitations}</div>
                      )}
                    </td>
                    <td className="py-3 px-4 text-slate-600 font-sans">{item.category}</td>
                    <td className="py-3 px-4 font-sans">
                      {item.source_url ? (
                        <a
                          href={item.source_url}
                          target="_blank"
                          rel="noreferrer"
                          className="text-sky-700 hover:underline inline-flex items-center gap-1"
                        >
                          {item.source_name}
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      ) : (
                        <span className="text-slate-700">{item.source_name}</span>
                      )}
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-600">{item.resolution}</td>
                    <td className="py-3 px-4 font-mono text-slate-600">{item.crs}</td>
                    <td className="py-3 px-4 font-mono text-slate-500">{item.source_date}</td>
                    <td className="py-3 px-4">
                      <span className={`text-[10px] font-semibold px-2.5 py-1 rounded-full ${classifyBadge(item.data_classification)}`}>
                        {item.data_classification}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Engine Description + Formulae ───────────────────────── */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-7">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-4 mb-5">
          <BookOpen className="w-4 h-4 text-teal-600" />
          <h3 className="font-bold text-slate-900 text-sm">Hydrological &amp; Optimization Formulations</h3>
        </div>

        {/* SCS-CN + Saint-Venant explanation */}
        <div className="mb-5 bg-slate-50 border border-slate-200 rounded-xl p-5 text-xs">
          <h4 className="font-bold text-slate-900 mb-2">Engine: SCS-CN + 1D Saint-Venant Surrogate</h4>
          <p className="text-slate-600 leading-relaxed max-w-4xl">
            When EPA SWMM 5.2 C binaries are unavailable (e.g., cloud Linux environments without SWMM compilation),
            the FloodScape AI surrogate engine applies the <strong>USDA SCS Curve Number method</strong> for rainfall-to-runoff
            transformation, combined with a <strong>simplified 1D Saint-Venant kinematic wave approximation</strong> for
            channel flow routing. This produces physically interpretable hydrographs sufficient for comparative subcatchment
            analysis and GI optimisation at the planning stage. All outputs are explicitly labelled as{' '}
            <strong>"SURROGATE MODEL — NOT EPA SWMM"</strong>.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {MATH_BLOCKS.map(block => (
            <div key={block.title} className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2">
              <h5 className="font-bold text-slate-900 text-xs">{block.title}</h5>
              <pre className="font-mono bg-white border border-slate-200 rounded-lg p-3 text-xs text-slate-800 whitespace-pre-wrap leading-relaxed">
                {block.formula}
              </pre>
              <p className="text-[11px] font-sans text-slate-600 leading-relaxed">{block.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Limitations Section ──────────────────────────────────── */}
      <div className="bg-white border border-amber-200 rounded-2xl shadow-sm p-7">
        <div className="flex items-center gap-2 border-b border-amber-100 pb-4 mb-5">
          <ShieldAlert className="w-4 h-4 text-amber-600" />
          <h3 className="font-bold text-slate-900 text-sm">Explicit Scientific Limitations</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {LIMITATIONS.map(lim => (
            <div key={lim.title} className="flex gap-3 bg-amber-50 border border-amber-200 rounded-xl p-4">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <h5 className="font-bold text-amber-950 text-xs mb-1">{lim.title}</h5>
                <p className="text-[11px] text-amber-900 leading-relaxed">{lim.text}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
