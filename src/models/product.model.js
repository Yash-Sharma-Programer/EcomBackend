import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
    // Legacy fields kept for backward compatibility with old data/queries
    Product_name: {
        type: String,
        required: [true, "Product name is required"],
        trim: true
    },
    Product_Price: {
        type: Number,
        required: [true, "Price is required"],
        min: 0
    },
    Product_URl: {
        type: String,
        default: ""
    },

    description: {
        type: String,
        default: ""
    },
    images: {
        type: [String],
        default: []
    },
    stock: {
        type: Number,
        default: 0,
        min: 0
    },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Category",
        default: null
    },
    status: {
        type: String,
        enum: ["active", "inactive"],
        default: "active"
    },
    ratingAvg: {
        type: Number,
        default: 0
    },
    ratingCount: {
        type: Number,
        default: 0
    }
}, { timestamps: true });

productSchema.index({ Product_name: "text", description: "text" });

// Keep Product_URl in sync with the first image for any legacy frontend code
productSchema.pre("save", async function () {
    if (this.images && this.images.length > 0) {
        this.Product_URl = this.images[0];
    }
});

const productModel = mongoose.model("Product", productSchema);

export default productModel;
