
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import validateSession from "@/middlewares/validateSession";
const prisma = new PrismaClient();

export async function GET(req) {
  const session = await validateSession(req);
  if (session.status !== 200) {
    return Response.json({ message: session.message, success: false }, { status: session.status });
  }

  try {
    const characters = await prisma.DFTcharacter.findMany();

    return NextResponse.json({ success: true, characters });
  } catch (err) {
    console.error("Database error:", err);  
    return NextResponse.json({ success: false, error: "Failed to fetch bots" }, { status: 500 });
  }
}
