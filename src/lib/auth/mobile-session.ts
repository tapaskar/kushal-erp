import { SignJWT, jwtVerify } from "jose";

const SECRET = new TextEncoder().encode(
  process.env.AUTH_SECRET || "dev-secret-change-in-production-min-32-chars!!"
);

export interface MobileSessionPayload {
  userId: string;
  userType: "staff" | "user";
  // Staff fields (when userType = "staff")
  staffId?: string;
  staffRole?: string;
  // User fields (when userType = "user")
  userRole?: string;
  // Common fields
  name: string;
  phone: string;
  email?: string;
  societyId: string;
}

export async function createMobileToken(
  payload: MobileSessionPayload
): Promise<string> {
  return new SignJWT(payload as unknown as Record<string, unknown>)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("30d")
    .sign(SECRET);
}

export async function verifyMobileToken(
  token: string
): Promise<MobileSessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, SECRET);
    return payload as unknown as MobileSessionPayload;
  } catch {
    return null;
  }
}

export async function getMobileSession(
  request: Request
): Promise<MobileSessionPayload | null> {
  const authHeader = request.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) return null;

  const token = authHeader.slice(7);
  return verifyMobileToken(token);
}
