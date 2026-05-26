import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { teams } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await request.json();

  const updateData: Record<string, any> = {};
  if (body.name !== undefined) updateData.name = body.name;
  if (body.icon_id !== undefined) updateData.iconId = body.icon_id;
  if (body.is_active !== undefined) updateData.isActive = body.is_active;

  const [updated] = await db
    .update(teams)
    .set(updateData)
    .where(eq(teams.id, Number(id)))
    .returning();

  return NextResponse.json(updated);
}
