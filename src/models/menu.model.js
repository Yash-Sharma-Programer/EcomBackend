import mongoose from "mongoose";

const menuItemSchema = new mongoose.Schema({
    label: { type: String, required: true },
    url: { type: String, required: true },
    order: { type: Number, default: 0 },
    openInNewTab: { type: Boolean, default: false }
}, { _id: true });

const menuSchema = new mongoose.Schema({
    name: { type: String, required: true },
    location: { type: String, enum: ["header", "footer"], required: true },
    items: { type: [menuItemSchema], default: [] }
}, { timestamps: true });

const menuModel = mongoose.model("Menu", menuSchema);
export default menuModel;
