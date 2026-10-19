import React, { useState } from 'react';
import { 
  MapPin, Plus, ShieldAlert, CheckCircle2, AlertTriangle, 
  Trash2, Navigation, RefreshCw, Download, Sliders, Flame, 
  Layers, Compass, Thermometer
} from 'lucide-react';
import { useUEM, calculateDistanceMeters } from '../context/UEMContext';
import { Geofence, Device } from '../types/uem';
import { FleetHeatMap } from '../components/common/FleetHeatMap';

export const GeofencingView: React.FC = () => {
  const { 
    geofences, devices, createGeofence, deleteGeofence, 
    updateDeviceLocation, exportCsv, organization 
  } = useUEM();

  const [activeSubTab, setActiveSubTab] = useState<'heatmap' | 'perimeters'>('heatmap');
  const [selectedFenceId, setSelectedFenceId] = useState<string>(geofences[0]?.id || '');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [latitude, setLatitude] = useState(14.5842);
  const [longitude, setLongitude] = useState(121.0825);
  const [radiusMeters, setRadiusMeters] = useState(500);
  const [actionOnBreach, setActionOnBreach] = useState<Geofence['actionOnBreach']>('alert_only');

  const selectedFence = geofences.find(g => g.id === selectedFenceId) || geofences[0];

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;

    await createGeofence({
      orgId: organization.id || 'org-cci-01',
      name,
      description,
      latitude,
      longitude,
      radiusMeters,
      actionOnBreach,
      enabled: true,
    });

    setShowCreateModal(false);
    setName('');
    setDescription('');
  };

  // Quick preset fills for Philippine hubs
  const applyPresetLocation = (preset: 'pasig' | 'caloocan' | 'laguna' | 'pampanga' | 'cebu' | 'davao') => {
    if (preset === 'pasig') {
      setName('CCI Pasig Main Plant & Corporate HQ');
      setDescription('Pasig manufacturing assembly and IT operations');
      setLatitude(14.5842);
      setLongitude(121.0825);
      setRadiusMeters(450);
    } else if (preset === 'caloocan') {
      setName('CCI Caloocan Cold Hub & Logistics Facility');
      setDescription('Refrigerated van fleet dispatch and multi-temperature storage');
      setLatitude(14.6543);
      setLongitude(120.9842);
      setRadiusMeters(550);
    } else if (preset === 'laguna') {
      setName('CCI Laguna Technopark Service Depot');
      setDescription('Refrigeration technical service workshop & spare parts depot');
      setLatitude(14.2818);
      setLongitude(121.0560);
      setRadiusMeters(500);
    } else if (preset === 'pampanga') {
      setName('CCI North Luzon Hub - San Fernando');
      setDescription('Central Luzon cold chain depot & emergency service response');
      setLatitude(15.0345);
      setLongitude(120.6852);
      setRadiusMeters(450);
    } else if (preset === 'cebu') {
      setName('CCI Cebu Mandaue Regional Facility');
      setDescription('Visayas sales, cold storage installation office and port staging');
      setLatitude(10.3340);
      setLongitude(123.9350);
      setRadiusMeters(400);
    } else if (preset === 'davao') {
      setName('CCI Davao Sasa Cold Port Terminal');
      setDescription('Mindanao agro-industrial cold storage and reefer container center');
      setLatitude(7.1260);
      setLongitude(125.6610);
      setRadiusMeters(500);
    }
  };

  // Simulate a device moving outside or inside
  const simulateMovement = async (device: Device, moveOutside: boolean) => {
    if (!selectedFence) return;
    let newLat = selectedFence.latitude;
    let newLng = selectedFence.longitude;

    if (moveOutside) {
      newLat += 0.015;
      newLng += 0.015;
    } else {
      newLat += 0.0005;
      newLng += 0.0005;
    }

    await updateDeviceLocation(device.id, newLat, newLng);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <span>Geofencing, GPS Telematics & Heat Map</span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 font-medium border border-indigo-500/30">
              Coolaire Consolidated Inc.
            </span>
          </h1>
          <p className="text-xs text-slate-400">
            Real-time geospatial heat maps, cold chain cargo temperatures, and boundary breach response policies
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => exportCsv('geofences')}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700/60 transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-indigo-400" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/30 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>New Geofence Perimeter</span>
          </button>
        </div>
      </div>

      {/* Primary Sub-Tab Switcher */}
      <div className="flex items-center border-b border-slate-800 text-xs font-semibold gap-6">
        <button
          onClick={() => setActiveSubTab('heatmap')}
          className={`py-3 flex items-center gap-2 border-b-2 transition-colors ${
            activeSubTab === 'heatmap' ? 'border-rose-500 text-rose-400' : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Flame className="w-4 h-4" />
          <span>Interactive Fleet Heat Map & Live Clusters</span>
        </button>
        <button
          onClick={() => setActiveSubTab('perimeters')}
          className={`py-3 flex items-center gap-2 border-b-2 transition-colors ${
            activeSubTab === 'perimeters' ? 'border-indigo-500 text-indigo-400' : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Compass className="w-4 h-4" />
          <span>Facility Geofence Radar & Perimeter Controls</span>
        </button>
      </div>

      {/* VIEW 1: FLEET HEAT MAP */}
      {activeSubTab === 'heatmap' && (
        <FleetHeatMap devices={devices} geofences={geofences} />
      )}

      {/* VIEW 2: RADAR & PERIMETER MANAGEMENT */}
      {activeSubTab === 'perimeters' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Radar / Geospatial Visualizer (2 Cols) */}
            <div className="lg:col-span-2 p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 shadow-xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Navigation className="w-4 h-4 text-indigo-400" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">
                    Geospatial Perimeter Canvas: {selectedFence?.name || 'Select Geofence'}
                  </h3>
                </div>
                <span className="text-[11px] font-mono text-indigo-300">
                  Center: [{selectedFence?.latitude.toFixed(4)}, {selectedFence?.longitude.toFixed(4)}] • Radius: {selectedFence?.radiusMeters}m
                </span>
              </div>

              {/* Interactive Radar Visual Canvas */}
              <div className="relative w-full h-80 bg-slate-950 rounded-xl border border-slate-800 overflow-hidden flex items-center justify-center p-4">
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:2rem_2rem] opacity-30" />
                
                <div className="absolute w-72 h-72 rounded-full border border-indigo-500/20 animate-pulse pointer-events-none" />
                <div className="absolute w-52 h-52 rounded-full border border-indigo-500/40 pointer-events-none" />
                <div className="absolute w-32 h-32 rounded-full bg-indigo-500/10 border-2 border-dashed border-indigo-400 flex items-center justify-center pointer-events-none">
                  <span className="text-[10px] font-semibold text-indigo-300 bg-slate-900/80 px-2 py-0.5 rounded shadow">
                    Perimeter ({selectedFence?.radiusMeters}m)
                  </span>
                </div>

                {/* Center Anchor Pin */}
                <div className="absolute z-10 flex flex-col items-center">
                  <div className="w-4 h-4 rounded-full bg-indigo-600 border-2 border-white shadow-lg" />
                  <span className="text-[10px] font-bold text-white bg-slate-900/90 px-1.5 py-0.5 rounded mt-1 border border-indigo-500/40">
                    Facility Center
                  </span>
                </div>

                {/* Device Pins Plotted */}
                {devices.map((device, idx) => {
                  if (!device.location || !selectedFence) return null;
                  const dist = calculateDistanceMeters(
                    device.location.latitude,
                    device.location.longitude,
                    selectedFence.latitude,
                    selectedFence.longitude
                  );
                  const isInside = dist <= selectedFence.radiusMeters;

                  const angle = (idx * (360 / Math.max(1, devices.length)) * Math.PI) / 180;
                  const normalizedDist = isInside ? 40 + (idx * 6) : 125 + (idx * 8);
                  const topPos = `calc(50% + ${Math.sin(angle) * normalizedDist}px)`;
                  const leftPos = `calc(50% + ${Math.cos(angle) * normalizedDist}px)`;

                  return (
                    <div
                      key={device.id}
                      style={{ top: topPos, left: leftPos }}
                      className="absolute z-20 transform -translate-x-1/2 -translate-y-1/2 group cursor-pointer"
                    >
                      <div className={`w-3.5 h-3.5 rounded-full border-2 border-white shadow-md transition-transform group-hover:scale-125 ${
                        isInside ? 'bg-emerald-500' : 'bg-rose-500 animate-ping'
                      }`} />
                      <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-1 hidden group-hover:flex flex-col items-center z-30 pointer-events-none">
                        <div className="px-2 py-1 rounded bg-slate-900 border border-slate-700 text-[10px] text-white whitespace-nowrap shadow-xl">
                          <p className="font-bold">{device.hostname}</p>
                          <p className="text-slate-400">{isInside ? 'INSIDE Boundary' : 'BREACH DETECTED!'}</p>
                          <p className="font-mono text-indigo-300">{Math.round(dist)}m from center</p>
                        </div>
                      </div>
                    </div>
                  );
                })}

                {/* Canvas Legend */}
                <div className="absolute bottom-3 left-3 flex items-center gap-4 text-[10px] bg-slate-900/90 px-3 py-1.5 rounded-lg border border-slate-800">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                    <span className="text-slate-300">Compliant (Inside)</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                    <span className="text-slate-300">Breached (Outside Perimeter)</span>
                  </div>
                </div>
              </div>

              {/* Simulation Sandbox */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sliders className="w-4 h-4 text-indigo-400" />
                    <h4 className="font-bold text-slate-200 text-xs">Live Telematics Movement Simulator</h4>
                  </div>
                  <span className="text-[11px] text-slate-400">Trigger immediate enter/exit geofence events</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {devices.slice(0, 4).map(dev => {
                    const isInside = dev.location?.insideGeofence;
                    return (
                      <div key={dev.id} className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-between">
                        <div>
                          <p className="font-bold text-slate-200 text-xs">{dev.hostname}</p>
                          <p className="text-[10px] text-slate-400">{dev.assignedUser}</p>
                        </div>
                        <div className="flex items-center gap-1.5">
                          {isInside ? (
                            <button
                              onClick={() => simulateMovement(dev, true)}
                              className="px-2 py-1 rounded bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 text-[10px] font-semibold transition-colors"
                            >
                              Exit Fence
                            </button>
                          ) : (
                            <button
                              onClick={() => simulateMovement(dev, false)}
                              className="px-2 py-1 rounded bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 text-[10px] font-semibold transition-colors"
                            >
                              Enter Fence
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Geofence Perimeter List (1 Col) */}
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3 shadow-xl">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200 flex items-center justify-between">
                  <span>Authorized Perimeters ({geofences.length})</span>
                </h3>

                <div className="space-y-2.5 max-h-[500px] overflow-y-auto">
                  {geofences.map(fence => {
                    const isSelected = fence.id === selectedFenceId;
                    return (
                      <div
                        key={fence.id}
                        onClick={() => setSelectedFenceId(fence.id)}
                        className={`p-3.5 rounded-xl border text-left cursor-pointer transition-all ${
                          isSelected
                            ? 'bg-indigo-600/10 border-indigo-500 shadow-md shadow-indigo-600/10'
                            : 'bg-slate-950/70 border-slate-800/80 hover:bg-slate-800/40'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <h4 className="font-bold text-slate-200 text-xs">{fence.name}</h4>
                            <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-2">{fence.description}</p>
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteGeofence(fence.id);
                            }}
                            className="text-slate-500 hover:text-rose-400 p-1 rounded hover:bg-slate-800"
                            title="Delete fence"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-slate-800/80 text-[10px] text-slate-400">
                          <span className="font-mono text-indigo-300">Radius: {fence.radiusMeters}m</span>
                          <span className={`px-1.5 py-0.5 rounded font-medium ${
                            fence.actionOnBreach === 'alert_only' ? 'bg-amber-500/10 text-amber-400' :
                            fence.actionOnBreach === 'lock_device' ? 'bg-rose-500/10 text-rose-400' :
                            'bg-purple-500/10 text-purple-400'
                          }`}>
                            Breach: {fence.actionOnBreach.replace('_', ' ')}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* Create Geofence Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-slate-100 text-base">New Facility Geofence Perimeter</h3>
              <button onClick={() => setShowCreateModal(false)} className="text-slate-400 hover:text-white">
                <Trash2 className="w-4 h-4 hidden" />
                <span>✕</span>
              </button>
            </div>

            {/* Quick Presets for Philippine Hubs */}
            <div className="space-y-1.5">
              <span className="text-[10px] text-slate-400 block font-semibold uppercase tracking-wider">Quick Fill Presets:</span>
              <div className="flex flex-wrap gap-1.5">
                <button
                  type="button"
                  onClick={() => applyPresetLocation('pasig')}
                  className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-indigo-300 text-[10px] font-medium"
                >
                  Pasig HQ & Plant
                </button>
                <button
                  type="button"
                  onClick={() => applyPresetLocation('caloocan')}
                  className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-indigo-300 text-[10px] font-medium"
                >
                  Caloocan Cold Hub
                </button>
                <button
                  type="button"
                  onClick={() => applyPresetLocation('laguna')}
                  className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-indigo-300 text-[10px] font-medium"
                >
                  Laguna Technopark
                </button>
                <button
                  type="button"
                  onClick={() => applyPresetLocation('pampanga')}
                  className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-indigo-300 text-[10px] font-medium"
                >
                  Pampanga Hub
                </button>
                <button
                  type="button"
                  onClick={() => applyPresetLocation('cebu')}
                  className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-indigo-300 text-[10px] font-medium"
                >
                  Cebu Mandaue
                </button>
                <button
                  type="button"
                  onClick={() => applyPresetLocation('davao')}
                  className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-indigo-300 text-[10px] font-medium"
                >
                  Davao Port
                </button>
              </div>
            </div>

            <form onSubmit={handleCreate} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Perimeter Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. CCI Subic Logistics Staging Hub"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-100"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Facility Description</label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Refrigeration charging bay & driver staging"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-100"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Latitude</label>
                  <input
                    type="number"
                    step="0.0001"
                    value={latitude}
                    onChange={(e) => setLatitude(parseFloat(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-100 font-mono"
                    required
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Longitude</label>
                  <input
                    type="number"
                    step="0.0001"
                    value={longitude}
                    onChange={(e) => setLongitude(parseFloat(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-100 font-mono"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Radius (Meters)</label>
                  <input
                    type="number"
                    value={radiusMeters}
                    onChange={(e) => setRadiusMeters(parseInt(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-100"
                    min="50"
                    max="10000"
                    required
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Action on Breach</label>
                  <select
                    value={actionOnBreach}
                    onChange={(e) => setActionOnBreach(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-100"
                  >
                    <option value="alert_only">Alert Administrator Only</option>
                    <option value="lock_device">Lock Endpoint Screen</option>
                    <option value="quarantine">Network Quarantine</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold shadow-md shadow-indigo-600/30"
                >
                  Save Geofence
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
