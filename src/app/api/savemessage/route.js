import validateSession from "@/middlewares/validateSession";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient(); 

export async function POST(req) {
  try {
    const session = await validateSession(req);
    if (session.status !== 200) {
      return Response.json({ message: session.message, success: false }, { status: session.status });
    }

    const body = await req.json();
    const { userId, characterId, messages, sessionId } = body;
    console.log("logs->", userId, characterId, messages, sessionId);

    let chatSession;
    let isDFT = false;

   
    const Bot = await prisma.aICharacter.findUnique({
      where: {
        id: characterId,
      }
    });

  
    let bot = null;
    if (!Bot) {
      bot = await prisma.dFTcharacter.findUnique({
        where: { id: characterId },
      });
      if (!bot) {
        return Response.json({ success: false, message: "Character not found" }, { status: 404 });
      }
      isDFT = true;

    
      if (!bot.userId) {
        await prisma.dFTcharacter.update({
          where: { id: characterId },
          data: { userId },
        });
      }
    }

 
    if (!sessionId) {
      chatSession = await prisma.chatSession.create({
        data: {
          userId,
          aiCharacterId: isDFT ? undefined : characterId,
          dftCharacterId: isDFT ? characterId : undefined,
        }
      });
    } else {
      chatSession = await prisma.chatSession.findUnique({
        where: {
          id: sessionId,
        }
      });

      if (!chatSession || chatSession.userId !== userId) {
        return Response.json({ success: false, message: "Invalid session" }, { status: 403 });
      }
    }

    // Save messages
    await prisma.message.createMany({
      data: messages.map((msg) => ({
        userId,
        aiCharacterId: isDFT ? undefined : characterId,
        dftCharacterId: isDFT ? characterId : undefined,
        chatSessionId: chatSession.id,
        sender: msg.sender === "user" ? "USER" : "AI",
        content: msg.text,
      }))
    });

    // Return all sessions for the same character and user
    const sessions = await prisma.chatSession.findMany({
      where: {
        userId,
        ...(isDFT
          ? { dftCharacterId: characterId }
          : { aiCharacterId: characterId }),
      },
      orderBy: {
        startedAt: "desc",
      }
    });

    return Response.json({
      sessionId: chatSession.id,
      session: sessions,
      success: true,
    }, { status: 200 });

  } catch (error) {
    console.error("Error:", error);
    return Response.json({
      message: "Save failed",
      success: false
    }, { status: 500 });
  }
}
