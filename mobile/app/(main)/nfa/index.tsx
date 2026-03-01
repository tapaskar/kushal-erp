import { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Pressable,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { useAuthStore } from "../../../src/store/auth-store";
import { Card } from "../../../src/components/ui/Card";
import { Badge } from "../../../src/components/ui/Badge";
import { Icon } from "../../../src/components/ui/Icon";
import { Button } from "../../../src/components/ui/Button";
import { colors, typography, spacing, radii } from "../../../src/theme";
import { NFA_STATUS_LABELS, NFA_STATUS_COLORS } from "../../../src/lib/constants";
import * as nfaApi from "../../../src/api/nfa";
import type { NFA } from "../../../src/lib/types";

const STATUS_FILTERS = [
  { key: "all", label: "All" },
  { key: "draft", label: "Draft" },
  { key: "pending_exec", label: "Pending" },
  { key: "approved", label: "Approved" },
  { key: "completed", label: "Completed" },
  { key: "rejected", label: "Rejected" },
];

export default function NFAListScreen() {
  const [nfas, setNfas] = useState<NFA[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState("all");
  const router = useRouter();
  const hasPermission = useAuthStore((s) => s.hasPermission);
  const canCreate = hasPermission("nfa_procurement.create");

  const loadNFAs = useCallback(async () => {
    try {
      const status = filter === "all" ? undefined : filter;
      const data = await nfaApi.getNFAs(status, 50);
      setNfas(data.nfas || []);
    } catch (e) {
      console.error("Failed to load NFAs:", e);
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    setLoading(true);
    loadNFAs();
  }, [filter]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadNFAs();
    setRefreshing(false);
  };

  const formatCurrency = (amount?: number) => {
    if (!amount) return "-";
    return `\u20B9${Number(amount).toLocaleString("en-IN")}`;
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Status Filters */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterBar}
        contentContainerStyle={styles.filterContent}
      >
        {STATUS_FILTERS.map((f) => (
          <Pressable
            key={f.key}
            onPress={() => setFilter(f.key)}
            style={[
              styles.filterChip,
              filter === f.key && styles.filterChipActive,
            ]}
          >
            <Text
              style={[
                styles.filterLabel,
                filter === f.key && styles.filterLabelActive,
              ]}
            >
              {f.label}
            </Text>
          </Pressable>
        ))}
      </ScrollView>

      {/* NFA List */}
      <ScrollView
        style={styles.list}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
      >
        {nfas.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Icon name="document-text" size={48} color={colors.textMuted} />
            <Text style={styles.emptyText}>No NFAs found</Text>
            {canCreate && (
              <Button
                title="Create NFA"
                onPress={() => router.push("/(main)/nfa/create")}
                variant="primary"
                size="sm"
                fullWidth={false}
                icon="add"
              />
            )}
          </View>
        ) : (
          nfas.map((nfa) => (
            <Card
              key={nfa.id}
              variant="elevated"
              padding="lg"
              onPress={() => router.push(`/(main)/nfa/${nfa.id}` as any)}
              style={styles.nfaCard}
            >
              <View style={styles.nfaHeader}>
                <Text style={styles.refNo}>{nfa.referenceNo}</Text>
                <Badge
                  label={NFA_STATUS_LABELS[nfa.status] || nfa.status}
                  color={NFA_STATUS_COLORS[nfa.status] || colors.textMuted}
                  size="sm"
                />
              </View>
              <Text style={styles.nfaTitle} numberOfLines={2}>
                {nfa.title}
              </Text>
              <View style={styles.nfaMeta}>
                <View style={styles.metaItem}>
                  <Icon name="wallet" size={14} color={colors.textTertiary} />
                  <Text style={styles.metaText}>
                    {formatCurrency(nfa.totalEstimatedAmount)}
                  </Text>
                </View>
                <View style={styles.metaItem}>
                  <Icon name="calendar" size={14} color={colors.textTertiary} />
                  <Text style={styles.metaText}>
                    {formatDate(nfa.createdAt)}
                  </Text>
                </View>
              </View>
              {/* Approval progress bar */}
              {(nfa.status === "pending_exec" ||
                nfa.status === "pending_treasurer") && (
                <View style={styles.progressContainer}>
                  <View style={styles.progressBar}>
                    <View
                      style={[
                        styles.progressFill,
                        {
                          width: `${
                            nfa.requiredExecApprovals > 0
                              ? (nfa.currentExecApprovals /
                                  nfa.requiredExecApprovals) *
                                100
                              : 0
                          }%`,
                        },
                      ]}
                    />
                  </View>
                  <Text style={styles.progressText}>
                    {nfa.currentExecApprovals}/{nfa.requiredExecApprovals} exec
                    approvals
                  </Text>
                </View>
              )}
              {nfa.creatorName && (
                <Text style={styles.creatorText}>
                  By {nfa.creatorName}
                </Text>
              )}
            </Card>
          ))
        )}
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* FAB to create */}
      {canCreate && (
        <Pressable
          style={styles.fab}
          onPress={() => router.push("/(main)/nfa/create")}
        >
          <Icon name="add" size={28} color={colors.textOnPrimary} filled />
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.background,
  },
  filterBar: {
    maxHeight: 52,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  filterContent: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    gap: spacing.sm,
  },
  filterChip: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radii.full,
    backgroundColor: colors.surfaceSecondary,
  },
  filterChipActive: {
    backgroundColor: colors.primary,
  },
  filterLabel: {
    ...typography.captionMedium,
    color: colors.textSecondary,
  },
  filterLabelActive: {
    color: colors.textOnPrimary,
  },
  list: { flex: 1, padding: spacing.lg },
  nfaCard: {
    marginBottom: spacing.md,
  },
  nfaHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.xs,
  },
  refNo: {
    ...typography.captionSemibold,
    color: colors.primary,
  },
  nfaTitle: {
    ...typography.bodySemibold,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  nfaMeta: {
    flexDirection: "row",
    gap: spacing.lg,
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
  },
  metaText: {
    ...typography.caption,
    color: colors.textTertiary,
  },
  progressContainer: {
    marginTop: spacing.sm,
  },
  progressBar: {
    height: 4,
    backgroundColor: colors.surfaceSecondary,
    borderRadius: 2,
    overflow: "hidden",
    marginBottom: spacing.xs,
  },
  progressFill: {
    height: "100%",
    backgroundColor: colors.primary,
    borderRadius: 2,
  },
  progressText: {
    ...typography.caption,
    color: colors.textMuted,
    fontSize: 11,
  },
  creatorText: {
    ...typography.caption,
    color: colors.textMuted,
    marginTop: spacing.xs,
    fontSize: 11,
  },
  emptyContainer: {
    alignItems: "center",
    paddingVertical: spacing.xxxl * 2,
    gap: spacing.md,
  },
  emptyText: {
    ...typography.body,
    color: colors.textMuted,
  },
  fab: {
    position: "absolute",
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary,
    justifyContent: "center",
    alignItems: "center",
    elevation: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.27,
    shadowRadius: 4.65,
  },
});
