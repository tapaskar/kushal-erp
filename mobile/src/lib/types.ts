export interface StaffProfile {
  id: string;
  employeeCode: string;
  name: string;
  phone: string;
  email?: string;
  role: string;
  department?: string;
  photoUrl?: string;
  employedSince?: string;
  contractorName?: string;
  consentGiven: boolean;
  consentRevokedAt?: string;
  isActive: boolean;
}

export interface Society {
  id: string;
  name: string;
  address: string;
  city: string;
}

export interface Shift {
  id: string;
  societyId: string;
  staffId: string;
  date: string;
  scheduledStart: string;
  scheduledEnd: string;
  actualCheckIn?: string;
  actualCheckOut?: string;
  checkInLat?: string;
  checkInLng?: string;
  checkOutLat?: string;
  checkOutLng?: string;
  checkInPhotoUrl?: string;
  checkOutPhotoUrl?: string;
  status: "scheduled" | "checked_in" | "checked_out" | "missed" | "cancelled";
  notes?: string;
}

export interface StaffTask {
  id: string;
  societyId: string;
  staffId?: string;
  taskType: "complaint" | "maintenance" | "patrol" | "ad_hoc" | "inspection";
  status: "pending" | "accepted" | "in_progress" | "completed" | "cancelled";
  title: string;
  description?: string;
  priority: "low" | "medium" | "high" | "urgent";
  complaintId?: string;
  location?: string;
  latitude?: string;
  longitude?: string;
  dueBy?: string;
  startedAt?: string;
  completedAt?: string;
  beforePhotoUrl?: string;
  afterPhotoUrl?: string;
  resolution?: string;
  createdAt: string;
}

export interface PatrolLog {
  id: string;
  patrolRouteId: string;
  staffId: string;
  shiftId?: string;
  status: "pending" | "in_progress" | "completed" | "missed" | "partial";
  startedAt?: string;
  completedAt?: string;
  checkpointResults: CheckpointResult[];
  totalCheckpoints: number;
  visitedCheckpoints: number;
}

export interface CheckpointResult {
  checkpointIndex: number;
  label: string;
  visitedAt: string;
  latitude?: number;
  longitude?: number;
  photoUrl?: string;
  beaconDetected?: boolean;
  notes?: string;
}

export interface PatrolRoute {
  checkpoints: {
    order: number;
    beaconId?: string;
    label: string;
    latitude?: number;
    longitude?: number;
    requiredAction?: string;
  }[];
}

export interface Beacon {
  id: string;
  societyId: string;
  uuid: string;
  major: number;
  minor: number;
  label: string;
  location?: string;
  latitude?: string;
  longitude?: string;
  floor?: number;
}

// ─── Security ───

export interface VisitorLog {
  id: string;
  societyId: string;
  staffId?: string;
  visitorName: string;
  visitorPhone?: string;
  visitorType: "guest" | "delivery" | "cab" | "vendor" | "service" | "other";
  unitId?: string;
  purpose?: string;
  vehicleNumber?: string;
  photoUrl?: string;
  idProofUrl?: string;
  status: "expected" | "checked_in" | "checked_out" | "rejected";
  expectedAt?: string;
  checkInAt?: string;
  checkOutAt?: string;
  checkInGate?: string;
  checkOutGate?: string;
  notes?: string;
  createdAt: string;
}

export interface Incident {
  id: string;
  societyId: string;
  reportedBy: string;
  severity: "low" | "medium" | "high" | "critical";
  title: string;
  description?: string;
  location?: string;
  latitude?: string;
  longitude?: string;
  photoUrls?: string[];
  status: "reported" | "investigating" | "resolved" | "escalated";
  resolvedAt?: string;
  resolution?: string;
  createdAt: string;
}

export interface SosAlert {
  id: string;
  societyId: string;
  staffId: string;
  latitude?: string;
  longitude?: string;
  message?: string;
  isResolved: boolean;
  createdAt: string;
}

// ─── Housekeeping ───

export interface CleaningLog {
  id: string;
  societyId: string;
  zoneId: string;
  staffId?: string;
  scheduledDate: string;
  status: "pending" | "in_progress" | "completed" | "verified" | "issue_reported";
  startedAt?: string;
  completedAt?: string;
  beforePhotoUrl?: string;
  afterPhotoUrl?: string;
  notes?: string;
  rating?: number;
  ratingComment?: string;
}

export interface CleaningZone {
  id: string;
  name: string;
  floor?: number;
  zoneType: string;
  frequency: string;
  description?: string;
}

export interface SupplyRequest {
  id: string;
  staffId: string;
  itemName: string;
  quantity: number;
  urgency: string;
  reason?: string;
  status: string;
  createdAt: string;
}

// ─── Inventory ───

export interface InventoryItem {
  id: string;
  name: string;
  barcode: string;
  category: string;
  quantity: number;
  location?: string;
  isConsumable: boolean;
}

// ─── Material Usage ───

export interface MaterialUsage {
  id: string;
  staffId: string;
  taskId?: string;
  inventoryItemId: string;
  quantityUsed: number;
  notes?: string;
  createdAt: string;
}

export interface LocationPoint {
  latitude: number;
  longitude: number;
  accuracy?: number;
  altitude?: number;
  speed?: number;
  heading?: number;
  source?: string;
  batteryLevel?: number;
  isMoving?: boolean;
  recordedAt: string;
}

// ─── User Profile (for non-staff users) ───

export interface UserProfile {
  id: string;
  name: string;
  phone: string;
  email?: string;
  role: string;
  avatarUrl?: string;
  isActive: boolean;
}

// ─── NFA (Note for Approval) ───

export interface NFA {
  id: string;
  referenceNo: string;
  title: string;
  description?: string;
  category?: string;
  priority: "low" | "normal" | "urgent";
  status: "draft" | "pending_exec" | "pending_treasurer" | "approved" | "po_created" | "completed" | "rejected" | "cancelled";
  totalEstimatedAmount?: number;
  requiredExecApprovals: number;
  currentExecApprovals: number;
  currentExecRejections: number;
  items: NFAItem[];
  approvals: NFAApproval[];
  createdBy: string;
  creatorName?: string;
  treasurerApprovedBy?: string;
  treasurerApproverName?: string;
  treasurerApprovedAt?: string;
  treasurerRemarks?: string;
  purchaseOrderId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface NFAItem {
  id: string;
  itemName: string;
  specification?: string;
  quantity: number;
  unit?: string;
  l1VendorName?: string;
  l1UnitPrice?: number;
  l1TotalPrice?: number;
  l2VendorName?: string;
  l2UnitPrice?: number;
  l2TotalPrice?: number;
  l3VendorName?: string;
  l3UnitPrice?: number;
  l3TotalPrice?: number;
  selectedQuote?: "l1" | "l2" | "l3";
  justification?: string;
}

export interface NFAApproval {
  id: string;
  userId: string;
  userName: string;
  userRole: string;
  action: "approved" | "rejected";
  remarks?: string;
  createdAt: string;
}

export interface NFAStats {
  draft: number;
  pending: number;
  approved: number;
  completed: number;
  rejected: number;
  total: number;
}

export interface ModuleInfo {
  moduleKey: string;
  moduleName: string;
  isEnabled: boolean;
}
