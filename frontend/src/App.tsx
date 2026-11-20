import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { FingerprintModal } from './components/FingerprintModal';
import { OverviewDashboard } from './pages/OverviewDashboard';
import { InteractiveMapPage } from './pages/InteractiveMapPage';
import { SusceptibilityPage } from './pages/SusceptibilityPage';
import { RainfallLabPage } from './pages/RainfallLabPage';
import { SimulationLabPage } from './pages/SimulationLabPage';
import { GiPlannerPage } from './pages/GiPlannerPage';
import { OptimisationLabPage } from './pages/OptimisationLabPage';
import { DataMethodologyPage } from './pages/DataMethodologyPage';

import {
  StudyArea, Subcatchment, DrainageAsset, FloodEvidence,
  InterventionSite, ResilienceFingerprint, RainfallScenario,
  ProposedInterventionItem
} from './types';
import {
  fetchHealth, fetchStudyArea, fetchSubcatchments, fetchDrainageAssets,
  fetchFloodEvidence, fetchInterventionSites, fetchRainfallScenarios,
  fetchResilienceFingerprint
} from './api';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [systemHealthy, setSystemHealthy] = useState<boolean>(true);
  const [engineName, setEngineName] = useState<string>('Initializing...');
  const [studyArea, setStudyArea] = useState<StudyArea | null>(null);
  const [subcatchments, setSubcatchments] = useState<Subcatchment[]>([]);
  const [drainageAssets, setDrainageAssets] = useState<DrainageAsset[]>([]);
  const [floodEvidence, setFloodEvidence] = useState<FloodEvidence[]>([]);
  const [interventionSites, setInterventionSites] = useState<InterventionSite[]>([]);
  const [scenarios, setScenarios] = useState<RainfallScenario[]>([]);
  
  // Active Green Infrastructure Portfolio across the application
  const [activeInterventions, setActiveInterventions] = useState<ProposedInterventionItem[]>([
    {
      subcatchment_code: 'TR-02',
      intervention_type: 'Rain Garden',
      allocated_area_m2: 1200,
      estimated_cost_inr_lakhs: 36.0
    },
    {
      subcatchment_code: 'TR-05',
      intervention_type: 'Permeable Pavement',
      allocated_area_m2: 1800,
      estimated_cost_inr_lakhs: 45.0
    },
    {
      subcatchment_code: 'TR-09',
      intervention_type: 'Retention Storage',
      allocated_area_m2: 2500,
      estimated_cost_inr_lakhs: 37.5
    }
  ]);

  // Fingerprint Modal State
  const [activeFingerprint, setActiveFingerprint] = useState<ResilienceFingerprint | null>(null);
  const [loadingFingerprint, setLoadingFingerprint] = useState<boolean>(false);

  // Initial Data Fetching
  useEffect(() => {
    fetchHealth()
      .then(h => {
        setSystemHealthy(h.status === 'healthy');
        setEngineName(h.active_simulation_engine);
      })
      .catch(() => {
        setSystemHealthy(false);
        setEngineName('Surrogate Hydrological Engine');
      });

    fetchStudyArea().then(data => setStudyArea(data)).catch(console.error);
    fetchSubcatchments().then(data => setSubcatchments(data)).catch(console.error);
    fetchDrainageAssets().then(data => setDrainageAssets(data)).catch(console.error);
    fetchFloodEvidence().then(data => setFloodEvidence(data)).catch(console.error);
    fetchInterventionSites().then(data => setInterventionSites(data)).catch(console.error);
    fetchRainfallScenarios().then(data => setScenarios(data)).catch(console.error);
  }, []);

  const handleOpenFingerprint = async (code: string) => {
    setLoadingFingerprint(true);
    try {
      const fp = await fetchResilienceFingerprint(code, 3);
      setActiveFingerprint(fp);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingFingerprint(false);
    }
  };

  const handleRefreshScenarios = () => {
    fetchRainfallScenarios().then(data => setScenarios(data)).catch(console.error);
  };

  const handleApplyOptimizationSolution = (interventions: ProposedInterventionItem[]) => {
    setActiveInterventions(interventions);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-800">
      
      {/* Top Header Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        systemHealthy={systemHealthy}
        engineName={engineName}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'overview' && (
          <OverviewDashboard
            studyArea={studyArea}
            subcatchments={subcatchments}
            setActiveTab={setActiveTab}
            onOpenFingerprint={handleOpenFingerprint}
            engineName={engineName}
          />
        )}

        {activeTab === 'map' && (
          <InteractiveMapPage
            subcatchments={subcatchments}
            drainageAssets={drainageAssets}
            floodEvidence={floodEvidence}
            interventionSites={interventionSites}
            onOpenFingerprint={handleOpenFingerprint}
          />
        )}

        {activeTab === 'susceptibility' && (
          <SusceptibilityPage
            subcatchments={subcatchments}
            onOpenFingerprint={handleOpenFingerprint}
            onUpdateSubcatchments={setSubcatchments}
          />
        )}

        {activeTab === 'rainfall' && (
          <RainfallLabPage
            scenarios={scenarios}
            onRefreshScenarios={handleRefreshScenarios}
          />
        )}

        {activeTab === 'simulation' && (
          <SimulationLabPage
            scenarios={scenarios}
            activeInterventions={activeInterventions}
          />
        )}

        {activeTab === 'interventions' && (
          <GiPlannerPage
            interventionSites={interventionSites}
            activeInterventions={activeInterventions}
            onUpdateInterventions={setActiveInterventions}
            onNavigateToSimulation={() => setActiveTab('simulation')}
          />
        )}

        {activeTab === 'optimisation' && (
          <OptimisationLabPage
            onApplySolution={handleApplyOptimizationSolution}
            onNavigateToSimulation={() => setActiveTab('simulation')}
          />
        )}

        {activeTab === 'methodology' && (
          <DataMethodologyPage />
        )}
      </main>

      {/* Flood Resilience Fingerprint Modal */}
      <FingerprintModal
        fingerprint={activeFingerprint}
        onClose={() => setActiveFingerprint(null)}
      />

      {/* Professional Footer */}
      <footer className="border-t border-slate-200 bg-white py-6 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <span className="font-bold text-slate-800">FloodScape AI</span>
            <span> — An Explainable, Rainfall-Adaptive Urban Flood Digital Twin</span>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Study Location: Tiruchirappalli, Tamil Nadu, India. Integrated with Copernicus DEM, NASA GPM IMERG & OpenStreetMap.
            </p>
          </div>
          <div className="flex items-center space-x-4 font-mono text-[11px]">
            <span>Engine: {engineName.includes('SWMM') ? 'EPA SWMM 5.2' : 'SCS-CN & 1D Surrogate'}</span>
            <span>•</span>
            <span>CRS: EPSG:4326</span>
            <span>•</span>
            <span>Trichy City Corporation Basin</span>
          </div>
        </div>
      </footer>

    </div>
  );
};
