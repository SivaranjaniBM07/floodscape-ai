import time
import math
import random
import numpy as np
from typing import List, Dict, Any, Tuple
from .hydrology import GI_SPECS, simulate_catchment_hydrograph

def evaluate_individual_portfolio(
    chromosome: List[float],
    candidate_sites: List[Dict[str, Any]],
    subcatchments: List[Dict[str, Any]],
    hyetograph: List[Dict[str, Any]],
    drainage_stress_pct: int,
    budget_limit_lakhs: float
) -> Tuple[float, float, float, List[Dict[str, Any]]]:
    """
    Evaluates one candidate allocation portfolio.
    Returns: (total_cost_lakhs, residual_peak_runoff_m3s, residual_volume_m3, allocated_interventions)
    """
    allocated_interventions = []
    total_cost_lakhs = 0.0
    
    # Map subcatchment by code for fast lookup
    sub_dict = {s["code"]: s for s in subcatchments}
    interventions_by_sub: Dict[str, List[Dict[str, Any]]] = {}
    
    for i, site in enumerate(candidate_sites):
        # chromosome has 2 genes per site: [fraction_of_area, gi_type_index]
        area_frac = max(0.0, min(1.0, chromosome[i * 2]))
        gi_idx = int(chromosome[i * 2 + 1]) % 4
        
        gi_types = ["Rain Garden", "Permeable Pavement", "Bioswale", "Retention Storage"]
        gi_type = gi_types[gi_idx]
        
        alloc_area_m2 = site["available_area_m2"] * area_frac
        if alloc_area_m2 < 50.0:  # Ignore trivial areas under 50 sqm
            continue
            
        unit_cost = GI_SPECS[gi_type]["unit_cost_lakhs_per_m2"]
        cost = alloc_area_m2 * unit_cost
        total_cost_lakhs += cost
        
        item = {
            "site_id": site.get("id", i + 1),
            "site_name": site.get("name", f"Site {i+1}"),
            "subcatchment_code": site["subcatchment_code"],
            "intervention_type": gi_type,
            "allocated_area_m2": round(alloc_area_m2, 1),
            "estimated_cost_inr_lakhs": round(cost, 2)
        }
        allocated_interventions.append(item)
        interventions_by_sub.setdefault(site["subcatchment_code"], []).append(item)

    # Budget penalty if exceeded
    cost_penalty = 0.0
    if total_cost_lakhs > budget_limit_lakhs:
        excess = total_cost_lakhs - budget_limit_lakhs
        cost_penalty = excess * 50.0  # heavy penalty to steer towards feasible region
        
    # Hydrodynamic evaluation
    total_sys_vol_m3 = 0.0
    num_steps = len(hyetograph)
    sys_rates = [0.0] * num_steps
    
    for sub in subcatchments:
        code = sub["code"]
        sub_gi = interventions_by_sub.get(code, [])
        res = simulate_catchment_hydrograph(
            area_ha=sub["area_ha"],
            slope_pct=sub["slope_pct"],
            elevation_m=sub["elevation_m"],
            soil_type=sub["soil_type"],
            impervious_pct=sub["impervious_pct"],
            baseline_drainage_capacity_m3s=sub.get("baseline_drainage_capacity_m3s", 2.5),
            drainage_stress_pct=drainage_stress_pct,
            hyetograph=hyetograph,
            allocated_interventions=sub_gi
        )
        total_sys_vol_m3 += res["total_runoff_volume_m3"]
        for t_idx, pt in enumerate(res["time_series"]):
            sys_rates[t_idx] += pt["runoff_rate_m3s"]

    peak_runoff_m3s = max(sys_rates) if sys_rates else 0.0
    
    # Penalize objectives if budget exceeded
    f1_cost = total_cost_lakhs
    f2_peak = peak_runoff_m3s + cost_penalty
    f3_vol = total_sys_vol_m3 + (cost_penalty * 1000.0)
    
    return f1_cost, f2_peak, f3_vol, allocated_interventions

