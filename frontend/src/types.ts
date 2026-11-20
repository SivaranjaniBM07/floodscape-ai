export interface StudyArea {
  id: number;
  name: string;
  state: string;
  country: string;
  center_lat: number;
  center_lng: number;
  bounding_box?: string;
  total_area_sqkm: number;
  population: number;
  crs: string;
  description?: string;
}

export interface Subcatchment {
  id: number;
  code: string;
  name: string;
  ward_numbers?: string;
  area_ha: number;
  elevation_m: number;
  slope_pct: number;
  flow_accumulation: number;
  impervious_pct: number;
  soil_type: string;
  hydraulic_conductivity_mmhr: number;
  baseline_drainage_capacity_m3s: number;
  susceptibility_score: number;
  dominant_factor: string;
  geometry_geojson: string;
}

export interface DrainageAsset {
  id: number;
  name: string;
  asset_type: string;
  length_m?: number;
  width_m?: number;
  depth_m?: number;
  design_capacity_m3s: number;
  status: string;
  geometry_geojson: string;
  subcatchment_code?: string;
  data_type: string;
}

export interface FloodEvidence {
  id: number;
  name: string;
  location_description?: string;
  historical_event: string;
  flood_depth_m: number;
  observation_date?: string;
  severity: string;
  geometry_geojson: string;
  subcatchment_code?: string;
  source: string;
}

export interface InterventionSite {
  id: number;
  name: string;
  subcatchment_code: string;
  land_use: string;
  available_area_m2: number;
  allowed_types: string;
  priority_level: string;
  geometry_geojson: string;
}

export interface StressScenarioMetric {
  capacity_pct: number;
  label: string;
  peak_runoff_m3s: number;
  runoff_volume_m3: number;
  waterlog_depth_cm: number;
  drainage_surcharge_risk: string;
  attenuation_deficit_m3: number;
}

export interface ResilienceFingerprint {
  subcatchment_code: string;
  name: string;
  area_ha: number;
  elevation_m: number;
  slope_pct: number;
  flow_accumulation: number;
  impervious_pct: number;
  soil_type: string;
  baseline_susceptibility_score: number;
  susceptibility_category: string;
  dominant_factor: string;
  stress_scenarios: StressScenarioMetric[];
  intervention_coverage_m2: number;
  potential_volume_retention_m3: number;
  potential_peak_reduction_pct: number;
  remaining_risk_score: number;
  radar_metrics: { dimension: string; value: number; baseline: number }[];
  scientific_explanation: string;
  limitations_note: string;
}

export interface RainfallScenario {
  id: number;
  name: string;
  storm_type: string;
  duration_hrs: number;
  return_period_yrs: number;
  total_rainfall_mm: number;
  peak_intensity_mmhr: number;
  hyetograph: { time_min: number; intensity_mmhr: number }[];
  provenance_type: string;
  description?: string;
}

export interface ProposedInterventionItem {
  subcatchment_code: string;
  intervention_type: string;
  allocated_area_m2: number;
  estimated_cost_inr_lakhs?: number;
}

export interface SimulationResult {
  id?: number;
  title: string;
  engine_name: string;
  engine_verification_badge: string;
  rainfall_scenario_name: string;
  drainage_capacity_pct: number;
  total_rainfall_volume_m3: number;
  peak_inflow_m3s: number;
  peak_runoff_m3s: number;
  baseline_peak_runoff_m3s: number;
  peak_reduction_pct: number;
  total_runoff_volume_m3: number;
  volume_retention_m3: number;
  volume_reduction_pct: number;
  flooded_nodes_count: number;
  max_surcharge_depth_m: number;
  hydrograph: {
    time_min: number;
    rainfall_depth_mm: number;
    runoff_rate_m3s: number;
    outfall_discharge_m3s: number;
    waterlog_storage_m3: number;
  }[];
  subcatchment_summaries: {
    code: string;
    name: string;
    area_ha: number;
    peak_runoff_m3s: number;
    total_volume_m3: number;
    gi_retained_m3: number;
    surcharge_depth_m: number;
    is_flooded: boolean;
  }[];
  execution_time_ms: number;
  is_swmm_native: boolean;
  methodology_caveat: string;
}

export interface ParetoSolution {
  solution_id: number;
  solution_type: string;
  total_cost_lakhs: number;
  residual_peak_runoff_m3s: number;
  residual_volume_m3: number;
  peak_reduction_pct: number;
  volume_reduction_pct: number;
  interventions_count: number;
  allocations: {
    site_id: number;
    site_name: string;
    subcatchment_code: string;
    intervention_type: string;
    allocated_area_m2: number;
    estimated_cost_inr_lakhs: number;
  }[];
}

export interface OptimizationResult {
  budget_limit_lakhs: number;
  scenario_name: string;
  drainage_stress_pct: number;
  baseline_cost_lakhs: number;
  baseline_peak_runoff_m3s: number;
  baseline_volume_m3: number;
  pareto_frontier: ParetoSolution[];
  low_cost_solution: ParetoSolution;
  balanced_solution: ParetoSolution;
  high_perf_solution: ParetoSolution;
  algorithm_metadata: {
    algorithm: string;
    crossover: string;
    mutation: string;
    population_size: number;
    generations: number;
    objectives: string[];
  };
  execution_time_s: number;
}

export interface DataProvenanceItem {
  id: number;
  dataset_name: string;
  category: string;
  source_name: string;
  source_url?: string;
  resolution?: string;
  crs: string;
  source_date?: string;
  processing_method?: string;
  known_limitations?: string;
  data_classification: string;
}
