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
    const {  botName, botDesc, botPersona, avatar, userId, botGender } = body;

    const bot = await prisma.aICharacter.create({
        data: { name: botName,
                description: botDesc,
                personality: botPersona,
                avatar: avatar,
                userId: userId,
                gender: botGender
              },
      });

    return Response.json({ 
      message: "Bot created successfully!", 
      success: true, 
    }, { status: 200 });

  } catch (error) {
    console.error("Error:", error);
    return Response.json({ 
      message: "Internal Server Error", 
      success: false 
    }, { status: 500 });
  }
}