import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import validateSession from "@/middlewares/validateSession";

const prisma = new PrismaClient();

export async function GET(req, { params }) {
  const session = await validateSession(req);
  if (session.status !== 200) {
    return NextResponse.json({ message: session.message, success: false }, { status: session.status });
  }

  const id = params.id;

  if (!id) {
    return NextResponse.json({ success: false, error: "Bot ID required" }, { status: 400 });
  }

  try {
    const bot = await prisma.aICharacter.findUnique({
      where: { id },
    });
    console.log(bot);
    return NextResponse.json({ success: true, bot });
  } catch (err) {
    return NextResponse.json({ success: false, error: "Failed to fetch bot" }, { status: 500 });
  }
}
