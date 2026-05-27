import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "@/lib/db";
import * as schema from "@/lib/db/schema";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    schema,
    usePlural: true,
  }),
  emailAndPassword: {
    enabled: true,
  },
  user: {
    modelName: "user",
    additionalFields: {
      role: {
        type: "string",
        defaultValue: "user",
        input: false,
      },
      avatarIcon: {
        type: "string",
        required: false,
        fieldName: "avatar_icon",
        input: false,
      },
      teamId: {
        type: "number",
        required: false,
        fieldName: "team_id",
        input: false,
      },
      isActive: {
        type: "boolean",
        defaultValue: true,
        fieldName: "is_active",
        input: false,
      },
    },
  },
  session: {
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60,
    },
  },
});
