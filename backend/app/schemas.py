from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field

class StudyAreaResponse(BaseModel):
    id: int
    name: str
    state: str
    country: str
    center_lat: float
    center_lng: float
    bounding_box: Optional[str]
    total_area_sqkm: float
    population: int
    crs: str
    description: Optional[str]

    class Config:
        from_attributes = True

class SubcatchmentResponse(BaseModel):
    id: int
    code: str
    name: str
    ward_numbers: Optional[str]
    area_ha: float
    elevation_m: float
    slope_pct: float
    flow_accumulation: float
    impervious_pct: float
    soil_type: str
    hydraulic_conductivity_mmhr: float
    baseline_drainage_capacity_m3s: float
    susceptibility_score: float
    dominant_factor: str
    geometry_geojson: str

    class Config:
        from_attributes = True

class DrainageAssetResponse(BaseModel):
    id: int
    name: str
    asset_type: str
    length_m: Optional[float]
    width_m: Optional[float]
    depth_m: Optional[float]
    design_capacity_m3s: float
    status: str
    geometry_geojson: str
    subcatchment_code: Optional[str]
    data_type: str

    class Config:
        from_attributes = True

class FloodEvidenceResponse(BaseModel):
    id: int
    name: str
    location_description: Optional[str]
    historical_event: str
    flood_depth_m: float
    observation_date: Optional[str]
    severity: str
    geometry_geojson: str
    subcatchment_code: Optional[str]
    source: str

    class Config:
        from_attributes = True

class InterventionSiteResponse(BaseModel):
    id: int
    name: str
    subcatchment_code: str
    land_use: str
    available_area_m2: float
    allowed_types: str
    priority_level: str
    geometry_geojson: str

    class Config:
        from_attributes = True

class ProposedInterventionItem(BaseModel):
    subcatchment_code: str
    intervention_type: str
    allocated_area_m2: float
    estimated_cost_inr_lakhs: Optional[float] = None

class ProposedInterventionCreate(BaseModel):
    interventions: List[ProposedInterventionItem]

class SusceptibilityWeightsRequest(BaseModel):
    weight_elevation: float = 0.20
    weight_slope: float = 0.20
    weight_flow_accum: float = 0.25
    weight_impervious: float = 0.20
    weight_soil: float = 0.15

class SubcatchmentSusceptibilityItem(BaseModel):
    code: str
    name: str
    area_ha: float
    raw_score: float
    normalized_score: float
    category: str  # High, Moderate, Low
    dominant_factor: str
    factor_contributions: Dict[str, float]

class SusceptibilityRecalculateResponse(BaseModel):
    method: str
    weights_used: Dict[str, float]
    subcatchments: List[SubcatchmentSusceptibilityItem]
    high_risk_count: int
    moderate_risk_count: int
    low_risk_count: int

# Flood Resilience Fingerprint Schemas
class StressScenarioMetric(BaseModel):
    capacity_pct: int
    label: str
    peak_runoff_m3s: float
    runoff_volume_m3: float
    waterlog_depth_cm: float
    drainage_surcharge_risk: str  # Low, Moderate, High, Critical
    attenuation_deficit_m3: float

class ResilienceFingerprintResponse(BaseModel):
    subcatchment_code: str
    name: str
    area_ha: float
    elevation_m: float
    slope_pct: float
    flow_accumulation: float
    impervious_pct: float
    soil_type: str
    baseline_susceptibility_score: float
    susceptibility_category: str
    dominant_factor: str
    
    # 4 Drainage capacity stress scenarios: 100%, 75%, 50%, 25%
    stress_scenarios: List[StressScenarioMetric]
    
    # Mitigation & Green Infrastructure
    intervention_coverage_m2: float
    potential_volume_retention_m3: float
    potential_peak_reduction_pct: float
    remaining_risk_score: float
    
    # Factor breakdown for radar/spider chart
    radar_metrics: List[Dict[str, Any]]
    
    # Plain text research explanation
    scientific_explanation: str
    limitations_note: str

# Rainfall Scenarios
class RainfallScenarioResponse(BaseModel):
    id: int
    name: str
    storm_type: str
    duration_hrs: float
    return_period_yrs: int
    total_rainfall_mm: float
    peak_intensity_mmhr: float
    hyetograph: List[Dict[str, Any]]
    provenance_type: str
    description: Optional[str]

    class Config:
        from_attributes = True

class RainfallCustomRequest(BaseModel):
    name: str
    duration_hrs: float
    total_rainfall_mm: float
    peak_ratio: float = 0.4
    storm_type: str = "Custom User-Defined Storm"

# Simulation Schemas
class SimulationRunRequest(BaseModel):
    scenario_id: int
    drainage_stress_pct: int = 100  # 100, 75, 50, 25
    interventions: List[ProposedInterventionItem] = []

class HydrographPoint(BaseModel):
    time_min: int
    rainfall_depth_mm: float
    runoff_rate_m3s: float
    outfall_discharge_m3s: float
    waterlog_storage_m3: float

class SimulationRunResponse(BaseModel):
    id: Optional[int]
    title: str
    engine_name: str
    engine_verification_badge: str
    rainfall_scenario_name: str
    drainage_capacity_pct: int
    total_rainfall_volume_m3: float
    peak_inflow_m3s: float
    peak_runoff_m3s: float
    baseline_peak_runoff_m3s: float
    peak_reduction_pct: float
    total_runoff_volume_m3: float
    volume_retention_m3: float
    volume_reduction_pct: float
    flooded_nodes_count: int
    max_surcharge_depth_m: float
    hydrograph: List[HydrographPoint]
    subcatchment_summaries: List[Dict[str, Any]]
    execution_time_ms: float
    is_swmm_native: bool
    methodology_caveat: str

# Optimisation Schemas
class OptimizationRunRequest(BaseModel):
    budget_limit_lakhs: float = 300.0
    rainfall_scenario_id: int = 1
    drainage_stress_pct: int = 100
    population_size: int = 40
    generations: int = 25

class ParetoSolution(BaseModel):
    solution_id: int
    solution_type: str  # "Low-Cost", "Balanced", "High-Performance", "Pareto Optimal"
    total_cost_lakhs: float
    residual_peak_runoff_m3s: float
    residual_volume_m3: float
    peak_reduction_pct: float
    volume_reduction_pct: float
    interventions_count: int
    allocations: List[Dict[str, Any]]

class OptimizationRunResponse(BaseModel):
    budget_limit_lakhs: float
    scenario_name: str
    drainage_stress_pct: int
    baseline_cost_lakhs: float
    baseline_peak_runoff_m3s: float
    baseline_volume_m3: float
    pareto_frontier: List[ParetoSolution]
    low_cost_solution: ParetoSolution
    balanced_solution: ParetoSolution
    high_perf_solution: ParetoSolution
    algorithm_metadata: Dict[str, Any]
    execution_time_s: float

class DataProvenanceResponse(BaseModel):
    id: int
    dataset_name: str
    category: str
    source_name: str
    source_url: Optional[str]
    resolution: Optional[str]
    crs: str
    source_date: Optional[str]
    processing_method: Optional[str]
    known_limitations: Optional[str]
    data_classification: str

    class Config:
        from_attributes = True
