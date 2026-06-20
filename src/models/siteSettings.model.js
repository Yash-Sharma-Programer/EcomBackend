import mongoose from "mongoose";

const bannerSchema = new mongoose.Schema({
    image: { type: String, required: true },
    title: { type: String, default: "" },
    subtitle: { type: String, default: "" },
    link: { type: String, default: "" },
    order: { type: Number, default: 0 }
}, { _id: true });

const siteSettingsSchema = new mongoose.Schema({
    siteName: { type: String, default: "ShopZen" },
    logo: { type: String, default: "" },
    favicon: { type: String, default: "" },
    contactEmail: { type: String, default: "" },
    contactPhone: { type: String, default: "" },
    contactAddress: { type: String, default: "" },
    socialLinks: {
        facebook: { type: String, default: "" },
        instagram: { type: String, default: "" },
        twitter: { type: String, default: "" },
        youtube: { type: String, default: "" }
    },
    footerContent: { type: String, default: "" },
    banners: { type: [bannerSchema], default: [] },
    seoTitle: { type: String, default: "" },
    seoDescription: { type: String, default: "" },
    emailFrom: { type: String, default: "" }
}, { timestamps: true });

const siteSettingsModel = mongoose.model("SiteSettings", siteSettingsSchema);
export default siteSettingsModel;
