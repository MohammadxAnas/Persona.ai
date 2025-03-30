const jwt = require("jsonwebtoken");
const User = require("../models/user");

const validateSession = async (req, res, next) => {
    try {
        const authHeader = req.header('Authorization');

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(403).json({ message: "Unauthorized, JWT token is required" });
        }
        const token = authHeader.split(' ')[1];

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded._id);

        if (!user || user.sessionToken !== decoded.sessionToken) {
            return res.status(401).json({ message: "Session expired. Login again." });
        }

        req.user = user; // Attach user data to request
        next();
    } catch (error) {
        console.error("Session validation error:", error);
        res.status(401).json({ message: "Invalid session" });
    }
};

module.exports = validateSession;