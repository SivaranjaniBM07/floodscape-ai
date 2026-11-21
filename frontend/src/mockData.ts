// ============================================================
// FloodScape AI — Complete Mock / Fallback Dataset
// Study Location: Tiruchirappalli, Tamil Nadu, India
// All data is SIMULATED / DEMONSTRATION unless noted.
// ============================================================

import {
  StudyArea, Subcatchment, DrainageAsset, FloodEvidence,
  InterventionSite, RainfallScenario, SimulationResult, OptimizationResult, DataProvenanceItem
} from './types';

export const MOCK_STUDY_AREA: StudyArea = {
  id: 1,
  name: "Tiruchirappalli Urban Agglomeration",
  state: "Tamil Nadu",
  country: "India",
  center_lat: 10.7905,
  center_lng: 78.7047,
  bounding_box: "[78.62, 10.73, 78.79, 10.87]",
  total_area_sqkm: 167.2,
  population: 1022000,
  crs: "EPSG:4326 (WGS 84)",
  description: "Tiruchirappalli (Trichy) is located on the plains of the Cauvery River delta in central Tamil Nadu. Characterized by low-gradient deltaic terrain, dense historical urban wards, the Uyyakondan Canal network, and seasonal monsoonal flash-waterlogging risks exacerbated by rapid urbanization."
};

