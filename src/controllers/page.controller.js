import pageModel from "../models/page.model.js";

function slugify(text) {
    return text
        .toString()
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '')
        .replace(/[\s_-]+/g, '-')
        .replace(/^-+|-+$/g, '');
}

// Public: published pages only
export async function getPublishedPages(req, res) {
    try {
        const pages = await pageModel.find({ status: 'published' }).select('title slug').sort({ title: 1 });
        res.status(200).json({ success: true, pages });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
}

// Public: a single published page by slug
export async function getPageBySlug(req, res) {
    try {
        const page = await pageModel.findOne({ slug: req.params.slug, status: 'published' });
        if (!page) return res.status(404).json({ success: false, message: "Page not found" });
        res.status(200).json({ success: true, page });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
}

// Admin: list all pages regardless of status
export async function getAllPages(req, res) {
    try {
        const pages = await pageModel.find().sort({ updatedAt: -1 });
        res.status(200).json({ success: true, pages });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
}

export async function getPageById(req, res) {
    try {
        const page = await pageModel.findById(req.params.id);
        if (!page) return res.status(404).json({ success: false, message: "Page not found" });
        res.status(200).json({ success: true, page });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
}

export async function createPage(req, res) {
    try {
        const { title, slug, content, status, metaTitle, metaDescription } = req.body;
        if (!title || !title.trim()) {
            return res.status(400).json({ success: false, message: "Page title is required" });
        }

        const finalSlug = slugify(slug && slug.trim() ? slug : title);
        const existing = await pageModel.findOne({ slug: finalSlug });
        if (existing) {
            return res.status(409).json({ success: false, message: "A page with this slug already exists" });
        }

        const page = await pageModel.create({
            title: title.trim(),
            slug: finalSlug,
            content: content || "",
            status: status === 'draft' ? 'draft' : 'published',
            metaTitle: metaTitle || "",
            metaDescription: metaDescription || ""
        });

        res.status(201).json({ success: true, message: "Page created successfully", page });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
}

export async function updatePage(req, res) {
    try {
        const page = await pageModel.findById(req.params.id);
        if (!page) return res.status(404).json({ success: false, message: "Page not found" });

        const { title, slug, content, status, metaTitle, metaDescription } = req.body;

        if (slug && slug.trim()) {
            const newSlug = slugify(slug);
            if (newSlug !== page.slug) {
                const existing = await pageModel.findOne({ slug: newSlug, _id: { $ne: page._id } });
                if (existing) {
                    return res.status(409).json({ success: false, message: "A page with this slug already exists" });
                }
                page.slug = newSlug;
            }
        }

        if (title && title.trim()) page.title = title.trim();
        if (content !== undefined) page.content = content;
        if (status && ["published", "draft"].includes(status)) page.status = status;
        if (metaTitle !== undefined) page.metaTitle = metaTitle;
        if (metaDescription !== undefined) page.metaDescription = metaDescription;

        await page.save();
        res.status(200).json({ success: true, message: "Page updated successfully", page });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
}

export async function deletePage(req, res) {
    try {
        const page = await pageModel.findByIdAndDelete(req.params.id);
        if (!page) return res.status(404).json({ success: false, message: "Page not found" });
        res.status(200).json({ success: true, message: "Page deleted successfully" });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
}
