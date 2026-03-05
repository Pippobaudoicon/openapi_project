/**
 * Cleanup script: drop old collections and clear Better Auth data
 * for a fresh start with Better Auth authentication.
 * 
 * Usage: NODE_ENV=development node scripts/cleanup-fresh-start.js
 *    or: node scripts/cleanup-fresh-start.js  (uses .env)
 */
import "../config/env.js";
import { MongoClient } from "mongodb";
import { createInterface } from "readline";

const MONGODB_URI = process.env.MONGODB_URI;

function confirm(question) {
  const rl = createInterface({ input: process.stdin, output: process.stdout });
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer.toLowerCase() === "y");
    });
  });
}

async function cleanup() {
  if (process.env.NODE_ENV === "production") {
    console.error("ERROR: This script cannot be run in production.");
    process.exit(1);
  }

  const ok = await confirm(
    "This will DELETE all user and auth data. Are you sure? (y/N) "
  );
  if (!ok) {
    console.log("Aborted.");
    process.exit(0);
  }

  const client = new MongoClient(MONGODB_URI);
  await client.connect();
  const db = client.db();

  console.log("Connected to:", MONGODB_URI.replace(/\/\/.*@/, "//<credentials>@"));
  console.log("");

  // 1. Drop old collections that are no longer needed
  const toDrop = ["users", "sessions"];
  for (const name of toDrop) {
    try {
      const exists = await db.listCollections({ name }).hasNext();
      if (exists) {
        await db.collection(name).drop();
        console.log(`✓ Dropped collection: ${name}`);
      } else {
        console.log(`- Collection '${name}' does not exist, skipping`);
      }
    } catch (err) {
      console.log(`✗ Error dropping '${name}':`, err.message);
    }
  }

  console.log("");

  // 2. Clear Better Auth collections (user, session, account, verification, twoFactor)
  const toClear = ["user", "session", "account", "verification", "twoFactor"];
  for (const name of toClear) {
    try {
      const exists = await db.listCollections({ name }).hasNext();
      if (exists) {
        const result = await db.collection(name).deleteMany({});
        console.log(`✓ Cleared collection: ${name} (${result.deletedCount} docs removed)`);
      } else {
        console.log(`- Collection '${name}' does not exist, skipping`);
      }
    } catch (err) {
      console.log(`✗ Error clearing '${name}':`, err.message);
    }
  }

  console.log("");

  // 3. Clear user-specific app data (optional — removes search history, credit transactions, activities)
  const appDataCollections = ["searchhistories", "credit_transactions", "activities"];
  for (const name of appDataCollections) {
    try {
      const exists = await db.listCollections({ name }).hasNext();
      if (exists) {
        const result = await db.collection(name).deleteMany({});
        console.log(`✓ Cleared app data: ${name} (${result.deletedCount} docs removed)`);
      } else {
        console.log(`- Collection '${name}' does not exist, skipping`);
      }
    } catch (err) {
      console.log(`✗ Error clearing '${name}':`, err.message);
    }
  }

  console.log("");

  // 4. Verify remaining collections
  const remaining = await db.listCollections().toArray();
  console.log("Remaining collections:", remaining.map(c => c.name).join(", "));

  await client.close();
  console.log("\n✓ Cleanup complete. You can now register fresh users via Better Auth.");
}

cleanup().catch((err) => {
  console.error("Cleanup failed:", err);
  process.exit(1);
});
