import os
import json
import time
from typing import List, Dict, Any, Optional
from fastapi import FastAPI, Depends, HTTPException, Query, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy import text

from .database import engine, Base, get_db
from .models import (
    StudyArea, Subcatchment, DrainageAsset, FloodEvidence,
    InterventionSite, ProposedIntervention, RainfallScenario,
    SimulationRun, OptimizationRun, DataProvenance
)
from .schemas import (
    StudyAreaResponse, SubcatchmentResponse, DrainageAssetResponse,
    FloodEvidenceResponse, InterventionSiteResponse, ProposedInterventionCreate,
    SusceptibilityWeightsRequest, SusceptibilityRecalculateResponse,
    ResilienceFingerprintResponse, RainfallScenarioResponse, RainfallCustomRequest,
    SimulationRunRequest, SimulationRunResponse, OptimizationRunRequest,
    OptimizationRunResponse, DataProvenanceResponse
)
from .seed_data import seed_database
from .engine.hydrology import (
    SWMM_AVAILABLE, run_system_simulation, GI_SPECS
)
from .engine.fingerprint import (
    calculate_transparent_susceptibility, generate_flood_resilience_fingerprint
)
from .engine.nsga2 import run_nsga2_optimization

# Create all tables on startup
Base.metadata.create_all(bind=engine)

# Auto-seed if database is empty
with engine.connect() as conn:
    session = Session(bind=conn)
    seed_database(session)
    session.close()

