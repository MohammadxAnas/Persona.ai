import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
const bcrypt = require('bcryptjs');
const crypto = require("crypto");
import { sendConfirmationEmail } from "@/middlewares/confirmation";

const tempUsers = {};

export async function POST(req) {  // Use named export for POST request
 try{
  const body = await req.json();
  const { type, name, email, password, code } = body;
  console.log(type);

  if (!type) {
    return Response.json({ message: "Request type required!" }, { status: 400 });
  }
  if(type === "signup"){

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
 }

if(type === "verify"){
  
      if (!email || !code) {
        console.log("1")
        return Response.json({ message: "Email and confirmation code required!" }, { status: 400 });
       
      }
      console.log(tempUsers);
      if (!tempUsers[email]) {
          console.log("2")
        return Response.json({ message: "Invalid or expired confirmation code" }, { status: 400 });
      
      }
  
      const { name, password, confirmationCode, codeExpiresAt } = tempUsers[email];
  
      if (confirmationCode !== code) {
          console.log("3")
        return Response.json({ message: "Incorrect confirmation code" }, { status: 400 });
       
      }
  
      // Create user in the database
      const user = await prisma.user.create({
        data: { name, email, password ,confirmationCode, codeExpiresAt},
      });
  
      // Remove temp user after successful signup
      delete tempUsers[email];
  
      return Response.json({ message: "Email confirmed! You can now log in.", success: true }, { status: 200 });
}
return Response.json({ message: "Invalid request type!" }, { status: 400 });

} catch (error) {
  console.error("Error registering user:", error);
  Response.json({ message:  "Internal Server Error",success: false }, { status: 500 });
}
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