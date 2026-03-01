import { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  Alert,
  Pressable,
} from "react-native";
import { useRouter } from "expo-router";
import { Card } from "../../../src/components/ui/Card";
import { Button } from "../../../src/components/ui/Button";
import { Icon } from "../../../src/components/ui/Icon";
import { colors, typography, spacing, radii } from "../../../src/theme";
import * as nfaApi from "../../../src/api/nfa";

interface ItemRow {
  itemName: string;
  specification: string;
  quantity: string;
  unit: string;
  l1VendorName: string;
  l1UnitPrice: string;
  l2VendorName: string;
  l2UnitPrice: string;
  l3VendorName: string;
  l3UnitPrice: string;
}

const emptyItem = (): ItemRow => ({
  itemName: "",
  specification: "",
  quantity: "1",
  unit: "pcs",
  l1VendorName: "",
  l1UnitPrice: "",
  l2VendorName: "",
  l2UnitPrice: "",
  l3VendorName: "",
  l3UnitPrice: "",
});

const CATEGORIES = [
  { key: "electrical", label: "Electrical" },
  { key: "plumbing", label: "Plumbing" },
  { key: "civil", label: "Civil Work" },
  { key: "painting", label: "Painting" },
  { key: "gardening", label: "Gardening" },
  { key: "security", label: "Security" },
  { key: "cleaning", label: "Cleaning" },
  { key: "general", label: "General" },
  { key: "it_services", label: "IT Services" },
  { key: "other", label: "Other" },
];

const PRIORITIES = [
  { key: "low", label: "Low", color: colors.textMuted },
  { key: "normal", label: "Normal", color: colors.info },
  { key: "urgent", label: "Urgent", color: colors.error },
];