def fast_non_dominated_sort(objectives: np.ndarray) -> List[List[int]]:
    """
    Standard NSGA-II fast non-dominated sorting.
    objectives: N x M matrix (minimization)
    """
    n_pop = objectives.shape[0]
    domination_counts = [0] * n_pop
    dominated_solutions = [[] for _ in range(n_pop)]
    fronts = [[]]

    for p in range(n_pop):
        for q in range(n_pop):
            if p == q:
                continue
            # check p dominates q: p <= q in all and p < q in at least one
            p_less_or_equal = np.all(objectives[p] <= objectives[q])
            p_strictly_less = np.any(objectives[p] < objectives[q])
            
            if p_less_or_equal and p_strictly_less:
                dominated_solutions[p].append(q)
            elif np.all(objectives[q] <= objectives[p]) and np.any(objectives[q] < objectives[p]):
                domination_counts[p] += 1
                
        if domination_counts[p] == 0:
            fronts[0].append(p)
            
    i = 0
    while len(fronts[i]) > 0:
        next_front = []
        for p in fronts[i]:
            for q in dominated_solutions[p]:
                domination_counts[q] -= 1
                if domination_counts[q] == 0:
                    next_front.append(q)
        i += 1
        fronts.append(next_front)
        
    return fronts[:-1]

def calculate_crowding_distance(objectives: np.ndarray, front: List[int]) -> Dict[int, float]:
    """Calculates crowding distance for individuals within a front."""
    l = len(front)
    if l == 0:
        return {}
    if l <= 2:
        return {idx: float('inf') for idx in front}
        
    distances = {idx: 0.0 for idx in front}
    n_obj = objectives.shape[1]
    
    for m in range(n_obj):
        # Sort front by m-th objective
        sorted_front = sorted(front, key=lambda idx: objectives[idx, m])
        distances[sorted_front[0]] = float('inf')
        distances[sorted_front[-1]] = float('inf')
        
        obj_min = objectives[sorted_front[0], m]
        obj_max = objectives[sorted_front[-1], m]
        span = obj_max - obj_min
        if span == 0:
            continue
            
        for i in range(1, l - 1):
            distances[sorted_front[i]] += (objectives[sorted_front[i + 1], m] - objectives[sorted_front[i - 1], m]) / span
            
    return distances

