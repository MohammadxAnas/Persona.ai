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
    const SessionId = searchParams.get("sesId");

    if (!SessionId) {
      return NextResponse.json({ error: "Session ID is required" }, { status: 400 });
    }

    await prisma.$transaction([
      prisma.message.deleteMany({ where: { chatSessionId: SessionId } }),
      prisma.chatSession.delete({ where: { id: SessionId } }),
    ]);
    

    return NextResponse.json({ status: 200 });

  } catch (err) {
    console.error("Error deleting bot:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
