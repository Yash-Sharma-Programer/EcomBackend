import siteSettingsModel from "../models/siteSettings.model.js";
import uploadFile from "../services/storage.service.js";

async function getOrCreateSettings() {
    let settings = await siteSettingsModel.findOne();
    if (!settings) {
        settings = await siteSettingsModel.create({});
    }
    return settings;
}

// Public: site settings (used by frontend for header/footer/SEO/contact info)
export async function getSiteSettings(req, res) {
    try {
        const settings = await getOrCreateSettings();
        res.status(200).json({ success: true, settings });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
}

// Admin: update general settings (logo/favicon handled separately via file upload routes)
export async function updateSiteSettings(req, res) {
    try {
        const settings = await getOrCreateSettings();

        const {
            siteName, contactEmail, contactPhone, contactAddress,
            footerContent, seoTitle, seoDescription, emailFrom,
            facebook, instagram, twitter, youtube
        } = req.body;

        if (siteName !== undefined) settings.siteName = siteName;
        if (contactEmail !== undefined) settings.contactEmail = contactEmail;
        if (contactPhone !== undefined) settings.contactPhone = contactPhone;
        if (contactAddress !== undefined) settings.contactAddress = contactAddress;
        if (footerContent !== undefined) settings.footerContent = footerContent;
        if (seoTitle !== undefined) settings.seoTitle = seoTitle;
        if (seoDescription !== undefined) settings.seoDescription = seoDescription;
        if (emailFrom !== undefined) settings.emailFrom = emailFrom;

        if (facebook !== undefined) settings.socialLinks.facebook = facebook;
        if (instagram !== undefined) settings.socialLinks.instagram = instagram;
        if (twitter !== undefined) settings.socialLinks.twitter = twitter;
        if (youtube !== undefined) settings.socialLinks.youtube = youtube;

        await settings.save();
        res.status(200).json({ success: true, message: "Site settings updated", settings });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
}

// Admin: upload logo
export async function updateLogo(req, res) {
    try {
        if (!req.file) return res.status(400).json({ success: false, message: "Logo image is required" });
        const settings = await getOrCreateSettings();
        const result = await uploadFile(req.file.buffer, "logo");
        settings.logo = result.url;
        await settings.save();
        res.status(200).json({ success: true, message: "Logo updated", settings });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
}

// Admin: upload favicon
export async function updateFavicon(req, res) {
    try {
        if (!req.file) return res.status(400).json({ success: false, message: "Favicon image is required" });
        const settings = await getOrCreateSettings();
        const result = await uploadFile(req.file.buffer, "favicon");
        settings.favicon = result.url;
        await settings.save();
        res.status(200).json({ success: true, message: "Favicon updated", settings });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
}

// Admin: add a homepage banner
export async function addBanner(req, res) {
    try {
        if (!req.file) return res.status(400).json({ success: false, message: "Banner image is required" });
        const { title, subtitle, link } = req.body;

        const settings = await getOrCreateSettings();
        const result = await uploadFile(req.file.buffer, "banner");

        const maxOrder = settings.banners.reduce((max, b) => Math.max(max, b.order), -1);
        settings.banners.push({
            image: result.url,
            title: title || "",
            subtitle: subtitle || "",
            link: link || "",
            order: maxOrder + 1
        });
        await settings.save();

        res.status(201).json({ success: true, message: "Banner added", settings });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
}

// Admin: delete a homepage banner
export async function deleteBanner(req, res) {
    try {
        const settings = await getOrCreateSettings();
        settings.banners = settings.banners.filter(b => b._id.toString() !== req.params.bannerId);
        await settings.save();
        res.status(200).json({ success: true, message: "Banner removed", settings });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
}