app = FastAPI(
    title="FloodScape AI - Urban Flood Digital Twin API",
    description=(
        "An Explainable, Rainfall-Adaptive Urban Flood Digital Twin for Intelligent "
        "Green Infrastructure Planning in Tiruchirappalli, Tamil Nadu, India."
    ),
    version="1.0.0"
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {
        "project": "FloodScape AI",
        "title": "An Explainable, Rainfall-Adaptive Urban Flood Digital Twin for Intelligent Green Infrastructure Planning",
        "study_area": "Tiruchirappalli, Tamil Nadu, India",
        "workflow": "PREDICT -> EXPLAIN -> SIMULATE -> OPTIMISE -> PREVENT",
        "status": "online",
        "docs_url": "/docs"
    }

@app.get("/api/health")
def health_check(db: Session = Depends(get_db)):
    db_status = "connected"
    try:
        db.execute(text("SELECT 1"))
    except Exception as e:
        db_status = f"error: {str(e)}"
        
    return {
        "status": "healthy",
        "database": db_status,
        "study_area": "Tiruchirappalli, Tamil Nadu, India",
        "swmm_engine_available": SWMM_AVAILABLE,
        "active_simulation_engine": (
            "EPA SWMM 5.2 Dynamic Wave Core"
            if SWMM_AVAILABLE else
            "Verified Scientific Demonstration Surrogate Engine (SCS-CN & Saint-Venant 1D)"
        ),
        "timestamp": time.time()
    }

@app.get("/api/study-area", response_model=StudyAreaResponse)
def get_study_area(db: Session = Depends(get_db)):
    area = db.query(StudyArea).first()
    if not area:
        raise HTTPException(status_code=404, detail="Study area not initialized")
    return area

@app.get("/api/subcatchments", response_model=List[SubcatchmentResponse])
def get_subcatchments(db: Session = Depends(get_db)):
    subs = db.query(Subcatchment).all()
    return subs

@app.get("/api/subcatchments/{code}", response_model=SubcatchmentResponse)
def get_subcatchment_by_code(code: str, db: Session = Depends(get_db)):
    sub = db.query(Subcatchment).filter(Subcatchment.code == code).first()
    if not sub:
        raise HTTPException(status_code=404, detail=f"Subcatchment {code} not found")
    return sub

@app.post("/api/susceptibility/calculate", response_model=SusceptibilityRecalculateResponse)
def recalculate_susceptibility(
    weights: SusceptibilityWeightsRequest,
    db: Session = Depends(get_db)
):
    weights_dict = {
        "weight_elevation": weights.weight_elevation,
        "weight_slope": weights.weight_slope,
        "weight_flow_accum": weights.weight_flow_accum,
        "weight_impervious": weights.weight_impervious,
        "weight_soil": weights.weight_soil
    }
    
    subs = db.query(Subcatchment).all()
    results = []
    high_count = 0
    mod_count = 0
    low_count = 0
    
    for s in subs:
        calc = calculate_transparent_susceptibility(
            elevation_m=s.elevation_m,
            slope_pct=s.slope_pct,
            flow_accumulation=s.flow_accumulation,
            impervious_pct=s.impervious_pct,
            soil_conductivity_mmhr=s.hydraulic_conductivity_mmhr,
            weights=weights_dict
        )
        
        cat = calc["category"]
        if cat == "High":
            high_count += 1
        elif cat == "Moderate":
            mod_count += 1
        else:
            low_count += 1
            
        results.append({
            "code": s.code,
            "name": s.name,
            "area_ha": s.area_ha,
            "raw_score": calc["raw_score"],
            "normalized_score": calc["normalized_score"],
            "category": cat,
            "dominant_factor": calc["dominant_factor"],
            "factor_contributions": calc["contributions"]
        })
        
    # Sort subcatchments descending by score
    results.sort(key=lambda x: x["normalized_score"], reverse=True)
    
    return {
        "method": "Transparent Multi-Criteria Weighted Susceptibility Index (Linear Utility Normalization)",
        "weights_used": weights_dict,
        "subcatchments": results,
        "high_risk_count": high_count,
        "moderate_risk_count": mod_count,
        "low_risk_count": low_count
    }

@app.get("/api/resilience-fingerprint/{subcatchment_code}", response_model=ResilienceFingerprintResponse)
def get_resilience_fingerprint(
    subcatchment_code: str,
    scenario_id: Optional[int] = 3,  # default to 10-Yr Benchmark
    db: Session = Depends(get_db)
):
    sub = db.query(Subcatchment).filter(Subcatchment.code == subcatchment_code).first()
    if not sub:
        raise HTTPException(status_code=404, detail=f"Subcatchment {subcatchment_code} not found")
        
    scenario = db.query(RainfallScenario).filter(RainfallScenario.id == scenario_id).first()
    if not scenario:
        scenario = db.query(RainfallScenario).first()
        
    # Query any active proposed interventions for this subcatchment
    interventions = db.query(ProposedIntervention).filter(
        ProposedIntervention.subcatchment_code == subcatchment_code,
        ProposedIntervention.is_active == True
    ).all()
    
    gi_items = [
        {
            "intervention_type": item.intervention_type,
            "allocated_area_m2": item.allocated_area_m2
        } for item in interventions
    ]
    
    scen_dict = {
        "total_rainfall_mm": scenario.total_rainfall_mm,
        "duration_hrs": scenario.duration_hrs,
        "hyetograph": json.loads(scenario.hyetograph_json)
    }
    
    sub_dict = {
        "code": sub.code,
        "name": sub.name,
        "area_ha": sub.area_ha,
        "elevation_m": sub.elevation_m,
        "slope_pct": sub.slope_pct,
        "flow_accumulation": sub.flow_accumulation,
        "impervious_pct": sub.impervious_pct,
        "soil_type": sub.soil_type,
        "hydraulic_conductivity_mmhr": sub.hydraulic_conductivity_mmhr,
        "baseline_drainage_capacity_m3s": sub.baseline_drainage_capacity_m3s
    }
    
    fingerprint = generate_flood_resilience_fingerprint(
        subcatchment=sub_dict,
        rainfall_scenario=scen_dict,
        interventions=gi_items
    )
    
    return fingerprint

@app.get("/api/drainage-assets", response_model=List[DrainageAssetResponse])
def get_drainage_assets(db: Session = Depends(get_db)):
    return db.query(DrainageAsset).all()

@app.get("/api/flood-evidence", response_model=List[FloodEvidenceResponse])
def get_flood_evidence(db: Session = Depends(get_db)):
    return db.query(FloodEvidence).all()

@app.get("/api/intervention-sites", response_model=List[InterventionSiteResponse])
def get_intervention_sites(db: Session = Depends(get_db)):
    return db.query(InterventionSite).all()

@app.get("/api/gi-catalog")
def get_gi_catalog():
    return GI_SPECS

@app.get("/api/rainfall/scenarios", response_model=List[RainfallScenarioResponse])
def get_rainfall_scenarios(db: Session = Depends(get_db)):
    scenarios = db.query(RainfallScenario).all()
    res = []
    for s in scenarios:
        res.append({
            "id": s.id,
            "name": s.name,
            "storm_type": s.storm_type,
            "duration_hrs": s.duration_hrs,
            "return_period_yrs": s.return_period_yrs,
            "total_rainfall_mm": s.total_rainfall_mm,
            "peak_intensity_mmhr": s.peak_intensity_mmhr,
            "hyetograph": json.loads(s.hyetograph_json),
            "provenance_type": s.provenance_type,
            "description": s.description
        })
    return res

@app.post("/api/rainfall/scenarios", response_model=RainfallScenarioResponse)
def create_custom_rainfall(
    req: RainfallCustomRequest,
    db: Session = Depends(get_db)
):
    # Synthesize hyetograph using triangular / SCS peak distribution
    num_steps = max(6, int(req.duration_hrs * 4))  # 15-min intervals
    dt_min = (req.duration_hrs * 60.0) / num_steps
    
    hyeto = []
    # Chicago-like triangular peak at peak_ratio
    peak_step = int(num_steps * req.peak_ratio)
    weights = []
    for i in range(num_steps):
        dist = abs(i - peak_step)
        w = max(0.1, 1.0 - (dist / float(num_steps * 0.7)))
        weights.append(w)
    tot_w = sum(weights)
    
    peak_intensity = 0.0
    for i in range(num_steps):
        t = int((i + 1) * dt_min)
        depth_step = (weights[i] / tot_w) * req.total_rainfall_mm
        intensity = depth_step / (dt_min / 60.0)
        if intensity > peak_intensity:
            peak_intensity = intensity
        hyeto.append({
            "time_min": t,
            "intensity_mmhr": round(intensity, 2)
        })
        
    scenario = RainfallScenario(
        name=req.name,
        storm_type=req.storm_type,
        duration_hrs=req.duration_hrs,
        return_period_yrs=10,
        total_rainfall_mm=req.total_rainfall_mm,
        peak_intensity_mmhr=round(peak_intensity, 2),
        hyetograph_json=json.dumps(hyeto),
        provenance_type="USER-DEFINED HYPOTHETICAL STORM",
        description="Custom rainfall event parameterized directly by user in Rainfall Lab."
    )
    db.add(scenario)
    db.commit()
    db.refresh(scenario)
    
    return {
        "id": scenario.id,
        "name": scenario.name,
        "storm_type": scenario.storm_type,
        "duration_hrs": scenario.duration_hrs,
        "return_period_yrs": scenario.return_period_yrs,
        "total_rainfall_mm": scenario.total_rainfall_mm,
        "peak_intensity_mmhr": scenario.peak_intensity_mmhr,
        "hyetograph": hyeto,
        "provenance_type": scenario.provenance_type,
        "description": scenario.description
    }

@app.post("/api/simulation/run", response_model=SimulationRunResponse)
def execute_simulation(
    req: SimulationRunRequest,
    db: Session = Depends(get_db)
):
    start_time = time.time()
    scenario = db.query(RainfallScenario).filter(RainfallScenario.id == req.scenario_id).first()
    if not scenario:
        raise HTTPException(status_code=404, detail="Rainfall scenario not found")
        
    subs = db.query(Subcatchment).all()
    sub_dicts = [
        {
            "code": s.code,
            "name": s.name,
            "area_ha": s.area_ha,
            "elevation_m": s.elevation_m,
            "slope_pct": s.slope_pct,
            "soil_type": s.soil_type,
            "impervious_pct": s.impervious_pct,
            "baseline_drainage_capacity_m3s": s.baseline_drainage_capacity_m3s
        } for s in subs
    ]
    
    hyeto = json.loads(scenario.hyetograph_json)
    gi_items = [i.model_dump() for i in req.interventions]
    
    sim_result = run_system_simulation(
        subcatchments=sub_dicts,
        hyetograph=hyeto,
        drainage_stress_pct=req.drainage_stress_pct,
        interventions=gi_items
    )
    
    exec_ms = round((time.time() - start_time) * 1000.0, 1)
    
    # Save run record
    run_record = SimulationRun(
        title=f"Simulation: {scenario.name} @ {req.drainage_stress_pct}% Drainage",
        scenario_id=scenario.id,
        drainage_stress_pct=req.drainage_stress_pct,
        interventions_json=json.dumps(gi_items),
        engine_type=sim_result["engine_name"],
        peak_runoff_m3s=sim_result["peak_runoff_m3s"],
        total_volume_m3=sim_result["total_runoff_volume_m3"],
        flooded_nodes_count=sim_result["flooded_nodes_count"],
        max_surcharge_depth_m=sim_result["max_surcharge_depth_m"],
        hydrograph_json=json.dumps(sim_result["hydrograph"]),
        execution_time_ms=exec_ms
    )
    db.add(run_record)
    db.commit()
    db.refresh(run_record)
    
    return {
        "id": run_record.id,
        "title": run_record.title,
        "engine_name": sim_result["engine_name"],
        "engine_verification_badge": sim_result["engine_verification_badge"],
        "rainfall_scenario_name": scenario.name,
        "drainage_capacity_pct": req.drainage_stress_pct,
        "total_rainfall_volume_m3": sim_result["total_rainfall_volume_m3"],
        "peak_inflow_m3s": sim_result["peak_inflow_m3s"],
        "peak_runoff_m3s": sim_result["peak_runoff_m3s"],
        "baseline_peak_runoff_m3s": sim_result["baseline_peak_runoff_m3s"],
        "peak_reduction_pct": sim_result["peak_reduction_pct"],
        "total_runoff_volume_m3": sim_result["total_runoff_volume_m3"],
        "volume_retention_m3": sim_result["volume_retention_m3"],
        "volume_reduction_pct": sim_result["volume_reduction_pct"],
        "flooded_nodes_count": sim_result["flooded_nodes_count"],
        "max_surcharge_depth_m": sim_result["max_surcharge_depth_m"],
        "hydrograph": sim_result["hydrograph"],
        "subcatchment_summaries": sim_result["subcatchment_summaries"],
        "execution_time_ms": exec_ms,
        "is_swmm_native": sim_result["is_swmm_native"],
        "methodology_caveat": sim_result["methodology_caveat"]
    }

@app.post("/api/optimisation/run", response_model=OptimizationRunResponse)
def execute_optimization(
    req: OptimizationRunRequest,
    db: Session = Depends(get_db)
):
    scenario = db.query(RainfallScenario).filter(RainfallScenario.id == req.rainfall_scenario_id).first()
    if not scenario:
        scenario = db.query(RainfallScenario).first()
        
    candidate_sites = db.query(InterventionSite).all()
    site_dicts = [
        {
            "id": s.id,
            "name": s.name,
            "subcatchment_code": s.subcatchment_code,
            "land_use": s.land_use,
            "available_area_m2": s.available_area_m2
        } for s in candidate_sites
    ]
    
    subs = db.query(Subcatchment).all()
    sub_dicts = [
        {
            "code": s.code,
            "name": s.name,
            "area_ha": s.area_ha,
            "elevation_m": s.elevation_m,
            "slope_pct": s.slope_pct,
            "soil_type": s.soil_type,
            "impervious_pct": s.impervious_pct,
            "baseline_drainage_capacity_m3s": s.baseline_drainage_capacity_m3s
        } for s in subs
    ]
    
    hyeto = json.loads(scenario.hyetograph_json)
    
    opt_result = run_nsga2_optimization(
        candidate_sites=site_dicts,
        subcatchments=sub_dicts,
        hyetograph=hyeto,
        budget_limit_lakhs=req.budget_limit_lakhs,
        drainage_stress_pct=req.drainage_stress_pct,
        pop_size=min(50, max(20, req.population_size)),
        generations=min(30, max(10, req.generations))
    )
    
    # Save optimization run record
    opt_record = OptimizationRun(
        title=f"NSGA-II Run: Budget ₹{req.budget_limit_lakhs} Lakhs @ {req.drainage_stress_pct}% Capacity",
        budget_limit_lakhs=req.budget_limit_lakhs,
        rainfall_scenario_id=scenario.id,
        drainage_stress_pct=req.drainage_stress_pct,
        population_size=req.population_size,
        generations=req.generations,
        pareto_solutions_json=json.dumps(opt_result["pareto_frontier"]),
        low_cost_solution_json=json.dumps(opt_result["low_cost_solution"]),
        balanced_solution_json=json.dumps(opt_result["balanced_solution"]),
        high_perf_solution_json=json.dumps(opt_result["high_perf_solution"]),
        execution_time_s=opt_result["execution_time_s"]
    )
    db.add(opt_record)
    db.commit()
    
    return opt_result

@app.get("/api/data-provenance", response_model=List[DataProvenanceResponse])
def get_data_provenance(db: Session = Depends(get_db)):
    return db.query(DataProvenance).all()