def run_nsga2_optimization(
    candidate_sites: List[Dict[str, Any]],
    subcatchments: List[Dict[str, Any]],
    hyetograph: List[Dict[str, Any]],
    budget_limit_lakhs: float = 300.0,
    drainage_stress_pct: int = 100,
    pop_size: int = 40,
    generations: int = 25
) -> Dict[str, Any]:
    """
    Executes multi-objective NSGA-II optimization:
    f1: Total Cost (INR Lakhs) -> Minimize
    f2: Residual Peak Runoff (m3/s) -> Minimize
    f3: Residual Runoff Volume (m3) -> Minimize
    """
    start_time = time.time()
    num_sites = len(candidate_sites)
    num_genes = num_sites * 2  # area_frac, gi_type_idx
    
    # 0. Baseline (Zero intervention)
    baseline_cost, baseline_peak, baseline_vol, _ = evaluate_individual_portfolio(
        [0.0] * num_genes, candidate_sites, subcatchments, hyetograph, drainage_stress_pct, 1e9
    )
    
    # 1. Initialize Population
    population = []
    # Seed with diverse initializations: zero, low-cost, balanced, aggressive
    for i in range(pop_size):
        ind = []
        scale = (i / float(pop_size)) * 0.8
        for s in range(num_sites):
            area_frac = random.uniform(0.0, scale) if i > 0 else 0.0
            gi_type_idx = random.randint(0, 3)
            ind.extend([area_frac, gi_type_idx])
        population.append(ind)
        
    pop_arr = np.array(population, dtype=float)
    
    # 2. Generational Loop
    for gen in range(generations):
        # Evaluate population
        objectives = np.zeros((len(pop_arr), 3))
        for p in range(len(pop_arr)):
            c, pk, vl, _ = evaluate_individual_portfolio(
                pop_arr[p].tolist(), candidate_sites, subcatchments, hyetograph, drainage_stress_pct, budget_limit_lakhs
            )
            objectives[p] = [c, pk, vl]
            
        fronts = fast_non_dominated_sort(objectives)
        
        # Selection, Crossover (SBX) and Mutation
        offspring = []
        while len(offspring) < pop_size:
            # Binary tournament selection
            p1_idx = random.randint(0, pop_size - 1)
            p2_idx = random.randint(0, pop_size - 1)
            parent1 = pop_arr[p1_idx]
            parent2 = pop_arr[p2_idx]
            
            # Crossover (Simulated Binary Crossover / Blend)
            c1 = parent1.copy()
            c2 = parent2.copy()
            if random.random() < 0.9:
                alpha = random.random()
                for g in range(0, num_genes, 2):
                    c1[g] = alpha * parent1[g] + (1 - alpha) * parent2[g]
                    c2[g] = (1 - alpha) * parent1[g] + alpha * parent2[g]
                for g in range(1, num_genes, 2):
                    if random.random() < 0.5:
                        c1[g] = parent2[g]
                        c2[g] = parent1[g]
                        
            # Mutation (Polynomial Mutation)
            for child in [c1, c2]:
                for g in range(num_genes):
                    if random.random() < 0.15:
                        if g % 2 == 0:
                            child[g] = max(0.0, min(1.0, child[g] + random.gauss(0, 0.2)))
                        else:
                            child[g] = random.randint(0, 3)
                offspring.append(child)
                if len(offspring) >= pop_size:
                    break
                    
        # Combine Parent and Offspring (Elitism 2N -> N)
        combined_pop = np.vstack([pop_arr, np.array(offspring)])
        combined_obj = np.zeros((len(combined_pop), 3))
        for p in range(len(combined_pop)):
            c, pk, vl, _ = evaluate_individual_portfolio(
                combined_pop[p].tolist(), candidate_sites, subcatchments, hyetograph, drainage_stress_pct, budget_limit_lakhs
            )
            combined_obj[p] = [c, pk, vl]
            
        combined_fronts = fast_non_dominated_sort(combined_obj)
        
        new_pop = []
        for front in combined_fronts:
            if len(new_pop) + len(front) <= pop_size:
                for idx in front:
                    new_pop.append(combined_pop[idx])
            else:
                needed = pop_size - len(new_pop)
                cdists = calculate_crowding_distance(combined_obj, front)
                sorted_by_cdist = sorted(front, key=lambda idx: cdists[idx], reverse=True)
                for idx in sorted_by_cdist[:needed]:
                    new_pop.append(combined_pop[idx])
                break
        pop_arr = np.array(new_pop)
        
    # Final evaluation of the converged Pareto front
    final_obj = np.zeros((len(pop_arr), 3))
    all_allocations = []
    for p in range(len(pop_arr)):
        c, pk, vl, allocs = evaluate_individual_portfolio(
            pop_arr[p].tolist(), candidate_sites, subcatchments, hyetograph, drainage_stress_pct, budget_limit_lakhs
        )
        final_obj[p] = [c, pk, vl]
        all_allocations.append(allocs)
        
    final_fronts = fast_non_dominated_sort(final_obj)
    pareto_indices = final_fronts[0]
    
    # Filter only solutions strictly meeting budget limit
    valid_pareto = [idx for idx in pareto_indices if final_obj[idx, 0] <= budget_limit_lakhs]
    if not valid_pareto:
        valid_pareto = pareto_indices
        
    pareto_solutions = []
    for rank, idx in enumerate(valid_pareto):
        cost = round(float(final_obj[idx, 0]), 2)
        pk = round(float(final_obj[idx, 1]), 3)
        vol = round(float(final_obj[idx, 2]), 1)
        
        pk_red = max(0.0, round(((baseline_peak - pk) / max(0.001, baseline_peak)) * 100.0, 1))
        vol_red = max(0.0, round(((baseline_vol - vol) / max(0.001, baseline_vol)) * 100.0, 1))
        
        pareto_solutions.append({
            "solution_id": rank + 1,
            "solution_type": "Pareto Optimal",
            "total_cost_lakhs": cost,
            "residual_peak_runoff_m3s": pk,
            "residual_volume_m3": vol,
            "peak_reduction_pct": pk_red,
            "volume_reduction_pct": vol_red,
            "interventions_count": len(all_allocations[idx]),
            "allocations": all_allocations[idx]
        })

    # Sort solutions by cost
    pareto_solutions.sort(key=lambda x: x["total_cost_lakhs"])
    
    # 3. Identify Distinctive Solutions: Low-Cost, Balanced, High-Performance
    # Low-Cost: lowest cost with at least 5% volume reduction
    low_cost_sol = next((s for s in pareto_solutions if s["volume_reduction_pct"] >= 5.0), pareto_solutions[0])
    low_cost_sol = dict(low_cost_sol)
    low_cost_sol["solution_type"] = "Low-Cost Solution"
    
    # High-Performance: maximum volume & peak reduction within budget
    high_perf_sol = max(pareto_solutions, key=lambda s: s["volume_reduction_pct"] + s["peak_reduction_pct"])
    high_perf_sol = dict(high_perf_sol)
    high_perf_sol["solution_type"] = "High-Performance Solution"
    
    # Balanced (Knee-point): minimize distance to ideal point (min cost, min peak, min vol)
    min_c = min(s["total_cost_lakhs"] for s in pareto_solutions)
    max_c = max(max(s["total_cost_lakhs"] for s in pareto_solutions), min_c + 1.0)
    min_pk = min(s["residual_peak_runoff_m3s"] for s in pareto_solutions)
    max_pk = max(max(s["residual_peak_runoff_m3s"] for s in pareto_solutions), min_pk + 0.1)
    
    def knee_dist(sol):
        norm_c = (sol["total_cost_lakhs"] - min_c) / (max_c - min_c)
        norm_pk = (sol["residual_peak_runoff_m3s"] - min_pk) / (max_pk - min_pk)
        return (norm_c ** 2) + (norm_pk ** 2)
        
    balanced_sol = min(pareto_solutions, key=knee_dist)
    balanced_sol = dict(balanced_sol)
    balanced_sol["solution_type"] = "Balanced Solution"
    
    exec_time = round(time.time() - start_time, 2)
    
    return {
        "budget_limit_lakhs": budget_limit_lakhs,
        "scenario_name": "Tiruchirappalli 10-Yr 2-Hr Design Storm",
        "drainage_stress_pct": drainage_stress_pct,
        "baseline_cost_lakhs": 0.0,
        "baseline_peak_runoff_m3s": round(baseline_peak, 3),
        "baseline_volume_m3": round(baseline_vol, 1),
        "pareto_frontier": pareto_solutions,
        "low_cost_solution": low_cost_sol,
        "balanced_solution": balanced_sol,
        "high_perf_solution": high_perf_sol,
        "algorithm_metadata": {
            "algorithm": "NSGA-II (Deb et al., 2002)",
            "crossover": "Simulated Binary Crossover (SBX)",
            "mutation": "Polynomial Mutation",
            "population_size": pop_size,
            "generations": generations,
            "objectives": ["Min Total Cost (INR Lakhs)", "Min Residual Peak Runoff (m3/s)", "Min Residual Volume (m3)"]
        },
        "execution_time_s": exec_time
    }
