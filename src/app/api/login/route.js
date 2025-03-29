import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");

export async function POST(req) {
  try {
    const { email, password } = await req.json();

    const user = await prisma.user.findUnique({
      where: { email },
    });
    console.log(user);
    if (!user) {
      return Response.json({ error: "User Not Found!" }, { status: 400 });
    }

    const isPassEqual = await bcrypt.compare(password, user.password);
    if (!isPassEqual) {
      return Response.json(
        { message: "Incorrect password. Please try again.", success: false },
        { status: 403 }
      );
    }

    if (user.sessionToken !== null) {
      return Response.json(
        { message: "User already logged in from another device", success: false },
        { status: 403 }
      );
    }

    // Generate session token
    const sessionToken = crypto.randomBytes(32).toString("hex");

    // Update the user with the new session token
    await prisma.user.update({
      where: { email },
      data: { sessionToken },
    });

    // Generate JWT token
    const jwtToken = jwt.sign(
      { email: user.email, _id: user.id, sessionToken },
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