export const MOCK_SUBCATCHMENTS: Subcatchment[] = [
  {
    id: 1, code: "TR-01", name: "Srirangam Island", ward_numbers: "Wards 1-6",
    area_ha: 145.0, elevation_m: 69.2, slope_pct: 0.45, flow_accumulation: 58000,
    impervious_pct: 62.0, soil_type: "Alluvial Sandy Loam", hydraulic_conductivity_mmhr: 24.0,
    baseline_drainage_capacity_m3s: 3.8, susceptibility_score: 0.62, dominant_factor: "High Flow Accumulation",
    geometry_geojson: JSON.stringify({ type: "Polygon", coordinates: [[[78.685,10.852],[78.705,10.865],[78.722,10.858],[78.718,10.842],[78.692,10.838],[78.685,10.852]]] })
  },
  {
    id: 2, code: "TR-02", name: "Thillai Nagar Central", ward_numbers: "Wards 24-28",
    area_ha: 95.0, elevation_m: 71.5, slope_pct: 0.38, flow_accumulation: 42000,
    impervious_pct: 82.0, soil_type: "Clay Loam", hydraulic_conductivity_mmhr: 10.5,
    baseline_drainage_capacity_m3s: 2.1, susceptibility_score: 0.81, dominant_factor: "Very High Imperviousness",
    geometry_geojson: JSON.stringify({ type: "Polygon", coordinates: [[[78.675,10.825],[78.690,10.828],[78.692,10.812],[78.678,10.808],[78.675,10.825]]] })
  },
  {
    id: 3, code: "TR-03", name: "Woraiyur Heritage Quarter", ward_numbers: "Wards 18-23",
    area_ha: 88.0, elevation_m: 72.8, slope_pct: 0.55, flow_accumulation: 31000,
    impervious_pct: 74.0, soil_type: "Alluvial Sandy Loam", hydraulic_conductivity_mmhr: 18.0,
    baseline_drainage_capacity_m3s: 2.4, susceptibility_score: 0.56, dominant_factor: "High Imperviousness",
    geometry_geojson: JSON.stringify({ type: "Polygon", coordinates: [[[78.662,10.828],[78.676,10.830],[78.678,10.814],[78.664,10.812],[78.662,10.828]]] })
  },
  {
    id: 4, code: "TR-04", name: "Rockfort & Teppakulam", ward_numbers: "Wards 12-17",
    area_ha: 64.0, elevation_m: 88.4, slope_pct: 3.40, flow_accumulation: 18000,
    impervious_pct: 79.0, soil_type: "Red Sandy Soil", hydraulic_conductivity_mmhr: 28.0,
    baseline_drainage_capacity_m3s: 3.2, susceptibility_score: 0.44, dominant_factor: "High Imperviousness",
    geometry_geojson: JSON.stringify({ type: "Polygon", coordinates: [[[78.690,10.832],[78.704,10.834],[78.706,10.820],[78.692,10.818],[78.690,10.832]]] })
  },
  {
    id: 5, code: "TR-05", name: "Cantonment & Central Transit Hub", ward_numbers: "Wards 35-40",
    area_ha: 112.0, elevation_m: 75.1, slope_pct: 0.62, flow_accumulation: 36000,
    impervious_pct: 84.0, soil_type: "Urban Disturbed", hydraulic_conductivity_mmhr: 8.0,
    baseline_drainage_capacity_m3s: 2.6, susceptibility_score: 0.74, dominant_factor: "Very High Imperviousness",
    geometry_geojson: JSON.stringify({ type: "Polygon", coordinates: [[[78.678,10.806],[78.698,10.808],[78.700,10.792],[78.680,10.790],[78.678,10.806]]] })
  },
  {
    id: 6, code: "TR-06", name: "K.K. Nagar Residential", ward_numbers: "Wards 48-54",
    area_ha: 135.0, elevation_m: 77.5, slope_pct: 0.85, flow_accumulation: 24000,
    impervious_pct: 66.0, soil_type: "Clay Loam", hydraulic_conductivity_mmhr: 12.0,
    baseline_drainage_capacity_m3s: 3.0, susceptibility_score: 0.49, dominant_factor: "High Flow Accumulation",
    geometry_geojson: JSON.stringify({ type: "Polygon", coordinates: [[[78.682,10.788],[78.710,10.790],[78.712,10.772],[78.685,10.770],[78.682,10.788]]] })
  },
  {
    id: 7, code: "TR-07", name: "Ponmalai / Golden Rock", ward_numbers: "Wards 41-47",
    area_ha: 155.0, elevation_m: 84.2, slope_pct: 1.65, flow_accumulation: 19000,
    impervious_pct: 52.0, soil_type: "Red Sandy Soil", hydraulic_conductivity_mmhr: 30.0,
    baseline_drainage_capacity_m3s: 4.1, susceptibility_score: 0.28, dominant_factor: "Steep Gradient",
    geometry_geojson: JSON.stringify({ type: "Polygon", coordinates: [[[78.705,10.805],[78.735,10.808],[78.738,10.785],[78.708,10.782],[78.705,10.805]]] })
  },
  {
    id: 8, code: "TR-08", name: "Ariyamangalam Industrial", ward_numbers: "Wards 29-34",
    area_ha: 120.0, elevation_m: 72.0, slope_pct: 0.42, flow_accumulation: 48000,
    impervious_pct: 72.0, soil_type: "Clay Loam", hydraulic_conductivity_mmhr: 9.5,
    baseline_drainage_capacity_m3s: 2.2, susceptibility_score: 0.68, dominant_factor: "High Flow Accumulation",
    geometry_geojson: JSON.stringify({ type: "Polygon", coordinates: [[[78.710,10.825],[78.735,10.828],[78.738,10.810],[78.712,10.808],[78.710,10.825]]] })
  },
  {
    id: 9, code: "TR-09", name: "Edamalaipatti Pudur (Koraiyar Basin)", ward_numbers: "Wards 55-60",
    area_ha: 110.0, elevation_m: 70.8, slope_pct: 0.35, flow_accumulation: 62000,
    impervious_pct: 68.0, soil_type: "Black Cotton Clay", hydraulic_conductivity_mmhr: 6.0,
    baseline_drainage_capacity_m3s: 1.9, susceptibility_score: 0.77, dominant_factor: "Very High Flow Accumulation",
    geometry_geojson: JSON.stringify({ type: "Polygon", coordinates: [[[78.665,10.785],[78.682,10.788],[78.680,10.765],[78.662,10.762],[78.665,10.785]]] })
  },
  {
    id: 10, code: "TR-10", name: "Kattur & Thiruverumbur Gateway", ward_numbers: "Wards 61-65",
    area_ha: 160.0, elevation_m: 82.5, slope_pct: 1.10, flow_accumulation: 22000,
    impervious_pct: 48.0, soil_type: "Red Sandy Soil", hydraulic_conductivity_mmhr: 26.0,
    baseline_drainage_capacity_m3s: 3.9, susceptibility_score: 0.33, dominant_factor: "Moderate Imperviousness",
    geometry_geojson: JSON.stringify({ type: "Polygon", coordinates: [[[78.735,10.808],[78.765,10.810],[78.768,10.785],[78.738,10.782],[78.735,10.808]]] })
  },
  {
    id: 11, code: "TR-11", name: "Kudamurutti Outfall Basin", ward_numbers: "Wards 7-11",
    area_ha: 105.0, elevation_m: 68.5, slope_pct: 0.32, flow_accumulation: 67000,
    impervious_pct: 55.0, soil_type: "Alluvial Sandy Loam", hydraulic_conductivity_mmhr: 22.0,
    baseline_drainage_capacity_m3s: 3.4, susceptibility_score: 0.59, dominant_factor: "Very High Flow Accumulation",
    geometry_geojson: JSON.stringify({ type: "Polygon", coordinates: [[[78.655,10.835],[78.675,10.838],[78.678,10.822],[78.658,10.820],[78.655,10.835]]] })
  },
  {
    id: 12, code: "TR-12", name: "Uyyakondan Urban Channel Corridor", ward_numbers: "Cross-Ward Belt",
    area_ha: 125.0, elevation_m: 73.0, slope_pct: 0.40, flow_accumulation: 51000,
    impervious_pct: 76.0, soil_type: "Clay Loam", hydraulic_conductivity_mmhr: 11.0,
    baseline_drainage_capacity_m3s: 2.5, susceptibility_score: 0.71, dominant_factor: "High Imperviousness",
    geometry_geojson: JSON.stringify({ type: "Polygon", coordinates: [[[78.670,10.812],[78.715,10.815],[78.718,10.802],[78.672,10.800],[78.670,10.812]]] })
  }
];

