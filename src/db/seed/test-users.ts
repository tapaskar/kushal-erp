import { db } from "@/db";
import { users, userSocietyRoles } from "@/db/schema";

const SOCIETY_ID = "9ef20c27-bf8d-4c4d-95a4-ec0802e6b63a";

// Test users for the society
// Password for all users: admin123 (handled via Cognito or dev bypass)
const TEST_USERS = [
  {
    phone: "9900000001",
    name: "Rajesh Kumar",
    email: "rajesh@kushalheights.in",
    role: "society_admin" as const,
  },
  {
    phone: "9900000002",
    name: "Priya Sharma",
    email: "priya@kushalheights.in",
    role: "estate_manager" as const,
  },
  {
    phone: "9900000003",
    name: "Suresh Patel",
    email: "suresh@kushalheights.in",
    role: "president" as const,
  },
  {
    phone: "9900000004",
    name: "Anita Verma",
    email: "anita@kushalheights.in",
    role: "secretary" as const,
  },
  {
    phone: "9900000005",
    name: "Manoj Gupta",
    email: "manoj@kushalheights.in",
    role: "treasurer" as const,
  },
  // Executive members (3 for testing quorum with smaller set)
  {
    phone: "9900000010",
    name: "Amit Singh",
    email: "amit@kushalheights.in",
    role: "executive_member" as const,
  },
  {
    phone: "9900000011",
    name: "Neha Joshi",
    email: "neha@kushalheights.in",
    role: "executive_member" as const,
  },
  {
    phone: "9900000012",
    name: "Vikram Reddy",
    email: "vikram@kushalheights.in",
    role: "executive_member" as const,
  },
  // Resident
  {
    phone: "9900000020",
    name: "Deepak Mehta",
    email: "deepak@kushalheights.in",
    role: "resident" as const,
  },
];

async function seedTestUsers() {
  console.log("Seeding test users for society:", SOCIETY_ID);

  for (const u of TEST_USERS) {
    // Upsert user
    const [user] = await db
      .insert(users)
      .values({
        phone: u.phone,
        name: u.name,
        email: u.email,
      })
      .onConflictDoNothing()
      .returning();

    // If user already existed, fetch them
    let userId: string;
    if (user) {
      userId = user.id;
      console.log(`  Created user: ${u.name} (${u.phone}) -> ${userId}`);
    } else {
      const { eq } = await import("drizzle-orm");
      const [existing] = await db
        .select()
        .from(users)
        .where(eq(users.phone, u.phone))
        .limit(1);
      if (!existing) {
        console.error(`  Failed to create or find user: ${u.phone}`);
        continue;
      }
      userId = existing.id;
      console.log(`  User exists: ${u.name} (${u.phone}) -> ${userId}`);
    }

    // Assign role
    await db
      .insert(userSocietyRoles)
      .values({
        userId,
        societyId: SOCIETY_ID,
        role: u.role,
        isDefault: true,
      })
      .onConflictDoNothing();

    console.log(`  Assigned role: ${u.role}`);
  }

  console.log("\nDone! Test users seeded.");
  console.log("\nLogin credentials:");
  console.log("─────────────────────────────────────────");
  for (const u of TEST_USERS) {
    console.log(`  ${u.role.padEnd(20)} | Phone: ${u.phone} | Password: admin123`);
  }
  console.log("─────────────────────────────────────────");
}

seedTestUsers()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error("Seed failed:", e);
    process.exit(1);
  });
