import React from 'react';
import {
  Layers, CloudRain, Cpu, Sliders, ShieldCheck, Database,
  Activity, Map as MapIcon, Compass
} from 'lucide-react';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  systemHealthy: boolean;
  engineName: string;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  systemHealthy,
  engineName
}) => {
  const navItems = [
    { id: 'overview', label: 'Overview', icon: Compass },
    { id: 'map', label: 'Interactive Flood Map', icon: MapIcon },
    { id: 'susceptibility', label: 'Susceptibility & Fingerprint', icon: Layers },
    { id: 'rainfall', label: 'Rainfall Lab', icon: CloudRain },
    { id: 'simulation', label: 'Simulation Lab', icon: Cpu },
    { id: 'interventions', label: 'GI Planner', icon: ShieldCheck },
    { id: 'optimisation', label: 'NSGA-II Optimisation', icon: Sliders },
    { id: 'methodology', label: 'Data & Provenance', icon: Database },
  ];

  return (
    <header className="border-b border-slate-200 bg-white sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab('overview')}>
            <div className="w-9 h-9 bg-slate-900 text-sky-400 rounded-md flex items-center justify-center font-bold font-mono text-lg border border-slate-700 shadow-sm">
              FS
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-slate-900 tracking-tight text-lg">FloodScape AI</span>
                <span className="bg-sky-50 text-sky-700 border border-sky-200 text-xs px-2 py-0.5 rounded font-mono">
                  Tiruchirappalli, TN
                </span>
              </div>
              <p className="text-[11px] text-slate-500 hidden md:block">
                Explainable, Rainfall-Adaptive Urban Flood Digital Twin
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <div className="hidden lg:flex items-center space-x-2 bg-slate-50 border border-slate-200 rounded px-2.5 py-1 text-xs">
              <span className={`w-2 h-2 rounded-full ${systemHealthy ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
              <span className="text-slate-600 font-mono">Engine:</span>
              <span className="font-semibold text-slate-800 truncate max-w-[220px]" title={engineName}>
                {engineName.includes('SWMM') ? 'EPA SWMM 5.2' : 'SCS-CN & Saint-Venant 1D'}
              </span>
            </div>
            <div className="flex items-center space-x-1 border-l border-slate-200 pl-3">
              <span className="inline-flex items-center text-xs font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                WGS 84
              </span>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex space-x-1 overflow-x-auto py-1 scrollbar-none border-t border-slate-100 text-sm">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center space-x-1.5 px-3 py-2 rounded-md whitespace-nowrap font-medium text-xs md:text-sm transition-colors ${
                  isActive
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-sky-400' : 'text-slate-500'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
};
