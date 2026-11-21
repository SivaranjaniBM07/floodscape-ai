import React, { useState } from 'react';
import { MapContainer, TileLayer, Polygon, Polyline, CircleMarker, Popup, Tooltip } from 'react-leaflet';
import {
  Subcatchment, DrainageAsset, FloodEvidence, InterventionSite
} from '../types';
import { Layers, Eye, Shield, Droplets, AlertOctagon, MapPin, Info } from 'lucide-react';

interface InteractiveMapPageProps {
  subcatchments: Subcatchment[];
  drainageAssets: DrainageAsset[];
  floodEvidence: FloodEvidence[];
  interventionSites: InterventionSite[];
  onOpenFingerprint: (code: string) => void;
}

export const InteractiveMapPage: React.FC<InteractiveMapPageProps> = ({
  subcatchments,
  drainageAssets,
  floodEvidence,
  interventionSites,
  onOpenFingerprint
}) => {
  // Layer visibility toggles
  const [showSubcatchments, setShowSubcatchments] = useState(true);
  const [showDrainage, setShowDrainage] = useState(true);
  const [showFloodEvidence, setShowFloodEvidence] = useState(true);
  const [showInterventions, setShowInterventions] = useState(true);

  // Selected feature for sidebar inspection
  const [selectedFeature, setSelectedFeature] = useState<{
    type: 'subcatchment' | 'drainage' | 'evidence' | 'intervention';
    data: any;
  } | null>(null);

  const trichyCenter: [number, number] = [10.805, 78.695];

  const getSubcatchmentColor = (score: number) => {
    if (score >= 0.65) return '#dc2626'; // High Susceptibility (Red)
    if (score >= 0.40) return '#d97706'; // Moderate Susceptibility (Amber)
    return '#10b981'; // Low Susceptibility (Teal/Green)
  };

  return (
    <div className="space-y-4">
      {/* Top Controls & Statistics Bar */}
      <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 tracking-tight flex items-center space-x-2">
            <Layers className="w-5 h-5 text-sky-700" />
            <span>Interactive GIS Flood Map — Tiruchirappalli</span>
          </h2>
          <p className="text-xs text-slate-500">
            Spatial layers: 12 delineated basins, Uyyakondan canal corridor, historical flood logging spots, and GI candidate locations.
          </p>
        </div>

        {/* GIS Layer Toggles */}
        <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
          <label className="flex items-center space-x-1.5 bg-slate-50 border border-slate-200 px-2.5 py-1 rounded cursor-pointer hover:bg-slate-100">
            <input
              type="checkbox"
              checked={showSubcatchments}
              onChange={e => setShowSubcatchments(e.target.checked)}
              className="rounded text-sky-600 focus:ring-sky-500"
            />
            <span className="font-sans text-slate-700">Subcatchments</span>
          </label>

          <label className="flex items-center space-x-1.5 bg-slate-50 border border-slate-200 px-2.5 py-1 rounded cursor-pointer hover:bg-slate-100">
            <input
              type="checkbox"
              checked={showDrainage}
              onChange={e => setShowDrainage(e.target.checked)}
              className="rounded text-blue-600 focus:ring-blue-500"
            />
            <span className="font-sans text-slate-700">Drainage Canals</span>
          </label>

          <label className="flex items-center space-x-1.5 bg-slate-50 border border-slate-200 px-2.5 py-1 rounded cursor-pointer hover:bg-slate-100">
            <input
              type="checkbox"
              checked={showFloodEvidence}
              onChange={e => setShowFloodEvidence(e.target.checked)}
              className="rounded text-red-600 focus:ring-red-500"
            />
            <span className="font-sans text-slate-700">Flood Marks</span>
          </label>

          <label className="flex items-center space-x-1.5 bg-slate-50 border border-slate-200 px-2.5 py-1 rounded cursor-pointer hover:bg-slate-100">
            <input
              type="checkbox"
              checked={showInterventions}
              onChange={e => setShowInterventions(e.target.checked)}
              className="rounded text-emerald-600 focus:ring-emerald-500"
            />
            <span className="font-sans text-slate-700">GI Sites</span>
          </label>
        </div>
      </div>

      {/* Main Map + Inspector Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        
        {/* Leaflet Map Container */}
        <div className="lg:col-span-3 bg-white border border-slate-200 rounded-lg p-1.5 shadow-sm h-[650px] relative overflow-hidden">
          <MapContainer
            center={trichyCenter}
            zoom={12}
            scrollWheelZoom={true}
            className="w-full h-full rounded"
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {/* Subcatchment Polygons */}
            {showSubcatchments && subcatchments.map((sub) => {
              try {
                const geom = JSON.parse(sub.geometry_geojson);
                const coords = geom.coordinates[0].map((pt: [number, number]) => [pt[1], pt[0]]);
                const color = getSubcatchmentColor(sub.susceptibility_score);

                return (
                  <Polygon
                    key={sub.code}
                    positions={coords}
                    pathOptions={{
                      color: color,
                      weight: 2,
                      fillColor: color,
                      fillOpacity: 0.35
                    }}
                    eventHandlers={{
                      click: () => setSelectedFeature({ type: 'subcatchment', data: sub })
                    }}
                  >
                    <Tooltip sticky>
                      <div className="font-sans text-xs">
                        <span className="font-bold block">{sub.name} ({sub.code})</span>
                        <span>Susceptibility: {sub.susceptibility_score}</span>
                      </div>
                    </Tooltip>
                    <Popup>
                      <div className="p-1 font-sans text-xs space-y-1.5 max-w-[200px]">
                        <span className="font-bold text-slate-900 block">{sub.name} ({sub.code})</span>
                        <div className="text-slate-600 space-y-0.5">
                          <p>Area: {sub.area_ha} ha</p>
                          <p>Slope: {sub.slope_pct}% | Elev: {sub.elevation_m}m</p>
                          <p>Impervious: {sub.impervious_pct}%</p>
                          <p className="font-semibold text-slate-800">Dominant: {sub.dominant_factor}</p>
                        </div>
                        <button
                          onClick={() => onOpenFingerprint(sub.code)}
                          className="w-full py-1 bg-slate-900 text-white rounded text-[11px] font-medium"
                        >
                          View Fingerprint
                        </button>
                      </div>
                    </Popup>
                  </Polygon>
                );
              } catch (e) {
                return null;
              }
            })}

            {/* Drainage Networks */}
            {showDrainage && drainageAssets.map((asset) => {
              try {
                const geom = JSON.parse(asset.geometry_geojson);
                const coords = geom.coordinates.map((pt: [number, number]) => [pt[1], pt[0]]);

                return (
                  <Polyline
                    key={asset.id}
                    positions={coords}
                    pathOptions={{
                      color: '#0284c7',
                      weight: 4,
                      opacity: 0.85
                    }}
                    eventHandlers={{
                      click: () => setSelectedFeature({ type: 'drainage', data: asset })
                    }}
                  >
                    <Tooltip sticky>
                      <span className="text-xs font-sans font-bold">{asset.name}</span>
                    </Tooltip>
                  </Polyline>
                );
              } catch (e) {
                return null;
              }
            })}

            {/* Historical Flood Evidence Points */}
            {showFloodEvidence && floodEvidence.map((ev) => {
              try {
                const geom = JSON.parse(ev.geometry_geojson);
                const pos: [number, number] = [geom.coordinates[1], geom.coordinates[0]];

                return (
                  <CircleMarker
                    key={ev.id}
                    center={pos}
                    radius={7}
                    pathOptions={{
                      color: '#991b1b',
                      fillColor: '#dc2626',
                      fillOpacity: 0.9,
                      weight: 2
                    }}
                    eventHandlers={{
                      click: () => setSelectedFeature({ type: 'evidence', data: ev })
                    }}
                  >
                    <Tooltip sticky>
                      <span className="text-xs font-sans font-bold text-red-700">{ev.name} ({ev.flood_depth_m}m)</span>
                    </Tooltip>
                  </CircleMarker>
                );
              } catch (e) {
                return null;
              }
            })}

            {/* Candidate Intervention Sites */}
            {showInterventions && interventionSites.map((site) => {
              try {
                const geom = JSON.parse(site.geometry_geojson);
                const pos: [number, number] = [geom.coordinates[1], geom.coordinates[0]];

                return (
                  <CircleMarker
                    key={site.id}
                    center={pos}
                    radius={6}
                    pathOptions={{
                      color: '#065f46',
                      fillColor: '#10b981',
                      fillOpacity: 0.9,
                      weight: 2
                    }}
                    eventHandlers={{
                      click: () => setSelectedFeature({ type: 'intervention', data: site })
                    }}
                  >
                    <Tooltip sticky>
                      <span className="text-xs font-sans font-bold text-emerald-800">{site.name}</span>
                    </Tooltip>
                  </CircleMarker>
                );
              } catch (e) {
                return null;
              }
            })}

          </MapContainer>

          {/* Map Overlay Legend */}
          <div className="absolute bottom-4 left-4 z-[400] bg-white/95 backdrop-blur-sm border border-slate-300 rounded p-3 text-xs shadow-md space-y-1.5 max-w-[220px]">
            <span className="font-bold text-slate-900 block font-mono text-[11px] uppercase tracking-wider">
              Map Legend
            </span>
            <div className="flex items-center space-x-2">
              <span className="w-3 h-3 rounded-sm bg-red-600"></span>
              <span className="text-slate-700">High Susceptibility (≥0.65)</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="w-3 h-3 rounded-sm bg-amber-500"></span>
              <span className="text-slate-700">Moderate (0.40 - 0.64)</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="w-3 h-3 rounded-sm bg-emerald-500"></span>
              <span className="text-slate-700">Low (&lt;0.40)</span>
            </div>
            <div className="flex items-center space-x-2 pt-1 border-t border-slate-200">
              <span className="w-4 h-1 bg-sky-600 rounded"></span>
              <span className="text-slate-700">Drainage Channel / Canal</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-red-600 border border-white"></span>
              <span className="text-slate-700">Flood Inundation Spot</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 border border-white"></span>
              <span className="text-slate-700">GI Candidate Site</span>
            </div>
          </div>
        </div>

        {/* Sidebar Feature Inspector */}
        <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center space-x-2 pb-3 border-b border-slate-200 mb-4">
              <Info className="w-4 h-4 text-slate-500" />
              <h3 className="font-bold text-slate-900 text-sm">Feature Inspector</h3>
            </div>

            {selectedFeature ? (
              <div className="space-y-4 text-xs">
                {selectedFeature.type === 'subcatchment' && (
                  <>
                    <div>
                      <span className="text-[11px] text-slate-500 font-mono uppercase block">Subcatchment</span>
                      <h4 className="font-bold text-slate-900 text-sm">{selectedFeature.data.name} ({selectedFeature.data.code})</h4>
                      <p className="text-slate-500">{selectedFeature.data.ward_numbers}</p>
                    </div>

                    <div className="bg-slate-50 rounded p-3 border border-slate-200 space-y-1.5 font-mono">
                      <div className="flex justify-between">
                        <span className="text-slate-500 font-sans">Susceptibility:</span>
                        <span className="font-bold text-slate-900">{selectedFeature.data.susceptibility_score}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500 font-sans">Basin Area:</span>
                        <span>{selectedFeature.data.area_ha} ha</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500 font-sans">Mean Elevation:</span>
                        <span>{selectedFeature.data.elevation_m} m</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500 font-sans">Mean Gradient:</span>
                        <span>{selectedFeature.data.slope_pct}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500 font-sans">Impervious Cover:</span>
                        <span>{selectedFeature.data.impervious_pct}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500 font-sans">Soil Texture:</span>
                        <span className="font-sans">{selectedFeature.data.soil_type}</span>
                      </div>
                    </div>

                    <div className="border-l-2 border-sky-600 pl-2.5 py-0.5">
                      <span className="text-[11px] text-slate-500 block">Dominant Physical Driver:</span>
                      <span className="font-semibold text-slate-800">{selectedFeature.data.dominant_factor}</span>
                    </div>

                    <button
                      onClick={() => onOpenFingerprint(selectedFeature.data.code)}
                      className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white rounded text-xs font-medium font-sans transition-colors"
                    >
                      Open Resilience Fingerprint
                    </button>
                  </>
                )}

                {selectedFeature.type === 'drainage' && (
                  <>
                    <div>
                      <span className="text-[11px] text-slate-500 font-mono uppercase block">Drainage Asset</span>
                      <h4 className="font-bold text-slate-900 text-sm">{selectedFeature.data.name}</h4>
                      <p className="text-slate-500">{selectedFeature.data.asset_type}</p>
                    </div>

                    <div className="bg-slate-50 rounded p-3 border border-slate-200 space-y-1.5 font-mono">
                      <div className="flex justify-between">
                        <span className="text-slate-500 font-sans">Design Conveyance:</span>
                        <span className="font-bold text-sky-700">{selectedFeature.data.design_capacity_m3s} m³/s</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500 font-sans">Length:</span>
                        <span>{selectedFeature.data.length_m} m</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500 font-sans">Operating Status:</span>
                        <span className="font-sans text-slate-700">{selectedFeature.data.status}</span>
                      </div>
                    </div>

                    <p className="text-[11px] text-slate-500 bg-slate-100 p-2 rounded">
                      Data Classification: {selectedFeature.data.data_type}
                    </p>
                  </>
                )}

                {selectedFeature.type === 'evidence' && (
                  <>
                    <div>
                      <span className="text-[11px] text-red-600 font-mono uppercase block font-semibold">Historical Flood Observation</span>
                      <h4 className="font-bold text-slate-900 text-sm">{selectedFeature.data.name}</h4>
                      <p className="text-slate-500">{selectedFeature.data.location_description}</p>
                    </div>

                    <div className="bg-red-50/60 rounded p-3 border border-red-200 space-y-1.5 font-mono text-red-950">
                      <div className="flex justify-between">
                        <span className="text-slate-600 font-sans">Recorded Depth:</span>
                        <span className="font-bold text-red-700">{selectedFeature.data.flood_depth_m} m</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600 font-sans">Storm Event:</span>
                        <span className="font-sans">{selectedFeature.data.historical_event}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600 font-sans">Record Date:</span>
                        <span>{selectedFeature.data.observation_date}</span>
                      </div>
                    </div>

                    <p className="text-[11px] text-slate-500">
                      Source: {selectedFeature.data.source}
                    </p>
                  </>
                )}

                {selectedFeature.type === 'intervention' && (
                  <>
                    <div>
                      <span className="text-[11px] text-emerald-700 font-mono uppercase block font-semibold">Candidate GI Site</span>
                      <h4 className="font-bold text-slate-900 text-sm">{selectedFeature.data.name}</h4>
                      <p className="text-slate-500">{selectedFeature.data.land_use}</p>
                    </div>

                    <div className="bg-emerald-50/60 rounded p-3 border border-emerald-200 space-y-1.5 font-mono text-emerald-950">
                      <div className="flex justify-between">
                        <span className="text-slate-600 font-sans">Available Footprint:</span>
                        <span className="font-bold">{selectedFeature.data.available_area_m2.toLocaleString()} m²</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600 font-sans">Priority Level:</span>
                        <span className="font-sans font-semibold">{selectedFeature.data.priority_level}</span>
                      </div>
                    </div>

                    <p className="text-[11px] text-slate-600">
                      Suitability: {selectedFeature.data.allowed_types}
                    </p>
                  </>
                )}
              </div>
            ) : (
              <div className="py-12 text-center text-slate-400">
                <MapPin className="w-8 h-8 mx-auto mb-2 opacity-40" />
                <p className="text-xs">
                  Click any subcatchment, canal, flood mark, or GI candidate site on the map to inspect its parameters.
                </p>
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-slate-200 text-[11px] text-slate-400 font-mono">
            CRS: EPSG:4326 (WGS 84)
          </div>
        </div>

      </div>
    </div>
  );
};
