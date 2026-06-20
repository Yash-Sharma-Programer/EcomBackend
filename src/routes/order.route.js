import { Router } from "express";
import * as orderController from "../controllers/order.controller.js";
import { verifyToken, requireAdmin, optionalAuth } from "../middleware/auth.middleware.js";

const orderRouter = Router()

// Place order (works for logged-in users; guest checkout also tolerated since userId is optional)
orderRouter.post('/', optionalAuth, orderController.placeOrder)

// Admin: view all orders (filterable)
orderRouter.get('/', verifyToken, requireAdmin, orderController.getAllOrders)

// User: their own orders
orderRouter.get('/user/:userId', verifyToken, orderController.getUserOrders)

// Single order detail (used by both admin order detail page and user order detail page)
orderRouter.get('/:id', verifyToken, orderController.getOrderById)

// Admin: update order status / payment status
orderRouter.patch('/:id/status', verifyToken, requireAdmin, orderController.updateOrderStatus)
orderRouter.patch('/:id/payment', verifyToken, requireAdmin, orderController.updatePaymentStatus)

export default orderRouter
