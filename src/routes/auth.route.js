import { Router } from "express";
import * as authController from '../controllers/auth.controller.js'
import multer from "multer";
import uploadFile from "../services/storage.service.js";
import productModel from "../models/product.model.js";
import userModel from "../models/user.model.js";
import orderModel from "../models/order.model.js";
import { verifyToken } from "../middleware/auth.middleware.js";
import config from "../config/config.js";

const authRouter = Router()
const upload = multer({ storage: multer.memoryStorage() })

// Admin auth helper
const isAdmin = (req) =>
    (req.headers.adminusername || req.headers.adminUsername) === config.ADMIN_USERNAME &&
    (req.headers.adminpassword || req.headers.adminPassword) === config.ADMIN_PASSWORD

// Auth
authRouter.post('/signin', authController.register)
authRouter.post('/login', authController.loginHandler)
authRouter.post('/adminlogin', authController.adminloginHandler)
authRouter.post('/logout', authController.logout)

// Profile (protected)
authRouter.get('/profile', verifyToken, authController.getProfile)

// Products - public GET with search support
authRouter.get('/products', async (req, res) => {
    try {
        const { search } = req.query
        let query = {}
        if (search && search.trim()) {
            query = { $or: [{ Product_name: { $regex: search.trim(), $options: 'i' } }] }
        }
        const products = await productModel.find(query).sort({ createdAt: -1 })
        res.status(200).json({ success: true, products })
    } catch (err) {
        res.status(500).json({ success: false, message: err.message })
    }
})

authRouter.post('/addproduct', upload.single("productImage"), async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ success: false, message: "No file received" })
        const result = await uploadFile(req.file.buffer)
        await productModel.create({
            Product_name: req.body.productName,
            Product_URl: result.url,
            Product_Price: req.body.productPrice
        })
        return res.status(201).json({ success: true, message: "Product Added Successfully" })
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message })
    }
})

// Delete product (admin only)
authRouter.delete('/products/:id', async (req, res) => {
    try {
        if (!isAdmin(req)) return res.status(401).json({ success: false, message: "Unauthorized" })
        await productModel.findByIdAndDelete(req.params.id)
        res.status(200).json({ success: true, message: "Product deleted" })
    } catch (err) {
        res.status(500).json({ success: false, message: err.message })
    }
})

// ============ ADMIN USER MANAGEMENT ============

// GET all users (admin)
authRouter.get('/admin/users', async (req, res) => {
    try {
        if (!isAdmin(req)) return res.status(401).json({ success: false, message: "Unauthorized" })
        const users = await userModel.find().select('password').sort({ createdAt: -1 })
        res.status(200).json({ success: true, users })
    } catch (err) {
        res.status(500).json({ success: false, message: err.message })
    }
})

// DELETE user (admin)
authRouter.delete('/admin/users/:id', async (req, res) => {
    try {
        if (!isAdmin(req)) return res.status(401).json({ success: false, message: "Unauthorized" })
        await userModel.findByIdAndDelete(req.params.id)
        res.status(200).json({ success: true, message: "User deleted" })
    } catch (err) {
        res.status(500).json({ success: false, message: err.message })
    }
})

// PATCH block/unblock user (admin)
authRouter.patch('/admin/users/:id/block', async (req, res) => {
    try {
        if (!isAdmin(req)) return res.status(401).json({ success: false, message: "Unauthorized" })
        const user = await userModel.findById(req.params.id)
        if (!user) return res.status(404).json({ success: false, message: "User not found" })
        user.isBlocked = !user.isBlocked
        await user.save()
        res.status(200).json({ success: true, message: user.isBlocked ? "User blocked" : "User unblocked", isBlocked: user.isBlocked })
    } catch (err) {
        res.status(500).json({ success: false, message: err.message })
    }
})

// GET orders for a specific user (admin)
authRouter.get('/admin/users/:id/orders', async (req, res) => {
    try {
        if (!isAdmin(req)) return res.status(401).json({ success: false, message: "Unauthorized" })
        const user = await userModel.findById(req.params.id).select('-password')
        if (!user) return res.status(404).json({ success: false, message: "User not found" })
        const orders = await orderModel.find({ userId: req.params.id }).sort({ createdAt: -1 })
        res.status(200).json({ success: true, user, orders })
    } catch (err) {
        res.status(500).json({ success: false, message: err.message })
    }
})

// Analytics endpoint (admin only)
authRouter.get('/admin/analytics', async (req, res) => {
    try {
        if (!isAdmin(req)) return res.status(401).json({ success: false, message: "Unauthorized" })

        const totalProducts = await productModel.countDocuments()
        const totalUsers = await userModel.countDocuments()
        const totalOrders = await orderModel.countDocuments()

        const products = await productModel.find().sort({ createdAt: -1 })
        const users = await userModel.find().select('-password').sort({ createdAt: -1 })

        const sixMonthsAgo = new Date()
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5)
        sixMonthsAgo.setDate(1)
        sixMonthsAgo.setHours(0, 0, 0, 0)

        const productsByMonth = await productModel.aggregate([
            { $match: { createdAt: { $gte: sixMonthsAgo } } },
            { $group: { _id: { year: { $year: "$createdAt" }, month: { $month: "$createdAt" } }, count: { $sum: 1 }, totalValue: { $sum: "$Product_Price" } } },
            { $sort: { "_id.year": 1, "_id.month": 1 } }
        ])

        const usersByMonth = await userModel.aggregate([
            { $match: { createdAt: { $gte: sixMonthsAgo } } },
            { $group: { _id: { year: { $year: "$createdAt" }, month: { $month: "$createdAt" } }, count: { $sum: 1 } } },
            { $sort: { "_id.year": 1, "_id.month": 1 } }
        ])

        const priceRanges = await productModel.aggregate([
            { $bucket: { groupBy: "$Product_Price", boundaries: [0, 500, 1000, 2500, 5000, 10000, Infinity], default: "Other", output: { count: { $sum: 1 } } } }
        ])

        const topProducts = await productModel.find().sort({ Product_Price: -1 }).limit(5)
        const totalInventoryValue = products.reduce((sum, p) => sum + p.Product_Price, 0)
        const avgProductPrice = totalProducts > 0 ? totalInventoryValue / totalProducts : 0

        // Revenue from orders
        const revenueData = await orderModel.aggregate([
            { $group: { _id: null, totalRevenue: { $sum: "$totalAmount" } } }
        ])
        const totalRevenue = revenueData[0]?.totalRevenue || 0

        res.status(200).json({
            success: true,
            analytics: {
                summary: { totalProducts, totalUsers, totalOrders, totalInventoryValue, avgProductPrice, totalRevenue },
                productsByMonth, usersByMonth, priceRanges, topProducts,
                recentUsers: users.slice(0, 50),
                recentProducts: products.slice(0, 10)
            }
        })
    } catch (err) {
        res.status(500).json({ success: false, message: err.message })
    }
})

export default authRouter
