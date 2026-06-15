import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
    Product_name: {
        type: String,
        required: [true, "Product Name is required"]
    },
    Product_URl: {
        type: String,
        required: [true, "Image is required"]
    },
    Product_Price: {
        type: Number,
        required: [true, "Price is required"]
    }
}, { timestamps: true })

const productModel = mongoose.model("Product", productSchema)

export default productModel
