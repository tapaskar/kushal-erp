import { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { Card } from "../../src/components/ui/Card";
import { Badge } from "../../src/components/ui/Badge";
import { Icon } from "../../src/components/ui/Icon";
import { colors, typography, spacing, radii } from "../../src/theme";
import { NFA_STATUS_LABELS, NFA_STATUS_COLORS } from "../../src/lib/constants";
import * as nfaApi from "../../src/api/nfa";
import type { NFA } from "../../src/lib/types";

export default function ApprovalsScreen() {
  const [pendingNFAs, setPendingNFAs] = useState<NFA[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();

  const loadPending = useCallback(async () => {
    try {
      const data = await nfaApi.getPendingApprovals();
      setPendingNFAs(data.nfas || []);
    } catch (e) {
      console.error("Failed to load pending approvals:", e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPending();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadPending();
    setRefreshing(false);
  };

  const formatCurrency = (amount?: number) => {
    if (!amount) return "-";
    return `\u20B9${Number(amount).toLocaleString("en-IN")}`;
  };

  const getTimeSince = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    if (hours < 1) return "Just now";
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days === 1) return "1 day ago";
    return `${days} days ago`;
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor={colors.primary}
          colors={[colors.primary]}
        />
      }
    >
      {/* Header */}
      <View style={styles.headerSection}>
        <View style={styles.headerIcon}>
          <Icon name="checkmark-done" size={24} color={colors.primary} />
        </View>
        <Text style={styles.headerTitle}>Pending Approvals</Text>
        <Text style={styles.headerSubtitle}>
          {pendingNFAs.length} NFA{pendingNFAs.length !== 1 ? "s" : ""} awaiting
          your action
        </Text>
      </View>

      {/* Pending NFAs */}
      {pendingNFAs.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Icon name="check-circle" size={56} color={colors.success} />
          <Text style={styles.emptyTitle}>All caught up!</Text>
          <Text style={styles.emptySubtitle}>
            No pending approvals at the moment
          </Text>
        </View>
      ) : (
        <View style={styles.listContainer}>
          {pendingNFAs.map((nfa) => (
            <Card
              key={nfa.id}
              variant="elevated"
              padding="lg"
              onPress={() => router.push(`/(main)/nfa/${nfa.id}` as any)}
              style={styles.nfaCard}
            >
              <View style={styles.cardTop}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.refNo}>{nfa.referenceNo}</Text>
                  <Text style={styles.nfaTitle} numberOfLines={2}>
                    {nfa.title}
                  </Text>
                </View>
                <Badge
                  label={NFA_STATUS_LABELS[nfa.status] || nfa.status}
                  color={NFA_STATUS_COLORS[nfa.status] || colors.textMuted}
                  size="sm"
                />
              </View>

              <View style={styles.cardMeta}>
                <View style={styles.metaItem}>
                  <Icon name="wallet" size={14} color={colors.textTertiary} />
                  <Text style={styles.metaText}>
                    {formatCurrency(nfa.totalEstimatedAmount)}
                  </Text>
                </View>
                <View style={styles.metaItem}>
                  <Icon name="clock" size={14} color={colors.textTertiary} />
                  <Text style={styles.metaText}>
                    {getTimeSince(nfa.updatedAt || nfa.createdAt)}
                  </Text>
                </View>
              </View>

              {/* Progress */}
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
                  {nfa.currentExecApprovals}/{nfa.requiredExecApprovals}{" "}
                  approvals
                </Text>
              </View>

              <View style={styles.actionHint}>
                <Icon
                  name="chevron-right"
                  size={14}
                  color={colors.primary}
                />
                <Text style={styles.actionHintText}>
                  Tap to review and approve
                </Text>
              </View>
            </Card>
          ))}
        </View>
      )}

      <View style={{ height: spacing.xxxl * 2 }} />
    </ScrollView>
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
  headerSection: {
    alignItems: "center",
    paddingVertical: spacing.xxl,
    paddingHorizontal: spacing.lg,
  },
  headerIcon: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.primaryBgLight,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: spacing.md,
  },
  headerTitle: {
    ...typography.h2,
    color: colors.textPrimary,
  },
  headerSubtitle: {
    ...typography.caption,
    color: colors.textMuted,
    marginTop: spacing.xs,
  },
  emptyContainer: {
    alignItems: "center",
    paddingVertical: spacing.xxxl * 2,
    gap: spacing.md,
  },
  emptyTitle: {
    ...typography.h3,
    color: colors.textPrimary,
  },
  emptySubtitle: {
    ...typography.body,
    color: colors.textMuted,
  },
  listContainer: {
    padding: spacing.lg,
  },
  nfaCard: {
    marginBottom: spacing.md,
  },
  cardTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: spacing.sm,
  },
  refNo: {
    ...typography.captionSemibold,
    color: colors.primary,
    marginBottom: spacing.xs,
  },
  nfaTitle: {
    ...typography.bodySemibold,
    color: colors.textPrimary,
  },
  cardMeta: {
    flexDirection: "row",
    gap: spacing.lg,
    marginBottom: spacing.sm,
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
    marginBottom: spacing.sm,
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
  actionHint: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
  },
  actionHintText: {
    ...typography.captionMedium,
    color: colors.primary,
  },
});
