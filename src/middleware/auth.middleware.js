import jwt from "jsonwebtoken"
import config from "../config/config.js"

export function verifyToken(req, res, next) {
    const token = req.cookies?.refreshToken || req.headers?.authorization?.split(" ")[1]

    if (!token) {
        return res.status(401).json({ success: false, message: "Unauthorized: No token provided" })
    }

    try {
        const decoded = jwt.verify(token, config.JWT_SECRET)
        req.userId = decoded.id
        next()
    } catch (err) {
        return res.status(401).json({ success: false, message: "Unauthorized: Invalid token" })
    }
}
