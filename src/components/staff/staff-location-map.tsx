"use client";

import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

interface StaffLocation {
  staffId: string;
  staffName: string;
  staffRole: string;
  latitude: string;
  longitude: string;
  source: string;
  recordedAt: Date | string;
}

interface TrailPoint {
  latitude: string;
  longitude: string;
  recordedAt: Date | string;
  source: string;
}

const ROLE_COLORS: Record<string, string> = {
  security: "#dc2626",
  housekeeping: "#16a34a",
  maintenance: "#2563eb",
  gardener: "#65a30d",
  electrician: "#ca8a04",
  plumber: "#0891b2",
  supervisor: "#7c3aed",
};

function createMarkerIcon(role: string) {
  const color = ROLE_COLORS[role] || "#6b7280";
  return L.divIcon({
    className: "custom-staff-marker",
    html: `<div style="
      background-color: ${color};
      width: 28px;
      height: 28px;
      border-radius: 50%;
      border: 3px solid #fff;
      box-shadow: 0 2px 6px rgba(0,0,0,0.3);
      display: flex;
      align-items: center;
      justify-content: center;
    "><div style="
      width: 10px;
      height: 10px;
      background: #fff;
      border-radius: 50%;
    "></div></div>`,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
    popupAnchor: [0, -16],
  });
}

export function StaffLocationMap({
  locations,
  trail,
  selectedStaffName,
}: {
  locations: StaffLocation[];
  trail?: TrailPoint[];
  selectedStaffName?: string;
}) {
  const mapRef = useRef<L.Map | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const markersRef = useRef<L.LayerGroup | null>(null);
  const trailRef = useRef<L.Polyline | null>(null);

  // Initialize map
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = L.map(containerRef.current).setView([28.6139, 77.209], 15);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 19,
    }).addTo(map);

    markersRef.current = L.layerGroup().addTo(map);
    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Update markers when locations change
  useEffect(() => {
    if (!mapRef.current || !markersRef.current) return;

    markersRef.current.clearLayers();

    if (locations.length === 0) return;

    const bounds: [number, number][] = [];

    locations.forEach((loc) => {
      const lat = parseFloat(loc.latitude);
      const lng = parseFloat(loc.longitude);
      if (isNaN(lat) || isNaN(lng)) return;

      bounds.push([lat, lng]);

      const marker = L.marker([lat, lng], {
        icon: createMarkerIcon(loc.staffRole),
      });

      const lastSeen = new Date(loc.recordedAt);
      const timeAgo = getTimeAgo(lastSeen);

      marker.bindPopup(`
        <div style="min-width:150px;">
          <strong>${loc.staffName}</strong><br/>
          <span style="color:#666;text-transform:capitalize;">${loc.staffRole}</span><br/>
          <span style="color:#999;font-size:12px;">Last seen: ${timeAgo}</span><br/>
          <span style="color:#999;font-size:11px;">Source: ${loc.source}</span>
        </div>
      `);

      markersRef.current!.addLayer(marker);
    });

    if (bounds.length > 0) {
      mapRef.current.fitBounds(bounds, { padding: [40, 40], maxZoom: 17 });
    }
  }, [locations]);

  // Update trail when trail data changes
  useEffect(() => {
    if (!mapRef.current) return;

    // Remove old trail
    if (trailRef.current) {
      trailRef.current.remove();
      trailRef.current = null;
    }

    if (!trail || trail.length === 0) return;

    const points: [number, number][] = trail
      .map((p) => [parseFloat(p.latitude), parseFloat(p.longitude)] as [number, number])
      .filter(([lat, lng]) => !isNaN(lat) && !isNaN(lng));

    if (points.length > 1) {
      trailRef.current = L.polyline(points, {
        color: "#2563eb",
        weight: 3,
        opacity: 0.7,
        dashArray: "8, 6",
      }).addTo(mapRef.current);

      mapRef.current.fitBounds(points, { padding: [40, 40], maxZoom: 17 });
    }
  }, [trail]);

  return (
    <div className="relative w-full h-full rounded-lg overflow-hidden border">
      <div ref={containerRef} className="w-full h-full" />
      {/* Legend */}
      <div className="absolute bottom-4 left-4 bg-white/95 backdrop-blur rounded-lg shadow-lg p-3 z-[1000]">
        <p className="text-xs font-semibold text-gray-700 mb-2">Staff Roles</p>
        <div className="grid grid-cols-2 gap-x-4 gap-y-1">
          {Object.entries(ROLE_COLORS).map(([role, color]) => (
            <div key={role} className="flex items-center gap-1.5">
              <div
                className="w-3 h-3 rounded-full border border-white shadow-sm"
                style={{ backgroundColor: color }}
              />
              <span className="text-xs text-gray-600 capitalize">{role}</span>
            </div>
          ))}
        </div>
      </div>
      {selectedStaffName && (
        <div className="absolute top-4 left-4 bg-blue-600 text-white rounded-lg shadow-lg px-3 py-1.5 z-[1000] text-sm font-medium">
          Trail: {selectedStaffName}
        </div>
      )}
    </div>
  );
}

function getTimeAgo(date: Date): string {
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (seconds < 60) return "just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}
