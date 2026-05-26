import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { tasks } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";

export async function GET(request: NextRequest) {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const url = new URL(request.url);
  const teamId = url.searchParams.get("team_id");

  if (!teamId) return NextResponse.json({ error: "team_id required" }, { status: 400 });

  const result = await db
    .select()
    .from(tasks)
    .where(eq(tasks.teamId, Number(teamId)))
    .orderBy(desc(tasks.startDate));

  return NextResponse.json(result);
}

export async function POST(request: NextRequest) {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();

  const [inserted] = await db
    .insert(tasks)
    .values({
      title: body.title,
      description: body.description,
      status: body.status || "Tareas",
      startDate: new Date(),
      endDate: body.end_date ? new Date(body.end_date) : null,
      assignedTo: body.assigned_to || [],
      teamId: body.team_id,
    })
    .returning();

  return NextResponse.json(inserted);
}