export default function NFACreateScreen() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("general");
  const [priority, setPriority] = useState("normal");
  const [items, setItems] = useState<ItemRow[]>([emptyItem()]);
  const [saving, setSaving] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const updateItem = (index: number, field: keyof ItemRow, value: string) => {
    const updated = [...items];
    updated[index] = { ...updated[index], [field]: value };
    setItems(updated);
  };

  const addItem = () => setItems([...items, emptyItem()]);

  const removeItem = (index: number) => {
    if (items.length <= 1) return;
    setItems(items.filter((_, i) => i !== index));
  };

  const calculateTotal = () => {
    return items.reduce((sum, item) => {
      const qty = parseFloat(item.quantity) || 0;
      const p1 = parseFloat(item.l1UnitPrice) || 0;
      return sum + qty * p1;
    }, 0);
  };

  const buildPayload = () => ({
    title: title.trim(),
    description: description.trim() || undefined,
    category,
    priority,
    items: items
      .filter((i) => i.itemName.trim())
      .map((i) => ({
        itemName: i.itemName.trim(),
        specification: i.specification.trim() || undefined,
        quantity: parseFloat(i.quantity) || 1,
        unit: i.unit || "pcs",
        l1VendorName: i.l1VendorName.trim() || undefined,
        l1UnitPrice: parseFloat(i.l1UnitPrice) || undefined,
        l2VendorName: i.l2VendorName.trim() || undefined,
        l2UnitPrice: parseFloat(i.l2UnitPrice) || undefined,
        l3VendorName: i.l3VendorName.trim() || undefined,
        l3UnitPrice: parseFloat(i.l3UnitPrice) || undefined,
      })),
  });

  const validate = () => {
    if (!title.trim()) {
      Alert.alert("Error", "Please enter a title");
      return false;
    }
    const validItems = items.filter((i) => i.itemName.trim());
    if (validItems.length === 0) {
      Alert.alert("Error", "Add at least one item");
      return false;
    }
    return true;
  };

  const handleSaveDraft = async () => {
    if (!validate()) return;
    setSaving(true);
    try {
      await nfaApi.createNFA(buildPayload());
      Alert.alert("Success", "NFA saved as draft", [
        { text: "OK", onPress: () => router.back() },
      ]);
    } catch (e: any) {
      Alert.alert("Error", e?.response?.data?.error || "Failed to save NFA");
    } finally {
      setSaving(false);
    }
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    Alert.alert(
      "Submit for Approval",
      "Once submitted, exec members will be able to approve. Continue?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Submit",
          onPress: async () => {
            setSubmitting(true);
            try {
              const result = await nfaApi.createNFA(buildPayload());
              await nfaApi.submitNFA(result.nfa.id);
              Alert.alert("Success", "NFA submitted for approval", [
                { text: "OK", onPress: () => router.back() },
              ]);
            } catch (e: any) {
              Alert.alert(
                "Error",
                e?.response?.data?.error || "Failed to submit NFA"
              );
            } finally {
              setSubmitting(false);
            }
          },
        },
      ]
    );
  };

  return (
    <ScrollView
      style={styles.container}
      keyboardShouldPersistTaps="handled"
    >
      {/* Basic Info */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>NFA Details</Text>
        <Card padding="lg">
          <Text style={styles.label}>Title *</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g., Replacement of Common Area Lights"
            placeholderTextColor={colors.textMuted}
            value={title}
            onChangeText={setTitle}
          />

          <Text style={styles.label}>Description</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Detailed description of the requirement..."
            placeholderTextColor={colors.textMuted}
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={3}
          />

          <Text style={styles.label}>Category</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={{ marginBottom: spacing.md }}
          >
            <View style={styles.chipRow}>
              {CATEGORIES.map((c) => (
                <Pressable
                  key={c.key}
                  onPress={() => setCategory(c.key)}
                  style={[
                    styles.chip,
                    category === c.key && styles.chipActive,
                  ]}
                >
                  <Text
                    style={[
                      styles.chipText,
                      category === c.key && styles.chipTextActive,
                    ]}
                  >
                    {c.label}
                  </Text>
                </Pressable>
              ))}
            </View>
          </ScrollView>

          <Text style={styles.label}>Priority</Text>
          <View style={styles.chipRow}>
            {PRIORITIES.map((p) => (
              <Pressable
                key={p.key}
                onPress={() => setPriority(p.key)}
                style={[
                  styles.chip,
                  priority === p.key && {
                    backgroundColor: p.color,
                    borderColor: p.color,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.chipText,
                    priority === p.key && { color: "#fff" },
                  ]}
                >
                  {p.label}
                </Text>
              </Pressable>
            ))}
          </View>
        </Card>
      </View>

      {/* Items */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Items & Quotes</Text>
          <Pressable onPress={addItem} style={styles.addItemBtn}>
            <Icon name="add" size={16} color={colors.primary} />
            <Text style={styles.addItemText}>Add Item</Text>
          </Pressable>
        </View>

        {items.map((item, idx) => (
          <Card key={idx} padding="lg" style={styles.itemCard}>
            <View style={styles.itemHeader}>
              <Text style={styles.itemTitle}>Item {idx + 1}</Text>
              {items.length > 1 && (
                <Pressable onPress={() => removeItem(idx)}>
                  <Icon name="trash" size={18} color={colors.error} />
                </Pressable>
              )}
            </View>

            <TextInput
              style={styles.input}
              placeholder="Item name *"
              placeholderTextColor={colors.textMuted}
              value={item.itemName}
              onChangeText={(v) => updateItem(idx, "itemName", v)}
            />
            <TextInput
              style={styles.input}
              placeholder="Specification"
              placeholderTextColor={colors.textMuted}
              value={item.specification}
              onChangeText={(v) => updateItem(idx, "specification", v)}
            />

            <View style={styles.row}>
              <View style={{ flex: 1 }}>
                <TextInput
                  style={styles.input}
                  placeholder="Qty"
                  placeholderTextColor={colors.textMuted}
                  value={item.quantity}
                  onChangeText={(v) => updateItem(idx, "quantity", v)}
                  keyboardType="numeric"
                />
              </View>
              <View style={{ flex: 1 }}>
                <TextInput
                  style={styles.input}
                  placeholder="Unit"
                  placeholderTextColor={colors.textMuted}
                  value={item.unit}
                  onChangeText={(v) => updateItem(idx, "unit", v)}
                />
              </View>
            </View>

            {/* L1 Quote */}
            <Text style={styles.quoteLabel}>L1 Quote</Text>
            <View style={styles.row}>
              <View style={{ flex: 2 }}>
                <TextInput
                  style={styles.input}
                  placeholder="Vendor name"
                  placeholderTextColor={colors.textMuted}
                  value={item.l1VendorName}
                  onChangeText={(v) => updateItem(idx, "l1VendorName", v)}
                />
              </View>
              <View style={{ flex: 1 }}>
                <TextInput
                  style={styles.input}
                  placeholder="Unit \u20B9"
                  placeholderTextColor={colors.textMuted}
                  value={item.l1UnitPrice}
                  onChangeText={(v) => updateItem(idx, "l1UnitPrice", v)}
                  keyboardType="numeric"
                />
              </View>
            </View>

            {/* L2 Quote */}
            <Text style={styles.quoteLabel}>L2 Quote</Text>
            <View style={styles.row}>
              <View style={{ flex: 2 }}>
                <TextInput
                  style={styles.input}
                  placeholder="Vendor name"
                  placeholderTextColor={colors.textMuted}
                  value={item.l2VendorName}
                  onChangeText={(v) => updateItem(idx, "l2VendorName", v)}
                />
              </View>
              <View style={{ flex: 1 }}>
                <TextInput
                  style={styles.input}
                  placeholder="Unit \u20B9"
                  placeholderTextColor={colors.textMuted}
                  value={item.l2UnitPrice}
                  onChangeText={(v) => updateItem(idx, "l2UnitPrice", v)}
                  keyboardType="numeric"
                />
              </View>
            </View>

            {/* L3 Quote */}
            <Text style={styles.quoteLabel}>L3 Quote</Text>
            <View style={styles.row}>
              <View style={{ flex: 2 }}>
                <TextInput
                  style={styles.input}
                  placeholder="Vendor name"
                  placeholderTextColor={colors.textMuted}
                  value={item.l3VendorName}
                  onChangeText={(v) => updateItem(idx, "l3VendorName", v)}
                />
              </View>
              <View style={{ flex: 1 }}>
                <TextInput
                  style={styles.input}
                  placeholder="Unit \u20B9"
                  placeholderTextColor={colors.textMuted}
                  value={item.l3UnitPrice}
                  onChangeText={(v) => updateItem(idx, "l3UnitPrice", v)}
                  keyboardType="numeric"
                />
              </View>
            </View>
          </Card>
        ))}
      </View>

      {/* Total */}
      <View style={styles.section}>
        <Card variant="elevated" padding="lg">
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Estimated Total (L1)</Text>
            <Text style={styles.totalAmount}>
              {"\u20B9"}
              {calculateTotal().toLocaleString("en-IN")}
            </Text>
          </View>
        </Card>
      </View>

      {/* Actions */}
      <View style={styles.section}>
        <View style={styles.actionRow}>
          <View style={{ flex: 1 }}>
            <Button
              title="Save Draft"
              onPress={handleSaveDraft}
              variant="secondary"
              loading={saving}
              disabled={saving || submitting}
            />
          </View>
          <View style={{ flex: 1 }}>
            <Button
              title="Submit"
              onPress={handleSubmit}
              variant="primary"
              loading={submitting}
              disabled={saving || submitting}
              icon="send"
            />
          </View>
        </View>
      </View>

      <View style={{ height: spacing.xxxl * 2 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  section: {
    padding: spacing.lg,
    paddingBottom: 0,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.sm,
  },
  sectionTitle: {
    ...typography.subtitle,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  label: {
    ...typography.label,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
    marginTop: spacing.md,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    padding: spacing.md,
    fontSize: 15,
    color: colors.textPrimary,
    backgroundColor: colors.background,
    marginBottom: spacing.sm,
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: "top",
  },
  chipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radii.full,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  chipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  chipText: {
    ...typography.captionMedium,
    color: colors.textSecondary,
  },
  chipTextActive: {
    color: colors.textOnPrimary,
  },
  addItemBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  addItemText: {
    ...typography.captionSemibold,
    color: colors.primary,
  },
  itemCard: {
    marginBottom: spacing.md,
  },
  itemHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.sm,
  },
  itemTitle: {
    ...typography.bodySemibold,
    color: colors.textPrimary,
  },
  row: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  quoteLabel: {
    ...typography.captionSemibold,
    color: colors.primary,
    marginTop: spacing.sm,
    marginBottom: spacing.xs,
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  totalLabel: {
    ...typography.bodySemibold,
    color: colors.textSecondary,
  },
  totalAmount: {
    ...typography.h2,
    color: colors.primary,
  },
  actionRow: {
    flexDirection: "row",
    gap: spacing.md,
  },
});
