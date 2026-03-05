import { betterAuth } from "better-auth";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { twoFactor } from "better-auth/plugins";
import { MongoClient } from "mongodb";
import bcrypt from "bcrypt";

const client = new MongoClient(
  process.env.MONGODB_URI || "mongodb://localhost:27017/openapi"
);
const db = client.db();

export const auth = betterAuth({
  database: mongodbAdapter(db, { client }),
  baseURL: process.env.BETTER_AUTH_URL || "http://localhost:3001",
  basePath: "/auth",
  secret: process.env.BETTER_AUTH_SECRET || process.env.SESSION_SECRET,
  appName: "OpenAPI Platform",

  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
    sendResetPassword: async ({ user, url }) => {
      const { sendEmail } = await import("~/server/utils/email");
      await sendEmail(
        user.email,
        "Password Reset Request",
        `<h1>Reset Your Password</h1>
         <p>Click the link below to reset your password:</p>
         <a href="${url}">${url}</a>
         <p>This link will expire in 1 hour.</p>`
      );
    },
  },

  emailVerification: {
    sendOnSignUp: true,
    sendVerificationEmail: async ({ user, url }) => {
      const { sendEmail } = await import("~/server/utils/email");
      await sendEmail(
        user.email,
        "Verify Your Email",
        `<h1>Email Verification</h1>
         <p>Click the link below to verify your email address:</p>
         <a href="${url}">${url}</a>`
      );
    },
  },

  session: {
    expiresIn: 60 * 60 * 24, // 24 hours default
    updateAge: 60 * 60, // refresh session every hour
    cookieCache: {
      enabled: true,
      maxAge: 300, // 5 min cache
    },
  },

  user: {
    additionalFields: {
      firstName: { type: "string", required: false, input: true },
      lastName: { type: "string", required: false, input: true },
      company: { type: "string", required: false, input: true },
      phone: { type: "string", required: false, input: true },
      role: { type: "string", defaultValue: "user", input: false },
      creditBalance: { type: "number", defaultValue: 100, input: false },
      creditLimit: { type: "number", defaultValue: 1000, input: false },
    },
  },

  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    },
  },

  advanced: {
    password: {
      hash: async (password: string) => {
        return bcrypt.hash(password, 10);
      },
      verify: async ({ hash, password }: { hash: string; password: string }) => {
        // Migrated bcrypt hashes start with $2b$ or $2a$
        if (hash.startsWith("$2")) {
          return bcrypt.compare(password, hash);
        }
        return false;
      },
    },
  },

  plugins: [
    twoFactor({
      otpOptions: {
        async sendOTP({ user, otp }) {
          const { sendEmail } = await import("~/server/utils/email");
          await sendEmail(
            user.email,
            "Your Verification Code",
            `<h1>Your Code: ${otp}</h1>
             <p>This code expires in 3 minutes.</p>`
          );
        },
      },
    }),
  ],
});
