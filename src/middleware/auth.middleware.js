import jwt from "jsonwebtoken"
import config from "../config/config.js"
import userModel from "../models/user.model.js"

function extractToken(req) {
    return req.cookies?.token || req.headers?.authorization?.split(" ")[1]
}

// Verifies a logged-in user (any role) and attaches req.userId / req.userRole
export function verifyToken(req, res, next) {
    const token = extractToken(req)

    if (!token) {
        return res.status(401).json({ success: false, message: "Unauthorized: No token provided" })
    }

    try {
        const decoded = jwt.verify(token, config.JWT_SECRET)
        req.userId = decoded.id
        req.userRole = decoded.role || "user"
        next()
    } catch (err) {
        return res.status(401).json({ success: false, message: "Unauthorized: Invalid or expired token" })
    }
}

// Like verifyToken but does not fail if no token is present (req.userId stays undefined)
export function optionalAuth(req, res, next) {
    const token = extractToken(req)
    if (!token) return next()

    try {
        const decoded = jwt.verify(token, config.JWT_SECRET)
        req.userId = decoded.id
        req.userRole = decoded.role || "user"
    } catch {
        // ignore invalid token for optional auth
    }
    next()
}

// Requires the verified user to have role "admin"
export async function requireAdmin(req, res, next) {
    if (!req.userId) {
        return res.status(401).json({ success: false, message: "Unauthorized: No token provided" })
    }
    if (req.userRole !== "admin") {
        return res.status(403).json({ success: false, message: "Forbidden: Admin access required" })
    }

    try {
        const admin = await userModel.findById(req.userId)
        if (!admin || admin.role !== "admin") {
            return res.status(403).json({ success: false, message: "Forbidden: Admin access required" })
        }
        if (admin.isBlocked) {
            return res.status(403).json({ success: false, message: "Account is blocked" })
        }
        next()
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message })
    }
}

// Blocks access for users whose account has been blocked by an admin
export async function checkNotBlocked(req, res, next) {
    if (!req.userId) return next()
    try {
        const user = await userModel.findById(req.userId)
        if (user?.isBlocked) {
            return res.status(403).json({ success: false, message: "Your account has been blocked. Contact support." })
        }
        next()
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message })
    }
}
