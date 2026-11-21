import React, { useState } from 'react';
import {
  Layers, CloudRain, Cpu, Sliders, ShieldCheck, Database,
  Map as MapIcon, Compass, Droplets, Wifi, WifiOff, ChevronDown, ChevronUp
} from 'lucide-react';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  systemHealthy: boolean;
  engineName: string;
}

const NAV_ITEMS = [
  { id: 'overview',       label: 'Overview',              shortLabel: 'Overview',    icon: Compass    },
  { id: 'map',            label: 'Flood Map',             shortLabel: 'Map',         icon: MapIcon    },
  { id: 'susceptibility', label: 'Susceptibility',        shortLabel: 'Suscept.',    icon: Layers     },
  { id: 'rainfall',       label: 'Rainfall Lab',          shortLabel: 'Rainfall',    icon: CloudRain  },
  { id: 'simulation',     label: 'Simulation Lab',        shortLabel: 'Simulation',  icon: Cpu        },
  { id: 'interventions',  label: 'GI Planner',            shortLabel: 'GI Planner', icon: ShieldCheck },
  { id: 'optimisation',   label: 'NSGA-II Optimisation',  shortLabel: 'Optimise',    icon: Sliders    },
  { id: 'methodology',    label: 'Data & Provenance',     shortLabel: 'Data',        icon: Database   },
];

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  systemHealthy,
  engineName,
}) => {
  const [mobileOpen, setMobileOpen] = useState(false);

  const engineLabel = engineName.includes('SWMM')
    ? 'EPA SWMM 5.2'
    : 'SCS-CN & Saint-Venant 1D';

  return (
    <header className="sticky top-0 z-50 shadow-md" style={{ backgroundColor: '#0f172a' }}>
      {/* ── Top brand row ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">

          {/* Logo + wordmark */}
          <button
            onClick={() => { setActiveTab('overview'); setMobileOpen(false); }}
            className="flex items-center gap-3 group min-w-0 flex-shrink-0"
            aria-label="Go to Overview"
          >
            {/* Water-drop icon badge */}
            <div className="relative flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center"
                 style={{ background: 'linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)', boxShadow: '0 0 14px rgba(14,165,233,0.45)' }}>
              <Droplets className="w-5 h-5 text-white drop-shadow" />
              <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-emerald-400 rounded-full border-2 border-[#0f172a]" />
            </div>

            {/* Text stack */}
            <div className="text-left min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-extrabold tracking-tight text-white text-lg leading-none">
                  FloodScape<span className="text-sky-400"> AI</span>
                </span>
                <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-mono px-2 py-0.5 rounded-full border border-sky-700/60 text-sky-300"
                      style={{ backgroundColor: 'rgba(14,165,233,0.12)' }}>
                  Tiruchirappalli, TN
                </span>
              </div>
              <p className="hidden md:block text-[10px] font-mono text-slate-400 mt-0.5 truncate">
                Urban Flood Digital Twin — Rainfall-Adaptive & Explainable
              </p>
            </div>
          </button>

          {/* Right-side badges */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {/* System health */}
            <div className={`hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-mono border
              ${systemHealthy
                ? 'border-emerald-700/50 text-emerald-300 bg-emerald-900/30'
                : 'border-amber-700/50 text-amber-300 bg-amber-900/30'}`}>
              {systemHealthy
                ? <Wifi className="w-3.5 h-3.5" />
                : <WifiOff className="w-3.5 h-3.5" />}
              <span>{systemHealthy ? 'API Online' : 'Offline / Mock'}</span>
            </div>

            {/* Engine badge */}
            <div className="hidden xl:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-mono border border-sky-800/50 text-sky-300"
                 style={{ backgroundColor: 'rgba(14,165,233,0.08)' }}>
              <Cpu className="w-3.5 h-3.5 text-sky-400" />
              <span className="truncate max-w-[180px]" title={engineLabel}>{engineLabel}</span>
            </div>

            {/* CRS chip */}
            <span className="hidden lg:inline text-[11px] font-mono text-slate-500 border border-slate-700 px-2 py-1 rounded">
              WGS 84
            </span>

            {/* Mobile nav toggle */}
            <button
              className="lg:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700/60 transition-colors"
              onClick={() => setMobileOpen(v => !v)}
              aria-label="Toggle navigation"
            >
              {mobileOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* ── Tab navigation row ── */}
      <div className="border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* Desktop tabs */}
          <nav className="hidden lg:flex items-center gap-0.5 overflow-x-auto scrollbar-none py-1">
            {NAV_ITEMS.map(item => {
              const Icon = item.icon;
              const active = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`relative flex items-center gap-1.5 px-3 py-2 rounded-t-lg whitespace-nowrap text-xs font-medium transition-all duration-150
                    ${active
                      ? 'text-white'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'}`}
                  style={active ? { backgroundColor: 'rgba(14,165,233,0.15)' } : undefined}
                >
                  <Icon className={`w-3.5 h-3.5 ${active ? 'text-sky-400' : 'text-slate-500'}`} />
                  <span>{item.label}</span>
                  {/* Active indicator bar */}
                  {active && (
                    <span className="absolute bottom-0 left-2 right-2 h-0.5 rounded-full bg-sky-400" />
                  )}
                </button>
              );
            })}
          </nav>

          {/* Mobile compact tabs (always visible, horizontal scroll) */}
          <nav className="lg:hidden flex items-center gap-0.5 overflow-x-auto scrollbar-none py-1">
            {NAV_ITEMS.map(item => {
              const Icon = item.icon;
              const active = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => { setActiveTab(item.id); setMobileOpen(false); }}
                  className={`relative flex items-center gap-1 px-2.5 py-1.5 rounded whitespace-nowrap text-[11px] font-medium transition-all
                    ${active
                      ? 'text-white bg-sky-600/20 border border-sky-600/40'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'}`}
                >
                  <Icon className={`w-3 h-3 ${active ? 'text-sky-400' : 'text-slate-500'}`} />
                  <span>{item.shortLabel}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* ── Mobile expanded info panel ── */}
      {mobileOpen && (
        <div className="lg:hidden border-t border-slate-800 px-4 py-3 flex flex-wrap gap-2"
             style={{ backgroundColor: '#0a1120' }}>
          <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-mono border
            ${systemHealthy ? 'border-emerald-700/50 text-emerald-300' : 'border-amber-700/50 text-amber-300'}`}>
            {systemHealthy ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
            {systemHealthy ? 'API Online' : 'Offline / Mock'}
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-mono border border-sky-800/50 text-sky-300">
            <Cpu className="w-3 h-3" />
            <span className="truncate max-w-[200px]">{engineLabel}</span>
          </div>
          <span className="text-[11px] font-mono text-slate-500 border border-slate-700 px-2 py-0.5 rounded">WGS 84</span>
        </div>
      )}
    </header>
  );
};
