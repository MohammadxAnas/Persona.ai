import { PrismaClient } from "@prisma/client";
import { tempUsers } from "@/app/utlils/tempStorage";

const prisma = new PrismaClient();

export async function POST(req) {
  try {
    const { email, code } = await req.json();

    if (!email || !code) {
      console.log("1")
      return Response.json({ message: "Email and confirmation code required!" }, { status: 400 });
    
    }

    if (!tempUsers[email]) {
        console.log("2")
      return Response.json({ message: "Invalid or expired confirmation code" }, { status: 400 });
    
    }

    const { name, password, confirmationCode } = tempUsers[email];

    if (confirmationCode !== code) {
        console.log("3")
      return Response.json({ message: "Incorrect confirmation code" }, { status: 400 });
     
    }

    // Create user in the database
    const user = await prisma.user.create({
      data: { name, email, password },
    });

    // Remove temp user after successful signup
    delete tempUsers[email];

    return Response.json({ message: "Email confirmed! You can now log in.", success: true }, { status: 200 });

  } catch (error) {
    console.error("Error confirming email:", error);
    return Response.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
