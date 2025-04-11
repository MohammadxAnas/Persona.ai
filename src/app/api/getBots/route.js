
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import validateSession from "@/middlewares/validateSession";
const prisma = new PrismaClient(); // Use a single instance of Prisma

export async function GET(req) {
  const session = await validateSession(req);
  if (session.status !== 200) {
    return Response.json({ message: session.message, success: false }, { status: session.status });
  }

  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("userId");

  if (!userId) {
    return NextResponse.json({ success: false, error: "User ID required" }, { status: 400 });
  }

  try {
    const bots = await prisma.aICharacter.findMany({
      where: { userId },
    });

    return NextResponse.json({ success: true, bots });
  } catch (err) {
    return NextResponse.json({ success: false, error: "Failed to fetch bots" }, { status: 500 });
  }
}
