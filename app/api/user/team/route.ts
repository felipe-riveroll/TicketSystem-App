import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { users, teams } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function GET(request: NextRequest) {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = session.user as any;

  if (!user.teamId) return NextResponse.json({ teamName: null });

  const [team] = await db
    .select({ name: teams.name })
    .from(teams)
    .where(eq(teams.id, user.teamId))
    .limit(1);

  return NextResponse.json({ teamName: team?.name ?? null });
}
