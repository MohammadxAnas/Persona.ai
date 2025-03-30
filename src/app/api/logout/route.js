import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export async function POST(req) {
    try {
        const body = await req.json();  // Ensure JSON is properly parsed
        const email = body.email;  
        console.log(email);

        if (!email) {
            return Response.json({ message: "Email is required", success: false }, { status: 400 });
        }

        // Find user
        const user = await prisma.user.findUnique({
            where: { email },
        });

        if (!user) {
            return Response.json({ message: "User not found", success: false }, { status: 404 });
        }

        // Remove session token
        await prisma.user.update({
            where: { email },
            data: { sessionToken: null },
        });

        return Response.json({ message: "Logged out successfully", success: true }, { status: 200 });

    } catch (error) {
        console.error("Logout error:", error);
        return Response.json({ message: "Internal server error", success: false }, { status: 500 });
    }
}
