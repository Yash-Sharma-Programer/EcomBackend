import mongoose from "mongoose";

const pageSchema = new mongoose.Schema({
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    content: { type: String, default: "" },
    status: { type: String, enum: ["published", "draft"], default: "published" },
    metaTitle: { type: String, default: "" },
    metaDescription: { type: String, default: "" }
}, { timestamps: true });

const pageModel = mongoose.model("Page", pageSchema);
export default pageModel;
