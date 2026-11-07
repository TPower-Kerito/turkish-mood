/**
 * Turkish Mood - Web App Configuration
 * =====================================
 * This file contains global settings for the catalog.
 */

const CONFIG = {
  // Brand details
  BRAND_NAME: "Turkish Mood",
  BRAND_TAGLINE: "المذاق التركي الأصيل - أفخر أنواع البن والشوكولاتة المستوردة",
  FACEBOOK_URL: "https://www.facebook.com/profile.php?id=61591511417302",
  
  // Phase 1 / Phase 2 Controls
  // Set to true in Phase 2 to activate WhatsApp ordering buttons and floating drawer
  ENABLE_WHATSAPP: false,
  ENABLE_WHATSAPP_ORDER: false, // Alias for GEMINI.md compliance
  WHATSAPP_PHONE: "201000000000", // Will be used when Phase 2 is enabled

  // Hybrid Data Source (Optional Google Sheets CSV sync)
  // Publish your Google Sheet as CSV and paste the URL here.
  // Example: "https://docs.google.com/spreadsheets/d/e/2PACX-.../pub?output=csv"
  // If left empty or offline, the app uses products.json immediately.
  GOOGLE_SHEET_CSV_URL: "",

  // Default UI Settings (can be toggled in floating preview panel & stored in localStorage)
  DEFAULT_THEME: "dark-luxury", // 'dark-luxury' | 'cream-minimalist' | 'cafe-compact'
  DEFAULT_IMAGE_MODE: "crop",   // 'crop' (Smart Crop top 78%) | 'full' (Contain original)
  DEFAULT_GROUPING: "separate", // 'separate' (Cards) | 'merged' (Same roast/brand variants)
  
  // Currency & Formatting
  CURRENCY: "ج.م",
  CURRENCY_CODE: "EGP"
};

// Export to window for browser or module for node
if (typeof window !== "undefined") {
  window.CONFIG = CONFIG;
}
if (typeof module !== "undefined") {
  module.exports = CONFIG;
}
