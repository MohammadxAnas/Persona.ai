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
    const { userName, userDesc, userId, sessionId } = body;

    if (!userName || !userDesc) {
      return Response.json({ message: "Missing required persona fields", success: false }, { status: 400 });
    }

    if (!userId && !sessionId) {
      return Response.json({ message: "Either userId or chatsessionid is required", success: false }, { status: 400 });
    }

    const data = {
      name: userName,
      description: userDesc,
      ...(userId && { userId }),
      ...(sessionId && { chatSessionId: sessionId }),
    };

    const persona = await prisma.persona.create({ data });

    return Response.json({ message: "Saved successfully!", success: true, persona }, { status: 200 });

  } catch (error) {
    console.error("Error creating persona:", error);
    return Response.json({ message: "Internal Server Error", success: false }, { status: 500 });
  }
}
