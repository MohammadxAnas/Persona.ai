import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require("crypto");
import { sendConfirmationEmail } from "@/middlewares/confirmation";

const tempUsers = {};

export async function POST(req) {  // Use named export for POST request
 try{
  const { name, email, password } = await req.json();
  const find = await prisma.user.findUnique({
    where: { email: email },
  });
  if(find){
    return Response.json({ error: "User already registered" }, { status: 400 });
  }
  const confirmationCode = crypto.randomInt(100000, 999999).toString();
  const codeExpiresAt = new Date(Date.now() + 10 * 60 * 1000); // Code expires in 10 min

  tempUsers[email]={
    name,
    email,
    password: await bcrypt.hash(password,10),
    confirmationCode,
    codeExpiresAt,
};
console.log(tempUsers);
await sendConfirmationEmail(email, confirmationCode);

return Response.json({ message:  "Confirmation email sent! Please verify your email.",success: true }, { status: 200 });

} catch (error) {
  console.error("Error registering user:", error);
  res.status(500).json({ message: "Internal Server Error" });
}

    const user = await prisma.user.create({
        data: { name, email, password },
      });
    
      return Response.json(user, { status: 201 });
  
 
}

export async function GET(req) {  //  Use named export for GET request
  const users = await prisma.user.findMany();
  return Response.json(users, { status: 200 });
}


export async function DELETE(req) {  
    const { email } = await req.json();
    const user = await prisma.user.findUnique({
        where: { email: email },
      });
    if(!user){
        return Response.json({ error: "User email is required" }, { status: 400 });
    }
    await prisma.user.delete({
        where: { email },
      });
      return Response.json({ message: "User deleted successfully" }, { status: 200 });
  }