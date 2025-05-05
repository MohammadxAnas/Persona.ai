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
    const { userName, userDesc, userId } = body;

    if (!userName || !userDesc) {
      return Response.json({ message: "Missing required persona fields", success: false }, { status: 400 });
    }

    if (!userId) {
      return Response.json({
        message: "User ID is required to create persona",
        success: false
      }, { status: 400 });
    }

    const persona = await prisma.persona.create({
      data: {
        name: userName,
        description: userDesc,
        userId: userId,
      },
    });

    return Response.json({ message: "Saved successfully!", success: true, persona }, { status: 200 });

  } catch (error) {
    console.error("Error creating persona:", error);
    return Response.json({ message: "Internal Server Error", success: false }, { status: 500 });
  }
}
import { NextResponse } from "next/server";


export async function GET(req) {
  const session = await validateSession(req);
  if (session.status !== 200) {
    return NextResponse.json({ message: session.message, success: false }, { status: session.status });
  }

  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("userId");

  try {

    if (!userId) {
      return NextResponse.json({ success: false, error: "User ID required" }, { status: 400 });
    }

    const personas = await prisma.persona.findMany({
      where: { userId : userId,
      },
    });

    if (!personas) {
      return NextResponse.json({ success: false, error: "Default persona not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, personas });

  } catch (err) {
    console.error("Error fetching persona:", err);
    return NextResponse.json({ success: false, error: "Failed to fetch persona" }, { status: 500 });
  }
}


export async function DELETE(req) {
  const session = await validateSession(req);
  if (session.status !== 200) {
    return NextResponse.json({ message: session.message, success: false }, { status: session.status });
  }

  const { searchParams } = new URL(req.url);
  const Id = searchParams.get("Id");

  try {

    if (!Id) {
      return NextResponse.json({ success: false, error: "ID required" }, { status: 400 });
    }

    const personas = await prisma.persona.delete({
      where: { id : Id,
      },
    });

  
    return NextResponse.json({ success: true, message: "Deleted Successfully" });

  } catch (err) {
    console.error("Error deleting persona:", err);
    return NextResponse.json({ success: false, error: "Failed to delete persona" }, { status: 500 });
  }
}
