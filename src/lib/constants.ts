export const APP_NAME = "Kushal-RWA";

export const COMPLAINT_CATEGORIES = [
  "Plumbing",
  "Electrical",
  "Civil",
  "Housekeeping",
  "Security",
  "Noise",
  "Parking",
  "Lift",
  "Water Supply",
  "Pest Control",
  "Other",
] as const;

export const COMPLAINT_SLA_HOURS: Record<string, number> = {
  Plumbing: 24,
  Electrical: 12,
  Civil: 72,
  Housekeeping: 8,
  Security: 4,
  Noise: 12,
  Parking: 24,
  Lift: 6,
  "Water Supply": 12,
  "Pest Control": 48,
  Other: 48,
};

export const NAV_ITEMS = [
  { label: "Dashboard", href: "/", icon: "LayoutDashboard" },
  { label: "Society", href: "/society", icon: "Building2" },
  { label: "Members", href: "/members", icon: "Users" },
  { label: "Billing", href: "/billing", icon: "Receipt" },
  { label: "Payments", href: "/payments", icon: "CreditCard" },
  { label: "Defaulters", href: "/defaulters", icon: "AlertTriangle" },
  { label: "Inventory", href: "/inventory", icon: "Package" },
  { label: "Vendors", href: "/vendors", icon: "Store" },
  { label: "Procurement", href: "/procurement", icon: "ShoppingCart" },
  { label: "Notices", href: "/notices", icon: "Bell" },
  { label: "Complaints", href: "/complaints", icon: "MessageSquare" },
  { label: "Staff", href: "/staff", icon: "UserCog" },
  { label: "Housekeeping", href: "/housekeeping", icon: "Sparkles" },
  { label: "Reports", href: "/reports", icon: "BarChart3" },
] as const;

export const STAFF_SUB_NAV = [
  { label: "Overview", href: "/staff", icon: "UserCog" },
  { label: "Shifts", href: "/staff/shifts", icon: "Clock" },
  { label: "Tasks", href: "/staff/tasks", icon: "ClipboardList" },
  { label: "Patrols", href: "/staff/patrols", icon: "Shield" },
  { label: "Beacons", href: "/staff/beacons", icon: "Radio" },
  { label: "Visitors", href: "/staff/visitors", icon: "DoorOpen" },
  { label: "Incidents", href: "/staff/incidents", icon: "AlertTriangle" },
  { label: "SOS Alerts", href: "/staff/sos", icon: "Siren" },
  { label: "Cleaning", href: "/staff/cleaning", icon: "Sparkles" },
  { label: "Supplies", href: "/staff/supplies", icon: "Package" },
  { label: "Reports", href: "/staff/reports", icon: "BarChart3" },
] as const;

export const ASSET_CATEGORIES = [
  { value: "furniture", label: "Furniture" },
  { value: "electronics", label: "Electronics" },
  { value: "fire_safety", label: "Fire Safety" },
  { value: "dg_parts", label: "DG Parts" },
  { value: "cleaning", label: "Cleaning Supplies" },
  { value: "plumbing", label: "Plumbing" },
  { value: "electrical", label: "Electrical" },
  { value: "garden", label: "Garden" },
  { value: "sports", label: "Sports" },
  { value: "other", label: "Other" },
] as const;

export const ASSET_CONDITIONS = [
  { value: "new", label: "New", color: "bg-green-100 text-green-800" },
  { value: "good", label: "Good", color: "bg-blue-100 text-blue-800" },
  { value: "fair", label: "Fair", color: "bg-yellow-100 text-yellow-800" },
  { value: "poor", label: "Poor", color: "bg-orange-100 text-orange-800" },
  { value: "damaged", label: "Damaged", color: "bg-red-100 text-red-800" },
  { value: "disposed", label: "Disposed", color: "bg-gray-100 text-gray-800" },
] as const;

export const STOCK_MOVEMENT_REASONS = {
  stock_in: [
    { value: "purchase", label: "Purchase" },
    { value: "donation", label: "Donation" },
    { value: "return", label: "Return" },
    { value: "adjustment", label: "Adjustment" },
  ],
  stock_out: [
    { value: "consumed", label: "Consumed" },
    { value: "issued", label: "Issued" },
    { value: "damaged", label: "Damaged" },
    { value: "disposed", label: "Disposed" },
    { value: "adjustment", label: "Adjustment" },
  ],
} as const;

export const VENDOR_CATEGORIES = [
  // Product vendors
  { value: "housekeeping", label: "Housekeeping & Cleaning", type: "product" },
  { value: "heavy_machinery", label: "Heavy Machinery & Equipment", type: "product" },
  { value: "furniture", label: "Furniture", type: "product" },
  { value: "electronics", label: "Electronics & Appliances", type: "product" },
  { value: "fire_safety", label: "Fire Safety", type: "product" },
  { value: "dg_parts", label: "DG & Generator Parts", type: "product" },
  { value: "garden", label: "Garden & Landscaping Supplies", type: "product" },
  { value: "sports", label: "Sports Equipment", type: "product" },
  // Service vendors
  { value: "plumbing", label: "Plumbing", type: "service" },
  { value: "electrical", label: "Electrical", type: "service" },
  { value: "civil", label: "Civil & Construction", type: "service" },
  { value: "it_amc", label: "IT & AMC", type: "service" },
  { value: "security", label: "Security Services", type: "service" },
  { value: "pest_control", label: "Pest Control", type: "service" },
  { value: "lift_maintenance", label: "Lift Maintenance", type: "service" },
  { value: "painting", label: "Painting & Waterproofing", type: "service" },
  { value: "other", label: "Other", type: "service" },
] as const;

