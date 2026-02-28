"use client";

import { useState, useEffect, useCallback } from "react";
import dynamic from "next/dynamic";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Link from "next/link";
import { ArrowLeft, MapPin, RefreshCw } from "lucide-react";
import {
  getActiveStaffLocations,
  getStaffLocationTrail,
} from "@/services/staff-admin.service";

// Dynamically import the map component (no SSR for Leaflet)
const StaffLocationMap = dynamic(
  () =>
    import("@/components/staff/staff-location-map").then(
      (mod) => mod.StaffLocationMap
    ),
  { ssr: false, loading: () => <div className="w-full h-[500px] bg-gray-100 rounded-lg animate-pulse flex items-center justify-center text-gray-400">Loading map...</div> }
);

interface StaffLocation {
  staffId: string;
  staffName: string;
  staffRole: string;
  latitude: string;
  longitude: string;
  source: string;
  recordedAt: Date | string;
}

interface StaffOption {
  id: string;
  name: string;
  role: string;
}

interface TrailPoint {
  latitude: string;
  longitude: string;
  recordedAt: Date | string;
  source: string;
}

interface GeofenceConfig {
  lat: number;
  lng: number;
  radius: number;
}

export function LocationsClient({
  initialLocations,
  staffList,
  geofence,
}: {
  initialLocations: StaffLocation[];
  staffList: StaffOption[];
  geofence?: GeofenceConfig | null;
}) {
  const [locations, setLocations] = useState<StaffLocation[]>(initialLocations);
  const [selectedStaff, setSelectedStaff] = useState<string>("all");
  const [trail, setTrail] = useState<TrailPoint[]>([]);
  const [trailDate, setTrailDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [lastRefreshed, setLastRefreshed] = useState(new Date());

  const refreshLocations = useCallback(async () => {
    setRefreshing(true);
    try {
      const data = await getActiveStaffLocations();
      setLocations(data);
      setLastRefreshed(new Date());
    } catch (error) {
      console.error("Failed to refresh locations:", error);
    } finally {
      setRefreshing(false);
    }
  }, []);

  // Auto-refresh
  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(refreshLocations, 30000); // 30 seconds
    return () => clearInterval(interval);
  }, [autoRefresh, refreshLocations]);

  // Load trail when staff is selected
  useEffect(() => {
    if (selectedStaff === "all") {
      setTrail([]);
      return;
    }

    async function loadTrail() {
      try {
        const from = trailDate + "T00:00:00";
        const to = trailDate + "T23:59:59";
        const data = await getStaffLocationTrail(selectedStaff, from, to);
        setTrail(data);
      } catch (error) {
        console.error("Failed to load trail:", error);
        setTrail([]);
      }
    }

    loadTrail();
  }, [selectedStaff, trailDate]);

  const selectedStaffName =
    selectedStaff !== "all"
      ? staffList.find((s) => s.id === selectedStaff)?.name
      : undefined;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/staff">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <MapPin className="h-6 w-6 text-blue-600" />
              Staff Live Map
            </h1>
            <p className="text-muted-foreground">
              Real-time location tracking for all active staff
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={refreshLocations}
            disabled={refreshing}
          >
            <RefreshCw
              className={`h-4 w-4 mr-1 ${refreshing ? "animate-spin" : ""}`}
            />
            Refresh
          </Button>
          <Button
            variant={autoRefresh ? "default" : "outline"}
            size="sm"
            onClick={() => setAutoRefresh(!autoRefresh)}
          >
            {autoRefresh ? "Auto-refresh ON" : "Auto-refresh OFF"}
          </Button>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-wrap items-end gap-4">
        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground">
            View Staff Trail
          </Label>
          <Select value={selectedStaff} onValueChange={setSelectedStaff}>
            <SelectTrigger className="w-[220px]">
              <SelectValue placeholder="All Staff" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Staff (Overview)</SelectItem>
              {staffList.map((s) => (
                <SelectItem key={s.id} value={s.id}>
                  {s.name} ({s.role})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {selectedStaff !== "all" && (
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Trail Date</Label>
            <Input
              type="date"
              value={trailDate}
              onChange={(e) => setTrailDate(e.target.value)}
              className="w-[180px]"
            />
          </div>
        )}

        <div className="ml-auto flex items-center gap-4 text-sm text-muted-foreground">
          <span>
            {locations.length} staff tracked
          </span>
          <span>
            Last refreshed: {lastRefreshed.toLocaleTimeString()}
          </span>
        </div>
      </div>

      {/* Map */}
      <Card>
        <CardContent className="p-0">
          <div className="h-[500px]">
            <StaffLocationMap
              locations={locations}
              trail={trail.length > 0 ? trail : undefined}
              selectedStaffName={selectedStaffName}
              geofence={geofence}
            />
          </div>
        </CardContent>
      </Card>

      {/* Staff Location List */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Staff Locations Summary</CardTitle>
        </CardHeader>
        <CardContent>
          {locations.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              No location data available. Staff locations will appear here once
              they start their shifts with location tracking enabled.
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {locations.map((loc) => (
                <div
                  key={loc.staffId}
                  className="flex items-center gap-3 p-3 rounded-lg border hover:bg-gray-50 cursor-pointer"
                  onClick={() => setSelectedStaff(loc.staffId)}
                >
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{
                      backgroundColor:
                        {
                          security: "#dc2626",
                          housekeeping: "#16a34a",
                          maintenance: "#2563eb",
                          gardener: "#65a30d",
                          electrician: "#ca8a04",
                          plumber: "#0891b2",
                          supervisor: "#7c3aed",
                        }[loc.staffRole] || "#6b7280",
                    }}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">
                      {loc.staffName}
                    </p>
                    <p className="text-xs text-muted-foreground capitalize">
                      {loc.staffRole}
                    </p>
                  </div>
                  <span className="text-xs text-muted-foreground whitespace-nowrap">
                    {getTimeAgo(new Date(loc.recordedAt))}
                  </span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
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