export const MOCK_DRAINAGE_ASSETS: DrainageAsset[] = [
  {
    id: 1, name: "Uyyakondan Historical Main Canal", asset_type: "Major Flood & Irrigation Canal",
    length_m: 8400, width_m: 12, depth_m: 2.5, design_capacity_m3s: 14.5,
    status: "Operational (Encroachment Hotspots)", data_type: "DERIVED/HYPOTHETICAL DEMONSTRATION",
    subcatchment_code: "TR-12",
    geometry_geojson: JSON.stringify({ type: "LineString", coordinates: [[78.655,10.810],[78.675,10.812],[78.695,10.814],[78.725,10.816]] })
  },
  {
    id: 2, name: "Kudamurutti River Channel", asset_type: "Natural River Outlet",
    length_m: 6200, width_m: 20, depth_m: 3.0, design_capacity_m3s: 28.0,
    status: "Operational", data_type: "DERIVED/HYPOTHETICAL DEMONSTRATION",
    subcatchment_code: "TR-11",
    geometry_geojson: JSON.stringify({ type: "LineString", coordinates: [[78.650,10.840],[78.660,10.832],[78.670,10.825]] })
  },
  {
    id: 3, name: "Koraiyar River Flood Channel", asset_type: "Major Diversion Canal",
    length_m: 7100, width_m: 25, depth_m: 3.2, design_capacity_m3s: 35.0,
    status: "High Backwater Risk", data_type: "DERIVED/HYPOTHETICAL DEMONSTRATION",
    subcatchment_code: "TR-09",
    geometry_geojson: JSON.stringify({ type: "LineString", coordinates: [[78.658,10.758],[78.665,10.775],[78.675,10.790]] })
  },
  {
    id: 4, name: "Thillai Nagar Main Storm Drain Trunk", asset_type: "Underground Storm Conduit",
    length_m: 2400, width_m: 3.5, depth_m: 2.0, design_capacity_m3s: 6.8,
    status: "Silt Deposition Observed", data_type: "DERIVED/HYPOTHETICAL DEMONSTRATION",
    subcatchment_code: "TR-02",
    geometry_geojson: JSON.stringify({ type: "LineString", coordinates: [[78.678,10.824],[78.685,10.818],[78.690,10.812]] })
  },
  {
    id: 5, name: "Cantonment - Central Bus Stand Culvert Network", asset_type: "Box Culvert System",
    length_m: 1850, width_m: 2.8, depth_m: 1.8, design_capacity_m3s: 5.2,
    status: "Operational", data_type: "DERIVED/HYPOTHETICAL DEMONSTRATION",
    subcatchment_code: "TR-05",
    geometry_geojson: JSON.stringify({ type: "LineString", coordinates: [[78.682,10.804],[78.692,10.798],[78.696,10.792]] })
  },
  {
    id: 6, name: "Srirangam South Bank Embankment Conduit", asset_type: "Embankment Sluice & Drain",
    length_m: 3100, width_m: 3.0, depth_m: 1.9, design_capacity_m3s: 7.5,
    status: "Operational", data_type: "DERIVED/HYPOTHETICAL DEMONSTRATION",
    subcatchment_code: "TR-01",
    geometry_geojson: JSON.stringify({ type: "LineString", coordinates: [[78.688,10.844],[78.705,10.848],[78.718,10.845]] })
  }
];

export const MOCK_FLOOD_EVIDENCE: FloodEvidence[] = [
  {
    id: 1, name: "Thillai Nagar 11th Cross Inundation", severity: "High",
    location_description: "11th Cross East, Thillai Nagar",
    historical_event: "Nov 2021 Cyclone Nivar / Depression",
    flood_depth_m: 0.85, observation_date: "2021-11-20",
    subcatchment_code: "TR-02", source: "Trichy City Municipal Disaster Log",
    geometry_geojson: JSON.stringify({ type: "Point", coordinates: [78.684, 10.819] })
  },
  {
    id: 2, name: "Edamalaipatti Pudur Low-Lying Breach", severity: "Critical",
    location_description: "Near Koraiyar Regulator embankment",
    historical_event: "Dec 2023 Cyclone Michaung Rain Band",
    flood_depth_m: 1.25, observation_date: "2023-12-04",
    subcatchment_code: "TR-09", source: "Field Survey & Local Press Archives",
    geometry_geojson: JSON.stringify({ type: "Point", coordinates: [78.672, 10.774] })
  },
  {
    id: 3, name: "Central Bus Stand Underpass Waterlogging", severity: "High",
    location_description: "Cantonment Underpass, VOC Road",
    historical_event: "Oct 2022 Northeast Monsoon Convective Storm",
    flood_depth_m: 0.90, observation_date: "2022-10-18",
    subcatchment_code: "TR-05", source: "Traffic Police Incident Reports",
    geometry_geojson: JSON.stringify({ type: "Point", coordinates: [78.689, 10.796] })
  },
  {
    id: 4, name: "Srirangam Temple South Chithra Street", severity: "Moderate",
    location_description: "South Chithra Street, Srirangam",
    historical_event: "Dec 2015 Historic Delta Flood Event",
    flood_depth_m: 0.65, observation_date: "2015-12-02",
    subcatchment_code: "TR-01", source: "Temple Heritage Conservation Reports",
    geometry_geojson: JSON.stringify({ type: "Point", coordinates: [78.702, 10.849] })
  },
  {
    id: 5, name: "Ariyamangalam Rail Cross Waterlogging", severity: "High",
    location_description: "Ariyamangalam Industrial Sector 3",
    historical_event: "Dec 2020 Cyclone Burevi",
    flood_depth_m: 0.75, observation_date: "2020-12-04",
    subcatchment_code: "TR-08", source: "Industrial Area Association Survey",
    geometry_geojson: JSON.stringify({ type: "Point", coordinates: [78.721, 10.817] })
  },
  {
    id: 6, name: "Woraiyur Nachiyar Kovil Street Ponding", severity: "Moderate",
    location_description: "Nachiyar Kovil Mada Veedhi",
    historical_event: "Nov 2021 High Intensity Monsoonal Burst",
    flood_depth_m: 0.55, observation_date: "2021-11-12",
    subcatchment_code: "TR-03", source: "Resident Welfare Association Survey",
    geometry_geojson: JSON.stringify({ type: "Point", coordinates: [78.670, 10.822] })
  }
];