export const VENDOR_CATEGORY_LABEL: Record<string, string> = Object.fromEntries(
  VENDOR_CATEGORIES.map((c) => [c.value, c.label])
);

export const PR_PRIORITY_COLORS: Record<string, string> = {
  low: "bg-gray-100 text-gray-700",
  normal: "bg-blue-100 text-blue-700",
  urgent: "bg-red-100 text-red-700",
};

export const PO_STATUS_COLORS: Record<string, string> = {
  draft: "bg-gray-100 text-gray-700",
  pending_l1: "bg-yellow-100 text-yellow-800",
  pending_l2: "bg-orange-100 text-orange-800",
  pending_l3: "bg-amber-100 text-amber-800",
  approved: "bg-green-100 text-green-800",
  issued: "bg-blue-100 text-blue-800",
  delivered: "bg-emerald-100 text-emerald-800",
  cancelled: "bg-red-100 text-red-700",
};

export const PR_STATUS_COLORS: Record<string, string> = {
  draft: "bg-gray-100 text-gray-700",
  open: "bg-blue-100 text-blue-700",
  rfq_sent: "bg-purple-100 text-purple-700",
  quotes_received: "bg-yellow-100 text-yellow-700",
  po_created: "bg-orange-100 text-orange-700",
  completed: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-700",
};

export const QUANTITY_UNITS = [
  "pcs", "nos", "kg", "gm", "litre", "ml", "sqft", "sqm",
  "rmt", "bag", "box", "set", "pair", "roll", "bundle", "lot",
] as const;

export const ADMIN_NAV_ITEMS = [
  { label: "Dashboard", href: "/admin", icon: "LayoutDashboard" },
  { label: "Societies", href: "/admin/societies", icon: "Building2" },
  { label: "Users", href: "/admin/users", icon: "Users" },
] as const;

export const STAFF_ROLES = [
  { value: "security", label: "Security" },
  { value: "housekeeping", label: "Housekeeping" },
  { value: "maintenance", label: "Maintenance" },
  { value: "gardener", label: "Gardener" },
  { value: "electrician", label: "Electrician" },
  { value: "plumber", label: "Plumber" },
  { value: "supervisor", label: "Supervisor" },
] as const;

export const SHIFT_STATUS_COLORS: Record<string, string> = {
  scheduled: "bg-gray-100 text-gray-700",
  checked_in: "bg-green-100 text-green-700",
  checked_out: "bg-blue-100 text-blue-700",
  missed: "bg-red-100 text-red-700",
  cancelled: "bg-gray-100 text-gray-500",
};

export const STAFF_TASK_STATUS_COLORS: Record<string, string> = {
  pending: "bg-gray-100 text-gray-700",
  accepted: "bg-blue-100 text-blue-700",
  in_progress: "bg-yellow-100 text-yellow-700",
  completed: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-700",
};

export const PATROL_STATUS_COLORS: Record<string, string> = {
  pending: "bg-gray-100 text-gray-700",
  in_progress: "bg-yellow-100 text-yellow-700",
  completed: "bg-green-100 text-green-700",
  missed: "bg-red-100 text-red-700",
  partial: "bg-orange-100 text-orange-700",
};

export const VISITOR_STATUS_COLORS: Record<string, string> = {
  expected: "bg-yellow-100 text-yellow-700",
  checked_in: "bg-green-100 text-green-700",
  checked_out: "bg-blue-100 text-blue-700",
  rejected: "bg-red-100 text-red-700",
};

export const INCIDENT_SEVERITY_COLORS: Record<string, string> = {
  low: "bg-green-100 text-green-700",
  medium: "bg-yellow-100 text-yellow-700",
  high: "bg-orange-100 text-orange-700",
  critical: "bg-red-100 text-red-700",
};

export const INCIDENT_STATUS_COLORS: Record<string, string> = {
  reported: "bg-gray-100 text-gray-700",
  investigating: "bg-yellow-100 text-yellow-700",
  resolved: "bg-green-100 text-green-700",
  escalated: "bg-red-100 text-red-700",
};

export const CLEANING_STATUS_COLORS: Record<string, string> = {
  pending: "bg-gray-100 text-gray-700",
  in_progress: "bg-yellow-100 text-yellow-700",
  completed: "bg-green-100 text-green-700",
  verified: "bg-blue-100 text-blue-700",
  issue_reported: "bg-red-100 text-red-700",
};

export const VISITOR_TYPES = [
  { value: "guest", label: "Guest" },
  { value: "delivery", label: "Delivery" },
  { value: "cab", label: "Cab" },
  { value: "vendor", label: "Vendor" },
  { value: "service", label: "Service" },
  { value: "other", label: "Other" },
] as const;

export const CLEANING_ZONE_TYPES = [
  { value: "common_area", label: "Common Area" },
  { value: "staircase", label: "Staircase" },
  { value: "lobby", label: "Lobby" },
  { value: "parking", label: "Parking" },
  { value: "garden", label: "Garden" },
  { value: "terrace", label: "Terrace" },
  { value: "gym", label: "Gym" },
  { value: "pool", label: "Pool" },
] as const;

export const MAINTENANCE_FREQUENCIES = [
  { value: 30, label: "Monthly" },
  { value: 90, label: "Quarterly (3 months)" },
  { value: 180, label: "Half-Yearly (6 months)" },
  { value: 365, label: "Yearly" },
] as const;
