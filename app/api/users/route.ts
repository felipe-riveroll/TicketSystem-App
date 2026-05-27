import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";

export async function GET(request: NextRequest) {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const url = new URL(request.url);
  const teamId = url.searchParams.get("team_id");

  let result;

  if (teamId) {
    result = await db
      .select({
        id: users.id,
        name: users.name,
        avatarIcon: users.avatarIcon,
      })
      .from(users)
      .where(and(eq(users.teamId, Number(teamId)), eq(users.isActive, true)));
  } else {
    result = await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        role: users.role,
        avatarIcon: users.avatarIcon,
        teamId: users.teamId,
      })
      .from(users)
      .where(eq(users.isActive, true));
  }

  return NextResponse.json(result);
}
