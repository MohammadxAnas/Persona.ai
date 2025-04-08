import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient(); // Use a single instance of Prisma

export async function POST(req) {  
  try {
    const body = await req.json();
    const {  botName, botDesc, botPersona, userId } = body;

    const bot = await prisma.aICharacter.create({
        data: { name: botName,
                description: botDesc,
                personality: botPersona,
                userId: userId},
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