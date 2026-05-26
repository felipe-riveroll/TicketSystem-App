import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { tasks } from "@/lib/db/schema";
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
  if (body.status !== undefined) updateData.status = body.status;
  if (body.title !== undefined) updateData.title = body.title;
  if (body.description !== undefined) updateData.description = body.description;
  if (body.end_date !== undefined) updateData.endDate = body.end_date;
  if (body.assigned_to !== undefined) updateData.assignedTo = body.assigned_to;

  const [updated] = await db
    .update(tasks)
    .set(updateData)
    .where(eq(tasks.id, Number(id)))
    .returning();

  return NextResponse.json(updated);
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  await db.delete(tasks).where(eq(tasks.id, Number(id)));

  return NextResponse.json({ success: true });
}
