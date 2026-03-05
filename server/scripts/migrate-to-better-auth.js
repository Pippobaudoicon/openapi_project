import "../config/env.js";
import { MongoClient } from "mongodb";

const MONGODB_URI = process.env.MONGODB_URI;

async function migrate() {
  const client = new MongoClient(MONGODB_URI);
  await client.connect();
  const db = client.db();

  const usersCollection = db.collection("users"); // Mongoose collection name
  const baUserCollection = db.collection("user"); // Better Auth collection
  const baAccountCollection = db.collection("account"); // Better Auth accounts

  const users = await usersCollection.find({}).toArray();
  console.log(`Found ${users.length} users to migrate`);

  let migrated = 0;
  let skipped = 0;

  for (const user of users) {
    // Check if already migrated
    const existing = await baUserCollection.findOne({ email: user.email });
    if (existing) {
      console.log(`  SKIP: ${user.email} (already exists)`);
      skipped++;
      continue;
    }

    const id = user._id.toString();

    // Create Better Auth user record
    await baUserCollection.insertOne({
      _id: id,
      id,
      name: [user.firstName, user.lastName].filter(Boolean).join(" ") || user.email,
      email: user.email,
      emailVerified: user.isActive || false,
      image: null,
      createdAt: user.createdAt || new Date(),
      updatedAt: user.updatedAt || new Date(),
      // Custom fields
      firstName: user.firstName || "",
      lastName: user.lastName || "",
      company: user.company || "",
      phone: user.phone || "",
      role: user.role || "user",
      creditBalance: user.creditBalance ?? 100,
      creditLimit: user.creditLimit ?? 1000,
      creditSettings: user.creditSettings || null,
    });

    // Create Better Auth account record (credential type with existing bcrypt hash)
    await baAccountCollection.insertOne({
      id: `acc_${id}`,
      userId: id,
      accountId: id,
      providerId: "credential",
      password: user.password, // Existing bcrypt hash
      createdAt: user.createdAt || new Date(),
      updatedAt: user.updatedAt || new Date(),
    });

    console.log(`  OK: ${user.email}`);
    migrated++;
  }

  console.log(`\nMigration complete: ${migrated} migrated, ${skipped} skipped`);
  await client.close();
}

migrate().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
