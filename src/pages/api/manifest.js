// src/pages/api/manifest.js
import SettingServices from "@services/SettingServices";

export default async function handler(req, res) {
    const setting = await SettingServices.getStoreSeoSetting().catch(() => null);
    const seo = setting?.seo || {};

    // המרת קישורי תמונה לא מאובטחים (http://) ל-https:// למניעת Mixed Content.
    // URL שכבר https או נתיב יחסי נשאר כמו שהוא — אין שינוי לוגיקה.
    const toHttps = (url) =>
        typeof url === "string" ? url.replace(/^http:\/\//i, "https://") : url;
    const favicon = toHttps(seo.favicon);
    const meta_img = toHttps(seo.meta_img);

    const manifest = {
        name: seo.meta_title || "תמרים בתומר",
        short_name: seo.meta_title || "תמרים בתומר",
        description: seo.meta_description || "",
        start_url: "/",
        display: "standalone",
        background_color: "#f7f2cd",
        theme_color: "#f7f2cd",
        icons: [
            ...(favicon
                ? [{ src: favicon, sizes: "any", type: "image/png" }]
                : [{ src: "/Tomer dates.png", sizes: "any", type: "image/png" }]),
            ...(meta_img
                ? [
                    { src: meta_img, sizes: "192x192", type: "image/png", purpose: "any maskable" },
                    { src: meta_img, sizes: "512x512", type: "image/png", purpose: "any maskable" },
                ]
                : []),
        ],
    };

    res.setHeader("Content-Type", "application/manifest+json; charset=utf-8");
    res.setHeader("Cache-Control", "public, max-age=3600, must-revalidate");
    res.status(200).end(JSON.stringify(manifest)); // בטוח JSON טהור
}
