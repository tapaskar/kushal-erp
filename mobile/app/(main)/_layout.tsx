import { Tabs } from "expo-router";
import { Text } from "react-native";
import { useAuthStore } from "../../src/store/auth-store";

function TabIcon({ name, focused }: { name: string; focused: boolean }) {
  const icons: Record<string, string> = {
    index: "🏠",
    "tasks/index": "📋",
    "patrol/index": "🛡️",
    "shifts/index": "⏰",
    profile: "👤",
    "visitors/index": "🚪",
    "cleaning/index": "✨",
    "inventory/index": "📦",
    "reports/index": "📊",
  };
  return (
    <Text style={{ fontSize: 20, opacity: focused ? 1 : 0.5 }}>
      {icons[name] || "•"}
    </Text>
  );
}

export default function MainLayout() {
  const staff = useAuthStore((s) => s.staff);
  const role = staff?.role || "";

  const isSecurity = role === "security";
  const isHousekeeping = role === "housekeeping";
  const isSupervisor = role === "supervisor";
  const isTechnical = ["maintenance", "electrician", "plumber"].includes(role);

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: "#1a56db",
        tabBarInactiveTintColor: "#94a3b8",
        tabBarStyle: {
          backgroundColor: "#fff",
          borderTopColor: "#e2e8f0",
          height: 60,
          paddingBottom: 8,
        },
        headerStyle: { backgroundColor: "#1a56db" },
        headerTintColor: "#fff",
        headerTitleStyle: { fontWeight: "600" },
      }}
    >
      {/* ── Core tabs (all roles) ── */}
      <Tabs.Screen
        name="index"
        options={{
          title: "Dashboard",
          tabBarIcon: ({ focused }) => (
            <TabIcon name="index" focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="tasks/index"
        options={{
          title: "Tasks",
          tabBarIcon: ({ focused }) => (
            <TabIcon name="tasks/index" focused={focused} />
          ),
        }}
      />

      {/* ── Security: Visitors tab ── */}
      <Tabs.Screen
        name="visitors/index"
        options={{
          title: "Visitors",
          href: isSecurity ? "/(main)/visitors" : null,
          tabBarIcon: ({ focused }) => (
            <TabIcon name="visitors/index" focused={focused} />
          ),
        }}
      />

      {/* ── Security/Technical: Patrol tab ── */}
      <Tabs.Screen
        name="patrol/index"
        options={{
          title: "Patrol",
          href: isSecurity || isTechnical || isSupervisor ? "/(main)/patrol" : null,
          tabBarIcon: ({ focused }) => (
            <TabIcon name="patrol/index" focused={focused} />
          ),
        }}
      />

      {/* ── Housekeeping: Cleaning tab ── */}
      <Tabs.Screen
        name="cleaning/index"
        options={{
          title: "Cleaning",
          href: isHousekeeping ? "/(main)/cleaning" : null,
          tabBarIcon: ({ focused }) => (
            <TabIcon name="cleaning/index" focused={focused} />
          ),
        }}
      />

      {/* ── Inventory tab (supervisor or gardener) ── */}
      <Tabs.Screen
        name="inventory/index"
        options={{
          title: "Inventory",
          href: isSupervisor || role === "gardener" ? "/(main)/inventory" : null,
          tabBarIcon: ({ focused }) => (
            <TabIcon name="inventory/index" focused={focused} />
          ),
        }}
      />

      {/* ── Shifts tab (all roles) ── */}
      <Tabs.Screen
        name="shifts/index"
        options={{
          title: "Shifts",
          tabBarIcon: ({ focused }) => (
            <TabIcon name="shifts/index" focused={focused} />
          ),
        }}
      />

      {/* ── Reports tab (supervisor only) ── */}
      <Tabs.Screen
        name="reports/index"
        options={{
          title: "Reports",
          href: isSupervisor ? "/(main)/reports" : null,
          tabBarIcon: ({ focused }) => (
            <TabIcon name="reports/index" focused={focused} />
          ),
        }}
      />

      {/* ── Profile tab (all roles) ── */}
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ focused }) => (
            <TabIcon name="profile" focused={focused} />
          ),
        }}
      />

      {/* ── Hidden detail screens ── */}
      <Tabs.Screen
        name="tasks/[taskId]"
        options={{ href: null, title: "Task Detail" }}
      />
      <Tabs.Screen
        name="patrol/[patrolLogId]"
        options={{ href: null, title: "Active Patrol" }}
      />
      <Tabs.Screen
        name="shifts/clock"
        options={{ href: null, title: "Clock In/Out" }}
      />
      <Tabs.Screen
        name="visitors/new"
        options={{ href: null, title: "New Visitor" }}
      />
      <Tabs.Screen
        name="visitors/[visitorId]"
        options={{ href: null, title: "Visitor Detail" }}
      />
      <Tabs.Screen
        name="incidents/index"
        options={{ href: null, title: "Incidents" }}
      />
      <Tabs.Screen
        name="incidents/new"
        options={{ href: null, title: "Report Incident" }}
      />
      <Tabs.Screen
        name="sos"
        options={{ href: null, title: "SOS Alert" }}
      />
      <Tabs.Screen
        name="cleaning/[logId]"
        options={{ href: null, title: "Clean Zone" }}
      />
      <Tabs.Screen
        name="cleaning/supplies"
        options={{ href: null, title: "Supplies" }}
      />
      <Tabs.Screen
        name="inventory/[itemId]"
        options={{ href: null, title: "Item Detail" }}
      />
      <Tabs.Screen
        name="inventory/scan"
        options={{ href: null, title: "Scan Barcode" }}
      />
      <Tabs.Screen
        name="scan-qr"
        options={{ href: null, title: "Scan QR" }}
      />
      <Tabs.Screen
        name="reports/attendance"
        options={{ href: null, title: "Attendance Report" }}
      />
      <Tabs.Screen
        name="reports/cleaning"
        options={{ href: null, title: "Cleaning Report" }}
      />
      <Tabs.Screen
        name="reports/security"
        options={{ href: null, title: "Security Report" }}
      />
    </Tabs>
  );
}
