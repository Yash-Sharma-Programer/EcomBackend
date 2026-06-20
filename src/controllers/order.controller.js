import orderModel from "../models/order.model.js";
import productModel from "../models/product.model.js";

// POST /orders — place an order with one or more line items
export async function placeOrder(req, res) {
    try {
        const { items, address, paymentMethod, userId } = req.body;

        if (!Array.isArray(items) || items.length === 0) {
            return res.status(400).json({ success: false, message: "Order must contain at least one item" });
        }
        if (!address || !address.name || !address.phone || !address.street || !address.city || !address.pincode) {
            return res.status(400).json({ success: false, message: "Complete delivery address is required" });
        }

        // Validate items against current product data and stock
        for (const item of items) {
            const product = await productModel.findById(item.product);
            if (!product) {
                return res.status(400).json({ success: false, message: `Product not found: ${item.productName || item.product}` });
            }
            if (product.stock !== undefined && product.stock < item.quantity) {
                return res.status(400).json({ success: false, message: `Insufficient stock for ${product.Product_name}` });
            }
        }

        const totalAmount = items.reduce((sum, i) => sum + (i.productPrice * i.quantity), 0);

        const order = await orderModel.create({
            items,
            totalAmount,
            address,
            userId: userId || req.userId || null,
            paymentMethod: paymentMethod === 'online' ? 'online' : 'cod',
            paymentStatus: paymentMethod === 'online' ? 'paid' : 'pending'
        });

        // Decrement stock
        await Promise.all(items.map(item =>
            productModel.findByIdAndUpdate(item.product, { $inc: { stock: -item.quantity } })
        ));

        res.status(201).json({ success: true, message: "Order placed successfully", order });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
}

// GET /orders — admin: view all orders with search/filter
export async function getAllOrders(req, res) {
    try {
        const { status, paymentStatus, search } = req.query;
        const query = {};

        if (status && status !== 'all') query.status = status;
        if (paymentStatus && paymentStatus !== 'all') query.paymentStatus = paymentStatus;
        if (search && search.trim()) {
            query.$or = [
                { 'address.name': { $regex: search.trim(), $options: 'i' } },
                { 'address.phone': { $regex: search.trim(), $options: 'i' } },
                { 'items.productName': { $regex: search.trim(), $options: 'i' } }
            ];
        }

        const orders = await orderModel.find(query).populate('userId', 'name email').sort({ createdAt: -1 });
        res.status(200).json({ success: true, orders });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
}

export async function getOrderById(req, res) {
    try {
        const order = await orderModel.findById(req.params.id).populate('userId', 'name email');
        if (!order) return res.status(404).json({ success: false, message: "Order not found" });
        res.status(200).json({ success: true, order });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
}

// GET /orders/user/:userId — orders for a specific user
export async function getUserOrders(req, res) {
    try {
        const orders = await orderModel.find({ userId: req.params.userId }).sort({ createdAt: -1 });
        res.status(200).json({ success: true, orders });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
}

// PATCH /orders/:id/status — admin: update order status
export async function updateOrderStatus(req, res) {
    try {
        const { status } = req.body;
        const allowed = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
        if (!allowed.includes(status)) {
            return res.status(400).json({ success: false, message: "Invalid status" });
        }
        const order = await orderModel.findByIdAndUpdate(req.params.id, { status }, { new: true });
        if (!order) {
            return res.status(404).json({ success: false, message: "Order not found" });
        }
        res.status(200).json({ success: true, message: "Order status updated", order });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
}

// PATCH /orders/:id/payment — admin: update payment status
export async function updatePaymentStatus(req, res) {
    try {
        const { paymentStatus } = req.body;
        const allowed = ['pending', 'paid', 'failed', 'refunded'];
        if (!allowed.includes(paymentStatus)) {
            return res.status(400).json({ success: false, message: "Invalid payment status" });
        }
        const order = await orderModel.findByIdAndUpdate(req.params.id, { paymentStatus }, { new: true });
        if (!order) {
            return res.status(404).json({ success: false, message: "Order not found" });
        }
        res.status(200).json({ success: true, message: "Payment status updated", order });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
}
