import * as Location from "expo-location";
import * as TaskManager from "expo-task-manager";
import { batchUploadLocations } from "../api/location";
import type { LocationPoint } from "../lib/types";

const LOCATION_TASK_NAME = "rwa-staff-location-tracking";

// Buffer for batching location uploads
let locationBuffer: LocationPoint[] = [];
let uploadTimer: ReturnType<typeof setInterval> | null = null;

// Define the background task
TaskManager.defineTask(LOCATION_TASK_NAME, async ({ data, error }) => {
  if (error) {
    console.error("[LocationTracker] Background task error:", error);
    return;
  }

  if (data) {
    const { locations } = data as { locations: Location.LocationObject[] };
    for (const loc of locations) {
      locationBuffer.push({
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
        accuracy: loc.coords.accuracy || undefined,
        altitude: loc.coords.altitude || undefined,
        speed: loc.coords.speed || undefined,
        heading: loc.coords.heading || undefined,
        source: "gps",
        recordedAt: new Date(loc.timestamp).toISOString(),
      });
    }
  }
});

async function flushBuffer() {
  if (locationBuffer.length === 0) return;

  const points = [...locationBuffer];
  locationBuffer = [];

  try {
    await batchUploadLocations(points);
  } catch (error) {
    console.error("[LocationTracker] Upload failed, re-queuing:", error);
    // Re-add points to buffer for next attempt
    locationBuffer = [...points, ...locationBuffer];
  }
}

export async function startLocationTracking(): Promise<boolean> {
  const { status: foreground } =
    await Location.requestForegroundPermissionsAsync();
  if (foreground !== "granted") return false;

  const { status: background } =
    await Location.requestBackgroundPermissionsAsync();
  if (background !== "granted") {
    console.warn("[LocationTracker] Background permission denied, using foreground only");
  }

  // Start background location updates
  await Location.startLocationUpdatesAsync(LOCATION_TASK_NAME, {
    accuracy: Location.Accuracy.Balanced,
    distanceInterval: 10, // meters
    timeInterval: 30000, // 30 seconds minimum
    deferredUpdatesInterval: 60000, // batch updates every 60 seconds
    showsBackgroundLocationIndicator: true,
    foregroundService: {
      notificationTitle: "Staff Tracker Active",
      notificationBody: "Location tracking is active during your shift",
      notificationColor: "#1a56db",
    },
  });

  // Start periodic buffer flush (every 5 minutes)
  uploadTimer = setInterval(flushBuffer, 5 * 60 * 1000);

  return true;
}

export async function stopLocationTracking(): Promise<void> {
  const isTracking = await Location.hasStartedLocationUpdatesAsync(
    LOCATION_TASK_NAME
  );

  if (isTracking) {
    await Location.stopLocationUpdatesAsync(LOCATION_TASK_NAME);
  }

  // Flush remaining buffer
  await flushBuffer();

  if (uploadTimer) {
    clearInterval(uploadTimer);
    uploadTimer = null;
  }
}

export async function isTrackingActive(): Promise<boolean> {
  return Location.hasStartedLocationUpdatesAsync(LOCATION_TASK_NAME);
}

export async function getCurrentPosition(): Promise<{
  latitude: number;
  longitude: number;
} | null> {
  try {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") return null;

    const loc = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.High,
    });

    return {
      latitude: loc.coords.latitude,
      longitude: loc.coords.longitude,
    };
  } catch {
    return null;
  }
}
