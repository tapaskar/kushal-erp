import { db } from "@/db";
import { societyModules, societyRolePermissions } from "@/db/schema";

// ─── Module Definitions ───

export const DEFAULT_MODULE_DEFINITIONS = [
  {
    moduleKey: "staff_management",
    moduleName: "Staff Management",
    description: "Shifts, tasks, patrols, cleaning, SOS alerts",
    isEnabled: true,
  },
  {
    moduleKey: "visitor_management",
    moduleName: "Visitor Management",
    description: "Visitor check-in/out and pre-approval",
    isEnabled: true,
  },
  {
    moduleKey: "inventory",
    moduleName: "Inventory",
    description: "Asset tracking and barcode scanning",
    isEnabled: true,
  },
  {
    moduleKey: "nfa_procurement",
    moduleName: "NFA Procurement",
    description: "Note for Approval creation, multi-level approval, and purchase orders",
    isEnabled: true,
  },
  {
    moduleKey: "complaints",
    moduleName: "Complaints",
    description: "Raise, track, and resolve complaints",
    isEnabled: true,
  },
  {
    moduleKey: "notices",
    moduleName: "Notices & Announcements",
    description: "Post and view society announcements",
    isEnabled: true,
  },
  {
    moduleKey: "meetings",
    moduleName: "Meetings & Resolutions",
    description: "AGM/SGM/committee meeting scheduling, minutes, and resolutions",
    isEnabled: false,
  },
  {
    moduleKey: "facility_booking",
    moduleName: "Facility Booking",
    description: "Community hall, clubhouse, gym, and pool booking",
    isEnabled: false,
  },
  {
    moduleKey: "documents",
    moduleName: "Document Repository",
    description: "Society bylaws, NOCs, certificates, and meeting minutes",
    isEnabled: false,
  },
  {
    moduleKey: "financial_reports",
    moduleName: "Financial Reports",
    description: "Income/expense statements, balance sheets, and budgets",
    isEnabled: true,
  },
  {
    moduleKey: "vendor_management",
    moduleName: "Vendor Management",
    description: "Vendor registration, approval, and category management",
    isEnabled: true,
  },
  {
    moduleKey: "billing_payments",
    moduleName: "Billing & Payments",
    description: "Maintenance bills, payment tracking, and defaulters",
    isEnabled: true,
  },
] as const;

// ─── Permission Definitions ───
// Format: { role, roleType, moduleKey, permission, isGranted }

type PermEntry = {
  role: string;
  roleType: "user" | "staff";
  moduleKey: string;
  permission: string;
  isGranted: boolean;
};

// Helper to create permission entries for a role
function userPerms(
  role: string,
  perms: Record<string, boolean>
): PermEntry[] {
  return Object.entries(perms).map(([key, granted]) => {
    const [moduleKey, permission] = key.split(".");
    return { role, roleType: "user" as const, moduleKey, permission, isGranted: granted };
  });
}

function staffPerms(
  role: string,
  perms: Record<string, boolean>
): PermEntry[] {
  return Object.entries(perms).map(([key, granted]) => {
    const [moduleKey, permission] = key.split(".");
    return { role, roleType: "staff" as const, moduleKey, permission, isGranted: granted };
  });
}

