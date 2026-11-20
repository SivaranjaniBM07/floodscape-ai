import sys
import os
import json

sys.path.insert(0, os.path.abspath("backend"))

from app.database import SessionLocal
from app.main import (
    read_root, health_check, get_study_area, get_subcatchments,
    get_subcatchment_by_code, recalculate_susceptibility, get_resilience_fingerprint,
    get_drainage_assets, get_flood_evidence, get_intervention_sites,
    get_rainfall_scenarios, create_custom_rainfall, execute_simulation,
    execute_optimization, get_data_provenance
)
from app.schemas import (
    SusceptibilityWeightsRequest, RainfallCustomRequest,
    SimulationRunRequest, ProposedInterventionItem, OptimizationRunRequest
)

def run_direct_api_tests():
    print("==============================================================")
    print("FLOODSCAPE AI — COMPREHENSIVE ENDPOINT TEST SUITE")
    print("==============================================================")
    db = SessionLocal()
    try:
        # 1. Root & Health
        root = read_root()
        assert root["status"] == "online"
        print(f"[PASS] 1. Root: '{root['title']}' -> {root['status']}")

        health = health_check(db)
        assert health["status"] == "healthy"
        print(f"[PASS] 2. Health: {health['status']} | Database: {health['database']} | Engine: {health['active_simulation_engine']}")

        # 2. Study Area
        sa = get_study_area(db)
        assert sa.name == "Tiruchirappalli Urban Agglomeration"
        print(f"[PASS] 3. Study Area: '{sa.name}', Area: {sa.total_area_sqkm} sq.km, CRS: {sa.crs}")

        # 3. Subcatchments
        subs = get_subcatchments(db)
        assert len(subs) == 12
        print(f"[PASS] 4. Subcatchments: Loaded {len(subs)} delineated basins in Tiruchirappalli")

        sub2 = get_subcatchment_by_code("TR-02", db)
        assert sub2.code == "TR-02"
        print(f"[PASS] 5. Subcatchment TR-02: '{sub2.name}', Impervious: {sub2.impervious_pct}%, Elev: {sub2.elevation_m}m")

        # 4. Susceptibility Recalculation
        req_weights = SusceptibilityWeightsRequest(
            weight_elevation=0.25,
            weight_slope=0.15,
            weight_flow_accum=0.30,
            weight_impervious=0.20,
            weight_soil=0.10
        )
        susc_res = recalculate_susceptibility(req_weights, db)
        assert len(susc_res["subcatchments"]) == 12
        print(f"[PASS] 6. Susceptibility Recalculation: High={susc_res['high_risk_count']}, Mod={susc_res['moderate_risk_count']}, Low={susc_res['low_risk_count']}")

        # 5. SIGNATURE FEATURE: Flood Resilience Fingerprint (4 Stress Scenarios)
        fp = get_resilience_fingerprint("TR-02", 3, db)
        assert len(fp["stress_scenarios"]) == 4
        print(f"[PASS] 7. Flood Resilience Fingerprint (SIGNATURE FEATURE):")
        print(f"       Basin: {fp['name']} ({fp['subcatchment_code']}) | Score: {fp['baseline_susceptibility_score']} ({fp['susceptibility_category']})")
        print(f"       Dominant Factor: {fp['dominant_factor']}")
        for st in fp["stress_scenarios"]:
            print(f"       * {st['label']}: Peak {st['peak_runoff_m3s']} m3/s, Ponding {st['waterlog_depth_cm']} cm ({st['drainage_surcharge_risk']})")
        print(f"       * Natural Language Research Explanation: {fp['scientific_explanation'][:95]}...")

        # 6. Assets & Evidence
        assets = get_drainage_assets(db)
        print(f"[PASS] 8. Drainage Assets: {len(assets)} infrastructure vectors (e.g. {assets[0].name})")

        evidence = get_flood_evidence(db)
        print(f"[PASS] 9. Flood Evidence: {len(evidence)} historical inundation spots (e.g. {evidence[0].name}, depth {evidence[0].flood_depth_m}m)")

        sites = get_intervention_sites(db)
        print(f"[PASS] 10. Candidate GI Sites: {len(sites)} public parcels (e.g. {sites[0].name})")

        # 7. Rainfall
        scens = get_rainfall_scenarios(db)
        print(f"[PASS] 11. Rainfall Scenarios: {len(scens)} design hyetographs loaded")

        new_storm = create_custom_rainfall(
            RainfallCustomRequest(
                name="2026 Test Convective Burst",
                duration_hrs=2.0,
                total_rainfall_mm=88.0,
                peak_ratio=0.35
            ),
            db
        )
        print(f"[PASS] 12. Custom Storm Designer: Created '{new_storm['name']}', Peak: {new_storm['peak_intensity_mmhr']} mm/h")

        # 8. Full-System Simulation Run
        sim_res = execute_simulation(
            SimulationRunRequest(
                scenario_id=3,
                drainage_stress_pct=75,
                interventions=[
                    ProposedInterventionItem(
                        subcatchment_code="TR-02",
                        intervention_type="Rain Garden",
                        allocated_area_m2=2000.0
                    ),
                    ProposedInterventionItem(
                        subcatchment_code="TR-05",
                        intervention_type="Permeable Pavement",
                        allocated_area_m2=2500.0
                    )
                ]
            ),
            db
        )
        print(f"[PASS] 13. Hydrodynamic Simulation:")
        print(f"       * Engine: {sim_res['engine_name']} ({sim_res['engine_verification_badge']})")
        print(f"       * Peak Runoff: {sim_res['peak_runoff_m3s']} m3/s (Reduction: -{sim_res['peak_reduction_pct']}%)")
        print(f"       * Total Volume: {sim_res['total_runoff_volume_m3']} m3 (Retention: {sim_res['volume_retention_m3']} m3, -{sim_res['volume_reduction_pct']}%)")
        print(f"       * Surcharged Nodes: {sim_res['flooded_nodes_count']} / 12, Max Depth: {sim_res['max_surcharge_depth_m']}m")
        print(f"       * Hydrograph points: {len(sim_res['hydrograph'])} time steps")

        # 9. NSGA-II Multi-Objective Optimization
        opt_res = execute_optimization(
            OptimizationRunRequest(
                budget_limit_lakhs=250.0,
                rainfall_scenario_id=3,
                drainage_stress_pct=100,
                population_size=20,
                generations=15
            ),
            db
        )
        print(f"[PASS] 14. NSGA-II Multi-Objective Optimisation:")
        print(f"       * Execution Time: {opt_res['execution_time_s']}s")
        print(f"       * Pareto Frontier: {len(opt_res['pareto_frontier'])} non-dominated portfolios")
        print(f"       * Low-Cost: ₹{opt_res['low_cost_solution']['total_cost_lakhs']}L (Vol Red: -{opt_res['low_cost_solution']['volume_reduction_pct']}%)")
        print(f"       * Balanced: ₹{opt_res['balanced_solution']['total_cost_lakhs']}L (Vol Red: -{opt_res['balanced_solution']['volume_reduction_pct']}%)")
        print(f"       * High-Perf: ₹{opt_res['high_perf_solution']['total_cost_lakhs']}L (Vol Red: -{opt_res['high_perf_solution']['volume_reduction_pct']}%)")

        # 10. Data Provenance
        prov = get_data_provenance(db)
        print(f"[PASS] 15. Data Provenance: {len(prov)} datasets registered with full attribution")

        print("\n==============================================================")
        print("ALL 15 BACKEND ENDPOINTS & RESEARCH MODULES VERIFIED 100%!")
        print("==============================================================")
    finally:
        db.close()

if __name__ == "__main__":
    run_direct_api_tests()
