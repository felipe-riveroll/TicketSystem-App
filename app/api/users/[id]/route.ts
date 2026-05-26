import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq, inArray } from "drizzle-orm";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await request.json();

  const updateData: Record<string, any> = {};
  if (body.full_name !== undefined) updateData.fullName = body.full_name;
  if (body.email !== undefined) updateData.email = body.email;
  if (body.avatar_icon !== undefined) updateData.avatarIcon = body.avatar_icon;
  if (body.is_active !== undefined) updateData.isActive = body.is_active;
  if (body.team_id !== undefined) updateData.teamId = body.team_id;
  if (body.role !== undefined) updateData.role = body.role;

  const [updated] = await db
    .update(users)
    .set(updateData)
    .where(eq(users.id, Number(id)))
    .returning();

  return NextResponse.json(updated);
}
