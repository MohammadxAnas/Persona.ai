import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");

export async function POST(req) {
  console.log("hitting");
  try {
    const { email, password, Password } = await req.json();
    
    console.log(email);
    console.log(password);
    console.log(Password);
    

    let user = await prisma.user.findUnique({
      where: { email },
    });

    console.log("User fetched:", user);

    if (!user) {
      return Response.json({ error: "User Not Found!" }, { status: 400 });
    }
    const passToCompare = Password || password;

    const isPassEqual = await bcrypt.compare(passToCompare, user.password);

    
    console.log(isPassEqual);
    if (!isPassEqual) {
      return Response.json(
        { message: "Incorrect password. Please try again.", success: false },
        { status: 403 }
      );
    }

    // 💡 Re-fetch the user from DB after updating
    if (user.sessionToken) {
      console.log("Error: User already logged in");
      return Response.json(
        { message: "User already logged in from another device", success: false },
        { status: 403 }
      );
    }

    // Generate session token
    const sessionToken = crypto.randomBytes(32).toString("hex");

    // Update session token in the database
    await prisma.user.update({
      where: { email },
      data: { sessionToken },
    });

    //  Re-fetch the user to get the updated sessionToken
    user = await prisma.user.findUnique({
      where: { email },
    });

    console.log("Updated User:", user);

    // Generate JWT token
    const jwtToken = jwt.sign(
      { email: user.email, _id: user.id, sessionToken: user.sessionToken },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );

    return Response.json(
      {
        message: "Login successful",
        success: true,
        jwtToken,
        email,
        name: user.name,
      },
      { status: 200 }
    );
  } catch (err) {
    console.error("Login Error:", err);
    return Response.json({ message: "Login failed", success: false }, { status: 500 });
  }
}
