import axios from 'axios';
import {
  StudyArea, Subcatchment, DrainageAsset, FloodEvidence,
  InterventionSite, ResilienceFingerprint, RainfallScenario,
  SimulationResult, OptimizationResult, DataProvenanceItem,
  ProposedInterventionItem
} from './types';

const API_BASE = (import.meta as any).env?.VITE_API_URL || (
  typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
    ? 'http://127.0.0.1:8000/api'
    : '/api'
);

const api = axios.create({
  baseURL: API_BASE,
  timeout: 30000,
});

export const fetchHealth = async () => {
  const { data } = await api.get('/health');
  return data;
};

export const fetchStudyArea = async (): Promise<StudyArea> => {
  const { data } = await api.get('/study-area');
  return data;
};

export const fetchSubcatchments = async (): Promise<Subcatchment[]> => {
  const { data } = await api.get('/subcatchments');
  return data;
};

export const fetchSubcatchment = async (code: string): Promise<Subcatchment> => {
  const { data } = await api.get(`/subcatchments/${code}`);
  return data;
};

export const recalculateSusceptibility = async (weights: {
  weight_elevation: number;
  weight_slope: number;
  weight_flow_accum: number;
  weight_impervious: number;
  weight_soil: number;
}) => {
  const { data } = await api.post('/susceptibility/calculate', weights);
  return data;
};

export const fetchResilienceFingerprint = async (
  subcatchmentCode: string,
  scenarioId: number = 3
): Promise<ResilienceFingerprint> => {
  const { data } = await api.get(`/resilience-fingerprint/${subcatchmentCode}?scenario_id=${scenarioId}`);
  return data;
};

export const fetchDrainageAssets = async (): Promise<DrainageAsset[]> => {
  const { data } = await api.get('/drainage-assets');
  return data;
};

export const fetchFloodEvidence = async (): Promise<FloodEvidence[]> => {
  const { data } = await api.get('/flood-evidence');
  return data;
};

export const fetchInterventionSites = async (): Promise<InterventionSite[]> => {
  const { data } = await api.get('/intervention-sites');
  return data;
};

export const fetchRainfallScenarios = async (): Promise<RainfallScenario[]> => {
  const { data } = await api.get('/rainfall/scenarios');
  return data;
};

export const createCustomRainfall = async (payload: {
  name: string;
  duration_hrs: number;
  total_rainfall_mm: number;
  peak_ratio?: number;
}): Promise<RainfallScenario> => {
  const { data } = await api.post('/rainfall/scenarios', payload);
  return data;
};

export const runSimulation = async (payload: {
  scenario_id: number;
  drainage_stress_pct: number;
  interventions: ProposedInterventionItem[];
}): Promise<SimulationResult> => {
  const { data } = await api.post('/simulation/run', payload);
  return data;
};

export const runOptimization = async (payload: {
  budget_limit_lakhs: number;
  rainfall_scenario_id: number;
  drainage_stress_pct: number;
  population_size?: number;
  generations?: number;
}): Promise<OptimizationResult> => {
  const { data } = await api.post('/optimisation/run', payload);
  return data;
};

export const fetchDataProvenance = async (): Promise<DataProvenanceItem[]> => {
  const { data } = await api.get('/data-provenance');
  return data;
};
