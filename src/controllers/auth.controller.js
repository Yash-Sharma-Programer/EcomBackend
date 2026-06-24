import userModel from "../models/user.model.js";
import jwt from "jsonwebtoken"
import config from "../config/config.js"
import bcrypt from "bcrypt"
import crypto from "crypto"
import { canSendEmail, sendPasswordResetEmail, sendPasswordChangeEmail } from "../services/email.service.js"

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

export async function forgotPassword(req, res) {
    try {
        const { email } = req.body;
        if (!email) {
            return res.status(400).json({ success: false, message: "Email is required" });
        }

        const user = await userModel.findOne({ email: email.toLowerCase() });

        // Do not reveal whether an email exists or not.
        if (!user) {
            return res.status(200).json({ success: true, message: "If this email exists, a reset link has been sent" });
        }

        const rawToken = crypto.randomBytes(32).toString("hex");
        const hashedToken = crypto.createHash("sha256").update(rawToken).digest("hex");

        user.resetPasswordToken = hashedToken;
        user.resetPasswordExpires = new Date(Date.now() + 15 * 60 * 1000);
        await user.save();

        const resetUrl = `${config.CLIENT_URL}/reset-password/${rawToken}`;

        if (!canSendEmail()) {
            // For local development, return the link so you can test without SMTP.
            // In production, configure SMTP env vars instead of exposing reset links.
            if (config.NODE_ENV !== "production") {
                return res.status(200).json({
                    success: true,
                    message: "SMTP is not configured. Use this development reset link.",
                    resetLink: resetUrl
                });
            }
            return res.status(500).json({ success: false, message: "SMTP is not configured on the server" });
        }

        await sendPasswordResetEmail(user, resetUrl);

        return res.status(200).json({ success: true, message: "Password reset link sent to your email" });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
}

export async function resetPassword(req, res) {
    try {
        const { token } = req.params;
        const { password } = req.body;

        if (!password || password.length < 8) {
            return res.status(400).json({ success: false, message: "Password must be at least 8 characters" });
        }

        const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
        const user = await userModel.findOne({
            resetPasswordToken: hashedToken,
            resetPasswordExpires: { $gt: new Date() }
        });

        if (!user) {
            return res.status(400).json({ success: false, message: "Reset link is invalid or expired" });
        }

        user.password = await bcrypt.hash(password, 10);
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;
        await user.save();

        // Send password change confirmation email
        if (canSendEmail()) {
            await sendPasswordChangeEmail(user);
        }

        return res.status(200).json({ success: true, message: "Password reset successfully" });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
}

export async function changePassword(req, res) {
    try {
        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({ success: false, message: "Current password and new password are required" });
        }
        if (newPassword.length < 8) {
            return res.status(400).json({ success: false, message: "New password must be at least 8 characters" });
        }

        const user = await userModel.findById(req.userId);
        if (!user) return res.status(404).json({ success: false, message: "User not found" });

        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
            return res.status(401).json({ success: false, message: "Current password is incorrect" });
        }

        user.password = await bcrypt.hash(newPassword, 10);
        await user.save();

        // Send password change confirmation email
        if (canSendEmail()) {
            await sendPasswordChangeEmail(user);
        }

        return res.status(200).json({ success: true, message: "Password changed successfully" });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
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
