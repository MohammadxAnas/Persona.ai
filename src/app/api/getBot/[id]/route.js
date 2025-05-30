import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import validateSession from "@/middlewares/validateSession";

const prisma = new PrismaClient();

export async function GET(req, { params }) {
  const session = await validateSession(req);
  console.log(">",session.user.id)
  if (session.status !== 200) {
    return NextResponse.json({ message: session.message, success: false }, { status: session.status });
  }

  const id = params.id;
  if (!id) {
    return NextResponse.json({ success: false, error: "Bot ID required" }, { status: 400 });
  }

  try {
    let bot = await prisma.aICharacter.findUnique({ where: { id } });
    let botType = "USER";
    let isDFT = false;

  
    if (!bot) {
      bot = await prisma.dFTcharacter.findUnique({ where: { id } });
      botType = "DEFAULT";
      isDFT = true;
    }

    if (!bot) {
      return NextResponse.json({ success: false, error: "Bot not found" }, { status: 404 });
    }

    const chatSessions = await prisma.chatSession.findMany({
      where: {
        userId: session.user.id,
        ...(isDFT
          ? { dftCharacterId: bot.id }
          : { aiCharacterId: bot.id }),
      },
      orderBy: { startedAt: "desc" },
    });

    const latestSession = chatSessions[0] || null;

    return NextResponse.json({
      success: true,
      bot,
      botType,
      chatSessionId: latestSession?.id || null,
      chatSessions,
    });

  } catch (err) {
    console.error("Error fetching bot:", err);
    return NextResponse.json({ success: false, error: "Failed to fetch bot" }, { status: 500 });
  }
}