export const MOCK_INTERVENTION_SITES: InterventionSite[] = [
  { id: 1, name: "Anna Stadium Perimeter Green Buffer", subcatchment_code: "TR-05", land_use: "Public Recreational", available_area_m2: 4500, allowed_types: "Rain Garden,Bioswale,Permeable Pavement", priority_level: "High", geometry_geojson: JSON.stringify({ type: "Point", coordinates: [78.687, 10.798] }) },
  { id: 2, name: "Bishop Heber College Open Sports Enclave", subcatchment_code: "TR-02", land_use: "Institutional Open Ground", available_area_m2: 6200, allowed_types: "Retention Storage,Bioswale,Rain Garden", priority_level: "Critical", geometry_geojson: JSON.stringify({ type: "Point", coordinates: [78.682, 10.821] }) },
  { id: 3, name: "Ponmalai Railway Ground Open Basins", subcatchment_code: "TR-07", land_use: "Railway Land / Open Park", available_area_m2: 8500, allowed_types: "Retention Storage,Bioswale", priority_level: "High", geometry_geojson: JSON.stringify({ type: "Point", coordinates: [78.718, 10.795] }) },
  { id: 4, name: "Thillai Nagar Corporation Park Retrofit", subcatchment_code: "TR-02", land_use: "Municipal Park", available_area_m2: 2800, allowed_types: "Rain Garden,Permeable Pavement", priority_level: "High", geometry_geojson: JSON.stringify({ type: "Point", coordinates: [78.686, 10.816] }) },
  { id: 5, name: "K.K. Nagar Children Park & Walking Track", subcatchment_code: "TR-06", land_use: "Municipal Park / Walking Track", available_area_m2: 3800, allowed_types: "Bioswale,Permeable Pavement,Rain Garden", priority_level: "Medium", geometry_geojson: JSON.stringify({ type: "Point", coordinates: [78.698, 10.781] }) },
  { id: 6, name: "Srirangam Boys Higher Secondary Ground", subcatchment_code: "TR-01", land_use: "School Open Grounds", available_area_m2: 5100, allowed_types: "Rain Garden,Retention Storage", priority_level: "High", geometry_geojson: JSON.stringify({ type: "Point", coordinates: [78.697, 10.846] }) },
  { id: 7, name: "District Collectorate Parking Plaza", subcatchment_code: "TR-05", land_use: "Administrative Civic Plaza", available_area_m2: 3200, allowed_types: "Permeable Pavement,Bioswale", priority_level: "Medium", geometry_geojson: JSON.stringify({ type: "Point", coordinates: [78.684, 10.801] }) },
  { id: 8, name: "Ariyamangalam Canal Riparian Buffer", subcatchment_code: "TR-08", land_use: "Canal Easement / Open Buffer", available_area_m2: 7200, allowed_types: "Bioswale,Retention Storage", priority_level: "High", geometry_geojson: JSON.stringify({ type: "Point", coordinates: [78.724, 10.815] }) },
  { id: 9, name: "Edamalaipatti Pudur Community Playground", subcatchment_code: "TR-09", land_use: "Neighborhood Open Space", available_area_m2: 5800, allowed_types: "Retention Storage,Bioswale,Rain Garden", priority_level: "Critical", geometry_geojson: JSON.stringify({ type: "Point", coordinates: [78.670, 10.778] }) },
  { id: 10, name: "Woraiyur Kamala Niketan Surrounds", subcatchment_code: "TR-03", land_use: "Urban Commons", available_area_m2: 2400, allowed_types: "Rain Garden,Permeable Pavement", priority_level: "Medium", geometry_geojson: JSON.stringify({ type: "Point", coordinates: [78.669, 10.825] }) },
  { id: 11, name: "Kudamurutti Riverbank Retention Node", subcatchment_code: "TR-11", land_use: "Riparian Floodplain", available_area_m2: 9500, allowed_types: "Retention Storage,Bioswale", priority_level: "High", geometry_geojson: JSON.stringify({ type: "Point", coordinates: [78.663, 10.828] }) },
  { id: 12, name: "Uyyakondan Promenade Green Strip", subcatchment_code: "TR-12", land_use: "Linear Canal Greenway", available_area_m2: 4200, allowed_types: "Bioswale,Rain Garden", priority_level: "Critical", geometry_geojson: JSON.stringify({ type: "Point", coordinates: [78.692, 10.809] }) }
];

