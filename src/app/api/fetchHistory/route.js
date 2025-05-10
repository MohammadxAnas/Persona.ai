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
    const { sessionId, id , userId } = body;

    if (!sessionId || !id || !userId) {
      return Response.json({ message: "sessionId and id are required", success: false }, { status: 400 });
    }

    const messages = await prisma.message.findMany({
      where: {
        chatSessionId: sessionId,
        characterId: id,
        userId: userId
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
