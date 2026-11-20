import datetime
from sqlalchemy import Column, Integer, Float, String, Boolean, DateTime, Text
from .database import Base

class StudyArea(Base):
    __tablename__ = "study_areas"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    state = Column(String(100), default="Tamil Nadu")
    country = Column(String(50), default="India")
    center_lat = Column(Float, default=10.7905)
    center_lng = Column(Float, default=78.7047)
    bounding_box = Column(Text, nullable=True)  # JSON [min_lng, min_lat, max_lng, max_lat]
    total_area_sqkm = Column(Float, default=167.2)
    population = Column(Integer, default=1022000)
    crs = Column(String(50), default="EPSG:4326")
    description = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class Subcatchment(Base):
    __tablename__ = "subcatchments"

    id = Column(Integer, primary_key=True, index=True)
    code = Column(String(50), unique=True, index=True)
    name = Column(String(100), nullable=False)
    ward_numbers = Column(String(100), nullable=True)
    area_ha = Column(Float, nullable=False)
    elevation_m = Column(Float, nullable=False)
    slope_pct = Column(Float, nullable=False)
    flow_accumulation = Column(Float, nullable=False)
    impervious_pct = Column(Float, nullable=False)
    soil_type = Column(String(100), nullable=False)
    hydraulic_conductivity_mmhr = Column(Float, default=15.0)
    baseline_drainage_capacity_m3s = Column(Float, default=2.5)
    susceptibility_score = Column(Float, default=0.5)
    dominant_factor = Column(String(100), default="Impervious Surface")
    geometry_geojson = Column(Text, nullable=False)  # GeoJSON Polygon / MultiPolygon string
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class DrainageAsset(Base):
    __tablename__ = "drainage_assets"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    asset_type = Column(String(50), nullable=False)  # Canal, Main Channel, Secondary Drain, Culvert
    length_m = Column(Float, nullable=True)
    width_m = Column(Float, nullable=True)
    depth_m = Column(Float, nullable=True)
    design_capacity_m3s = Column(Float, nullable=False)
    status = Column(String(50), default="Operational")
    geometry_geojson = Column(Text, nullable=False)  # GeoJSON LineString / Point
    subcatchment_code = Column(String(50), nullable=True)
    data_type = Column(String(50), default="DEMONSTRATION/REPRESENTATIVE")

class FloodEvidence(Base):
    __tablename__ = "flood_evidence"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(150), nullable=False)
    location_description = Column(String(255), nullable=True)
    historical_event = Column(String(100), nullable=False)  # e.g. "Dec 2015 Flood", "Nov 2021 Cyclone", "Dec 2023 Michaung"
    flood_depth_m = Column(Float, nullable=False)
    observation_date = Column(String(50), nullable=True)
    severity = Column(String(50), default="High")
    geometry_geojson = Column(Text, nullable=False)  # GeoJSON Point
    subcatchment_code = Column(String(50), nullable=True)
    source = Column(String(200), default="Trichy City Disaster Mgmt / Field Survey Reports")

class InterventionSite(Base):
    __tablename__ = "intervention_sites"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(150), nullable=False)
    subcatchment_code = Column(String(50), nullable=False)
    land_use = Column(String(100), nullable=False)  # Public Park, Institutional, Roadside, Open Ground
    available_area_m2 = Column(Float, nullable=False)
    allowed_types = Column(String(255), default="Rain Garden,Permeable Pavement,Bioswale,Retention Storage")
    priority_level = Column(String(50), default="Medium")
    geometry_geojson = Column(Text, nullable=False)  # GeoJSON Point / Polygon

class ProposedIntervention(Base):
    __tablename__ = "proposed_interventions"

    id = Column(Integer, primary_key=True, index=True)
    site_id = Column(Integer, nullable=True)
    subcatchment_code = Column(String(50), nullable=False)
    intervention_type = Column(String(100), nullable=False)  # Rain Garden, Permeable Pavement, Bioswale, Retention Storage
    allocated_area_m2 = Column(Float, nullable=False)
    retention_capacity_m3 = Column(Float, default=0.0)
    estimated_cost_inr_lakhs = Column(Float, default=0.0)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class RainfallScenario(Base):
    __tablename__ = "rainfall_scenarios"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    storm_type = Column(String(50), default="Synthetic Design Storm")  # Design Storm, Historical GPM, Extreme Convective
    duration_hrs = Column(Float, nullable=False)
    return_period_yrs = Column(Integer, nullable=False)
    total_rainfall_mm = Column(Float, nullable=False)
    peak_intensity_mmhr = Column(Float, nullable=False)
    hyetograph_json = Column(Text, nullable=False)  # JSON list [{time_min, intensity_mmhr}]
    provenance_type = Column(String(100), default="HYPOTHETICAL/DESIGN")
    description = Column(Text, nullable=True)

class SimulationRun(Base):
    __tablename__ = "simulation_runs"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(150), nullable=False)
    scenario_id = Column(Integer, nullable=False)
    drainage_stress_pct = Column(Integer, default=100)  # 100%, 75%, 50%, 25%
    interventions_json = Column(Text, default="[]")
    engine_type = Column(String(50), default="Surrogate Hydrological-Hydraulic 1D Engine")
    peak_runoff_m3s = Column(Float, nullable=False)
    total_volume_m3 = Column(Float, nullable=False)
    flooded_nodes_count = Column(Integer, default=0)
    max_surcharge_depth_m = Column(Float, default=0.0)
    hydrograph_json = Column(Text, nullable=False)
    execution_time_ms = Column(Float, default=0.0)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class OptimizationRun(Base):
    __tablename__ = "optimization_runs"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(150), nullable=False)
    budget_limit_lakhs = Column(Float, default=250.0)
    rainfall_scenario_id = Column(Integer, nullable=False)
    drainage_stress_pct = Column(Integer, default=100)
    population_size = Column(Integer, default=40)
    generations = Column(Integer, default=25)
    pareto_solutions_json = Column(Text, nullable=False)
    low_cost_solution_json = Column(Text, nullable=False)
    balanced_solution_json = Column(Text, nullable=False)
    high_perf_solution_json = Column(Text, nullable=False)
    execution_time_s = Column(Float, default=0.0)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class DataProvenance(Base):
    __tablename__ = "data_provenance"

    id = Column(Integer, primary_key=True, index=True)
    dataset_name = Column(String(150), nullable=False)
    category = Column(String(100), nullable=False)  # DEM, Hydrology, Soil, Infrastructure, Land Cover
    source_name = Column(String(150), nullable=False)
    source_url = Column(String(255), nullable=True)
    resolution = Column(String(100), nullable=True)
    crs = Column(String(50), default="EPSG:4326")
    source_date = Column(String(100), nullable=True)
    processing_method = Column(Text, nullable=True)
    known_limitations = Column(Text, nullable=True)
    data_classification = Column(String(50), default="Public/Derived/Demonstration")
