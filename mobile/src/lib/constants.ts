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
