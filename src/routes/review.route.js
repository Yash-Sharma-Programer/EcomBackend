import { Router } from "express";
import reviewModel from "../models/review.model.js";
import userModel from "../models/user.model.js";
import { verifyToken } from "../middleware/auth.middleware.js";
import config from "../config/config.js";

const reviewRouter = Router()

// GET /reviews/:productId — get all reviews for a product
reviewRouter.get('/reviews/:productId', async (req, res) => {
    try {
        const reviews = await reviewModel.find({ product: req.params.productId }).sort({ createdAt: -1 })
        res.status(200).json({ success: true, reviews })
    } catch (err) {
        res.status(500).json({ success: false, message: err.message })
    }
})

// POST /reviews/:productId — add a review (auth required)
reviewRouter.post('/reviews/:productId', verifyToken, async (req, res) => {
    try {
        const user = await userModel.findById(req.userId).select('-password')
        if (!user) return res.status(404).json({ success: false, message: "User not found" })
        if (user.isBlocked) return res.status(403).json({ success: false, message: "Your account is blocked" })

        const { rating, comment } = req.body
        if (!rating || !comment) return res.status(400).json({ success: false, message: "Rating and comment are required" })

        // Check if already reviewed
        const existing = await reviewModel.findOne({ product: req.params.productId, userId: req.userId })
        if (existing) return res.status(409).json({ success: false, message: "You already reviewed this product" })

        const review = await reviewModel.create({
            product: req.params.productId,
            userId: req.userId,
            username: user.name,
            rating,
            comment
        })
        res.status(201).json({ success: true, message: "Review added", review })
    } catch (err) {
        res.status(500).json({ success: false, message: err.message })
    }
})

// DELETE /reviews/:reviewId — delete own review (auth required)
reviewRouter.delete('/:reviewId', verifyToken, async (req, res) => {
    try {
        const review = await reviewModel.findById(req.params.reviewId)
        if (!review) return res.status(404).json({ success: false, message: "Review not found" })

        // Allow user to delete own review OR admin
        const { adminusername, adminpassword } = req.headers
        const isAdmin = adminusername === config.ADMIN_USERNAME && adminpassword === config.ADMIN_PASSWORD
        const isOwner = review.userId.toString() === req.userId

        if (!isAdmin && !isOwner) {
            return res.status(403).json({ success: false, message: "Not authorized to delete this review" })
        }

        await reviewModel.findByIdAndDelete(req.params.reviewId)
        res.status(200).json({ success: true, message: "Review deleted" })
    } catch (err) {
        res.status(500).json({ success: false, message: err.message })
    }
})

export default reviewRouter