export const MOCK_RAINFALL_SCENARIOS: RainfallScenario[] = [
  {
    id: 1, name: "2-Year 1-Hour Convective Cloudburst", storm_type: "Synthetic Design Storm (SCS Type II)",
    duration_hrs: 1, return_period_yrs: 2, total_rainfall_mm: 44, peak_intensity_mmhr: 78,
    provenance_type: "DESIGN STORM (IMD Trichy IDF curve)",
    description: "Frequent convective thunderstorm typical of pre-monsoon summer and early northeast monsoon.",
    hyetograph: [
      { time_min: 10, intensity_mmhr: 14 }, { time_min: 20, intensity_mmhr: 32 },
      { time_min: 30, intensity_mmhr: 78 }, { time_min: 40, intensity_mmhr: 48 },
      { time_min: 50, intensity_mmhr: 22 }, { time_min: 60, intensity_mmhr: 10 }
    ]
  },
  {
    id: 2, name: "5-Year 2-Hour Monsoonal Burst", storm_type: "Synthetic Design Storm (SCS Type II)",
    duration_hrs: 2, return_period_yrs: 5, total_rainfall_mm: 72, peak_intensity_mmhr: 92,
    provenance_type: "DESIGN STORM (IMD & NASA GPM IMERG Calibrated)",
    description: "Standard municipal drainage design benchmark for tier-II Indian urban local bodies.",
    hyetograph: [
      { time_min: 15, intensity_mmhr: 12 }, { time_min: 30, intensity_mmhr: 28 },
      { time_min: 45, intensity_mmhr: 64 }, { time_min: 60, intensity_mmhr: 92 },
      { time_min: 75, intensity_mmhr: 46 }, { time_min: 90, intensity_mmhr: 26 },
      { time_min: 105, intensity_mmhr: 14 }, { time_min: 120, intensity_mmhr: 6 }
    ]
  },
  {
    id: 3, name: "10-Year 2-Hour Severe Urban Storm (Benchmark)", storm_type: "Synthetic Design Storm (Chicago Storm Profile)",
    duration_hrs: 2, return_period_yrs: 10, total_rainfall_mm: 96, peak_intensity_mmhr: 118,
    provenance_type: "HYPOTHETICAL STRESS BENCHMARK (Trichy Climate Resilient City Action Plan)",
    description: "High-impact design storm testing capacity limits of primary canals and trunk storm drains.",
    hyetograph: [
      { time_min: 15, intensity_mmhr: 18 }, { time_min: 30, intensity_mmhr: 42 },
      { time_min: 45, intensity_mmhr: 88 }, { time_min: 60, intensity_mmhr: 118 },
      { time_min: 75, intensity_mmhr: 62 }, { time_min: 90, intensity_mmhr: 35 },
      { time_min: 105, intensity_mmhr: 16 }, { time_min: 120, intensity_mmhr: 5 }
    ]
  },
  {
    id: 4, name: "25-Year 3-Hour Cyclonic Downpour", storm_type: "Bay of Bengal Depressions Profile",
    duration_hrs: 3, return_period_yrs: 25, total_rainfall_mm: 138, peak_intensity_mmhr: 132,
    provenance_type: "CYCLONIC ANALOGUE (Derived from Nov 2021 & Dec 2023 regional records)",
    description: "Severe cyclonic event exceeding standard drainage capacity across low-lying deltaic basins.",
    hyetograph: [
      { time_min: 20, intensity_mmhr: 22 }, { time_min: 40, intensity_mmhr: 55 },
      { time_min: 60, intensity_mmhr: 98 }, { time_min: 80, intensity_mmhr: 132 },
      { time_min: 100, intensity_mmhr: 84 }, { time_min: 120, intensity_mmhr: 48 },
      { time_min: 140, intensity_mmhr: 28 }, { time_min: 160, intensity_mmhr: 16 },
      { time_min: 180, intensity_mmhr: 9 }
    ]
  }
];

