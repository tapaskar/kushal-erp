// For local development with Android emulator, use 10.0.2.2 instead of localhost
// To use local backend, change the dev URL back to "http://10.0.2.2:3000"
export const API_BASE_URL = "https://d2ptd26i4ablj7.cloudfront.net";

export const STAFF_ROLES: Record<string, string> = {
  security: "Security",
  housekeeping: "Housekeeping",
  maintenance: "Maintenance",
  gardener: "Gardener",
  electrician: "Electrician",
  plumber: "Plumber",
  supervisor: "Supervisor",
};

export const USER_ROLES: Record<string, string> = {
  super_admin: "Super Admin",
  society_admin: "Society Admin",
  estate_manager: "Estate Manager",
  president: "President",
  vice_president: "Vice President",
  secretary: "Secretary",
  joint_secretary: "Joint Secretary",
  treasurer: "Treasurer",
  joint_treasurer: "Joint Treasurer",
  executive_member: "Executive Member",
  committee_member: "Committee Member",
  resident: "Resident",
};

export const NFA_STATUS_LABELS: Record<string, string> = {
  draft: "Draft",
  pending_exec: "Pending Exec Approval",
  pending_treasurer: "Pending Treasurer",
  approved: "Approved",
  po_created: "PO Created",
  completed: "Completed",
  rejected: "Rejected",
  cancelled: "Cancelled",
};

export const NFA_STATUS_COLORS: Record<string, string> = {
  draft: "#94a3b8",
  pending_exec: "#f59e0b",
  pending_treasurer: "#8b5cf6",
  approved: "#22c55e",
  po_created: "#3b82f6",
  completed: "#16a34a",
  rejected: "#ef4444",
  cancelled: "#6b7280",
};

export const TASK_STATUS_LABELS: Record<string, string> = {
  pending: "Pending",
  accepted: "Accepted",
  in_progress: "In Progress",
  completed: "Completed",
  cancelled: "Cancelled",
};

export const SHIFT_STATUS_LABELS: Record<string, string> = {
  scheduled: "Scheduled",
  checked_in: "Checked In",
  checked_out: "Checked Out",
  missed: "Missed",
  cancelled: "Cancelled",
};

export const PATROL_STATUS_LABELS: Record<string, string> = {
  pending: "Pending",
  in_progress: "In Progress",
  completed: "Completed",
  missed: "Missed",
  partial: "Partial",
};
