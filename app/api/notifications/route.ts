import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { notifications, users, teams } from "@/lib/db/schema";
import { eq, desc, inArray } from "drizzle-orm";

export async function GET(request: NextRequest) {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const result = await db
    .select({
      id: notifications.id,
      ticketId: notifications.ticketId,
      teamId: notifications.teamId,
      userId: notifications.userId,
      type: notifications.type,
      message: notifications.message,
      isRead: notifications.isRead,
      createdAt: notifications.createdAt,
    })
    .from(notifications)
    .where(eq(notifications.teamId, 2))
    .orderBy(desc(notifications.createdAt))
    .limit(100);

  const enriched = await Promise.all(
    result.map(async (notif) => {
      const [userRow] = notif.userId
        ? await db.select({ fullName: users.fullName, avatarIcon: users.avatarIcon }).from(users).where(eq(users.id, notif.userId)).limit(1)
        : [null];
      const [teamRow] = notif.teamId
        ? await db.select({ name: teams.name, iconId: teams.iconId }).from(teams).where(eq(teams.id, notif.teamId)).limit(1)
        : [null];
      return {
        ...notif,
        users: userRow ? { full_name: userRow.fullName, avatar_icon: userRow.avatarIcon } : null,
        teams: teamRow ? { name: teamRow.name, icon_id: teamRow.iconId } : null,
      };
    })
  );

  return NextResponse.json(enriched);
}

export async function PATCH(request: NextRequest) {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();

  if (body.ids && Array.isArray(body.ids)) {
    // Mark all as read
    await db
      .update(notifications)
      .set({ isRead: true })
      .where(inArray(notifications.id, body.ids));
    return NextResponse.json({ success: true });
  }

  if (body.id) {
    // Mark single as read
    await db
      .update(notifications)
      .set({ isRead: true })
      .where(eq(notifications.id, body.id));
    return NextResponse.json({ success: true });
  }

  return NextResponse.json({ error: "Invalid request" }, { status: 400 });
}

export async function DELETE(request: NextRequest) {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();

  if (body.ids && Array.isArray(body.ids)) {
    // Clear all
    await db.delete(notifications).where(inArray(notifications.id, body.ids));
    return NextResponse.json({ success: true });
  }

  if (body.id) {
    // Delete single
    await db.delete(notifications).where(eq(notifications.id, body.id));
    return NextResponse.json({ success: true });
  }

  return NextResponse.json({ error: "Invalid request" }, { status: 400 });
}
