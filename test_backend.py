import sys
import os
import json

# Add backend to path
sys.path.insert(0, os.path.abspath("backend"))

from app.database import engine, Base, SessionLocal
from app.seed_data import seed_database
from app.models import StudyArea, Subcatchment, RainfallScenario
from app.engine.fingerprint import calculate_transparent_susceptibility, generate_flood_resilience_fingerprint
from app.engine.hydrology import run_system_simulation
from app.engine.nsga2 import run_nsga2_optimization

def test_all():
    print("1. Initializing DB and Seeding...")
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    seed_database(db)
    
    study_area = db.query(StudyArea).first()
    assert study_area is not None, "Study area missing"
    print(f"   Study Area: {study_area.name}, CRS: {study_area.crs}")
    
    subs = db.query(Subcatchment).all()
    assert len(subs) == 12, f"Expected 12 subcatchments, got {len(subs)}"
    print(f"   Loaded {len(subs)} subcatchments successfully.")
    
    print("\n2. Testing Susceptibility Calculation...")
    calc = calculate_transparent_susceptibility(
        elevation_m=subs[0].elevation_m,
        slope_pct=subs[0].slope_pct,
        flow_accumulation=subs[0].flow_accumulation,
        impervious_pct=subs[0].impervious_pct,
        soil_conductivity_mmhr=subs[0].hydraulic_conductivity_mmhr
    )
    print(f"   Subcatchment {subs[0].code} score: {calc['normalized_score']}, Category: {calc['category']}, Dominant: {calc['dominant_factor']}")
    
    print("\n3. Testing Flood Resilience Fingerprint (4 Stress Scenarios)...")
    scen = db.query(RainfallScenario).filter(RainfallScenario.id == 3).first()
    assert scen is not None, "Rainfall scenario 3 missing"
    
    sub_dict = {
        "code": subs[1].code,
        "name": subs[1].name,
        "area_ha": subs[1].area_ha,
        "elevation_m": subs[1].elevation_m,
        "slope_pct": subs[1].slope_pct,
        "flow_accumulation": subs[1].flow_accumulation,
        "impervious_pct": subs[1].impervious_pct,
        "soil_type": subs[1].soil_type,
        "hydraulic_conductivity_mmhr": subs[1].hydraulic_conductivity_mmhr,
        "baseline_drainage_capacity_m3s": subs[1].baseline_drainage_capacity_m3s
    }
    scen_dict = {
        "total_rainfall_mm": scen.total_rainfall_mm,
        "duration_hrs": scen.duration_hrs,
        "hyetograph": json.loads(scen.hyetograph_json)
    }
    
    fp = generate_flood_resilience_fingerprint(
        subcatchment=sub_dict,
        rainfall_scenario=scen_dict,
        interventions=[{"intervention_type": "Rain Garden", "allocated_area_m2": 1500.0}]
    )
    assert len(fp["stress_scenarios"]) == 4, "Must have 4 stress scenarios"
    print(f"   Fingerprint generated for {fp['name']}: {len(fp['stress_scenarios'])} stress tests.")
    for st in fp["stress_scenarios"]:
        print(f"     * {st['label']}: Peak {st['peak_runoff_m3s']} m3/s, Waterlog Depth {st['waterlog_depth_cm']} cm ({st['drainage_surcharge_risk']})")
        
    print("\n4. Testing Full-System Simulation Engine...")
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
    sim_res = run_system_simulation(
        subcatchments=sub_dicts,
        hyetograph=json.loads(scen.hyetograph_json),
        drainage_stress_pct=75,
        interventions=[{"subcatchment_code": "TR-02", "intervention_type": "Permeable Pavement", "allocated_area_m2": 2000.0}]
    )
    print(f"   Engine: {sim_res['engine_name']}")
    print(f"   Peak Runoff: {sim_res['peak_runoff_m3s']} m3/s, Total Volume: {sim_res['total_runoff_volume_m3']} m3")
    print(f"   Flooded Nodes: {sim_res['flooded_nodes_count']}, Max Surcharge: {sim_res['max_surcharge_depth_m']} m")
    
    print("\n5. Testing NSGA-II Multi-Objective Optimization...")
    candidate_sites = [
        {"id": 1, "name": "Site 1", "subcatchment_code": "TR-02", "available_area_m2": 2000.0},
        {"id": 2, "name": "Site 2", "subcatchment_code": "TR-05", "available_area_m2": 3000.0},
        {"id": 3, "name": "Site 3", "subcatchment_code": "TR-09", "available_area_m2": 2500.0}
    ]
    opt_res = run_nsga2_optimization(
        candidate_sites=candidate_sites,
        subcatchments=sub_dicts[:4],
        hyetograph=json.loads(scen.hyetograph_json)[:4],
        budget_limit_lakhs=150.0,
        drainage_stress_pct=100,
        pop_size=10,
        generations=5
    )
    print(f"   NSGA-II finished in {opt_res['execution_time_s']}s.")
    print(f"   Pareto Frontier count: {len(opt_res['pareto_frontier'])}")
    print(f"   Low-Cost Solution: Cost ₹{opt_res['low_cost_solution']['total_cost_lakhs']}L, Vol Red: {opt_res['low_cost_solution']['volume_reduction_pct']}%")
    print(f"   Balanced Solution: Cost ₹{opt_res['balanced_solution']['total_cost_lakhs']}L, Vol Red: {opt_res['balanced_solution']['volume_reduction_pct']}%")
    print(f"   High-Perf Solution: Cost ₹{opt_res['high_perf_solution']['total_cost_lakhs']}L, Vol Red: {opt_res['high_perf_solution']['volume_reduction_pct']}%")

    db.close()
    print("\nALL BACKEND VERIFICATION TESTS PASSED SUCCESSFULLY!")

if __name__ == "__main__":
    test_all()
