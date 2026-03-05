import { betterAuth } from "better-auth";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { twoFactor } from "better-auth/plugins";
import { MongoClient } from "mongodb";

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
      // Will be wired to nodemailer in Task 13
      console.log(`[Auth] Password reset for ${user.email}: ${url}`);
    },
  },

  emailVerification: {
    sendOnSignUp: true,
    sendVerificationEmail: async ({ user, url }) => {
      // Will be wired to nodemailer in Task 13
      console.log(`[Auth] Verify email for ${user.email}: ${url}`);
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

  plugins: [
    twoFactor({
      otpOptions: {
        async sendOTP({ user, otp }) {
          // Will be wired to nodemailer in Task 13
          console.log(`[Auth] 2FA OTP for ${user.email}: ${otp}`);
        },
      },
    }),
  ],
});
