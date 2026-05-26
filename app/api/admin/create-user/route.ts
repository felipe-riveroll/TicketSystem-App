import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { hash } from "bcryptjs";

function generateRandomPassword(length = 8) {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()";
  let password = "";
  for (let i = 0; i < length; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: req.headers });
    if (!session?.user || (session.user as any).role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { full_name, email, avatar_icon, team_id } = body;

    if (!full_name || !email || !avatar_icon || !team_id) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const generatedPassword = generateRandomPassword(8);
    const hashedPassword = await hash(generatedPassword, 10);

    await db.insert(users).values({
      fullName: full_name,
      email,
      password: hashedPassword,
      avatarIcon: avatar_icon,
      teamId: team_id,
      role: "user",
      isActive: true,
    });

    return NextResponse.json({
      success: true,
      password: generatedPassword,
      message: `Miembro agregado. Contraseña temporal: ${generatedPassword}`,
    });
  } catch (error) {
    console.error("Unexpected error in create-user route:", error);
    return NextResponse.json({ error: "Error inesperado al agregar miembro" }, { status: 500 });
  }
}
