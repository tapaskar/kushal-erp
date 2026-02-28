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