export const DEFAULT_ROLE_PERMISSIONS: PermEntry[] = [
  // ─── society_admin ───
  ...userPerms("society_admin", {
    "nfa_procurement.create": true,
    "nfa_procurement.view": true,
    "nfa_procurement.approve_exec": false,
    "nfa_procurement.approve_treasurer": false,
    "nfa_procurement.create_po": true,
    "nfa_procurement.export_pdf": true,
    "staff_management.view": true,
    "staff_management.manage": true,
    "complaints.view": true,
    "complaints.manage": true,
    "notices.view": true,
    "notices.create": true,
    "financial_reports.view": true,
    "vendor_management.view": true,
    "vendor_management.manage": true,
    "facility_booking.view": true,
    "facility_booking.manage": true,
    "configure_permissions.manage": true,
  }),

  // ─── estate_manager ───
  ...userPerms("estate_manager", {
    "nfa_procurement.create": true,
    "nfa_procurement.view": true,
    "nfa_procurement.approve_exec": false,
    "nfa_procurement.approve_treasurer": false,
    "nfa_procurement.create_po": true,
    "nfa_procurement.export_pdf": true,
    "staff_management.view": true,
    "staff_management.manage": true,
    "complaints.view": true,
    "complaints.manage": true,
    "notices.view": true,
    "notices.create": true,
    "financial_reports.view": false,
    "vendor_management.view": true,
    "vendor_management.manage": true,
    "facility_booking.view": true,
    "facility_booking.manage": true,
    "configure_permissions.manage": false,
  }),

  // ─── president ───
  ...userPerms("president", {
    "nfa_procurement.create": false,
    "nfa_procurement.view": true,
    "nfa_procurement.approve_exec": false,
    "nfa_procurement.approve_treasurer": false,
    "nfa_procurement.create_po": false,
    "nfa_procurement.export_pdf": true,
    "staff_management.view": true,
    "staff_management.manage": false,
    "complaints.view": true,
    "complaints.manage": false,
    "notices.view": true,
    "notices.create": true,
    "financial_reports.view": true,
    "vendor_management.view": false,
    "vendor_management.manage": false,
    "facility_booking.view": true,
    "facility_booking.manage": false,
    "configure_permissions.manage": false,
  }),

  // ─── vice_president ───
  ...userPerms("vice_president", {
    "nfa_procurement.create": false,
    "nfa_procurement.view": true,
    "nfa_procurement.approve_exec": false,
    "nfa_procurement.approve_treasurer": false,
    "nfa_procurement.create_po": false,
    "nfa_procurement.export_pdf": true,
    "staff_management.view": false,
    "staff_management.manage": false,
    "complaints.view": true,
    "complaints.manage": false,
    "notices.view": true,
    "notices.create": false,
    "financial_reports.view": false,
    "vendor_management.view": false,
    "vendor_management.manage": false,
    "facility_booking.view": true,
    "facility_booking.manage": false,
    "configure_permissions.manage": false,
  }),

  // ─── secretary ───
  ...userPerms("secretary", {
    "nfa_procurement.create": false,
    "nfa_procurement.view": true,
    "nfa_procurement.approve_exec": false,
    "nfa_procurement.approve_treasurer": false,
    "nfa_procurement.create_po": false,
    "nfa_procurement.export_pdf": true,
    "staff_management.view": true,
    "staff_management.manage": false,
    "complaints.view": true,
    "complaints.manage": true,
    "notices.view": true,
    "notices.create": true,
    "financial_reports.view": false,
    "vendor_management.view": false,
    "vendor_management.manage": false,
    "facility_booking.view": true,
    "facility_booking.manage": true,
    "configure_permissions.manage": false,
  }),

  // ─── joint_secretary ───
  ...userPerms("joint_secretary", {
    "nfa_procurement.create": false,
    "nfa_procurement.view": true,
    "nfa_procurement.approve_exec": false,
    "nfa_procurement.approve_treasurer": false,
    "nfa_procurement.create_po": false,
    "nfa_procurement.export_pdf": true,
    "staff_management.view": false,
    "staff_management.manage": false,
    "complaints.view": true,
    "complaints.manage": false,
    "notices.view": true,
    "notices.create": true,
    "financial_reports.view": false,
    "vendor_management.view": false,
    "vendor_management.manage": false,
    "facility_booking.view": true,
    "facility_booking.manage": false,
    "configure_permissions.manage": false,
  }),

  // ─── treasurer ───
  ...userPerms("treasurer", {
    "nfa_procurement.create": false,
    "nfa_procurement.view": true,
    "nfa_procurement.approve_exec": false,
    "nfa_procurement.approve_treasurer": true,
    "nfa_procurement.create_po": false,
    "nfa_procurement.export_pdf": true,
    "staff_management.view": false,
    "staff_management.manage": false,
    "complaints.view": true,
    "complaints.manage": false,
    "notices.view": true,
    "notices.create": false,
    "financial_reports.view": true,
    "vendor_management.view": false,
    "vendor_management.manage": false,
    "facility_booking.view": true,
    "facility_booking.manage": false,
    "configure_permissions.manage": false,
  }),

  // ─── joint_treasurer ───
  ...userPerms("joint_treasurer", {
    "nfa_procurement.create": false,
    "nfa_procurement.view": true,
    "nfa_procurement.approve_exec": false,
    "nfa_procurement.approve_treasurer": true,
    "nfa_procurement.create_po": false,
    "nfa_procurement.export_pdf": true,
    "staff_management.view": false,
    "staff_management.manage": false,
    "complaints.view": false,
    "complaints.manage": false,
    "notices.view": true,
    "notices.create": false,
    "financial_reports.view": true,
    "vendor_management.view": false,
    "vendor_management.manage": false,
    "facility_booking.view": true,
    "facility_booking.manage": false,
    "configure_permissions.manage": false,
  }),

  // ─── executive_member ───
  ...userPerms("executive_member", {
    "nfa_procurement.create": false,
    "nfa_procurement.view": true,
    "nfa_procurement.approve_exec": true,
    "nfa_procurement.approve_treasurer": false,
    "nfa_procurement.create_po": false,
    "nfa_procurement.export_pdf": true,
    "staff_management.view": false,
    "staff_management.manage": false,
    "complaints.view": true,
    "complaints.manage": false,
    "notices.view": true,
    "notices.create": false,
    "financial_reports.view": false,
    "vendor_management.view": false,
    "vendor_management.manage": false,
    "facility_booking.view": true,
    "facility_booking.manage": false,
    "configure_permissions.manage": false,
  }),

  // ─── committee_member (legacy) ───
  ...userPerms("committee_member", {
    "nfa_procurement.create": false,
    "nfa_procurement.view": true,
    "nfa_procurement.approve_exec": false,
    "nfa_procurement.approve_treasurer": false,
    "nfa_procurement.create_po": false,
    "nfa_procurement.export_pdf": true,
    "staff_management.view": false,
    "staff_management.manage": false,
    "complaints.view": true,
    "complaints.manage": false,
    "notices.view": true,
    "notices.create": false,
    "financial_reports.view": false,
    "vendor_management.view": false,
    "vendor_management.manage": false,
    "facility_booking.view": true,
    "facility_booking.manage": false,
    "configure_permissions.manage": false,
  }),

  // ─── resident ───
  ...userPerms("resident", {
    "nfa_procurement.create": false,
    "nfa_procurement.view": false,
    "nfa_procurement.approve_exec": false,
    "nfa_procurement.approve_treasurer": false,
    "nfa_procurement.create_po": false,
    "nfa_procurement.export_pdf": false,
    "staff_management.view": true,
    "staff_management.manage": false,
    "complaints.view": true,
    "complaints.manage": false,
    "notices.view": true,
    "notices.create": false,
    "financial_reports.view": false,
    "vendor_management.view": false,
    "vendor_management.manage": false,
    "facility_booking.view": true,
    "facility_booking.manage": false,
    "configure_permissions.manage": false,
  }),

  // ─── Staff Roles ───

  // security
  ...staffPerms("security", {
    "staff_management.shifts": true,
    "staff_management.tasks": true,
    "staff_management.patrol": true,
    "staff_management.cleaning": false,
    "staff_management.reports": false,
    "staff_management.sos": true,
    "visitor_management.view": true,
    "visitor_management.manage": true,
    "inventory.view": false,
    "inventory.manage": false,
  }),

  // housekeeping
  ...staffPerms("housekeeping", {
    "staff_management.shifts": true,
    "staff_management.tasks": true,
    "staff_management.patrol": false,
    "staff_management.cleaning": true,
    "staff_management.reports": false,
    "staff_management.sos": true,
    "visitor_management.view": false,
    "visitor_management.manage": false,
    "inventory.view": false,
    "inventory.manage": false,
  }),

  // supervisor
  ...staffPerms("supervisor", {
    "staff_management.shifts": true,
    "staff_management.tasks": true,
    "staff_management.patrol": true,
    "staff_management.cleaning": false,
    "staff_management.reports": true,
    "staff_management.sos": true,
    "visitor_management.view": false,
    "visitor_management.manage": false,
    "inventory.view": true,
    "inventory.manage": true,
  }),

  // maintenance
  ...staffPerms("maintenance", {
    "staff_management.shifts": true,
    "staff_management.tasks": true,
    "staff_management.patrol": true,
    "staff_management.cleaning": false,
    "staff_management.reports": false,
    "staff_management.sos": true,
    "visitor_management.view": false,
    "visitor_management.manage": false,
    "inventory.view": false,
    "inventory.manage": false,
  }),

  // electrician
  ...staffPerms("electrician", {
    "staff_management.shifts": true,
    "staff_management.tasks": true,
    "staff_management.patrol": true,
    "staff_management.cleaning": false,
    "staff_management.reports": false,
    "staff_management.sos": true,
    "visitor_management.view": false,
    "visitor_management.manage": false,
    "inventory.view": false,
    "inventory.manage": false,
  }),

  // plumber
  ...staffPerms("plumber", {
    "staff_management.shifts": true,
    "staff_management.tasks": true,
    "staff_management.patrol": true,
    "staff_management.cleaning": false,
    "staff_management.reports": false,
    "staff_management.sos": true,
    "visitor_management.view": false,
    "visitor_management.manage": false,
    "inventory.view": false,
    "inventory.manage": false,
  }),

  // gardener
  ...staffPerms("gardener", {
    "staff_management.shifts": true,
    "staff_management.tasks": true,
    "staff_management.patrol": false,
    "staff_management.cleaning": false,
    "staff_management.reports": false,
    "staff_management.sos": true,
    "visitor_management.view": false,
    "visitor_management.manage": false,
    "inventory.view": true,
    "inventory.manage": false,
  }),
];

// ─── Seed Function ───

export async function seedSocietyPermissions(
  societyId: string,
  configuredBy?: string
) {
  // 1. Insert module definitions
  for (const mod of DEFAULT_MODULE_DEFINITIONS) {
    await db
      .insert(societyModules)
      .values({
        societyId,
        moduleKey: mod.moduleKey,
        moduleName: mod.moduleName,
        description: mod.description,
        isEnabled: mod.isEnabled,
        configuredBy: configuredBy || null,
      })
      .onConflictDoNothing();
  }

  // 2. Insert role permissions
  for (const perm of DEFAULT_ROLE_PERMISSIONS) {
    await db
      .insert(societyRolePermissions)
      .values({
        societyId,
        role: perm.role,
        roleType: perm.roleType,
        moduleKey: perm.moduleKey,
        permission: perm.permission,
        isGranted: perm.isGranted,
        configuredBy: configuredBy || null,
      })
      .onConflictDoNothing();
  }
}
