import reviewModel from "../models/review.model.js";
import userModel from "../models/user.model.js";
import { refreshProductRating } from "./product.controller.js";

// Public: approved reviews for a product
export async function getProductReviews(req, res) {
    try {
        const reviews = await reviewModel
            .find({ product: req.params.productId, status: 'approved' })
            .sort({ createdAt: -1 });
        res.status(200).json({ success: true, reviews });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
}

// Logged-in user: submit a review for a product
export async function submitReview(req, res) {
    try {
        const { productId, rating, text } = req.body;

        if (!productId || !rating || !text || !text.trim()) {
            return res.status(400).json({ success: false, message: "Product, rating and review text are required" });
        }
        if (rating < 1 || rating > 5) {
            return res.status(400).json({ success: false, message: "Rating must be between 1 and 5" });
        }

        const user = await userModel.findById(req.userId);
        if (!user) return res.status(404).json({ success: false, message: "User not found" });

        const existing = await reviewModel.findOne({ product: productId, user: req.userId });
        if (existing) {
            existing.rating = rating;
            existing.text = text.trim();
            existing.status = 'pending';
            await existing.save();
            return res.status(200).json({ success: true, message: "Review updated and resubmitted for approval", review: existing });
        }

        const review = await reviewModel.create({
            product: productId,
            user: req.userId,
            username: user.name,
            rating,
            text: text.trim()
        });

        res.status(201).json({ success: true, message: "Review submitted for approval", review });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
}

// Admin: list all reviews (optionally filter by status)
export async function getAllReviews(req, res) {
    try {
        const { status } = req.query;
        const query = {};
        if (status && status !== 'all') query.status = status;

        const reviews = await reviewModel.find(query).populate('product', 'Product_name').sort({ createdAt: -1 });
        res.status(200).json({ success: true, reviews });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
}

// Admin: approve or reject a review
export async function updateReviewStatus(req, res) {
    try {
        const { status } = req.body;
        if (!['approved', 'rejected', 'pending'].includes(status)) {
            return res.status(400).json({ success: false, message: "Invalid status" });
        }

        const review = await reviewModel.findByIdAndUpdate(req.params.id, { status }, { new: true });
        if (!review) return res.status(404).json({ success: false, message: "Review not found" });

        await refreshProductRating(review.product);

        res.status(200).json({ success: true, message: `Review ${status}`, review });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
}

// Admin: delete a review
export async function deleteReview(req, res) {
    try {
        const review = await reviewModel.findByIdAndDelete(req.params.id);
        if (!review) return res.status(404).json({ success: false, message: "Review not found" });

        await refreshProductRating(review.product);

        res.status(200).json({ success: true, message: "Review deleted" });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
}
