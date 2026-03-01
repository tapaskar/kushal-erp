import { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Alert,
  ActivityIndicator,
  TextInput,
  Modal,
  Pressable,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useAuthStore } from "../../../src/store/auth-store";
import { Card } from "../../../src/components/ui/Card";
import { Badge } from "../../../src/components/ui/Badge";
import { Icon } from "../../../src/components/ui/Icon";
import { Button } from "../../../src/components/ui/Button";
import { colors, typography, spacing, radii } from "../../../src/theme";
import {
  NFA_STATUS_LABELS,
  NFA_STATUS_COLORS,
  USER_ROLES,
} from "../../../src/lib/constants";
import * as nfaApi from "../../../src/api/nfa";
import { generateNFAPdf } from "../../../src/lib/nfa-pdf";
import type { NFA } from "../../../src/lib/types";

export default function NFADetailScreen() {
  const { nfaId } = useLocalSearchParams<{ nfaId: string }>();
  const router = useRouter();
  const { hasPermission, society } = useAuthStore();

  const [nfa, setNfa] = useState<NFA | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  // Approval modal
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [approvalAction, setApprovalAction] = useState<"approved" | "rejected">(
    "approved"
  );
  const [remarks, setRemarks] = useState("");

  const canApproveExec = hasPermission("nfa_procurement.approve_exec");
  const canApproveTreasurer = hasPermission(
    "nfa_procurement.approve_treasurer"
  );
  const canCreatePO = hasPermission("nfa_procurement.create_po");
  const canExportPdf = hasPermission("nfa_procurement.export_pdf");

  const loadDetail = async () => {
    try {
      const data = await nfaApi.getNFADetail(nfaId!);
      setNfa(data.nfa || data);
    } catch (e) {
      console.error("Failed to load NFA detail:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (nfaId) loadDetail();
  }, [nfaId]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadDetail();
    setRefreshing(false);
  };

  const formatCurrency = (amount?: number) => {
    if (!amount && amount !== 0) return "-";
    return `\u20B9${Number(amount).toLocaleString("en-IN")}`;
  };

  const formatDateTime = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleApproval = async () => {
    setActionLoading(true);
    try {
      await nfaApi.approveNFA(nfaId!, approvalAction, remarks.trim() || undefined);
      Alert.alert(
        "Success",
        approvalAction === "approved"
          ? "NFA approved successfully"
          : "NFA rejected"
      );
      setShowApprovalModal(false);
      setRemarks("");
      await loadDetail();
    } catch (e: any) {
      Alert.alert("Error", e?.response?.data?.error || "Action failed");
    } finally {
      setActionLoading(false);
    }
  };

  const handleSubmit = async () => {
    Alert.alert("Submit NFA", "Submit this NFA for approval?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Submit",
        onPress: async () => {
          setActionLoading(true);
          try {
            await nfaApi.submitNFA(nfaId!);
            Alert.alert("Success", "NFA submitted for approval");
            await loadDetail();
          } catch (e: any) {
            Alert.alert(
              "Error",
              e?.response?.data?.error || "Failed to submit"
            );
          } finally {
            setActionLoading(false);
          }
        },
      },
    ]);
  };

  const handleCreatePO = async () => {
    Alert.alert("Create Purchase Order", "Create PO from this approved NFA?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Create PO",
        onPress: async () => {
          setActionLoading(true);
          try {
            await nfaApi.createPOFromNFA(nfaId!);
            Alert.alert("Success", "Purchase Order created");
            await loadDetail();
          } catch (e: any) {
            Alert.alert(
              "Error",
              e?.response?.data?.error || "Failed to create PO"
            );
          } finally {
            setActionLoading(false);
          }
        },
      },
    ]);
  };

  const handleComplete = async () => {
    Alert.alert(
      "Mark Completed",
      "Mark this NFA as completed?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Complete",
          onPress: async () => {
            setActionLoading(true);
            try {
              await nfaApi.completeNFA(nfaId!);
              Alert.alert("Success", "NFA marked as completed");
              await loadDetail();
            } catch (e: any) {
              Alert.alert(
                "Error",
                e?.response?.data?.error || "Failed to complete"
              );
            } finally {
              setActionLoading(false);
            }
          },
        },
      ]
    );
  };

  const handleExportPdf = async () => {
    if (!nfa) return;
    try {
      await generateNFAPdf(nfa, society?.name || "Society");
    } catch (e: any) {
      Alert.alert("Error", "Failed to generate PDF. " + (e?.message || ""));
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!nfa) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>NFA not found</Text>
      </View>
    );
  }

  const showApproveButtons =
    (canApproveExec && nfa.status === "pending_exec") ||
    (canApproveTreasurer && nfa.status === "pending_treasurer");

  return (
    <>
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
        <Card variant="elevated" padding="lg" style={styles.headerCard}>
          <View style={styles.headerRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.refNo}>{nfa.referenceNo}</Text>
              <Text style={styles.nfaTitle}>{nfa.title}</Text>
            </View>
            <Badge
              label={NFA_STATUS_LABELS[nfa.status] || nfa.status}
              color={NFA_STATUS_COLORS[nfa.status] || colors.textMuted}
            />
          </View>

          {nfa.description && (
            <Text style={styles.description}>{nfa.description}</Text>
          )}

          <View style={styles.detailGrid}>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Category</Text>
              <Text style={styles.detailValue}>
                {nfa.category?.replace(/_/g, " ") || "-"}
              </Text>
            </View>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Priority</Text>
              <Text style={styles.detailValue}>
                {nfa.priority?.charAt(0).toUpperCase() + nfa.priority?.slice(1)}
              </Text>
            </View>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Total Amount</Text>
              <Text style={[styles.detailValue, { color: colors.primary }]}>
                {formatCurrency(nfa.totalEstimatedAmount)}
              </Text>
            </View>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Created</Text>
              <Text style={styles.detailValue}>
                {formatDateTime(nfa.createdAt)}
              </Text>
            </View>
          </View>

          {/* PDF Export Button */}
          {canExportPdf && (
            <Button
              title="Download PDF"
              onPress={handleExportPdf}
              variant="secondary"
              size="sm"
              icon="download"
            />
          )}
        </Card>

        {/* Items Table */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Items ({nfa.items?.length || 0})
          </Text>
          {nfa.items?.map((item, idx) => (
            <Card key={item.id || idx} padding="lg" style={styles.itemCard}>
              <View style={styles.itemHeaderRow}>
                <Text style={styles.itemName}>
                  {idx + 1}. {item.itemName}
                </Text>
                <Text style={styles.itemQty}>
                  {item.quantity} {item.unit || "pcs"}
                </Text>
              </View>
              {item.specification && (
                <Text style={styles.itemSpec}>{item.specification}</Text>
              )}

              {/* Quotes */}
              <View style={styles.quotesContainer}>
                {[
                  {
                    label: "L1",
                    vendor: item.l1VendorName,
                    price: item.l1UnitPrice,
                    total: item.l1TotalPrice,
                    key: "l1",
                  },
                  {
                    label: "L2",
                    vendor: item.l2VendorName,
                    price: item.l2UnitPrice,
                    total: item.l2TotalPrice,
                    key: "l2",
                  },
                  {
                    label: "L3",
                    vendor: item.l3VendorName,
                    price: item.l3UnitPrice,
                    total: item.l3TotalPrice,
                    key: "l3",
                  },
                ].map((q) =>
                  q.vendor ? (
                    <View
                      key={q.key}
                      style={[
                        styles.quoteRow,
                        item.selectedQuote === q.key && styles.quoteSelected,
                      ]}
                    >
                      <View style={styles.quoteLabelContainer}>
                        <Text
                          style={[
                            styles.quoteLabel,
                            item.selectedQuote === q.key && {
                              color: colors.primary,
                            },
                          ]}
                        >
                          {q.label}
                        </Text>
                        {item.selectedQuote === q.key && (
                          <Icon
                            name="check-circle"
                            size={14}
                            color={colors.success}
                            filled
                          />
                        )}
                      </View>
                      <Text style={styles.quoteVendor}>{q.vendor}</Text>
                      <Text style={styles.quotePrice}>
                        {formatCurrency(q.price)} /unit
                      </Text>
                      {q.total && (
                        <Text style={styles.quoteTotal}>
                          Total: {formatCurrency(q.total)}
                        </Text>
                      )}
                    </View>
                  ) : null
                )}
              </View>
            </Card>
          ))}
        </View>

        {/* Approval Progress */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Approval Progress</Text>
          <Card padding="lg">
            <View style={styles.progressRow}>
              <View style={styles.progressBar}>
                <View
                  style={[
                    styles.progressFill,
                    {
                      width: `${
                        nfa.requiredExecApprovals > 0
                          ? Math.min(
                              (nfa.currentExecApprovals /
                                nfa.requiredExecApprovals) *
                                100,
                              100
                            )
                          : 0
                      }%`,
                    },
                  ]}
                />
              </View>
              <Text style={styles.progressText}>
                {nfa.currentExecApprovals} of {nfa.requiredExecApprovals} exec
                approvals (
                {nfa.requiredExecApprovals > 0
                  ? Math.round(
                      (nfa.currentExecApprovals / nfa.requiredExecApprovals) *
                        100
                    )
                  : 0}
                % quorum)
              </Text>
            </View>
            {nfa.currentExecRejections > 0 && (
              <Text style={styles.rejectionText}>
                {nfa.currentExecRejections} rejection(s)
              </Text>
            )}
          </Card>
        </View>

        {/* Approval Timeline */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Approval Timeline</Text>
          <Card padding="lg">
            {/* Created event */}
            <View style={styles.timelineItem}>
              <View style={styles.timelineDot} />
              <View style={styles.timelineLine} />
              <View style={styles.timelineContent}>
                <Text style={styles.timelineAction}>Created</Text>
                <Text style={styles.timelinePerson}>
                  by {nfa.creatorName || "Admin"}
                </Text>
                <Text style={styles.timelineDate}>
                  {formatDateTime(nfa.createdAt)}
                </Text>
              </View>
            </View>

            {/* Each approval/rejection */}
            {nfa.approvals?.map((approval, idx) => (
              <View key={approval.id || idx} style={styles.timelineItem}>
                <View
                  style={[
                    styles.timelineDot,
                    {
                      backgroundColor:
                        approval.action === "approved"
                          ? colors.success
                          : colors.error,
                    },
                  ]}
                />
                {idx < (nfa.approvals?.length || 0) - 1 && (
                  <View style={styles.timelineLine} />
                )}
                <View style={styles.timelineContent}>
                  <View style={styles.timelineActionRow}>
                    <Badge
                      label={approval.action}
                      color={
                        approval.action === "approved"
                          ? colors.success
                          : colors.error
                      }
                      size="sm"
                    />
                  </View>
                  <Text style={styles.timelinePerson}>
                    {approval.userName}{" "}
                    <Text style={styles.timelineRole}>
                      ({USER_ROLES[approval.userRole] || approval.userRole})
                    </Text>
                  </Text>
                  {approval.remarks && (
                    <Text style={styles.timelineRemarks}>
                      "{approval.remarks}"
                    </Text>
                  )}
                  <Text style={styles.timelineDate}>
                    {formatDateTime(approval.createdAt)}
                  </Text>
                </View>
              </View>
            ))}

            {/* Treasurer approval */}
            {nfa.treasurerApprovedAt && (
              <View style={styles.timelineItem}>
                <View
                  style={[
                    styles.timelineDot,
                    { backgroundColor: colors.purple },
                  ]}
                />
                <View style={styles.timelineContent}>
                  <View style={styles.timelineActionRow}>
                    <Badge
                      label="Treasurer Approved"
                      color={colors.purple}
                      size="sm"
                    />
                  </View>
                  <Text style={styles.timelinePerson}>
                    {nfa.treasurerApproverName || "Treasurer"}
                  </Text>
                  {nfa.treasurerRemarks && (
                    <Text style={styles.timelineRemarks}>
                      "{nfa.treasurerRemarks}"
                    </Text>
                  )}
                  <Text style={styles.timelineDate}>
                    {formatDateTime(nfa.treasurerApprovedAt)}
                  </Text>
                </View>
              </View>
            )}

            {(!nfa.approvals || nfa.approvals.length === 0) &&
              !nfa.treasurerApprovedAt && (
                <Text style={styles.emptyTimeline}>
                  No approvals yet
                </Text>
              )}
          </Card>
        </View>

        {/* Action Buttons */}
        <View style={styles.section}>
          {/* Submit draft */}
          {nfa.status === "draft" &&
            hasPermission("nfa_procurement.create") && (
              <Button
                title="Submit for Approval"
                onPress={handleSubmit}
                variant="primary"
                icon="send"
                loading={actionLoading}
              />
            )}

          {/* Approve/Reject */}
          {showApproveButtons && (
            <View style={styles.approvalButtons}>
              <View style={{ flex: 1 }}>
                <Button
                  title="Approve"
                  onPress={() => {
                    setApprovalAction("approved");
                    setShowApprovalModal(true);
                  }}
                  variant="success"
                  icon="check-circle"
                  disabled={actionLoading}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Button
                  title="Reject"
                  onPress={() => {
                    setApprovalAction("rejected");
                    setShowApprovalModal(true);
                  }}
                  variant="danger"
                  icon="close"
                  disabled={actionLoading}
                />
              </View>
            </View>
          )}

          {/* Create PO */}
          {nfa.status === "approved" && canCreatePO && (
            <Button
              title="Create Purchase Order"
              onPress={handleCreatePO}
              variant="primary"
              icon="receipt"
              loading={actionLoading}
            />
          )}

          {/* Mark Completed */}
          {nfa.status === "po_created" && canCreatePO && (
            <Button
              title="Mark Completed"
              onPress={handleComplete}
              variant="success"
              icon="checkmark-done"
              loading={actionLoading}
            />
          )}
        </View>

        <View style={{ height: spacing.xxxl * 2 }} />
      </ScrollView>

      {/* Approval Modal */}
      <Modal
        visible={showApprovalModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowApprovalModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {approvalAction === "approved" ? "Approve NFA" : "Reject NFA"}
            </Text>
            <Text style={styles.modalSubtitle}>{nfa.referenceNo}</Text>

            <Text style={styles.label}>Remarks (optional)</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Add your remarks..."
              placeholderTextColor={colors.textMuted}
              value={remarks}
              onChangeText={setRemarks}
              multiline
              numberOfLines={3}
            />

            <View style={styles.modalActions}>
              <View style={{ flex: 1 }}>
                <Button
                  title="Cancel"
                  onPress={() => {
                    setShowApprovalModal(false);
                    setRemarks("");
                  }}
                  variant="secondary"
                />
              </View>
              <View style={{ flex: 1 }}>
                <Button
                  title={
                    approvalAction === "approved" ? "Approve" : "Reject"
                  }
                  onPress={handleApproval}
                  variant={
                    approvalAction === "approved" ? "success" : "danger"
                  }
                  loading={actionLoading}
                />
              </View>
            </View>
          </View>
        </View>
      </Modal>
    </>
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
  errorText: { ...typography.body, color: colors.textMuted },
  headerCard: { margin: spacing.lg },
  headerRow: {
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
    ...typography.h3,
    color: colors.textPrimary,
  },
  description: {
    ...typography.body,
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },
  detailGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  detailItem: {
    width: "45%",
  },
  detailLabel: {
    ...typography.caption,
    color: colors.textMuted,
    marginBottom: 2,
  },
  detailValue: {
    ...typography.bodySemibold,
    color: colors.textPrimary,
    textTransform: "capitalize",
  },
  section: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
  },
  sectionTitle: {
    ...typography.subtitle,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  itemCard: { marginBottom: spacing.sm },
  itemHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.xs,
  },
  itemName: {
    ...typography.bodySemibold,
    color: colors.textPrimary,
    flex: 1,
  },
  itemQty: {
    ...typography.captionSemibold,
    color: colors.textTertiary,
  },
  itemSpec: {
    ...typography.caption,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  quotesContainer: {
    gap: spacing.xs,
    marginTop: spacing.sm,
  },
  quoteRow: {
    backgroundColor: colors.surfaceSecondary,
    borderRadius: radii.sm,
    padding: spacing.sm,
    borderWidth: 1,
    borderColor: "transparent",
  },
  quoteSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryBgLight,
  },
  quoteLabelContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    marginBottom: 2,
  },
  quoteLabel: {
    ...typography.captionSemibold,
    color: colors.textTertiary,
  },
  quoteVendor: {
    ...typography.captionMedium,
    color: colors.textPrimary,
  },
  quotePrice: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  quoteTotal: {
    ...typography.captionSemibold,
    color: colors.textPrimary,
  },
  progressRow: { marginBottom: spacing.xs },
  progressBar: {
    height: 6,
    backgroundColor: colors.surfaceSecondary,
    borderRadius: 3,
    overflow: "hidden",
    marginBottom: spacing.sm,
  },
  progressFill: {
    height: "100%",
    backgroundColor: colors.primary,
    borderRadius: 3,
  },
  progressText: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  rejectionText: {
    ...typography.caption,
    color: colors.error,
    marginTop: spacing.xs,
  },
  // Timeline
  timelineItem: {
    flexDirection: "row",
    marginBottom: spacing.lg,
    position: "relative",
  },
  timelineDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.primary,
    marginTop: 4,
    marginRight: spacing.md,
    zIndex: 1,
  },
  timelineLine: {
    position: "absolute",
    left: 5,
    top: 16,
    bottom: -spacing.lg,
    width: 2,
    backgroundColor: colors.border,
  },
  timelineContent: {
    flex: 1,
  },
  timelineAction: {
    ...typography.bodySemibold,
    color: colors.textPrimary,
  },
  timelineActionRow: {
    marginBottom: spacing.xs,
  },
  timelinePerson: {
    ...typography.captionMedium,
    color: colors.textPrimary,
  },
  timelineRole: {
    color: colors.textTertiary,
    fontWeight: "400",
  },
  timelineRemarks: {
    ...typography.caption,
    color: colors.textSecondary,
    fontStyle: "italic",
    marginTop: 2,
  },
  timelineDate: {
    ...typography.caption,
    color: colors.textMuted,
    marginTop: 2,
    fontSize: 11,
  },
  emptyTimeline: {
    ...typography.caption,
    color: colors.textMuted,
    textAlign: "center",
    paddingVertical: spacing.lg,
  },
  approvalButtons: {
    flexDirection: "row",
    gap: spacing.md,
  },
  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radii.xl,
    borderTopRightRadius: radii.xl,
    padding: spacing.xxl,
    paddingBottom: 40,
  },
  modalTitle: {
    ...typography.h3,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  modalSubtitle: {
    ...typography.caption,
    color: colors.textMuted,
    marginBottom: spacing.lg,
  },
  label: {
    ...typography.label,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    padding: spacing.md,
    fontSize: 15,
    color: colors.textPrimary,
    backgroundColor: colors.background,
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: "top",
    marginBottom: spacing.lg,
  },
  modalActions: {
    flexDirection: "row",
    gap: spacing.md,
  },
});
