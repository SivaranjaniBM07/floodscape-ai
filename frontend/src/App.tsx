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
import {
  MOCK_STUDY_AREA,
  MOCK_SUBCATCHMENTS,
  MOCK_DRAINAGE_ASSETS,
  MOCK_FLOOD_EVIDENCE,
  MOCK_INTERVENTION_SITES,
  MOCK_RAINFALL_SCENARIOS,
} from './mockData';

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

  // Initial Data Fetching — with mock data fallback when API is unavailable
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

    fetchStudyArea()
      .then(data => setStudyArea(data))
      .catch(() => setStudyArea(MOCK_STUDY_AREA));

    fetchSubcatchments()
      .then(data => setSubcatchments(data))
      .catch(() => setSubcatchments(MOCK_SUBCATCHMENTS));

    fetchDrainageAssets()
      .then(data => setDrainageAssets(data))
      .catch(() => setDrainageAssets(MOCK_DRAINAGE_ASSETS));

    fetchFloodEvidence()
      .then(data => setFloodEvidence(data))
      .catch(() => setFloodEvidence(MOCK_FLOOD_EVIDENCE));

    fetchInterventionSites()
      .then(data => setInterventionSites(data))
      .catch(() => setInterventionSites(MOCK_INTERVENTION_SITES));

    fetchRainfallScenarios()
      .then(data => setScenarios(data))
      .catch(() => setScenarios(MOCK_RAINFALL_SCENARIOS));
  }, []);

  const handleOpenFingerprint = async (code: string) => {
    setLoadingFingerprint(true);
    try {
      const fp = await fetchResilienceFingerprint(code, 3);
      setActiveFingerprint(fp);
    } catch (err) {
      // Build a mock fingerprint from subcatchment data as fallback
      const sub = MOCK_SUBCATCHMENTS.find(s => s.code === code);
      if (sub) {
        const mockFp: ResilienceFingerprint = {
          subcatchment_code: sub.code,
          name: sub.name,
          area_ha: sub.area_ha,
          elevation_m: sub.elevation_m,
          slope_pct: sub.slope_pct,
          flow_accumulation: sub.flow_accumulation,
          impervious_pct: sub.impervious_pct,
          soil_type: sub.soil_type,
          baseline_susceptibility_score: sub.susceptibility_score,
          susceptibility_category:
            sub.susceptibility_score >= 0.7 ? 'High'
            : sub.susceptibility_score >= 0.45 ? 'Moderate' : 'Low',
          dominant_factor: sub.dominant_factor,
          stress_scenarios: [
            { label: 'Full Design Capacity', capacity_pct: 100, peak_runoff_m3s: parseFloat((sub.baseline_drainage_capacity_m3s * 0.80).toFixed(2)), runoff_volume_m3: Math.round(sub.area_ha * 420), waterlog_depth_cm: 8,  drainage_surcharge_risk: 'Low — Within Capacity',          attenuation_deficit_m3: 0 },
            { label: '75% Partial Blockage', capacity_pct: 75,  peak_runoff_m3s: parseFloat((sub.baseline_drainage_capacity_m3s * 0.95).toFixed(2)), runoff_volume_m3: Math.round(sub.area_ha * 510), waterlog_depth_cm: 22, drainage_surcharge_risk: 'Moderate — Surcharge Risk',       attenuation_deficit_m3: Math.round(sub.area_ha * 90) },
            { label: '50% Severe Silting',   capacity_pct: 50,  peak_runoff_m3s: parseFloat((sub.baseline_drainage_capacity_m3s * 1.15).toFixed(2)), runoff_volume_m3: Math.round(sub.area_ha * 640), waterlog_depth_cm: 42, drainage_surcharge_risk: 'High — Likely Overflow',          attenuation_deficit_m3: Math.round(sub.area_ha * 220) },
            { label: '25% Critical Blockage',capacity_pct: 25,  peak_runoff_m3s: parseFloat((sub.baseline_drainage_capacity_m3s * 1.40).toFixed(2)), runoff_volume_m3: Math.round(sub.area_ha * 820), waterlog_depth_cm: 68, drainage_surcharge_risk: 'Critical — Widespread Inundation', attenuation_deficit_m3: Math.round(sub.area_ha * 400) },
          ],
          intervention_coverage_m2: 2500,
          potential_volume_retention_m3: Math.round(sub.area_ha * 85),
          potential_peak_reduction_pct: Math.round(sub.susceptibility_score * 22),
          remaining_risk_score: parseFloat((sub.susceptibility_score * 0.78).toFixed(2)),
          radar_metrics: [
            { dimension: 'Imperviousness', value: Math.min(100, sub.impervious_pct), baseline: 65 },
            { dimension: 'Flow Accum.', value: Math.min(100, Math.round(sub.flow_accumulation / 700)), baseline: 50 },
            { dimension: 'Low Slope', value: Math.min(100, Math.round((4 - Math.min(sub.slope_pct, 4)) / 4 * 100)), baseline: 50 },
            { dimension: 'Drainage Stress', value: Math.min(100, Math.round((1 / sub.hydraulic_conductivity_mmhr) * 300)), baseline: 40 },
            { dimension: 'Low Elevation', value: Math.min(100, Math.round((90 - Math.min(sub.elevation_m, 90)) / 25 * 100)), baseline: 45 },
            { dimension: 'Susceptibility', value: Math.round(sub.susceptibility_score * 100), baseline: 50 },
          ],
          scientific_explanation: `${sub.name} (${sub.code}) presents a composite flood susceptibility score of ${sub.susceptibility_score.toFixed(2)}, driven primarily by ${sub.dominant_factor}. The subcatchment covers ${sub.area_ha} ha at a mean elevation of ${sub.elevation_m} m with ${sub.impervious_pct}% impervious surface cover and a low terrain gradient of ${sub.slope_pct}%. These characteristics, combined with the ${sub.soil_type} pedological profile (Ksat ${sub.hydraulic_conductivity_mmhr} mm/hr), limit natural infiltration capacity and accelerate surface runoff generation under moderate to high intensity precipitation events typical of the northeast monsoon season.`,
          limitations_note: 'This fingerprint was generated from mock/fallback data as the backend API was unreachable. All stress scenario values are parametric estimates derived from physical subcatchment characteristics and should not be used as calibrated hydraulic model outputs. For production use, connect to the FloodScape AI backend.',
        };
        setActiveFingerprint(mockFp);
      } else {
        console.error('No subcatchment found for code:', code, err);
      }
    } finally {
      setLoadingFingerprint(false);
    }
  };

  const handleRefreshScenarios = () => {
    fetchRainfallScenarios()
      .then(data => setScenarios(data))
      .catch(() => setScenarios(MOCK_RAINFALL_SCENARIOS));
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
