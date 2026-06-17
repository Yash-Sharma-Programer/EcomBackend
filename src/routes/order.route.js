import { Router } from "express";
import orderModel from "../models/order.model.js";
import config from "../config/config.js";

const orderRouter = Router()

// POST /orders — place a Buy Now order
orderRouter.post('/', async (req, res) => {
    try {
        const {
            product, productName, productPrice, productImage,
            quantity, totalAmount, address, userId
        } = req.body

        if (!product || !productName || !productPrice || !quantity || !totalAmount || !address) {
            return res.status(400).json({ success: false, message: "Missing required fields" })
        }

        const order = await orderModel.create({
            product, productName, productPrice, productImage,
            quantity, totalAmount, address,
            userId: userId || null
        })

        res.status(201).json({ success: true, message: "Order placed successfully", order })
    } catch (err) {
        res.status(500).json({ success: false, message: err.message })
    }
})

// GET /orders — admin: view all orders
orderRouter.get('/', async (req, res) => {
    try {
        const { adminusername, adminpassword } = req.headers
        if (adminusername !== config.ADMIN_USERNAME || adminpassword !== config.ADMIN_PASSWORD) {
            return res.status(401).json({ success: false, message: "Unauthorized" })
        }
        const orders = await orderModel.find().sort({ createdAt: -1 })
        res.status(200).json({ success: true, orders })
    } catch (err) {
        res.status(500).json({ success: false, message: err.message })
    }
})

// GET /orders/user/:userId — orders for a specific user
orderRouter.get('/user/:userId', async (req, res) => {
    try {
        const orders = await orderModel.find({ userId: req.params.userId }).sort({ createdAt: -1 })
        res.status(200).json({ success: true, orders })
    } catch (err) {
        res.status(500).json({ success: false, message: err.message })
    }
})

// PATCH /orders/:id/status — admin: update order status
orderRouter.patch('/:id/status', async (req, res) => {
    try {
        const { adminusername, adminpassword } = req.headers
        if (adminusername !== config.ADMIN_USERNAME || adminpassword !== config.ADMIN_PASSWORD) {
            return res.status(401).json({ success: false, message: "Unauthorized" })
        }
        const { status } = req.body
        const allowed = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled']
        if (!allowed.includes(status)) {
            return res.status(400).json({ success: false, message: "Invalid status" })
        }
        const order = await orderModel.findByIdAndUpdate(req.params.id, { status }, { new: true })
        if (!order) {
            return res.status(404).json({ success: false, message: "Order not found" })
        }
        res.status(200).json({ success: true, message: "Order status updated", order })
    } catch (err) {
        res.status(500).json({ success: false, message: err.message })
    }
})

export default orderRouter
