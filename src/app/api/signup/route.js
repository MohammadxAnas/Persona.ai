import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { sendConfirmationEmail } from "@/middlewares/confirmation";

const prisma = new PrismaClient(); // Use a single instance of Prisma

export async function POST(req) {  
  try {
    const body = await req.json();
    const {  name, email, password } = body;

 
    const find = await prisma.user.findUnique({
      where: { email: email },
    });

    if (find) {
      return Response.json({ error: "User already registered" }, { status: 400 });
    }


    const confirmationCode = crypto.randomInt(100000, 999999).toString();
    const codeExpiresAt = new Date(Date.now() + 10 * 60 * 1000); // Code expires in 10 min

  
    const tempUser = {
      name,
      email,
      password: await bcrypt.hash(password, 10),
      confirmationCode,
      codeExpiresAt,
    };

    console.log(tempUser);

    await sendConfirmationEmail(email, confirmationCode);

    return Response.json({ 
      message: "Confirmation email sent! Please verify your email.", 
      success: true,
      userData: tempUser, 
    }, { status: 200 });

  } catch (error) {
    console.error("Error registering user:", error);
    return Response.json({ 
      message: "Internal Server Error", 
      success: false 
    }, { status: 500 });
  }
}
