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
    console.log("logs->",userId,characterId,messages,sessionId);

    const bot = await prisma.dFTcharacter.findUnique({
      where:{
        id: characterId,
        userId: userId
      }
    })
    const Bot = await prisma.aICharacter.findUnique({
       where:{
        id: characterId,
        userId: userId
      }
    })
    if(!bot && !Bot){
      await prisma.dFTcharacter.update({
        where: {id: characterId},
        data:{
          userId: userId
        }
      })
    }

    let chatSession;

    if(!sessionId){
        chatSession = await prisma.chatSession.create({
            data: {
                userId,
                characterId,
            }
        })
    }

   else{
       chatSession = await prisma.chatSession.findUnique({
        where: {id: sessionId,
          userId: userId
        }
       })
   }
   
    await prisma.message.createMany({
    data: messages.map((msg) =>({
        userId, 
        characterId,
        chatSessionId: chatSession.id,
        sender: msg.sender === "user" ? "USER" : "AI",
        content: msg.text,
    }))
   })
   const sessions = await prisma.chatSession.findMany({
    where: {
      characterId : characterId,
      userId: userId
    },
    orderBy : {
      startedAt : "desc"
    }
   })
   console.log(sessions)
    return Response.json({ 
      sessionId: chatSession.id , 
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