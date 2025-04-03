import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export async function POST(req) {
    try {
      const body = await req.json();
      const { code, email, name, password, confirmationCode, codeExpiresAt } = body;

      console.log("Email:", email);
      console.log("Code:", code);
      console.log("Name:", name);
      console.log("Password:", password);
      console.log("Confirmation Code:", confirmationCode);
      console.log("Code Expiry:", codeExpiresAt);
    
      if (!email || !code || !name || !password || !confirmationCode || !codeExpiresAt) {
        console.log("1 - Missing Fields");
        return Response.json({ message: "All fields are required!", success: false }, { status: 400 });
      }
              
              if (confirmationCode !== code) {
                  console.log("3")
                return Response.json({ message: "Incorrect confirmation code" }, { status: 400 });
               
              }
          
              // Create user in the database
              const user = await prisma.user.create({
                data: { name, email, password, confirmationCode, codeExpiresAt, isVerified: true},
              });
          
              console.log("User Created:", user);

              return Response.json({ message: "Email confirmed! ", success: true, password: password }, { status: 200 });
    } catch (error) {
        console.error("Error registering user:", error);
        return Response.json({ message:  "Internal Server Error",success: false }, { status: 500 });
    }
}