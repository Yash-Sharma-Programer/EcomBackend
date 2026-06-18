const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema({
  siteName: String,
  siteDescription: String,
  logo: String,
  favicon: String,
  contactEmail: String,
  contactPhone: String,
  contactAddress: String,
  socialMedia: {
    facebook: String,
    twitter: String,
    instagram: String,
    youtube: String
  },
  banners: [{
    title: String,
    image: String,
    link: String,
    order: Number
  }],
  footerContent: String,
  seoSettings: {
    defaultMetaDescription: String,
    defaultMetaKeywords: String
  },
  emailSettings: {
    smtpHost: String,
    smtpPort: String,
    email: String,
    password: String
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Settings', settingsSchema);
