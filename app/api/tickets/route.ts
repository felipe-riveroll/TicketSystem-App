import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { tickets, notifications } from "@/lib/db/schema";
import { eq, desc, and } from "drizzle-orm";

export async function GET(request: NextRequest) {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = session.user as any;
  const isAdmin = user.role === "admin";
  const teamId = user.teamId;

  let query = db
    .select({
      id: tickets.id,
      description: tickets.description,
      type: tickets.type,
      priority: tickets.priority,
      status: tickets.status,
      arrivalTime: tickets.arrivalTime,
      maxWaitMinutes: tickets.maxWaitMinutes,
      teamId: tickets.teamId,
      userId: tickets.userId,
      isActive: tickets.isActive,
    })
    .from(tickets)
    .where(eq(tickets.isActive, true));

  if (!isAdmin && teamId) {
    query = db
      .select({
        id: tickets.id,
        description: tickets.description,
        type: tickets.type,
        priority: tickets.priority,
        status: tickets.status,
        arrivalTime: tickets.arrivalTime,
        maxWaitMinutes: tickets.maxWaitMinutes,
        teamId: tickets.teamId,
        userId: tickets.userId,
        isActive: tickets.isActive,
      })
      .from(tickets)
      .where(and(eq(tickets.isActive, true), eq(tickets.teamId, teamId)));
  } else if (!isAdmin) {
    return NextResponse.json([]);
  }

  const result = await query.orderBy(desc(tickets.arrivalTime));

  const enriched = await Promise.all(
    result.map(async (ticket) => {
      const { users, teams } = await import("@/lib/db/schema");
      const [userRow] = ticket.userId
        ? await db.select({ fullName: users.fullName, avatarIcon: users.avatarIcon }).from(users).where(eq(users.id, ticket.userId)).limit(1)
        : [null];
      const [teamRow] = ticket.teamId
        ? await db.select({ name: teams.name, iconId: teams.iconId }).from(teams).where(eq(teams.id, ticket.teamId)).limit(1)
        : [null];
      return {
        ...ticket,
        users: userRow ? { full_name: userRow.fullName, avatar_icon: userRow.avatarIcon } : null,
        teams: teamRow ? { name: teamRow.name, icon_id: teamRow.iconId } : null,
      };
    })
  );

  return NextResponse.json(enriched);
}

export async function POST(request: NextRequest) {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const { description, type, priority, max_wait_minutes, team_id, user_id } = body;

  const [inserted] = await db
    .insert(tickets)
    .values({
      description,
      type,
      priority: priority || "Media",
      status: "Pendiente",
      maxWaitMinutes: max_wait_minutes,
      teamId: team_id,
      userId: user_id,
      isActive: true,
    })
    .returning();

  // Replace trigger: create notification for Sistemas team
  await db.insert(notifications).values({
    ticketId: inserted.id,
    teamId: 2,
    userId: user_id,
    type: "ticket_created",
    message: `Nuevo ticket creado: ${description.slice(0, 80)}`,
    isRead: false,
  });

  return NextResponse.json(inserted);
}