export const MOCK_SIMULATION_RESULT: SimulationResult = {
  id: 1,
  title: "10-Year 2-Hour Severe Urban Storm — 75% Drainage Capacity (Demo)",
  engine_name: "SCS-CN & 1D Saint-Venant Surrogate",
  engine_verification_badge: "SURROGATE MODEL — NOT EPA SWMM",
  rainfall_scenario_name: "10-Year 2-Hour Severe Urban Storm (Benchmark)",
  drainage_capacity_pct: 75,
  total_rainfall_volume_m3: 1612800,
  peak_inflow_m3s: 24.8,
  peak_runoff_m3s: 19.4,
  baseline_peak_runoff_m3s: 22.1,
  peak_reduction_pct: 12.2,
  total_runoff_volume_m3: 980400,
  volume_retention_m3: 118800,
  volume_reduction_pct: 10.8,
  flooded_nodes_count: 4,
  max_surcharge_depth_m: 0.38,
  execution_time_ms: 420,
  is_swmm_native: false,
  methodology_caveat: "Results generated by SCS-CN rainfall-runoff with 1D simplified Saint-Venant approximation. These are illustrative estimates for decision support, not calibrated hydraulic model outputs.",
  hydrograph: [
    { time_min: 0, rainfall_depth_mm: 0, runoff_rate_m3s: 0, outfall_discharge_m3s: 0, waterlog_storage_m3: 0 },
    { time_min: 15, rainfall_depth_mm: 2.8, runoff_rate_m3s: 0.8, outfall_discharge_m3s: 0.6, waterlog_storage_m3: 120 },
    { time_min: 30, rainfall_depth_mm: 6.3, runoff_rate_m3s: 4.2, outfall_discharge_m3s: 3.1, waterlog_storage_m3: 480 },
    { time_min: 45, rainfall_depth_mm: 13.2, runoff_rate_m3s: 10.8, outfall_discharge_m3s: 8.4, waterlog_storage_m3: 1200 },
    { time_min: 60, rainfall_depth_mm: 17.7, runoff_rate_m3s: 19.4, outfall_discharge_m3s: 15.2, waterlog_storage_m3: 2800 },
    { time_min: 75, rainfall_depth_mm: 9.3, runoff_rate_m3s: 16.1, outfall_discharge_m3s: 14.8, waterlog_storage_m3: 3200 },
    { time_min: 90, rainfall_depth_mm: 5.3, runoff_rate_m3s: 11.4, outfall_discharge_m3s: 12.0, waterlog_storage_m3: 2600 },
    { time_min: 105, rainfall_depth_mm: 2.4, runoff_rate_m3s: 6.8, outfall_discharge_m3s: 8.2, waterlog_storage_m3: 1800 },
    { time_min: 120, rainfall_depth_mm: 0.75, runoff_rate_m3s: 3.2, outfall_discharge_m3s: 4.5, waterlog_storage_m3: 980 },
    { time_min: 150, rainfall_depth_mm: 0, runoff_rate_m3s: 1.1, outfall_discharge_m3s: 2.1, waterlog_storage_m3: 400 },
    { time_min: 180, rainfall_depth_mm: 0, runoff_rate_m3s: 0.3, outfall_discharge_m3s: 0.8, waterlog_storage_m3: 120 }
  ],
  subcatchment_summaries: [
    { code: "TR-02", name: "Thillai Nagar Central", area_ha: 95, peak_runoff_m3s: 4.1, total_volume_m3: 98400, gi_retained_m3: 11200, surcharge_depth_m: 0.38, is_flooded: true },
    { code: "TR-09", name: "Edamalaipatti Pudur (Koraiyar Basin)", area_ha: 110, peak_runoff_m3s: 3.8, total_volume_m3: 92400, gi_retained_m3: 10400, surcharge_depth_m: 0.31, is_flooded: true },
    { code: "TR-05", name: "Cantonment & Central Transit Hub", area_ha: 112, peak_runoff_m3s: 3.6, total_volume_m3: 88200, gi_retained_m3: 9800, surcharge_depth_m: 0.24, is_flooded: false },
    { code: "TR-12", name: "Uyyakondan Urban Channel Corridor", area_ha: 125, peak_runoff_m3s: 3.4, total_volume_m3: 82800, gi_retained_m3: 9200, surcharge_depth_m: 0.18, is_flooded: false },
    { code: "TR-01", name: "Srirangam Island", area_ha: 145, peak_runoff_m3s: 3.1, total_volume_m3: 75600, gi_retained_m3: 8400, surcharge_depth_m: 0.0, is_flooded: false },
    { code: "TR-08", name: "Ariyamangalam Industrial", area_ha: 120, peak_runoff_m3s: 2.8, total_volume_m3: 69600, gi_retained_m3: 7800, surcharge_depth_m: 0.12, is_flooded: true }
  ]
};

