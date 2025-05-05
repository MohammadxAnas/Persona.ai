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
    const { userName, userDesc, userId } = body;

    if (!userName || !userDesc) {
      return Response.json({ message: "Missing required persona fields", success: false }, { status: 400 });
    }

    if (!userId) {
      return Response.json({
        message: "User ID is required to create persona",
        success: false
      }, { status: 400 });
    }

    const existing = await prisma.persona.findFirst({
      where: {
        userId: userId,
        default: true,
      },
    });
    
    if (!existing) {
      return Response.json({ message: "Internal Server Error", success: false }, { status: 500 });
    }
    
    const persona = await prisma.persona.update({
      where: {
        id: existing.id, 
      },
      data: {
        name: userName,
        description: userDesc,
      },
    });

    return Response.json({ message: "Saved successfully!", success: true, persona }, { status: 200 });

  } catch (error) {
    console.error("Error creating persona:", error);
    return Response.json({ message: "Internal Server Error", success: false }, { status: 500 });
  }
}
