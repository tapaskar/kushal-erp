import { Tabs } from "expo-router";
import { useAuthStore } from "../../src/store/auth-store";
import { BackButton } from "../../src/components/BackButton";
import { Icon, type IconName } from "../../src/components/ui/Icon";
import { colors, spacing } from "../../src/theme";

function TabIcon({ name, focused }: { name: string; focused: boolean }) {
  const icons: Record<string, IconName> = {
    index: "home",
    "tasks/index": "tasks",
    "patrol/index": "shield",
    "shifts/index": "clock",
    profile: "person",
    "visitors/index": "visitors",
    "cleaning/index": "cleaning",
    "inventory/index": "inventory",
    "reports/index": "reports",
  };
  return (
    <Icon
      name={icons[name] || "home"}
      size={22}
      color={focused ? colors.primary : colors.textMuted}
      filled={focused}
    />
  );
}

export default function MainLayout() {
  const staff = useAuthStore((s) => s.staff);
  const role = staff?.role || "";

  const isSecurity = role === "security";
  const isHousekeeping = role === "housekeeping";
  const isSupervisor = role === "supervisor";
  const isTechnical = ["maintenance", "electrician", "plumber"].includes(role);

  // Shared options for hidden detail screens
  const detailScreen = (title: string) => ({
    href: null as any,
    title,
    headerBackVisible: false,
    headerLeft: () => <BackButton />,
  });

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
          height: 64,
          paddingBottom: spacing.sm,
          paddingTop: spacing.xs,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: "500",
        },
        headerStyle: { backgroundColor: colors.primary },
        headerTintColor: colors.textOnPrimary,
        headerTitleStyle: { fontWeight: "600" },
        headerShadowVisible: false,
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

      {/* ── Hidden detail screens (with back button, no native back) ── */}
      <Tabs.Screen name="tasks/[taskId]" options={detailScreen("Task Detail")} />
      <Tabs.Screen name="patrol/[patrolLogId]" options={detailScreen("Active Patrol")} />
      <Tabs.Screen name="shifts/clock" options={detailScreen("Clock In/Out")} />
      <Tabs.Screen name="visitors/new" options={detailScreen("New Visitor")} />
      <Tabs.Screen name="visitors/[visitorId]" options={detailScreen("Visitor Detail")} />
      <Tabs.Screen name="incidents/index" options={detailScreen("Incidents")} />
      <Tabs.Screen name="incidents/new" options={detailScreen("Report Incident")} />
      <Tabs.Screen name="sos" options={detailScreen("SOS Alert")} />
      <Tabs.Screen name="cleaning/[logId]" options={detailScreen("Clean Zone")} />
      <Tabs.Screen name="cleaning/supplies" options={detailScreen("Supplies")} />
      <Tabs.Screen name="inventory/[itemId]" options={detailScreen("Item Detail")} />
      <Tabs.Screen name="inventory/scan" options={detailScreen("Scan Barcode")} />
      <Tabs.Screen name="scan-qr" options={detailScreen("Scan QR")} />
      <Tabs.Screen name="reports/attendance" options={detailScreen("Attendance Report")} />
      <Tabs.Screen name="reports/cleaning" options={detailScreen("Cleaning Report")} />
      <Tabs.Screen name="reports/security" options={detailScreen("Security Report")} />
    </Tabs>
  );
}
