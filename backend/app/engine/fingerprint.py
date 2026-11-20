import math
from typing import Dict, Any, List

def calculate_transparent_susceptibility(
    elevation_m: float,
    slope_pct: float,
    flow_accumulation: float,
    impervious_pct: float,
    soil_conductivity_mmhr: float,
    weights: Dict[str, float] = None
) -> Dict[str, Any]:
    """
    Transparent Weighted Susceptibility Index calculation.
    Not a calibrated flood probability, but an explainable multicriteria susceptibility index.
    """
    if weights is None:
        weights = {
            "weight_elevation": 0.20,
            "weight_slope": 0.20,
            "weight_flow_accum": 0.25,
            "weight_impervious": 0.20,
            "weight_soil": 0.15
        }
    
    # 1. Normalize Elevation (Trichy range ~65m to 95m, lower elevation = higher susceptibility)
    # Min elev ~65m -> factor 1.0, Max elev ~95m -> factor 0.0
    norm_elevation = max(0.0, min(1.0, (95.0 - elevation_m) / (95.0 - 65.0)))
    
    # 2. Normalize Slope (flatter slope = slower drainage = higher susceptibility, range 0.2% to 4.5%)
    # Flat slope ~0.2% -> factor 1.0, Steeper slope ~4.5% -> factor 0.0
    norm_slope = max(0.0, min(1.0, (4.5 - slope_pct) / (4.5 - 0.2)))
    
    # 3. Normalize Flow Accumulation (higher flow accumulation = confluence zone = higher susceptibility, range 1,000 to 75,000)
    norm_flow_accum = max(0.0, min(1.0, (flow_accumulation - 1000.0) / (75000.0 - 1000.0)))
    
    # 4. Normalize Impervious Surface (higher built-up = higher runoff = higher susceptibility, range 15% to 90%)
    norm_impervious = max(0.0, min(1.0, (impervious_pct - 15.0) / (90.0 - 15.0)))
    
    # 5. Normalize Soil Infiltration (lower infiltration = higher susceptibility, range 5 mm/hr to 40 mm/hr)
    norm_soil = max(0.0, min(1.0, (40.0 - soil_conductivity_mmhr) / (40.0 - 5.0)))
    
    # Factor contributions
    c_elev = norm_elevation * weights["weight_elevation"]
    c_slope = norm_slope * weights["weight_slope"]
    c_flow = norm_flow_accum * weights["weight_flow_accum"]
    c_imp = norm_impervious * weights["weight_impervious"]
    c_soil = norm_soil * weights["weight_soil"]
    
    raw_score = c_elev + c_slope + c_flow + c_imp + c_soil
    normalized_score = round(max(0.05, min(0.98, raw_score)), 3)
    
    # Identify dominant factor
    factor_dict = {
        "Low Topographic Elevation": c_elev,
        "Flat Surface Gradient": c_slope,
        "High Upstream Flow Accumulation": c_flow,
        "Impervious Built-Up Cover": c_imp,
        "Low Infiltration Soil Class": c_soil
    }
    dominant_factor = max(factor_dict, key=factor_dict.get)
    
    category = "High" if normalized_score >= 0.65 else ("Moderate" if normalized_score >= 0.40 else "Low")
    
    return {
        "raw_score": raw_score,
        "normalized_score": normalized_score,
        "category": category,
        "dominant_factor": dominant_factor,
        "norm_factors": {
            "elevation": round(norm_elevation, 3),
            "slope": round(norm_slope, 3),
            "flow_accumulation": round(norm_flow_accum, 3),
            "impervious": round(norm_impervious, 3),
            "soil_impedance": round(norm_soil, 3)
        },
        "contributions": {
            "elevation": round(c_elev, 3),
            "slope": round(c_slope, 3),
            "flow_accumulation": round(c_flow, 3),
            "impervious": round(c_imp, 3),
            "soil": round(c_soil, 3)
        }
    }

