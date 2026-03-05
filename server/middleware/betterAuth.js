import { MongoClient } from "mongodb";

let db;

async function getDb() {
  if (db) return db;
  const client = new MongoClient(process.env.MONGODB_URI);
  await client.connect();
  db = client.db();
  return db;
}

/**
 * Looks up a Better Auth session from the request cookie.
 * Returns { session, user } if valid, or null if not.
 */
async function lookupSession(req) {
  const cookieHeader = req.headers.cookie || "";
  const sessionCookie = cookieHeader
    .split(";")
    .map((c) => c.trim())
    .find((c) => c.startsWith("better-auth.session_token="));

  if (!sessionCookie) return null;

  const tokenValue = decodeURIComponent(sessionCookie.split("=")[1]);
  // Better Auth token format: "token.signature" — extract the token part
  const token = tokenValue.includes(".") ? tokenValue.split(".")[0] : tokenValue;

  const database = await getDb();
  const session = await database.collection("session").findOne({
    token,
    expiresAt: { $gt: new Date() },
  });

  if (!session) return null;

  const user = await database.collection("user").findOne({ _id: session.userId });
  if (!user) return null;

  return { session, user };
}

/**
 * Builds the req.user object from a Better Auth user document.
 */
function buildReqUser(user) {
  // Convert _id to string to avoid BSON version conflicts between
  // the raw MongoDB driver (used here) and Mongoose (used in routes).
  // Mongoose's findById() accepts string IDs and converts internally.
  const id = user._id.toString();
  return {
    _id: id,
    id,
    email: user.email,
    firstName: user.firstName || "",
    lastName: user.lastName || "",
    role: user.role || "user",
    isActive: user.emailVerified || false,
    company: user.company || "",
    phone: user.phone || "",
    creditBalance: user.creditBalance ?? 0,
    creditLimit: user.creditLimit ?? 0,
    creditSettings: user.creditSettings || null,
  };
}

/**
 * Requires a valid Better Auth session. Returns 401 if missing/invalid.
 */
export async function requireAuth(req, res, next) {
  try {
    const result = await lookupSession(req);
    if (!result) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    req.user = buildReqUser(result.user);
    next();
  } catch (error) {
    console.error("[Auth] Session validation error:", error);
    return res.status(500).json({ error: "Authentication error" });
  }
}

/**
 * Optional auth — attaches user if session exists, but doesn't block.
 */
export async function optionalAuth(req, res, next) {
  try {
    const result = await lookupSession(req);
    if (result) {
      req.user = buildReqUser(result.user);
    }
  } catch {
    // No valid session — continue without req.user
  }
  next();
}
