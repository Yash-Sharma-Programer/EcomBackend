import userModel from "../models/user.model.js";
import jwt from "jsonwebtoken"
import config from "../config/config.js"
import bcrypt from "bcrypt"

function signToken(user) {
    return jwt.sign({ id: user._id, role: user.role }, config.JWT_SECRET, { expiresIn: "7d" })
}

function setAuthCookie(res, token) {
    res.cookie('token', token, {
        httpOnly: true,
        secure: config.NODE_ENV === 'production',
        sameSite: 'none',
        maxAge: 7 * 24 * 60 * 60 * 1000
    })
}

function publicUser(user) {
    return {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isBlocked: user.isBlocked
    }
}

export async function register(req, res) {
    try {
        const { name, email, password } = req.body

        if (!name || !email || !password) {
            return res.status(400).json({ success: false, message: "Name, email and password are required" })
        }
        if (password.length < 8) {
            return res.status(400).json({ success: false, message: "Password must be at least 8 characters" })
        }

        const isAlreadyRegistered = await userModel.findOne({ email: email.toLowerCase() })

        if (isAlreadyRegistered) {
            return res.status(409).json({
                success: false,
                message: "User already exists"
            })
        }

        const hashedPassword = await bcrypt.hash(password, 10)

        const user = await userModel.create({ name, email: email.toLowerCase(), password: hashedPassword })

        const token = signToken(user)
        setAuthCookie(res, token)

        res.status(201).json({
            success: true,
            message: 'User Registered Successfully',
            user: publicUser(user),
            token
        })
    } catch (err) {
        res.status(500).json({ success: false, message: err.message })
    }
}

export async function loginHandler(req, res) {
    try {
        const { email, password } = req.body

        if (!email || !password) {
            return res.status(400).json({ success: false, message: "Email and password are required" })
        }

        const user = await userModel.findOne({ email: email.toLowerCase() })

        if (!user) {
            return res.status(404).json({ success: false, message: "User Not Found" })
        }

        if (user.isBlocked) {
            return res.status(403).json({ success: false, message: "Your account has been blocked. Contact support." })
        }

        const isMatch = await bcrypt.compare(password, user.password)

        if (!isMatch) {
            return res.status(401).json({ success: false, message: "Invalid Credentials" })
        }

        const token = signToken(user)
        setAuthCookie(res, token)

        res.status(200).json({
            success: true,
            message: 'Login Successful',
            user: publicUser(user),
            token
        })
    } catch (err) {
        res.status(500).json({ success: false, message: err.message })
    }
}

// Admin login uses the same User collection; the configured ADMIN_USERNAME/ADMIN_PASSWORD
// in env vars seeds/authenticates a bootstrap admin account on first use.
export async function adminloginHandler(req, res) {
    try {
        const { username, password } = req.body

        if (username === config.ADMIN_USERNAME && password === config.ADMIN_PASSWORD) {
            // Find or create the bootstrap admin user record so JWT + role middleware works uniformly
            let admin = await userModel.findOne({ email: `${config.ADMIN_USERNAME}@admin.local` })
            if (!admin) {
                const hashedPassword = await bcrypt.hash(password, 10)
                admin = await userModel.create({
                    name: 'Admin',
                    email: `${config.ADMIN_USERNAME}@admin.local`,
                    password: hashedPassword,
                    role: 'admin'
                })
            } else if (admin.role !== 'admin') {
                admin.role = 'admin'
                await admin.save()
            }

            const token = signToken(admin)
            setAuthCookie(res, token)

            return res.status(200).json({
                success: true,
                message: "Admin Login Successful",
                user: publicUser(admin),
                token
            })
        }
        return res.status(401).json({ success: false, message: "Invalid admin credentials" })
    } catch (err) {
        res.status(500).json({ success: false, message: err.message })
    }
}

export async function getProfile(req, res) {
    try {
        const user = await userModel.findById(req.userId).select("-password")
        if (!user) return res.status(404).json({ success: false, message: "User not found" })
        res.status(200).json({ success: true, user: publicUser(user) })
    } catch (err) {
        res.status(500).json({ success: false, message: err.message })
    }
}

export async function updateProfile(req, res) {
    try {
        const { name } = req.body
        const user = await userModel.findByIdAndUpdate(
            req.userId,
            { ...(name ? { name } : {}) },
            { new: true }
        ).select("-password")
        if (!user) return res.status(404).json({ success: false, message: "User not found" })
        res.status(200).json({ success: true, message: "Profile updated", user: publicUser(user) })
    } catch (err) {
        res.status(500).json({ success: false, message: err.message })
    }
}

export function logout(req, res) {
    res.clearCookie('token', {
        httpOnly: true,
        secure: config.NODE_ENV === 'production',
        sameSite: 'none'
    })
    res.status(200).json({ success: true, message: "Logged out successfully" })
}
