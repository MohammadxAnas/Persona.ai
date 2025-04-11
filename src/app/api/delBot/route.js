import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import validateSession from "@/middlewares/validateSession";

const prisma = new PrismaClient();

export async function DELETE(req) {
  try {
    const session = await validateSession(req);
    if (session.status !== 200) {
      return Response.json({ message: session.message, success: false }, { status: session.status });
    }

    const { searchParams } = new URL(req.url);
    const botId = searchParams.get("botId");

    if (!botId) {
      return NextResponse.json({ error: "Bot ID is required" }, { status: 400 });
    }

    const existingBot = await prisma.aICharacter.findUnique({
      where: { id: botId },
    });

    if (!existingBot) {
      return NextResponse.json({ error: "Bot not found" }, { status: 404 });
    }

    await prisma.aICharacter.delete({
      where: { id: botId },
    });

    return NextResponse.json({ message: "Bot deleted successfully" }, { status: 200 });

  } catch (err) {
    console.error("Error deleting bot:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
