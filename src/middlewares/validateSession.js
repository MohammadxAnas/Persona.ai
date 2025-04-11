import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();

const validateSession = async (req) => {
    try {
        const authHeader = req.headers.get("authorization");

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return { status: 403, message: "Unauthorized, JWT token is required" };
        }

        const token = authHeader.split(" ")[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const user = await prisma.user.findUnique({
            where: { email: decoded.email },
        });

        if (!user || user.sessionToken !== decoded.sessionToken) {
            return { status: 401, message: "Session expired. Login again." };
        }

        return { status: 200, user }; // Return user object if valid
    } catch (error) {
        console.error("Session validation error:", error);
        return { status: 401, message: "Invalid session" };
    }
};

export default validateSession;
