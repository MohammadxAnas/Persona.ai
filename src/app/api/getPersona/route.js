import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import validateSession from "@/middlewares/validateSession";

const prisma = new PrismaClient();

export async function GET(req) {
  const session = await validateSession(req);
  if (session.status !== 200) {
    return NextResponse.json({ message: session.message, success: false }, { status: session.status });
  }

  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("userId");

  try {

    if (!userId) {
      return NextResponse.json({ success: false, error: "User ID required" }, { status: 400 });
    }

    const persona = await prisma.persona.findFirst({
      where: { userId : userId,
               default: true
      },
    });

    if (!persona) {
      return NextResponse.json({ success: false, error: "Default persona not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, persona });

  } catch (err) {
    console.error("Error fetching persona:", err);
    return NextResponse.json({ success: false, error: "Failed to fetch persona" }, { status: 500 });
  }
}
