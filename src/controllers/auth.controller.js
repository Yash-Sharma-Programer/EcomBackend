import userModel from "../models/user.model.js";
import jwt from "jsonwebtoken"
import config from "../config/config.js"
import bcrypt from "bcrypt"

export async function register(req, res) {
    const { name, email, password } = req.body

    const isAlreadyRegistered = await userModel.findOne({ email })
    if (isAlreadyRegistered) {
        return res.status(409).json({ success: false, message: "User already exists" })
    }

    const hashedPassword = await bcrypt.hash(password, 10)
    const user = await userModel.create({ name, email, password: hashedPassword })

    const refreshToken = jwt.sign({ id: user._id }, config.JWT_SECRET, { expiresIn: "7d" })
    res.cookie('refreshToken', refreshToken, { httpOnly: true, secure: false, sameSite: 'strict', maxAge: 7 * 24 * 60 * 60 * 1000 })

    res.status(201).json({
        success: true,
        message: 'User Registered Successfully',
        user: { id: user._id, name: user.name, email: user.email }
    })
}

export async function loginHandler(req, res) {
    const { email, password } = req.body

    const user = await userModel.findOne({ email })
    if (!user) return res.status(404).json({ success: false, message: "User Not Found" })

    if (user.isBlocked) {
        return res.status(403).json({ success: false, message: "Your account has been blocked by the admin. Please contact support." })
    }

    const isMatch = await bcrypt.compare(password, user.password)
    if (!isMatch) return res.status(401).json({ success: false, message: "Invalid Credentials" })

    const refreshToken = jwt.sign({ id: user._id }, config.JWT_SECRET, { expiresIn: "7d" })
    res.cookie('refreshToken', refreshToken, { httpOnly: true, secure: true, sameSite: 'none', maxAge: 7 * 24 * 60 * 60 * 1000 })

    res.status(200).json({
        success: true,
        message: 'Login Successful a user!',
        user: { id: user._id, name: user.name, email: user.email }
    })
}

export async function adminloginHandler(req, res) {
    const { username, password } = req.body
    if (username === config.ADMIN_USERNAME && password === config.ADMIN_PASSWORD) {
        return res.status(200).json({ success: true, message: "Admin Login Successful" })
    }
    return res.status(401).json({ success: false, message: "Invalid admin credentials" })
}

export async function getProfile(req, res) {
    try {
        const user = await userModel.findById(req.userId).select("-password")
        if (!user) return res.status(404).json({ success: false, message: "User not found" })
        res.status(200).json({ success: true, user })
    } catch (err) {
        res.status(500).json({ success: false, message: err.message })
    }
}

export function logout(req, res) {
    res.clearCookie('refreshToken', { httpOnly: true, secure: false, sameSite: 'strict' })
    res.status(200).json({ success: true, message: "Logged out successfully" })
}
