import { PrismaClient } from "@prisma/client";
import validateSession from "@/middlewares/validateSession";

const prisma = new PrismaClient();

export async function POST(req) {
  try {
    const session = await validateSession(req);
    if (session.status !== 200) {
      return Response.json({ message: session.message, success: false }, { status: session.status });
    }

    const body = await req.json();
    const { sessionId, id, userId } = body;

    if (!sessionId || !id || !userId) {
      return Response.json({ message: "sessionId, id, and userId are required", success: false }, { status: 400 });
    }

    // Check if character is AICharacter or DFTcharacter
    let bot = await prisma.aICharacter.findUnique({ where: { id } });
    let isDFT = false;

    if (!bot) {
      bot = await prisma.dFTcharacter.findUnique({ where: { id } });
      if (!bot) {
        return Response.json({ message: "Bot not found", success: false }, { status: 404 });
      }
      isDFT = true;
    }

    // Query messages based on correct character field
    const messages = await prisma.message.findMany({
      where: {
        chatSessionId: sessionId,
        userId,
        ...(isDFT
          ? { dftCharacter: { id: id } }
          : { aiCharacterId: id }),
      },
      orderBy: {
        createdAt: "asc",
      },
    });

    return Response.json({ messages, success: true }, { status: 200 });

  } catch (error) {
    console.error("Error fetching messages:", error);
    return Response.json({ message: "Internal Server Error", success: false }, { status: 500 });
  }
}
