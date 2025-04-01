import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export async function POST(req) {
    try {
        const body = await req.json();
        const { code, email } = body;

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
    } catch (error) {
        console.error("Error registering user:", error);
        Response.json({ message:  "Internal Server Error",success: false }, { status: 500 });
    }
}