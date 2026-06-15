import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true
    },
    productName: { type: String, required: true },
    productPrice: { type: Number, required: true },
    productImage: { type: String },
    quantity: { type: Number, required: true, min: 1 },
    totalAmount: { type: Number, required: true },
    address: {
        name: { type: String, required: true },
        phone: { type: String, required: true },
        street: { type: String, required: true },
        city: { type: String, required: true },
        pincode: { type: String, required: true },
    },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    status: {
        type: String,
        enum: ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'],
        default: 'confirmed'
    }
}, { timestamps: true })

const orderModel = mongoose.model("Order", orderSchema)
export default orderModel
