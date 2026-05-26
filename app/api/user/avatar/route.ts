import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function PATCH(request: NextRequest) {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const userId = (session.user as any).id;

  const [updated] = await db
    .update(users)
    .set({ avatarIcon: body.avatar_icon })
    .where(eq(users.id, userId))
    .returning();

  return NextResponse.json(updated);
}
