import userModel from "../models/user.model.js";
import orderModel from "../models/order.model.js";

export async function getAllUsers(req, res) {
    try {
        const { search } = req.query;
        const query = { role: 'user' };
        if (search && search.trim()) {
            query.$or = [
                { name: { $regex: search.trim(), $options: 'i' } },
                { email: { $regex: search.trim(), $options: 'i' } }
            ];
        }
        const users = await userModel.find(query).select('-password').sort({ createdAt: -1 });
        res.status(200).json({ success: true, users });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
}

export async function getUserById(req, res) {
    try {
        const user = await userModel.findById(req.params.id).select('-password');
        if (!user) return res.status(404).json({ success: false, message: "User not found" });

        const orders = await orderModel.find({ userId: user._id }).sort({ createdAt: -1 });

        res.status(200).json({ success: true, user, orders });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
}

export async function toggleBlockUser(req, res) {
    try {
        const user = await userModel.findById(req.params.id);
        if (!user) return res.status(404).json({ success: false, message: "User not found" });
        if (user.role === 'admin') {
            return res.status(400).json({ success: false, message: "Cannot block an admin account" });
        }

        user.isBlocked = !user.isBlocked;
        await user.save();

        res.status(200).json({
            success: true,
            message: user.isBlocked ? "User blocked" : "User unblocked",
            user: { id: user._id, isBlocked: user.isBlocked }
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
}

export async function deleteUser(req, res) {
    try {
        const user = await userModel.findById(req.params.id);
        if (!user) return res.status(404).json({ success: false, message: "User not found" });
        if (user.role === 'admin') {
            return res.status(400).json({ success: false, message: "Cannot delete an admin account" });
        }
        await userModel.findByIdAndDelete(req.params.id);
        res.status(200).json({ success: true, message: "User deleted successfully" });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
}

// Saved addresses (self-service, for the logged-in user)
export async function addAddress(req, res) {
    try {
        const { label, name, phone, street, city, pincode, isDefault } = req.body;
        if (!name || !phone || !street || !city || !pincode) {
            return res.status(400).json({ success: false, message: "All address fields are required" });
        }
        const user = await userModel.findById(req.userId);
        if (!user) return res.status(404).json({ success: false, message: "User not found" });

        if (isDefault) {
            user.addresses.forEach(a => { a.isDefault = false; });
        }

        user.addresses.push({ label, name, phone, street, city, pincode, isDefault: !!isDefault || user.addresses.length === 0 });
        await user.save();

        res.status(201).json({ success: true, message: "Address added", addresses: user.addresses });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
}

export async function deleteAddress(req, res) {
    try {
        const user = await userModel.findById(req.userId);
        if (!user) return res.status(404).json({ success: false, message: "User not found" });

        user.addresses = user.addresses.filter(a => a._id.toString() !== req.params.addressId);
        await user.save();

        res.status(200).json({ success: true, message: "Address removed", addresses: user.addresses });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
}

// Wishlist (self-service)
export async function getWishlist(req, res) {
    try {
        const user = await userModel.findById(req.userId).populate('wishlist');
        if (!user) return res.status(404).json({ success: false, message: "User not found" });
        res.status(200).json({ success: true, wishlist: user.wishlist });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
}

export async function toggleWishlist(req, res) {
    try {
        const { productId } = req.body;
        const user = await userModel.findById(req.userId);
        if (!user) return res.status(404).json({ success: false, message: "User not found" });

        const exists = user.wishlist.some(id => id.toString() === productId);
        if (exists) {
            user.wishlist = user.wishlist.filter(id => id.toString() !== productId);
        } else {
            user.wishlist.push(productId);
        }
        await user.save();

        res.status(200).json({ success: true, inWishlist: !exists, wishlist: user.wishlist });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
}