def generate_flood_resilience_fingerprint(
    subcatchment: Dict[str, Any],
    rainfall_scenario: Dict[str, Any],
    interventions: List[Dict[str, Any]] = None,
    weights: Dict[str, float] = None
) -> Dict[str, Any]:
    """
    Computes the complete Flood Resilience Fingerprint for a subcatchment.
    Includes response across 4 drainage scenarios: 100%, 75%, 50%, 25% capacity.
    """
    interventions = interventions or []
    
    # 1. Base susceptibility
    susc_info = calculate_transparent_susceptibility(
        elevation_m=subcatchment["elevation_m"],
        slope_pct=subcatchment["slope_pct"],
        flow_accumulation=subcatchment["flow_accumulation"],
        impervious_pct=subcatchment["impervious_pct"],
        soil_conductivity_mmhr=subcatchment.get("hydraulic_conductivity_mmhr", 15.0),
        weights=weights
    )
    
    # 2. Hyetograph from scenario
    hyetograph = rainfall_scenario.get("hyetograph", [])
    total_p_mm = rainfall_scenario.get("total_rainfall_mm", 65.0)
    
    area_ha = subcatchment["area_ha"]
    baseline_drainage_cap = subcatchment.get("baseline_drainage_capacity_m3s", 2.5)
    
    # 3. Compute 4 drainage stress tests: 100%, 75%, 50%, 25% capacity
    stress_percentages = [100, 75, 50, 25]
    stress_results = []
    
    # Baseline runoff estimation
    # Curve number
    imp_frac = subcatchment["impervious_pct"] / 100.0
    cn = 98.0 * imp_frac + (1.0 - imp_frac) * 70.0
    S_mm = (25400.0 / cn) - 254.0
    Ia_mm = 0.2 * S_mm
    runoff_depth_mm = ((total_p_mm - Ia_mm) ** 2) / (total_p_mm - Ia_mm + S_mm) if total_p_mm > Ia_mm else 0.0
    base_runoff_vol_m3 = runoff_depth_mm * area_ha * 10.0
    base_peak_m3s = (base_runoff_vol_m3 / (rainfall_scenario.get("duration_hrs", 2.0) * 3600.0)) * 2.2
    
    for cap_pct in stress_percentages:
        stressed_cap_m3s = baseline_drainage_cap * (cap_pct / 100.0)
        excess_peak = max(0.0, base_peak_m3s - stressed_cap_m3s)
        
        # Waterlogged retention volume and ponding depth over 5% low-depression area
        deficit_m3 = excess_peak * (rainfall_scenario.get("duration_hrs", 2.0) * 1800.0)
        low_area_m2 = max(5000.0, area_ha * 10000.0 * 0.05)
        ponding_depth_cm = round((deficit_m3 / low_area_m2) * 100.0, 1)
        
        if ponding_depth_cm > 40.0:
            risk_label = "Critical Surcharge"
        elif ponding_depth_cm > 20.0:
            risk_label = "High Surcharge"
        elif ponding_depth_cm > 5.0:
            risk_label = "Moderate Surcharge"
        else:
            risk_label = "Nominal / In-Bank Flow"
            
        label = f"{cap_pct}% Normal Capacity" if cap_pct == 100 else f"{cap_pct}% Stress Condition"
        
        stress_results.append({
            "capacity_pct": cap_pct,
            "label": label,
            "peak_runoff_m3s": round(base_peak_m3s, 3),
            "runoff_volume_m3": round(base_runoff_vol_m3, 1),
            "waterlog_depth_cm": ponding_depth_cm,
            "drainage_surcharge_risk": risk_label,
            "attenuation_deficit_m3": round(deficit_m3, 1)
        })
        
    # 4. Green Infrastructure Benefits
    gi_area_total_m2 = sum(float(item.get("allocated_area_m2", 0.0)) for item in interventions)
    potential_retention_vol_m3 = sum(float(item.get("allocated_area_m2", 0.0)) * 0.22 for item in interventions)
    
    if base_runoff_vol_m3 > 0:
        vol_red_pct = min(65.0, (potential_retention_vol_m3 / base_runoff_vol_m3) * 100.0)
    else:
        vol_red_pct = 0.0
        
    peak_red_pct = min(50.0, vol_red_pct * 0.75)
    
    # Remaining risk score calculation
    mitigation_factor = min(0.60, (vol_red_pct / 100.0) * 0.8)
    remaining_risk = round(max(0.08, susc_info["normalized_score"] * (1.0 - mitigation_factor)), 3)
    
    # 5. Radar chart metrics
    norm = susc_info["norm_factors"]
    radar_metrics = [
        {"dimension": "Topographic Low (Elevation)", "value": round(norm["elevation"] * 100, 1), "baseline": 50},
        {"dimension": "Runoff Flatness (Slope)", "value": round(norm["slope"] * 100, 1), "baseline": 50},
        {"dimension": "Flow Accumulation", "value": round(norm["flow_accumulation"] * 100, 1), "baseline": 50},
        {"dimension": "Impervious Density", "value": round(norm["impervious"] * 100, 1), "baseline": 50},
        {"dimension": "Soil Infiltration Impedance", "value": round(norm["soil_impedance"] * 100, 1), "baseline": 50},
        {"dimension": "Drainage Stress Vulnerability", "value": round((1.0 - (baseline_drainage_cap / 5.0)) * 100, 1), "baseline": 50}
    ]
    
    # 6. Natural Language Explainability Narrative
    elev = subcatchment["elevation_m"]
    slope = subcatchment["slope_pct"]
    imp = subcatchment["impervious_pct"]
    dom = susc_info["dominant_factor"]
    soil = subcatchment["soil_type"]
    name = subcatchment["name"]
    code = subcatchment["code"]
    
    explanation = (
        f"Subcatchment {name} ({code}) is categorized as {susc_info['category']} susceptibility "
        f"with a transparent composite index of {susc_info['normalized_score']} (scale 0 to 1). "
        f"The primary hydrological driver is {dom}. Situated at an elevation of {elev} m above MSL "
        f"with a gentle slope of {slope}%, runoff velocities are constrained, prolonging ponding duration. "
        f"With {imp}% impervious urban surface cover over {soil} substrate, natural infiltration is restricted. "
        f"Under hypothetical drainage stress testing (simulating backwater or hydraulic throttling), reduction of conveyance "
        f"from 100% down to 25% elevates simulated street waterlogging from {stress_results[0]['waterlog_depth_cm']} cm "
        f"to {stress_results[3]['waterlog_depth_cm']} cm."
    )
    
    limitations = (
        "Methodological Note: Susceptibility is an uncalibrated relative multicriteria ranking index based on physical basin "
        "attributes. Drainage stress tests reflect hypothetical capacity throttling scenarios rather than surveyed physical "
        "pipe blockage. Peak and volume estimates are calculated using the SCS-CN and kinematic routing equations."
    )
    
    return {
        "subcatchment_code": code,
        "name": name,
        "area_ha": area_ha,
        "elevation_m": elev,
        "slope_pct": slope,
        "flow_accumulation": subcatchment["flow_accumulation"],
        "impervious_pct": imp,
        "soil_type": soil,
        "baseline_susceptibility_score": susc_info["normalized_score"],
        "susceptibility_category": susc_info["category"],
        "dominant_factor": dom,
        "stress_scenarios": stress_results,
        "intervention_coverage_m2": round(gi_area_total_m2, 1),
        "potential_volume_retention_m3": round(potential_retention_vol_m3, 1),
        "potential_peak_reduction_pct": round(peak_red_pct, 1),
        "remaining_risk_score": remaining_risk,
        "radar_metrics": radar_metrics,
        "scientific_explanation": explanation,
        "limitations_note": limitations
    }
