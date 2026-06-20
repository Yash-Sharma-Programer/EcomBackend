import menuModel from "../models/menu.model.js";

// Public: get the active menu for a given location (header/footer), items sorted by order
export async function getMenuByLocation(req, res) {
    try {
        const { location } = req.params;
        if (!["header", "footer"].includes(location)) {
            return res.status(400).json({ success: false, message: "Invalid menu location" });
        }
        const menu = await menuModel.findOne({ location });
        if (!menu) return res.status(200).json({ success: true, menu: null });

        const items = [...menu.items].sort((a, b) => a.order - b.order);
        res.status(200).json({ success: true, menu: { ...menu.toObject(), items } });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
}

// Admin: list all menus
export async function getAllMenus(req, res) {
    try {
        const menus = await menuModel.find().sort({ location: 1 });
        res.status(200).json({ success: true, menus });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
}

export async function getMenuById(req, res) {
    try {
        const menu = await menuModel.findById(req.params.id);
        if (!menu) return res.status(404).json({ success: false, message: "Menu not found" });
        res.status(200).json({ success: true, menu });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
}

export async function createMenu(req, res) {
    try {
        const { name, location } = req.body;
        if (!name || !name.trim() || !["header", "footer"].includes(location)) {
            return res.status(400).json({ success: false, message: "Menu name and a valid location (header/footer) are required" });
        }

        const menu = await menuModel.create({ name: name.trim(), location, items: [] });
        res.status(201).json({ success: true, message: "Menu created successfully", menu });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
}

export async function deleteMenu(req, res) {
    try {
        const menu = await menuModel.findByIdAndDelete(req.params.id);
        if (!menu) return res.status(404).json({ success: false, message: "Menu not found" });
        res.status(200).json({ success: true, message: "Menu deleted successfully" });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
}

// Add a menu item
export async function addMenuItem(req, res) {
    try {
        const { label, url, openInNewTab } = req.body;
        if (!label || !url) {
            return res.status(400).json({ success: false, message: "Label and URL are required" });
        }

        const menu = await menuModel.findById(req.params.id);
        if (!menu) return res.status(404).json({ success: false, message: "Menu not found" });

        const maxOrder = menu.items.reduce((max, i) => Math.max(max, i.order), -1);
        menu.items.push({ label, url, openInNewTab: !!openInNewTab, order: maxOrder + 1 });
        await menu.save();

        res.status(201).json({ success: true, message: "Menu item added", menu });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
}

// Edit a menu item
export async function updateMenuItem(req, res) {
    try {
        const { label, url, openInNewTab } = req.body;
        const menu = await menuModel.findById(req.params.id);
        if (!menu) return res.status(404).json({ success: false, message: "Menu not found" });

        const item = menu.items.id(req.params.itemId);
        if (!item) return res.status(404).json({ success: false, message: "Menu item not found" });

        if (label !== undefined) item.label = label;
        if (url !== undefined) item.url = url;
        if (openInNewTab !== undefined) item.openInNewTab = !!openInNewTab;

        await menu.save();
        res.status(200).json({ success: true, message: "Menu item updated", menu });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
}

// Delete a menu item
export async function deleteMenuItem(req, res) {
    try {
        const menu = await menuModel.findById(req.params.id);
        if (!menu) return res.status(404).json({ success: false, message: "Menu not found" });

        menu.items = menu.items.filter(i => i._id.toString() !== req.params.itemId);
        await menu.save();

        res.status(200).json({ success: true, message: "Menu item removed", menu });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
}

// Reorder menu items: body = { orderedItemIds: [id1, id2, id3, ...] }
export async function reorderMenuItems(req, res) {
    try {
        const { orderedItemIds } = req.body;
        if (!Array.isArray(orderedItemIds)) {
            return res.status(400).json({ success: false, message: "orderedItemIds array is required" });
        }

        const menu = await menuModel.findById(req.params.id);
        if (!menu) return res.status(404).json({ success: false, message: "Menu not found" });

        orderedItemIds.forEach((itemId, index) => {
            const item = menu.items.id(itemId);
            if (item) item.order = index;
        });

        await menu.save();
        res.status(200).json({ success: true, message: "Menu order updated", menu });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
}
