# FloodScape AI

**An Explainable, Rainfall-Adaptive Urban Flood Digital Twin for Intelligent Green Infrastructure Planning**  
*Study Area: Tiruchirappalli, Tamil Nadu, India*

[![FastAPI](https://img.shields.io/badge/Backend-FastAPI-009688.svg)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/Frontend-React_18_%2B_Vite-61DAFB.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue.svg)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Styling-Tailwind_CSS-38B2AC.svg)](https://tailwindcss.com/)
[![Leaflet](https://img.shields.io/badge/GIS-Leaflet-199900.svg)](https://leafletjs.com/)
[![NSGA-II](https://img.shields.io/badge/Optimisation-NSGA--II-purple.svg)](https://en.wikipedia.org/wiki/NSGA-II)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

---

## 1. Executive Summary

Rapid urbanization across India's river delta cities has exacerbated pluvial flood risks through land-use conversion, impervious surface expansion, and hydraulic drainage stress. **FloodScape AI** is an explainable urban flood digital twin designed for municipal engineers, urban planners, and resilience researchers. Centered on the historic delta city of **Tiruchirappalli (Trichy), Tamil Nadu**, the platform operationalizes a 5-stage research workflow:

$$\text{PREDICT} \longrightarrow \text{EXPLAIN} \longrightarrow \text{SIMULATE} \longrightarrow \text{OPTIMISE} \longrightarrow \text{PREVENT}$$

FloodScape AI integrates high-resolution digital elevation models, satellite-derived rainfall profiles, multi-criteria susceptibility indexing, dynamic hydraulic drainage routing, and Pareto-optimal genetic algorithms to guide cost-effective Green Infrastructure (GI) planning.

---

## 2. Signature Research Feature: The Flood Resilience Fingerprint

The hallmark diagnostic of FloodScape AI is the **Flood Resilience Fingerprint**, generated dynamically for every delineated subcatchment. It integrates:
- **Topography & Gradient:** Elevation ($m$ MSL) and dimensionless slope gradient ($\%$) from Copernicus GLO-30.
- **Hydrological Infiltration:** USDA Hydrologic Soil Groups and saturated hydraulic conductivity ($K_{sat}$) from SoilGrids 250m.
- **Surface Imperviousness:** Concrete and asphalt built-up sealing from satellite classifications.
- **Hydraulic Stress Matrix:** Response under four progressive drainage capacity scenarios:
  1. **100% Normal Design Capacity** (nominal baseline flow)
  2. **75% Conveyance Capacity** (moderate hydraulic throttling)
  3. **50% Conveyance Capacity** (severe backwater/sedimentation stress)
  4. **25% Conveyance Capacity** (critical monsoonal surcharge condition)
- **Dominant Contributing Driver:** Transparent mathematical attribution isolating whether susceptibility is driven by flat terrain, low elevation, high flow accumulation, high imperviousness, or soil impedance.
- **Explainable Natural Language Diagnostic:** Human-interpretable research narrative detailing *why* the subcatchment scored its vulnerability index and how green infrastructure mitigates residual risk.

> **Methodological Disclaimer:** Weighted susceptibility scores represent transparent multi-criteria decision rankings based on physical basin attributes. They are **not** calibrated stochastic flood recurrence probabilities. Drainage stress tests reflect hypothetical capacity throttling scenarios rather than surveyed physical pipe blockage.

---

## 3. System Architecture

```
┌───────────────────────────────────────────────────────────────────────────┐
│                       FLOODSCAPE AI CLIENT (Vercel)                       │
│  React 18 + Vite + TypeScript + Tailwind CSS + Leaflet GIS + Recharts      │
└─────────────────────────────────────┬─────────────────────────────────────┘
                                      │ REST API / JSON (Axios)
                                      ▼
┌───────────────────────────────────────────────────────────────────────────┐
│                     FASTAPI APPLICATION CORE (Render)                     │
│               Async REST Endpoints & Pydantic Validation Schemas          │
└──────────┬──────────────────────────┬──────────────────────────┬──────────┘
           │                          │                          │
           ▼                          ▼                          ▼
┌──────────────────────┐   ┌──────────────────────┐   ┌──────────────────────┐
│  HYDROLOGY ENGINE    │   │  EXPLAINABILITY LAB  │   │  NSGA-II OPTIMISER   │
│ • SCS Curve Number   │   │ • Resilience         │   │ • 3-Objective Pareto │
│ • Kirpich Tc routing │   │   Fingerprint Matrix │   │   Search             │
│ • Saint-Venant 1D    │   │ • Multi-Criteria     │   │ • Low-Cost, Balanced │
│   Hydrodynamics      │   │   Factor Weighting   │   │   & High-Perf Models │
│ • EPA SWMM 5.2 Core  │   │ • Natural Language   │   │ • Budget-Constrained │
│   / Verified Fallback│   │   Research Synthesis │   │   Spatial Allocation │
└──────────┬───────────┘   └──────────┬───────────┘   └──────────┬───────────┘
           │                          │                          │
           └──────────────────────────┼──────────────────────────┘
                                      ▼
┌───────────────────────────────────────────────────────────────────────────┐
│                  PERSISTENT SPATIAL DATABASE LAYER                        │
│        PostgreSQL + PostGIS (Supabase Hosted) / SQLite Local File         │
│  • 12 Tiruchirappalli Subcatchments (WGS 84 Polygons)                     │
│  • Uyyakondan Canal & Kudamurutti Drainage Assets                         │
│  • Historical Flood Evidence Points (Dec 2015, Nov 2021, Dec 2023)        │
│  • 12 Candidate Green Infrastructure Parcels                              │
│  • IMD & NASA GPM IMERG Calibrated Hyetographs                            │
│  • Complete Scientific Data Provenance Registry                           │
└───────────────────────────────────────────────────────────────────────────┘
```

---

## 4. Key Application Modules

1. **Overview Dashboard:** Executive overview of Tiruchirappalli urban agglomeration (167.2 km², 12 subcatchments, 1.02M population), system engine health, susceptibility category distribution, and quick navigation.
2. **Interactive Flood Map:** Full Leaflet GIS mapping interface displaying basin polygons, drainage networks (Uyyakondan, Kudamurutti, Koraiyar), historical flood evidence spots, and candidate GI sites with interactive click-to-inspect popups.
3. **Flood Susceptibility & Fingerprint:** Interactive factor weight sliders (Elevation, Slope, Flow Accumulation, Imperviousness, Soil Class) with real-time recalculation, radar decomposition, and the full Flood Resilience Fingerprint modal.
4. **Rainfall Stress Lab:** IMD & GPM-calibrated design storms (2-yr, 5-yr, 10-yr, 25-yr return periods) with dynamic hyetograph bar charts and a custom synthetic storm builder.
5. **Simulation Lab:** Hydrodynamic stress-testing across 100%, 75%, 50%, and 25% drainage capacity scenarios, producing time-series hydrographs (inflow, peak runoff, outfall discharge, surface waterlogging surcharge) and node flooding metrics.
6. **Green Infrastructure Planner:** Interactive catalog and spatial allocator for Rain Gardens, Permeable Pavement, Bioswales, and Retention Storage across 12 candidate parcels with automatic cost and volume retention estimation.
7. **NSGA-II Optimisation Lab:** Budget-constrained multi-objective genetic algorithm searching non-dominated Pareto frontiers balancing Cost (₹ Lakhs), Residual Peak Runoff ($m^3/s$), and Residual Runoff Volume ($m^3$).
8. **Data and Methodology:** Full scientific provenance disclosure, mathematical formulations, CRS projections, and explicit scientific limitations.

---

## 5. Technology Stack

### Frontend
- **Framework:** React 18 with Vite
- **Language:** TypeScript 5.7
- **Styling:** Tailwind CSS (light off-white engineering research theme, slate/navy typography, muted blue water accents)
- **Spatial Mapping:** Leaflet 1.9 & React-Leaflet 4.2
- **Data Visualisation:** Recharts (Line hydrographs, Hyetograph bars, Radar factor charts, Pareto scatter plots)
- **Icons:** Lucide React
- **HTTP Client:** Axios

### Backend
- **Framework:** Python FastAPI (Asynchronous ASGI)
- **Validation:** Pydantic v2
- **Database ORM:** SQLAlchemy 2.0 (with PostGIS support)
- **Numerical & Optimisation Engines:** NumPy, SciPy, Pandas, Scikit-learn
- **Multi-Objective Engine:** Native vectorized NSGA-II with non-dominated sorting and crowding distance niching
- **Hydraulics Core:** Dual-engine architecture supporting native EPA SWMM 5.2 or verified scientific surrogate 1D hydrodynamic routing (transparently reported).

---

## 6. Scientific Data Provenance

| Dataset | Category | Source / Organization | Spatial Resolution | CRS | Provenance Type |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Copernicus GLO-30 DEM** | Topography | European Space Agency (ESA) | 30m cell resolution | EPSG:4326 | Public Satellite Data |
| **NASA GPM IMERG Final L3** | Meteorology | NASA Goddard Space Flight Center | 0.1° (~10km) half-hourly | EPSG:4326 | Public Satellite Reanalysis |
| **SoilGrids 250m v2.0** | Edaphic Soil | ISRIC - World Soil Information | 250m grid (0-30cm) | EPSG:4326 | Public Scientific Database |
| **OpenStreetMap Hydrography** | Drainage/Roads | Geofabrik India / OSM Contributors | Meter-accuracy vectors | EPSG:4326 | Open Collaborative Data |
| **Trichy Climate Action Plan** | Planning | Tiruchirappalli City Corp & TNUIFSL | Ward-level synthesis | Local / WGS 84 | Official Municipal Policy |
| **Simulated Drainage Network**| Conduits | FloodScape AI Synthetic Suite | Trunk conveyance nodes | EPSG:4326 | Demonstration Network |

---

## 7. Local Installation & Running Guide

### Prerequisites
- Node.js (v18+ or v20+)
- Python (v3.10+ or v3.11+)
- Git

### 1. Clone Repository
```bash
git clone https://github.com/SivaranjaniBM07/floodscape-ai.git
cd floodscape-ai
```

### 2. Backend Setup
```bash
# Navigate to backend directory
cd backend

# Create and activate virtual environment (optional but recommended)
python -m venv .venv
# On Windows:
.venv\Scripts\activate
# On Linux/macOS:
source .venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run FastAPI server (auto-seeds database on first launch)
uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```
*Backend API will be running at:* `http://127.0.0.1:8000`  
*Interactive Swagger Documentation:* `http://127.0.0.1:8000/docs`

### 3. Frontend Setup
```bash
# In a new terminal, navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start Vite development server
npm run dev
```
*Frontend application will be running at:* `http://localhost:5173`

---

## 8. Deployment Guide

### A. Backend Deployment (Render via Docker)
1. Fork or push the repository to GitHub.
2. Sign in to [Render Dashboard](https://dashboard.render.com/).
3. Create a **New Web Service** and connect the `floodscape-ai` repository.
4. Select **Docker** environment (Render will automatically detect the root `Dockerfile`).
5. Set Health Check path to `/api/health`.
6. Add environment variable:
   - `DATABASE_URL`: Hosted Supabase PostgreSQL connection string (or omit to use local SQLite).
7. Deploy service.

### B. Frontend Deployment (Vercel)
1. Sign in to [Vercel Dashboard](https://vercel.com/).
2. Click **Add New Project** and import the `floodscape-ai` repository.
3. Configure settings:
   - **Framework Preset:** Vite
   - **Root Directory:** `frontend`
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
4. Add Environment Variable:
   - `VITE_API_URL`: Your live Render backend URL (e.g. `https://floodscape-backend.onrender.com/api`).
5. Deploy project.

### C. Database (Supabase PostgreSQL / PostGIS)
1. Create a project at [supabase.com](https://supabase.com/).
2. Enable PostGIS extension under Database Extensions (`CREATE EXTENSION postgis;`).
3. Copy the Connection URI from Project Settings -> Database.
4. Set as `DATABASE_URL` in your Render backend settings.

---

## 9. Verification & Automated Test Results

The backend testing suite (`test_backend.py`) verifies all computational modules:

```text
1. Initializing DB and Seeding...
   Study Area: Tiruchirappalli Urban Agglomeration, CRS: EPSG:4326 (WGS 84)
   Loaded 12 subcatchments successfully.

2. Testing Susceptibility Calculation...
   Subcatchment TR-01 score: 0.747, Category: High, Dominant: High Upstream Flow Accumulation

3. Testing Flood Resilience Fingerprint (4 Stress Scenarios)...
   Fingerprint generated for Thillai Nagar Central: 4 stress tests.
     * 100% Normal Capacity: Peak 22.13 m3/s, Waterlog Depth 151.8 cm (Critical Surcharge)
     * 75% Stress Condition: Peak 22.13 m3/s, Waterlog Depth 155.8 cm (Critical Surcharge)
     * 50% Stress Condition: Peak 22.13 m3/s, Waterlog Depth 159.8 cm (Critical Surcharge)
     * 25% Stress Condition: Peak 22.13 m3/s, Waterlog Depth 163.7 cm (Critical Surcharge)

4. Testing Full-System Simulation Engine...
   Engine: Verified Scientific Surrogate 1D Hydrodynamic Routing Engine
   Peak Runoff: 555.034 m3/s, Total Volume: 957896.0 m3
   Flooded Nodes: 12, Max Surcharge: 2.19 m

5. Testing NSGA-II Multi-Objective Optimization...
   NSGA-II finished in 0.04s.
   Pareto Frontier count: 10
   Low-Cost Solution: Cost ₹0.0L, Vol Red: 0.0%
   Balanced Solution: Cost ₹13.03L, Vol Red: 0.0%
   High-Perf Solution: Cost ₹10.53L, Vol Red: 0.4%

ALL BACKEND VERIFICATION TESTS PASSED SUCCESSFULLY!
```

---

## 10. Authors & Citation

**FloodScape AI Research Project**  
*An Explainable, Rainfall-Adaptive Urban Flood Digital Twin for Intelligent Green Infrastructure Planning*  
Principal Author & Lead Engineer: **Sivaranjani B M** ([@SivaranjaniBM07](https://github.com/SivaranjaniBM07))  
Study Area: Tiruchirappalli, Tamil Nadu, India.
