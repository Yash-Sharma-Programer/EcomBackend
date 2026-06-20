import categoryModel from "../models/category.model.js";
import productModel from "../models/product.model.js";
import uploadFile, { deleteFile } from "../services/storage.service.js";

function slugify(text) {
    return text
        .toString()
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '')
        .replace(/[\s_-]+/g, '-')
        .replace(/^-+|-+$/g, '');
}

export async function getAllCategories(req, res) {
    try {
        const categories = await categoryModel.find().sort({ name: 1 });
        res.status(200).json({ success: true, categories });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
}

export async function getCategoryById(req, res) {
    try {
        const category = await categoryModel.findById(req.params.id);
        if (!category) return res.status(404).json({ success: false, message: "Category not found" });
        res.status(200).json({ success: true, category });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
}

export async function getCategoryProducts(req, res) {
    try {
        const category = await categoryModel.findById(req.params.id);
        if (!category) return res.status(404).json({ success: false, message: "Category not found" });

        const products = await productModel
            .find({ category: category._id, status: 'active' })
            .sort({ createdAt: -1 });

        res.status(200).json({ success: true, category, products });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
}

export async function createCategory(req, res) {
    try {
        const { name, description, status } = req.body;
        if (!name || !name.trim()) {
            return res.status(400).json({ success: false, message: "Category name is required" });
        }

        const slug = slugify(name);
        const existing = await categoryModel.findOne({ $or: [{ name }, { slug }] });
        if (existing) {
            return res.status(409).json({ success: false, message: "A category with this name already exists" });
        }

        let imageUrl = "";
        if (req.file) {
            const result = await uploadFile(req.file.buffer, "category");
            imageUrl = result.url;
        }

        const category = await categoryModel.create({
            name: name.trim(),
            slug,
            description: description || "",
            image: imageUrl,
            status: status || "active"
        });

        res.status(201).json({ success: true, message: "Category created successfully", category });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
}

export async function updateCategory(req, res) {
    try {
        const category = await categoryModel.findById(req.params.id);
        if (!category) return res.status(404).json({ success: false, message: "Category not found" });

        const { name, description, status } = req.body;

        if (name && name.trim() && name.trim() !== category.name) {
            const newSlug = slugify(name);
            const existing = await categoryModel.findOne({ slug: newSlug, _id: { $ne: category._id } });
            if (existing) {
                return res.status(409).json({ success: false, message: "A category with this name already exists" });
            }
            category.name = name.trim();
            category.slug = newSlug;
        }

        if (description !== undefined) category.description = description;
        if (status && ["active", "inactive"].includes(status)) category.status = status;

        if (req.file) {
            const result = await uploadFile(req.file.buffer, "category");
            category.image = result.url;
        }

        await category.save();
        res.status(200).json({ success: true, message: "Category updated successfully", category });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
}

export async function deleteCategory(req, res) {
    try {
        const category = await categoryModel.findById(req.params.id);
        if (!category) return res.status(404).json({ success: false, message: "Category not found" });

        const productCount = await productModel.countDocuments({ category: category._id });
        if (productCount > 0) {
            return res.status(400).json({
                success: false,
                message: `Cannot delete: ${productCount} product(s) are assigned to this category. Reassign or delete them first.`
            });
        }

        await categoryModel.findByIdAndDelete(req.params.id);
        res.status(200).json({ success: true, message: "Category deleted successfully" });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
}
