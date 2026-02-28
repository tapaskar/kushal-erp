import { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import * as Location from "expo-location";
import * as patrolsApi from "../../../src/api/patrols";

interface PatrolDetail {
  log: {
    id: string;
    status: string;
    totalCheckpoints: number;
    visitedCheckpoints: number;
    checkpointResults: {
      checkpointIndex: number;
      label: string;
      visitedAt: string;
    }[];
    startedAt?: string;
    completedAt?: string;
  };
  routeName: string;
  routeCheckpoints: {
    order: number;
    label: string;
    requiredAction?: string;
  }[];
}

export default function ActivePatrolScreen() {
  const { patrolLogId } = useLocalSearchParams<{ patrolLogId: string }>();
  const [patrol, setPatrol] = useState<PatrolDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    loadPatrol();
  }, [patrolLogId]);

  const loadPatrol = async () => {
    try {
      const data = await patrolsApi.getPatrolLog(patrolLogId);
      setPatrol(data);
    } catch {
      Alert.alert("Error", "Failed to load patrol");
    } finally {
      setLoading(false);
    }
  };

  const handleStart = async () => {
    setActionLoading(true);
    try {
      await patrolsApi.startPatrol(patrolLogId);
      await loadPatrol();
    } catch {
      Alert.alert("Error", "Failed to start patrol");
    } finally {
      setActionLoading(false);
    }
  };

  const handleCheckpoint = async (index: number, label: string) => {
    setActionLoading(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      let lat: number | undefined;
      let lng: number | undefined;

      if (status === "granted") {
        const loc = await Location.getCurrentPositionAsync({});
        lat = loc.coords.latitude;
        lng = loc.coords.longitude;
      }

      await patrolsApi.recordCheckpoint(patrolLogId, {
        checkpointIndex: index,
        label,
        latitude: lat,
        longitude: lng,
      });
      await loadPatrol();
    } catch {
      Alert.alert("Error", "Failed to record checkpoint");
    } finally {
      setActionLoading(false);
    }
  };

  const handleComplete = async () => {
    setActionLoading(true);
    try {
      await patrolsApi.completePatrol(patrolLogId);
      Alert.alert("Patrol Complete", "Patrol has been marked as complete.");
      router.back();
    } catch {
      Alert.alert("Error", "Failed to complete patrol");
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <Text>Loading patrol...</Text>
      </View>
    );
  }

  if (!patrol) {
    return (
      <View style={styles.center}>
        <Text>Patrol not found</Text>
      </View>
    );
  }

  const visitedIndices = new Set(
    patrol.log.checkpointResults.map((r) => r.checkpointIndex)
  );

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.routeName}>{patrol.routeName}</Text>
        <Text style={styles.progress}>
          {patrol.log.visitedCheckpoints} / {patrol.log.totalCheckpoints}{" "}
          checkpoints
        </Text>
      </View>

      {patrol.log.status === "pending" && (
        <TouchableOpacity
          style={[styles.startButton, actionLoading && styles.buttonDisabled]}
          onPress={handleStart}
          disabled={actionLoading}
        >
          <Text style={styles.startButtonText}>
            {actionLoading ? "Starting..." : "Start Patrol"}
          </Text>
        </TouchableOpacity>
      )}

      {/* Checkpoints */}
      <View style={styles.checkpoints}>
        {patrol.routeCheckpoints.map((cp, idx) => {
          const visited = visitedIndices.has(cp.order);
          const result = patrol.log.checkpointResults.find(
            (r) => r.checkpointIndex === cp.order
          );

          return (
            <View key={idx} style={styles.checkpointItem}>
              <View
                style={[
                  styles.checkpointDot,
                  visited
                    ? styles.checkpointVisited
                    : styles.checkpointPending,
                ]}
              >
                <Text style={styles.checkpointDotText}>
                  {visited ? "✓" : cp.order}
                </Text>
              </View>
              <View style={styles.checkpointContent}>
                <Text
                  style={[
                    styles.checkpointLabel,
                    visited && styles.checkpointLabelVisited,
                  ]}
                >
                  {cp.label}
                </Text>
                {cp.requiredAction && (
                  <Text style={styles.checkpointAction}>
                    {cp.requiredAction}
                  </Text>
                )}
                {result && (
                  <Text style={styles.checkpointTime}>
                    Visited at{" "}
                    {new Date(result.visitedAt).toLocaleTimeString()}
                  </Text>
                )}
              </View>
              {!visited && patrol.log.status === "in_progress" && (
                <TouchableOpacity
                  style={styles.visitButton}
                  onPress={() => handleCheckpoint(cp.order, cp.label)}
                  disabled={actionLoading}
                >
                  <Text style={styles.visitButtonText}>Visit</Text>
                </TouchableOpacity>
              )}
            </View>
          );
        })}
      </View>

      {patrol.log.status === "in_progress" && (
        <TouchableOpacity
          style={[
            styles.completeButton,
            actionLoading && styles.buttonDisabled,
          ]}
          onPress={handleComplete}
          disabled={actionLoading}
        >
          <Text style={styles.completeButtonText}>
            {actionLoading ? "Completing..." : "Complete Patrol"}
          </Text>
        </TouchableOpacity>
      )}

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8fafc", padding: 16 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  header: { marginBottom: 20 },
  routeName: { fontSize: 20, fontWeight: "bold", color: "#1e293b" },
  progress: { fontSize: 14, color: "#64748b", marginTop: 4 },
  startButton: {
    backgroundColor: "#1a56db",
    borderRadius: 10,
    padding: 16,
    alignItems: "center",
    marginBottom: 20,
  },
  startButtonText: { color: "#fff", fontSize: 16, fontWeight: "600" },
  buttonDisabled: { opacity: 0.6 },
  checkpoints: { gap: 2 },
  checkpointItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 14,
    borderRadius: 10,
    marginBottom: 8,
  },
  checkpointDot: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  checkpointVisited: { backgroundColor: "#22c55e" },
  checkpointPending: { backgroundColor: "#e2e8f0" },
  checkpointDotText: { color: "#fff", fontWeight: "bold", fontSize: 13 },
  checkpointContent: { flex: 1 },
  checkpointLabel: { fontSize: 15, fontWeight: "600", color: "#1e293b" },
  checkpointLabelVisited: { color: "#64748b" },
  checkpointAction: { fontSize: 12, color: "#64748b", marginTop: 2 },
  checkpointTime: { fontSize: 11, color: "#22c55e", marginTop: 2 },
  visitButton: {
    backgroundColor: "#dbeafe",
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 6,
  },
  visitButtonText: { color: "#1a56db", fontWeight: "600", fontSize: 13 },
  completeButton: {
    backgroundColor: "#22c55e",
    borderRadius: 10,
    padding: 16,
    alignItems: "center",
    marginTop: 16,
  },
  completeButtonText: { color: "#fff", fontSize: 16, fontWeight: "600" },
});
