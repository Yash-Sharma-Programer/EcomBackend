import productModel from "../models/product.model.js";
import reviewModel from "../models/review.model.js";
import { uploadMultiple } from "../services/storage.service.js";

// Public: list products with search, category filter, price filter, sort, pagination
export async function getProducts(req, res) {
    try {
        const {
            search, category, minPrice, maxPrice,
            sort, page = 1, limit = 12, includeInactive
        } = req.query;

        const query = {};

        if (!includeInactive) query.status = 'active';

        if (search && search.trim()) {
            query.$or = [
                { Product_name: { $regex: search.trim(), $options: 'i' } },
                { description: { $regex: search.trim(), $options: 'i' } }
            ];
        }

        if (category) query.category = category;

        if (minPrice || maxPrice) {
            query.Product_Price = {};
            if (minPrice) query.Product_Price.$gte = Number(minPrice);
            if (maxPrice) query.Product_Price.$lte = Number(maxPrice);
        }

        let sortOption = { createdAt: -1 };
        if (sort === 'price_asc') sortOption = { Product_Price: 1 };
        else if (sort === 'price_desc') sortOption = { Product_Price: -1 };
        else if (sort === 'name_asc') sortOption = { Product_name: 1 };
        else if (sort === 'rating_desc') sortOption = { ratingAvg: -1 };
        else if (sort === 'newest') sortOption = { createdAt: -1 };

        const pageNum = Math.max(1, Number(page));
        const limitNum = Math.min(50, Math.max(1, Number(limit)));
        const skip = (pageNum - 1) * limitNum;

        const [products, total] = await Promise.all([
            productModel.find(query).populate('category', 'name slug').sort(sortOption).skip(skip).limit(limitNum),
            productModel.countDocuments(query)
        ]);

        res.status(200).json({
            success: true,
            products,
            pagination: {
                total,
                page: pageNum,
                limit: limitNum,
                totalPages: Math.ceil(total / limitNum)
            }
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
}

export async function getProductById(req, res) {
    try {
        const product = await productModel.findById(req.params.id).populate('category', 'name slug');
        if (!product) return res.status(404).json({ success: false, message: "Product not found" });

        const relatedProducts = await productModel.find({
            category: product.category,
            _id: { $ne: product._id },
            status: 'active'
        }).limit(8);

        res.status(200).json({ success: true, product, relatedProducts });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
}

export async function createProduct(req, res) {
    try {
        const { productName, productPrice, description, stock, category, status } = req.body;

        if (!productName || !productPrice) {
            return res.status(400).json({ success: false, message: "Product name and price are required" });
        }
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ success: false, message: "At least one product image is required" });
        }

        const uploaded = await uploadMultiple(req.files, "product");
        const imageUrls = uploaded.map(r => r.url);

        const product = await productModel.create({
            Product_name: productName,
            Product_Price: Number(productPrice),
            Product_URl: imageUrls[0],
            images: imageUrls,
            description: description || "",
            stock: stock !== undefined ? Number(stock) : 0,
            category: category || null,
            status: status === 'inactive' ? 'inactive' : 'active'
        });

        res.status(201).json({ success: true, message: "Product Added Successfully", product });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
}

export async function updateProduct(req, res) {
    try {
        const product = await productModel.findById(req.params.id);
        if (!product) return res.status(404).json({ success: false, message: "Product not found" });

        const { productName, productPrice, description, stock, category, status, existingImages } = req.body;

        if (productName) product.Product_name = productName;
        if (productPrice !== undefined) product.Product_Price = Number(productPrice);
        if (description !== undefined) product.description = description;
        if (stock !== undefined) product.stock = Number(stock);
        if (category !== undefined) product.category = category || null;
        if (status && ["active", "inactive"].includes(status)) product.status = status;

        // existingImages: JSON array of image URLs the admin chose to keep (for edit forms)
        let finalImages = product.images;
        if (existingImages !== undefined) {
            try {
                finalImages = JSON.parse(existingImages);
            } catch {
                finalImages = product.images;
            }
        }

        if (req.files && req.files.length > 0) {
            const uploaded = await uploadMultiple(req.files, "product");
            finalImages = [...finalImages, ...uploaded.map(r => r.url)];
        }

        product.images = finalImages;
        if (finalImages.length > 0) product.Product_URl = finalImages[0];

        await product.save();
        res.status(200).json({ success: true, message: "Product updated successfully", product });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
}

export async function deleteProduct(req, res) {
    try {
        const product = await productModel.findByIdAndDelete(req.params.id);
        if (!product) return res.status(404).json({ success: false, message: "Product not found" });
        await reviewModel.deleteMany({ product: product._id });
        res.status(200).json({ success: true, message: "Product deleted" });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
}

// Recalculate and persist a product's average rating / review count
export async function refreshProductRating(productId) {
    const stats = await reviewModel.aggregate([
        { $match: { product: productId, status: 'approved' } },
        { $group: { _id: '$product', avg: { $avg: '$rating' }, count: { $sum: 1 } } }
    ]);

    const avg = stats[0]?.avg || 0;
    const count = stats[0]?.count || 0;

    await productModel.findByIdAndUpdate(productId, {
        ratingAvg: Math.round(avg * 10) / 10,
        ratingCount: count
    });
}
