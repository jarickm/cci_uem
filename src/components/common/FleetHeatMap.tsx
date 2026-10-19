import React, { useState, useMemo } from 'react';
import { 
  Flame, MapPin, Layers, Navigation, Eye, 
  Activity, Sliders, ShieldAlert, CheckCircle2, 
  Maximize2, Zap, Truck, Thermometer, Battery
} from 'lucide-react';
import { Device, Geofence } from '../../types/uem';

interface FleetHeatMapProps {
  devices: Device[];
  geofences: Geofence[];
  onSelectDevice?: (deviceId: string) => void;
}

export const FleetHeatMap: React.FC<FleetHeatMapProps> = ({ devices, geofences, onSelectDevice }) => {
  const [mapScope, setMapScope] = useState<'metro_manila' | 'philippines'>('metro_manila');
  const [heatmapMetric, setHeatmapMetric] = useState<'density' | 'temperature' | 'compliance'>('density');
  const [heatRadius, setHeatRadius] = useState<number>(35);
  const [heatOpacity, setHeatOpacity] = useState<number>(0.75);
  const [showPins, setShowPins] = useState<boolean>(true);
  const [showFences, setShowFences] = useState<boolean>(true);
  const [hoveredDevice, setHoveredDevice] = useState<Device | null>(null);

  // Bounds definitions
  // Metro Manila Focus:
  // Lat: 14.20 to 14.80 (Span: 0.60)
  // Lng: 120.90 to 121.20 (Span: 0.30)
  // National Philippines Focus:
  // Lat: 6.5 to 16.5 (Span: 10.0)
  // Lng: 120.0 to 126.5 (Span: 6.5)

  const bounds = useMemo(() => {
    if (mapScope === 'metro_manila') {
      return {
        minLat: 14.20,
        maxLat: 14.80,
        minLng: 120.88,
        maxLng: 121.18,
      };
    } else {
      return {
        minLat: 6.8,
        maxLat: 16.2,
        minLng: 120.0,
        maxLng: 126.5,
      };
    }
  }, [mapScope]);

  // Project lat/lng to percentage X (0 - 100) and Y (0 - 100)
  const projectCoords = (lat: number, lng: number) => {
    const x = ((lng - bounds.minLng) / (bounds.maxLng - bounds.minLng)) * 100;
    // Y inverted because SVG/Canvas y=0 is at top
    const y = 100 - ((lat - bounds.minLat) / (bounds.maxLat - bounds.minLat)) * 100;
    return {
      x: Math.max(2, Math.min(98, x)),
      y: Math.max(2, Math.min(98, y)),
    };
  };

  // Compute color based on selected metric
  const getHeatColor = (device: Device) => {
    if (heatmapMetric === 'temperature') {
      const temp = device.location?.temperatureCelsius ?? 20;
      if (temp <= -18) return '#10b981'; // Green: Ideal Deep Freeze
      if (temp <= -10) return '#06b6d4'; // Cyan: Chilled
      if (temp <= 5) return '#f59e0b'; // Amber: Risk of thaw
      return '#ef4444'; // Red: Critical Warm Alert!
    } else if (heatmapMetric === 'compliance') {
      if (!device.location?.insideGeofence) return '#f43f5e'; // Red: Geofence Breach
      if (device.complianceStatus === 'Fail') return '#f59e0b'; // Amber: Non-compliant
      return '#6366f1'; // Indigo: Compliant
    } else {
      // Density: Vibrant cyan / blue / amber / magenta
      return '#38bdf8';
    }
  };

  return (
    <div className="rounded-2xl bg-slate-900 border border-slate-800 p-5 space-y-4 shadow-xl text-slate-100">
      
      {/* Heat Map Controls Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800 text-xs">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-rose-500/20 text-rose-400 flex items-center justify-center font-bold">
            <Flame className="w-4 h-4 animate-pulse" />
          </div>
          <div>
            <h3 className="font-bold text-slate-100 flex items-center gap-2">
              <span>CCI Live Fleet Geospatial Heat Map</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] bg-rose-500/10 text-rose-300 border border-rose-500/20 font-medium">
                Live Density Hotspots
              </span>
            </h3>
            <p className="text-[11px] text-slate-400">
              Multi-layer intensity gradients tracking refrigerated delivery fleet, technicians, and telemetry hubs
            </p>
          </div>
        </div>

        {/* View Switchers */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Scope Toggle */}
          <div className="flex bg-slate-950 p-1 rounded-lg border border-slate-800">
            <button
              onClick={() => setMapScope('metro_manila')}
              className={`px-2.5 py-1 rounded text-[11px] font-semibold transition-colors ${
                mapScope === 'metro_manila' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Greater Manila & SLEX
            </button>
            <button
              onClick={() => setMapScope('philippines')}
              className={`px-2.5 py-1 rounded text-[11px] font-semibold transition-colors ${
                mapScope === 'philippines' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              National Grid (PH)
            </button>
          </div>

          {/* Metric Selector */}
          <select
            value={heatmapMetric}
            onChange={(e) => setHeatmapMetric(e.target.value as any)}
            className="bg-slate-950 border border-slate-800 text-slate-200 rounded-lg px-2.5 py-1.5 text-[11px] font-medium"
          >
            <option value="density">Heatmap: Fleet Density</option>
            <option value="temperature">Heatmap: Reefer Temp (°C)</option>
            <option value="compliance">Heatmap: Geofence Risk</option>
          </select>
        </div>
      </div>

      {/* Sliders & Layer Toggles Ribbon */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-3 rounded-xl bg-slate-950/70 border border-slate-800/80 text-[11px] text-slate-300">
        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2">
            <Sliders className="w-3.5 h-3.5 text-indigo-400" />
            <span>Heat Radius ({heatRadius}px):</span>
            <input
              type="range"
              min="20"
              max="60"
              value={heatRadius}
              onChange={(e) => setHeatRadius(Number(e.target.value))}
              className="w-24 accent-indigo-500 cursor-pointer"
            />
          </label>

          <label className="flex items-center gap-2">
            <span>Opacity ({Math.round(heatOpacity * 100)}%):</span>
            <input
              type="range"
              min="0.3"
              max="1"
              step="0.05"
              value={heatOpacity}
              onChange={(e) => setHeatOpacity(Number(e.target.value))}
              className="w-20 accent-indigo-500 cursor-pointer"
            />
          </label>
        </div>

        <div className="flex items-center gap-3">
          <label className="flex items-center gap-1.5 cursor-pointer">
            <input
              type="checkbox"
              checked={showFences}
              onChange={(e) => setShowFences(e.target.checked)}
              className="rounded bg-slate-900 border-slate-700 text-indigo-600"
            />
            <span>Show Geofence Perimeters</span>
          </label>

          <label className="flex items-center gap-1.5 cursor-pointer">
            <input
              type="checkbox"
              checked={showPins}
              onChange={(e) => setShowPins(e.target.checked)}
              className="rounded bg-slate-900 border-slate-700 text-indigo-600"
            />
            <span>Show Device Pins</span>
          </label>
        </div>
      </div>

      {/* Interactive Map Visualizer Container */}
      <div className="relative w-full h-[420px] rounded-xl bg-slate-950 border border-slate-800 overflow-hidden shadow-inner flex items-center justify-center">
        
        {/* Background Radar / Geographic Grid Lines */}
        <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:24px_24px] opacity-40 pointer-events-none" />
        
        {/* Ambient Map Contours / Highway Corridors */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none" xmlns="http://www.w3.org/2000/svg">
          {mapScope === 'metro_manila' ? (
            <g stroke="#334155" strokeWidth="1.5" fill="none" opacity="0.35">
              {/* EDSA & C-5 Corridors */}
              <path d="M 40,10 Q 55,40 50,90" strokeDasharray="3 3" />
              <path d="M 60,15 Q 70,50 65,95" strokeDasharray="3 3" />
              {/* SLEX to Laguna */}
              <path d="M 50,60 L 52,98" stroke="#3b82f6" strokeWidth="2" strokeOpacity="0.4" />
              {/* Pasig River */}
              <path d="M 20,48 Q 50,45 80,48" stroke="#0ea5e9" strokeWidth="2" strokeOpacity="0.3" />
            </g>
          ) : (
            <g stroke="#334155" strokeWidth="1" fill="none" opacity="0.3">
              {/* Luzon, Visayas, Mindanao outlines */}
              <path d="M 30,15 Q 40,30 35,50" />
              <path d="M 60,55 Q 70,65 65,75" />
              <path d="M 75,80 Q 80,90 70,95" />
            </g>
          )}
        </svg>

        {/* 1. GEOFENCE BOUNDARIES LAYER */}
        {showFences && (
          <div className="absolute inset-0 pointer-events-none">
            {geofences.map(fence => {
              const { x, y } = projectCoords(fence.latitude, fence.longitude);
              return (
                <div
                  key={fence.id}
                  className="absolute transform -translate-x-1/2 -translate-y-1/2 flex items-center justify-center transition-all"
                  style={{ left: `${x}%`, top: `${y}%` }}
                >
                  {/* Fence perimeter ring */}
                  <div 
                    className="rounded-full border border-indigo-400/40 bg-indigo-500/10 animate-pulse pointer-events-auto"
                    style={{ width: `${heatRadius * 1.8}px`, height: `${heatRadius * 1.8}px` }}
                    title={`${fence.name} (${fence.radiusMeters}m)`}
                  />
                  <span className="absolute -bottom-4 font-bold text-[9px] text-indigo-300/80 whitespace-nowrap bg-slate-900/80 px-1.5 py-0.5 rounded border border-indigo-500/20">
                    {fence.name.replace('CCI ', '')}
                  </span>
                </div>
              );
            })}
          </div>
        )}

        {/* 2. HEAT MAP GAUSSIAN BLEND LAYER */}
        <div 
          className="absolute inset-0 pointer-events-none mix-blend-screen"
          style={{ opacity: heatOpacity }}
        >
          {devices.map(device => {
            if (!device.location) return null;
            const { x, y } = projectCoords(device.location.latitude, device.location.longitude);
            const color = getHeatColor(device);

            return (
              <div
                key={`heat-${device.id}`}
                className="absolute transform -translate-x-1/2 -translate-y-1/2 rounded-full blur-xl pointer-events-none transition-all duration-700"
                style={{
                  left: `${x}%`,
                  top: `${y}%`,
                  width: `${heatRadius * 2.4}px`,
                  height: `${heatRadius * 2.4}px`,
                  background: `radial-gradient(circle, ${color} 0%, ${color}66 45%, transparent 70%)`,
                }}
              />
            );
          })}
        </div>

        {/* 3. DEVICE PINS & INTERACTION LAYER */}
        {showPins && (
          <div className="absolute inset-0">
            {devices.map(device => {
              if (!device.location) return null;
              const { x, y } = projectCoords(device.location.latitude, device.location.longitude);
              const isAndroid = device.platform === 'android';
              const isHovered = hoveredDevice?.id === device.id;
              const temp = device.location.temperatureCelsius;

              return (
                <div
                  key={`pin-${device.id}`}
                  className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer z-20 group"
                  style={{ left: `${x}%`, top: `${y}%` }}
                  onMouseEnter={() => setHoveredDevice(device)}
                  onMouseLeave={() => setHoveredDevice(null)}
                  onClick={() => onSelectDevice && onSelectDevice(device.id)}
                >
                  {/* Pin Circle with Pulse */}
                  <div className={`relative w-6 h-6 rounded-full flex items-center justify-center font-bold text-[10px] shadow-lg transition-transform hover:scale-125 ${
                    isAndroid ? 'bg-emerald-600 text-white ring-2 ring-emerald-400/50' : 'bg-blue-600 text-white ring-2 ring-blue-400/50'
                  }`}>
                    {isAndroid ? '🚐' : '💻'}
                    {/* Live ping ring */}
                    <span className="absolute -inset-1 rounded-full animate-ping opacity-30 bg-emerald-400" />
                  </div>

                  {/* Device Tag */}
                  <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1 px-1.5 py-0.5 rounded bg-slate-900/90 border border-slate-700 text-[9px] font-semibold text-slate-200 whitespace-nowrap shadow-md pointer-events-none group-hover:border-indigo-400">
                    {device.hostname.replace('CCI-', '')}
                    {temp !== undefined && (
                      <span className={`ml-1 font-mono ${temp <= -15 ? 'text-emerald-400' : 'text-amber-400'}`}>
                        {temp}°C
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Hover Device Telemetry Card Overlay */}
        {hoveredDevice && (
          <div className="absolute bottom-4 left-4 z-30 p-3.5 rounded-xl bg-slate-900/95 border border-indigo-500/40 shadow-2xl backdrop-blur-md max-w-sm text-xs animate-fade-in space-y-2 pointer-events-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-md bg-indigo-600/30 text-indigo-400 flex items-center justify-center font-bold">
                  {hoveredDevice.platform === 'android' ? '🚐' : '💻'}
                </div>
                <div>
                  <h4 className="font-bold text-slate-100">{hoveredDevice.hostname}</h4>
                  <p className="text-[10px] text-slate-400">{hoveredDevice.assignedUser}</p>
                </div>
              </div>
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                hoveredDevice.complianceStatus === 'Pass' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'
              }`}>
                {hoveredDevice.complianceStatus}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <div>
                <span className="text-[10px] text-slate-400 block">Cold Chain Temp:</span>
                <span className="font-mono font-bold text-emerald-400 flex items-center gap-1">
                  <Thermometer className="w-3 h-3 text-emerald-400" />
                  {hoveredDevice.location?.temperatureCelsius ?? 'N/A'}°C
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block">Fleet Battery:</span>
                <span className="font-mono font-bold text-slate-200 flex items-center gap-1">
                  <Battery className="w-3 h-3 text-indigo-400" />
                  {hoveredDevice.hardware.batteryLevel ?? 100}%
                </span>
              </div>
              <div className="col-span-2">
                <span className="text-[10px] text-slate-400 block">Current Location:</span>
                <span className="text-slate-300 truncate block">
                  {hoveredDevice.location?.address || 'Pasig City, Metro Manila'}
                </span>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-800 flex justify-between items-center text-[10px]">
              <span className="text-indigo-400 font-medium">Click pin to inspect full telemetry</span>
              <span className={`px-1.5 py-0.5 rounded ${
                hoveredDevice.location?.insideGeofence ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'
              }`}>
                {hoveredDevice.location?.insideGeofence ? 'Inside Geofence' : 'Perimeter Breached'}
              </span>
            </div>
          </div>
        )}

        {/* Legend */}
        <div className="absolute top-3 right-3 z-10 bg-slate-900/90 border border-slate-800 rounded-lg p-2.5 text-[10px] shadow-lg backdrop-blur space-y-1.5 pointer-events-none">
          <div className="font-bold text-slate-300 uppercase tracking-wider text-[9px]">Heatmap Scale</div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <span>Optimal Reefer &lt; -18°C</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400" />
            <span>Chilled Storage 0°C to 4°C</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
            <span>Hotspot / Temp Warning</span>
          </div>
        </div>

      </div>

    </div>
  );
};
