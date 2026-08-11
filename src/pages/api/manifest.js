// src/pages/api/manifest.js
import SettingServices from "@services/SettingServices";

import { asset, assetFromSetting } from "@utils/basePath";

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
        name: seo.meta_title || "המתוקים של בני",
        short_name: seo.meta_title || "המתוקים של בני",
        description: seo.meta_description || "",
        // start_url ו-scope חייבים לכלול את תת-הנתיב שממנו החנות מוגשת, אחרת
        // הדפדפן פוסל את ה-manifest (scope מחוץ לתחום) והתקנת ה-PWA נכשלת.
        start_url: asset("/"),
        scope: asset("/"),
        display: "standalone",
        background_color: "#d5f2e6",
        theme_color: "#d5f2e6",
        // ההגדרות בשרת נשמרות כנתיב יחסי ("/logo/..."), ולכן חייבות את הקידומת
        icons: [
            ...(favicon
                ? [{ src: assetFromSetting(favicon), sizes: "any", type: "image/png" }]
                : [
                    { src: asset("/logo/logo-square-192.png"), sizes: "192x192", type: "image/png" },
                    { src: asset("/logo/logo-square.png"), sizes: "512x512", type: "image/png" },
                ]),
            ...(meta_img
                ? [
                    { src: assetFromSetting(meta_img), sizes: "192x192", type: "image/png", purpose: "any maskable" },
                    { src: assetFromSetting(meta_img), sizes: "512x512", type: "image/png", purpose: "any maskable" },
                ]
                : []),
        ],
    };

    res.setHeader("Content-Type", "application/manifest+json; charset=utf-8");
    res.setHeader("Cache-Control", "public, max-age=3600, must-revalidate");
    res.status(200).end(JSON.stringify(manifest)); // בטוח JSON טהור
}