export const MOCK_OPTIMIZATION_RESULT: OptimizationResult = {
  budget_limit_lakhs: 200,
  scenario_name: "10-Year 2-Hour Severe Urban Storm (Benchmark)",
  drainage_stress_pct: 75,
  baseline_cost_lakhs: 0,
  baseline_peak_runoff_m3s: 22.1,
  baseline_volume_m3: 1099200,
  execution_time_s: 2.4,
  algorithm_metadata: {
    algorithm: "NSGA-II (NumPy vectorized)",
    crossover: "Uniform crossover (p=0.9)",
    mutation: "Bit-flip mutation (p=1/n)",
    population_size: 60,
    generations: 40,
    objectives: ["Minimise total cost (₹ lakhs)", "Minimise residual peak runoff (m³/s)", "Minimise residual runoff volume (m³)"]
  },
  pareto_frontier: [
    { solution_id: 1, solution_type: "Pareto", total_cost_lakhs: 48, residual_peak_runoff_m3s: 19.8, residual_volume_m3: 1012400, peak_reduction_pct: 10.4, volume_reduction_pct: 7.9, interventions_count: 2, allocations: [] },
    { solution_id: 2, solution_type: "Pareto", total_cost_lakhs: 72, residual_peak_runoff_m3s: 18.4, residual_volume_m3: 968200, peak_reduction_pct: 16.7, volume_reduction_pct: 11.9, interventions_count: 3, allocations: [] },
    { solution_id: 3, solution_type: "Pareto", total_cost_lakhs: 96, residual_peak_runoff_m3s: 17.2, residual_volume_m3: 924800, peak_reduction_pct: 22.2, volume_reduction_pct: 15.9, interventions_count: 4, allocations: [] },
    { solution_id: 4, solution_type: "Pareto", total_cost_lakhs: 118, residual_peak_runoff_m3s: 16.1, residual_volume_m3: 886400, peak_reduction_pct: 27.1, volume_reduction_pct: 19.4, interventions_count: 5, allocations: [] },
    { solution_id: 5, solution_type: "Pareto", total_cost_lakhs: 142, residual_peak_runoff_m3s: 14.8, residual_volume_m3: 842000, peak_reduction_pct: 33.0, volume_reduction_pct: 23.4, interventions_count: 6, allocations: [] },
    { solution_id: 6, solution_type: "Pareto", total_cost_lakhs: 165, residual_peak_runoff_m3s: 13.6, residual_volume_m3: 802400, peak_reduction_pct: 38.5, volume_reduction_pct: 27.0, interventions_count: 7, allocations: [] },
    { solution_id: 7, solution_type: "Pareto", total_cost_lakhs: 189, residual_peak_runoff_m3s: 12.4, residual_volume_m3: 764800, peak_reduction_pct: 43.9, volume_reduction_pct: 30.4, interventions_count: 8, allocations: [] }
  ],
  low_cost_solution: {
    solution_id: 1, solution_type: "Low-Cost", total_cost_lakhs: 48, residual_peak_runoff_m3s: 19.8, residual_volume_m3: 1012400,
    peak_reduction_pct: 10.4, volume_reduction_pct: 7.9, interventions_count: 2,
    allocations: [
      { site_id: 2, site_name: "Bishop Heber College Open Sports Enclave", subcatchment_code: "TR-02", intervention_type: "Rain Garden", allocated_area_m2: 1600, estimated_cost_inr_lakhs: 24.0 },
      { site_id: 9, site_name: "Edamalaipatti Pudur Community Playground", subcatchment_code: "TR-09", intervention_type: "Retention Storage", allocated_area_m2: 1600, estimated_cost_inr_lakhs: 24.0 }
    ]
  },
  balanced_solution: {
    solution_id: 4, solution_type: "Balanced", total_cost_lakhs: 118, residual_peak_runoff_m3s: 16.1, residual_volume_m3: 886400,
    peak_reduction_pct: 27.1, volume_reduction_pct: 19.4, interventions_count: 5,
    allocations: [
      { site_id: 2, site_name: "Bishop Heber College Open Sports Enclave", subcatchment_code: "TR-02", intervention_type: "Rain Garden", allocated_area_m2: 2200, estimated_cost_inr_lakhs: 33.0 },
      { site_id: 9, site_name: "Edamalaipatti Pudur Community Playground", subcatchment_code: "TR-09", intervention_type: "Retention Storage", allocated_area_m2: 2500, estimated_cost_inr_lakhs: 37.5 },
      { site_id: 1, site_name: "Anna Stadium Perimeter Green Buffer", subcatchment_code: "TR-05", intervention_type: "Bioswale", allocated_area_m2: 1800, estimated_cost_inr_lakhs: 18.0 },
      { site_id: 12, site_name: "Uyyakondan Promenade Green Strip", subcatchment_code: "TR-12", intervention_type: "Bioswale", allocated_area_m2: 1500, estimated_cost_inr_lakhs: 15.0 },
      { site_id: 11, site_name: "Kudamurutti Riverbank Retention Node", subcatchment_code: "TR-11", intervention_type: "Retention Storage", allocated_area_m2: 1000, estimated_cost_inr_lakhs: 15.0 }
    ]
  },
  high_perf_solution: {
    solution_id: 7, solution_type: "High-Performance", total_cost_lakhs: 189, residual_peak_runoff_m3s: 12.4, residual_volume_m3: 764800,
    peak_reduction_pct: 43.9, volume_reduction_pct: 30.4, interventions_count: 8,
    allocations: [
      { site_id: 2, site_name: "Bishop Heber College Open Sports Enclave", subcatchment_code: "TR-02", intervention_type: "Retention Storage", allocated_area_m2: 3000, estimated_cost_inr_lakhs: 45.0 },
      { site_id: 9, site_name: "Edamalaipatti Pudur Community Playground", subcatchment_code: "TR-09", intervention_type: "Retention Storage", allocated_area_m2: 3500, estimated_cost_inr_lakhs: 52.5 },
      { site_id: 1, site_name: "Anna Stadium Perimeter Green Buffer", subcatchment_code: "TR-05", intervention_type: "Permeable Pavement", allocated_area_m2: 2500, estimated_cost_inr_lakhs: 25.0 },
      { site_id: 12, site_name: "Uyyakondan Promenade Green Strip", subcatchment_code: "TR-12", intervention_type: "Bioswale", allocated_area_m2: 2200, estimated_cost_inr_lakhs: 22.0 },
      { site_id: 8, site_name: "Ariyamangalam Canal Riparian Buffer", subcatchment_code: "TR-08", intervention_type: "Bioswale", allocated_area_m2: 2800, estimated_cost_inr_lakhs: 14.0 },
      { site_id: 6, site_name: "Srirangam Boys Higher Secondary Ground", subcatchment_code: "TR-01", intervention_type: "Rain Garden", allocated_area_m2: 1800, estimated_cost_inr_lakhs: 13.5 },
      { site_id: 11, site_name: "Kudamurutti Riverbank Retention Node", subcatchment_code: "TR-11", intervention_type: "Retention Storage", allocated_area_m2: 1200, estimated_cost_inr_lakhs: 10.0 },
      { site_id: 5, site_name: "K.K. Nagar Children Park & Walking Track", subcatchment_code: "TR-06", intervention_type: "Permeable Pavement", allocated_area_m2: 700, estimated_cost_inr_lakhs: 7.0 }
    ]
  }
};

