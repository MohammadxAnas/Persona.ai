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
  const chatSessionId = searchParams.get("chatSessionId");
  const userId = searchParams.get("userId");

  try {

    let persona = null;

    if (chatSessionId) {
      persona = await prisma.persona.findUnique({
        where: { chatSessionId },
      });
    }

    if (!persona && userId) {
      persona = await prisma.persona.findUnique({
        where: { userId },
      });
    }

    return NextResponse.json({ success: true, persona });

  } catch (err) {
    console.error("Error fetching persona:", err);
    return NextResponse.json({ success: false, error: "Failed to fetch persona" }, { status: 500 });
  }
}
