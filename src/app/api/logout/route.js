import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
import validateSession from "@/middlewares/validateSession";

export async function POST(req) {
    try {
        const session = await validateSession(req);
        if (session.status !== 200) {
        return Response.json({ message: session.message, success: false }, { status: session.status });
        }
        
        const body = await req.json();  
        const email = body.email;  
        console.log(email);

        if (!email) {
            return Response.json({ message: "Email is required", success: false }, { status: 400 });
        }

        // Find user
        const user = await prisma.user.findUnique({
            where: { email },
        });

        if (!user) {
            return Response.json({ message: "User not found", success: false }, { status: 404 });
        }

        // Remove session token
        await prisma.user.update({
            where: { email },
            data: { sessionToken: null },
        });

        return Response.json({ message: "Logged out successfully", success: true }, { status: 200 });

    } catch (error) {
        console.error("Logout error:", error);
        return Response.json({ message: "Internal server error", success: false }, { status: 500 });
    }
}


export async function DELETE(req) {
  try {
    const session = await validateSession(req);
    if (session.status !== 200) {
      return Response.json({ message: session.message, success: false }, { status: session.status });
    }

    const userId = session.user.id;

    await prisma.message.deleteMany({ where: { userId } });
    await prisma.chatSession.deleteMany({ where: { userId } });
    await prisma.recentBot.deleteMany({ where: { userId } });
    await prisma.persona.deleteMany({ where: { userId } });
    await prisma.AICharacter.deleteMany({ where: { userId } });

  
    await prisma.user.delete({ where: { id: userId } });

    return Response.json({ success: true, message: "Account deleted successfully." });
  } catch (error) {
    console.error("Account deletion failed:", error);
    return Response.json({ success: false, message: "Failed to delete account." }, { status: 500 });
  }
}
