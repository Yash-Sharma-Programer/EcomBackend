import { Router } from "express";
import * as authController from '../controllers/auth.controller.js'
import multer from "multer";
import uploadFile from "../services/storage.service.js";
import productModel from "../models/product.model.js";
import userModel from "../models/user.model.js";
import { verifyToken } from "../middleware/auth.middleware.js";
import config from "../config/config.js";

const authRouter = Router()
const upload = multer({ storage: multer.memoryStorage() })

// Auth
authRouter.post('/signin', authController.register)
authRouter.post('/login', authController.loginHandler)
authRouter.post('/adminlogin', authController.adminloginHandler)
authRouter.post('/logout', authController.logout)

// Profile (protected)
authRouter.get('/profile', verifyToken, authController.getProfile)

// Products - public GET with search support
authRouter.get('/', (req, res) => {
    res.status(200).json({
        message: "Backend Succesfully Run"
    })
})
authRouter.get('/products', async (req, res) => {
    try {
        const { search } = req.query
        let query = {}

        if (search && search.trim()) {
            query = {
                $or: [
                    { Product_name: { $regex: search.trim(), $options: 'i' } }
                ]
            }
        }

        const products = await productModel.find(query).sort({ createdAt: -1 })
        res.status(200).json({ success: true, products })
    } catch (err) {
        res.status(500).json({ success: false, message: err.message })
    }
})

authRouter.post('/addproduct', upload.single("productImage"), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: "No file received" });
        }

        const result = await uploadFile(req.file.buffer);

        await productModel.create({
            Product_name: req.body.productName,
            Product_URl: result.url,
            Product_Price: req.body.productPrice
        });

        return res.status(201).json({ success: true, message: "Product Added Successfully" });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
});

// Delete product (admin only)
authRouter.delete('/products/:id', async (req, res) => {
    try {
        const { adminUsername, adminPassword } = req.headers
        if (adminUsername !== config.ADMIN_USERNAME || adminPassword !== config.ADMIN_PASSWORD) {
            return res.status(401).json({ success: false, message: "Unauthorized" })
        }
        await productModel.findByIdAndDelete(req.params.id)
        res.status(200).json({ success: true, message: "Product deleted" })
    } catch (err) {
        res.status(500).json({ success: false, message: err.message })
    }
})

// Analytics endpoint (admin only)
authRouter.get('/admin/analytics', async (req, res) => {
    try {
        const { adminusername, adminpassword } = req.headers
        if (adminusername !== config.ADMIN_USERNAME || adminpassword !== config.ADMIN_PASSWORD) {
            return res.status(401).json({ success: false, message: "Unauthorized" })
        }

        const totalProducts = await productModel.countDocuments()
        const totalUsers = await userModel.countDocuments()

        const products = await productModel.find().sort({ createdAt: -1 })
        const users = await userModel.find().select('-password').sort({ createdAt: -1 })

        // Products added per month (last 6 months)
        const sixMonthsAgo = new Date()
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5)
        sixMonthsAgo.setDate(1)
        sixMonthsAgo.setHours(0, 0, 0, 0)

        const productsByMonth = await productModel.aggregate([
            { $match: { createdAt: { $gte: sixMonthsAgo } } },
            {
                $group: {
                    _id: {
                        year: { $year: "$createdAt" },
                        month: { $month: "$createdAt" }
                    },
                    count: { $sum: 1 },
                    totalValue: { $sum: "$Product_Price" }
                }
            },
            { $sort: { "_id.year": 1, "_id.month": 1 } }
        ])

        const usersByMonth = await userModel.aggregate([
            { $match: { createdAt: { $gte: sixMonthsAgo } } },
            {
                $group: {
                    _id: {
                        year: { $year: "$createdAt" },
                        month: { $month: "$createdAt" }
                    },
                    count: { $sum: 1 }
                }
            },
            { $sort: { "_id.year": 1, "_id.month": 1 } }
        ])

        // Price distribution
        const priceRanges = await productModel.aggregate([
            {
                $bucket: {
                    groupBy: "$Product_Price",
                    boundaries: [0, 500, 1000, 2500, 5000, 10000, Infinity],
                    default: "Other",
                    output: { count: { $sum: 1 } }
                }
            }
        ])

        // Top 5 most expensive products
        const topProducts = await productModel.find().sort({ Product_Price: -1 }).limit(5)

        const totalInventoryValue = products.reduce((sum, p) => sum + p.Product_Price, 0)
        const avgProductPrice = totalProducts > 0 ? totalInventoryValue / totalProducts : 0

        res.status(200).json({
            success: true,
            analytics: {
                summary: {
                    totalProducts,
                    totalUsers,
                    totalInventoryValue,
                    avgProductPrice
                },
                productsByMonth,
                usersByMonth,
                priceRanges,
                topProducts,
                recentUsers: users.slice(0, 10),
                recentProducts: products.slice(0, 10)
            }
        })
    } catch (err) {
        res.status(500).json({ success: false, message: err.message })
    }
})

export default authRouter