export const MOCK_DATA_PROVENANCE: DataProvenanceItem[] = [
  { id: 1, dataset_name: "Copernicus GLO-30 Digital Elevation Model", category: "Topography / DEM", source_name: "European Space Agency Copernicus Data Space", source_url: "https://dataspace.copernicus.eu/", resolution: "30m raster (1 arc-second)", crs: "EPSG:4326 / UTM Zone 44N", source_date: "2021 release", processing_method: "D8 flow direction; sink filling; slope & flow accumulation computed.", known_limitations: "Vegetation/building canopy may cause minor radar speckle at street level.", data_classification: "Public Satellite Data" },
  { id: 2, dataset_name: "NASA GPM IMERG Final Precipitation V07", category: "Precipitation & Meteorology", source_name: "NASA Global Precipitation Measurement Mission", source_url: "https://gpm.nasa.gov/data/imerg", resolution: "0.1° × 0.1° (~10 km) half-hourly", crs: "EPSG:4326", source_date: "2015–2024 archive", processing_method: "Bias-corrected against IMD Trichy Airport gauge; fitted to SCS Type-II distribution.", known_limitations: "10 km resolution is too coarse for sub-neighbourhood cloudburst precision.", data_classification: "Public Satellite / Reanalysis" },
  { id: 3, dataset_name: "SoilGrids Global Soil Texture & Physical Properties", category: "Edaphic & Soil Hydrology", source_name: "ISRIC – World Soil Information", source_url: "https://soilgrids.org/", resolution: "250 m (0–30 cm layer)", crs: "EPSG:4326", source_date: "2020 v2.0", processing_method: "Mapped to USDA Hydrologic Soil Groups A–D for SCS CN assignment.", known_limitations: "Urban soil compaction and fill layers modify natural pedotransfer functions.", data_classification: "Public Scientific Database" },
  { id: 4, dataset_name: "OpenStreetMap Infrastructure & Hydrography", category: "Built Environment & Drainage Trunks", source_name: "OpenStreetMap Contributors / Geofabrik India", source_url: "https://download.geofabrik.de/asia/india.html", resolution: "Vector (meter accuracy)", crs: "EPSG:4326", source_date: "Extracted 2024", processing_method: "Filtered for waterway=canal, waterway=drain, highway=primary/secondary.", known_limitations: "Underground stormwater conduits and culvert dimensions are partially unmapped.", data_classification: "Open Collaborative Spatial Data" },
  { id: 5, dataset_name: "Trichy Climate Resilient City Action Plan", category: "Municipal Master Planning", source_name: "Tiruchirappalli City Corporation & TNUIFSL", source_url: "https://trichycorporation.gov.in/wh-assets/tccdetails/CAP.pdf", resolution: "City-wide ward-level synthesis", crs: "Local municipal grid / WGS 84", source_date: "2022", processing_method: "Flood hotspots and vulnerable wards cross-referenced against simulation subcatchments.", known_limitations: "Administrative ward summaries rather than hydrologically delineated boundaries.", data_classification: "Official Municipal Policy Document" },
  { id: 6, dataset_name: "Simulated Demonstration Drainage Network", category: "Hydraulic Infrastructure Model", source_name: "FloodScape AI Synthetic Modeling Suite", resolution: "Subcatchment trunk conveyance nodes", crs: "EPSG:4326", source_date: "Simulated November 2024", processing_method: "Conceptual hydraulic conduits parameterized from channel cross-sections along Uyyakondan and Koraiyar paths.", known_limitations: "SIMULATED / DEMONSTRATION ONLY. Does not represent surveyed municipal pipe levels.", data_classification: "DEMONSTRATION SYNTHETIC DATA" }
];
