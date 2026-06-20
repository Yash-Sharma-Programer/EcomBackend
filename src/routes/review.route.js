import { Router } from "express";
import * as reviewController from "../controllers/review.controller.js";
import { verifyToken, requireAdmin } from "../middleware/auth.middleware.js";

const reviewRouter = Router();

// Public
reviewRouter.get('/product/:productId', reviewController.getProductReviews);

// Logged-in user
reviewRouter.post('/', verifyToken, reviewController.submitReview);

// Admin
reviewRouter.get('/', verifyToken, requireAdmin, reviewController.getAllReviews);
reviewRouter.patch('/:id/status', verifyToken, requireAdmin, reviewController.updateReviewStatus);
reviewRouter.delete('/:id', verifyToken, requireAdmin, reviewController.deleteReview);

export default reviewRouter;
