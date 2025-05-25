import validateSession from "@/middlewares/validateSession";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient(); 

export async function POST(req) {  
  try {
    const session = await validateSession(req);
    if (session.status !== 200) {
      return Response.json({ message: session.message, success: false }, { status: session.status });
    }

    const body = await req.json();
    const {  userId, botId, type } = body;

    console.log("-->>", userId, botId, type)

if (!userId || !botId || !type) {
  console.log("err");
  throw new Error("Missing userId, botId, or type");
}

const now = new Date();
let recentBot;

if (type === "USER") {
  recentBot = await prisma.recentBot.findFirst({
    where: {
      userId,
      aiCharacterId: botId,
    },
  });

  if (recentBot) {
    await prisma.recentBot.update({
      where: { id: recentBot.id },
      data: { viewedAt: now },
    });
  } else {
    await prisma.recentBot.create({
      data: {
        userId,
        aiCharacterId: botId,
        viewedAt: now,
      },
    });
  }

} else if (type === "DEFAULT") {
  recentBot = await prisma.recentBot.findFirst({
    where: {
      userId,
      dftCharacterId: botId,
    },
  });

  if (recentBot) {
    await prisma.recentBot.update({
      where: { id: recentBot.id },
      data: { viewedAt: now },
    });
  } else {
    await prisma.recentBot.create({
      data: {
        userId,
        dftCharacterId: botId,
        viewedAt: now,
      },
    });
  }
}


    return Response.json({ 
      success: true, 
    }, { status: 200 });

  } catch (error) {
    console.error("Error:", error);
    return Response.json({ 
      message: "Internal Server Error", 
      success: false 
    }, { status: 500 });
  }
}


import { NextResponse } from "next/server";

export async function GET(req) {
  const session = await validateSession(req);
  if (session.status !== 200) {
    return Response.json({ message: session.message, success: false }, { status: session.status });
  }

  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("userId");
  console.log(userId);

  if (!userId) {
    return NextResponse.json({ success: false, error: "User ID required" }, { status: 400 });
  }

  try {
    const bots = await prisma.recentBot.findMany({
      where: { userId },
      orderBy: {
        viewedAt : "desc"
      }
    });

    return NextResponse.json({ success: true, bots });
  } catch (err) {
    console.error("Database error:", err);  
    return NextResponse.json({ success: false, error: "Failed to fetch bots" }, { status: 500 });
  }
}
