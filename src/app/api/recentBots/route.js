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

    console.log("-->>",)

if (!userId || !botId || !type) {
  throw new Error("Missing userId, botId, or type");
}

const now = new Date();

let upsertData = {
  where: {},
  update: { viewedAt: now },
  create: {
    userId: userId,
    viewedAt: now,
  },
};

if (type === "USER") {
  upsertData.where = {
    userId_aiCharacterId: {
      userId,
      aiCharacterId: botId,
    },
  };
  upsertData.create.aiCharacterId = botId;
} else if (type === "DEFAULT") {
  upsertData.where = {
    userId_dftCharacterId: {
      userId,
      dftCharacterId: botId,
    },
  };
  upsertData.create.dftCharacterId = botId;
} else {
  throw new Error("Invalid bot type");
}


await prisma.recentBot.upsert(upsertData);

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
