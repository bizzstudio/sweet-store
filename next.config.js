// next.config.js
const runtimeCaching = require("next-pwa/cache");
const nextTranslate = require("next-translate-plugin");

// תת-הנתיב שממנו החנות מוגשת (ראה src/utils/basePath.js — אותו משתנה בדיוק).
// ריק = שורש הדומיין. חייב להתחיל ב-"/" ולא להסתיים ב-"/".
const basePath = (process.env.NEXT_PUBLIC_BASE_PATH || "").replace(/\/$/, "");

const withPWA = require("next-pwa")({
  dest: "public",
  register: true,
  runtimeCaching,
  buildExcludes: [/middleware-manifest\.json$/],
  // ה-scope חייב לכלול את תת-הנתיב, אחרת הדפדפן פוסל את הרישום של ה-service
  // worker (scope רחב מהנתיב שממנו הקובץ הוגש).
  scope: `${basePath}/`,
  // next-pwa 5.6.0 מזהה את src/pages/_offline.js לבדו וקובע את נתיב הגיבוי ל-
  // "/_offline" קשיח, בלי ה-basePath (build-fallback-worker.js). התוצאה: הכתובת
  // נכנסת ל-precache, מחזירה 404 בהתקנה, וכשל של רשומה אחת מפיל את התקנת ה-
  // service worker כולה — כלומר גם המטמון וגם עמוד ה-offline מתים בשקט.
  // הגדרה מפורשת גוברת על הזיהוי האוטומטי ומשמשת גם ל-precache וגם ל-caches.match.
  fallbacks: { document: `${basePath}/_offline` },
  sw: "service-worker.js",
  skipWaiting: true,
  disable: process.env.NODE_ENV === "development",
});

const baseConfig = {
  reactStrictMode: true,
  basePath,
  eslint: { ignoreDuringBuilds: true },
  i18n: { locales: ["he"], defaultLocale: "he" },

  // צמצום ייבואי "barrel": במקום למשוך את כל סט האייקונים/הרכיבים לכל ייבוא בודד,
  // Next משכתב את הייבוא כך שרק מה שבשימוש ממש נכנס ל-bundle. חוסך JS parse+eval
  // ב-thread הראשי (הגורם ל-TBT) בלי שום שינוי קוד. אין סיכון התנהגותי.
  experimental: {
    optimizePackageImports: [
      "react-icons",
      "@heroicons/react",
      "@headlessui/react",
      "lodash",
      "react-share",
    ],
  },

  // assetPrefix בוטל בכוונה: cdn.tmarim-betomer.com לא היה CDN אמיתי אלא subdomain רגיל,
  // וגרם ל-handshake (DNS+TLS) נוסף לכל קובץ /_next/static — ~750ms+ לכל CSS/JS (render-blocking).
  // בלי assetPrefix כל הקבצים הסטטיים נטענים על אותו חיבור של ה-HTML (origin), בלי חיבור נוסף.
  // מנוטרל גם אם משתנה הסביבה ASSET_PREFIX עדיין קיים בשרת — לא נצרב יותר ב-build.
  assetPrefix: undefined,

  images: {
    // אין להגדיר כאן loader מותאם: כל ערך שאינו "default" מכבה את endpoint
    // המיטוב המובנה ‎/_next/image, וכל התמונות באתר מחזירות 404.
    // תיקון ה-basePath ל-src נעשה ב-@component/common/Img במקום.
    // רשימת דומיינים סגורה במקום התבנית הפתוחה "**" שהייתה כאן.
    //
    // "**" הפך את ‎/_next/image לפרוקסי תמונות פתוח: כל אחד יכול היה לבקש
    // מהשרת של החנות להוריד כתובת https שרירותית ולהגיש אותה מהדומיין שלנו
    // (צריכת רוחב-פס וזיכרון על חשבוננו, והסתרת המקור האמיתי מאחורי הדומיין).
    // הרשימה נגזרה מסריקה של כל כתובות התמונות ב-DB (settings/categories/
    // products/blogs/popups) ובקוד — בפועל נמצאו שני דומיינים בלבד.
    // תמונות המוצרים והלוגו הן מקומיות ואינן זקוקות להיתר.
    remotePatterns: [
      { protocol: "https", hostname: "res.cloudinary.com" },
      { protocol: "https", hostname: "i.postimg.cc" },
    ],
    // dangerouslyAllowSVG נשאר כבוי בכוונה: SVG עוקף את המנוע דרך unoptimized
    // ב-@component/common/Img, ולכן אין צורך לפתוח כאן הגשת SVG מרוחק ואין
    // צורך לשנות contentDispositionType עבור כל שאר התמונות באתר.
    // הגשת פורמטים מודרניים (קטנים ב-25%-50% מ-JPEG/PNG) — משפר LCP ומשקל תמונות.
    formats: ["image/avif", "image/webp"],
    // התמונות המעובדות ניתנות למטמון ל-31 יום במקום 60 שניות (ברירת המחדל).
    minimumCacheTTL: 2678400,
  },

  // כותרת קאש לפונטים בלבד. Next נותן ל-/_next/static (JS/CSS עם hash) קאש immutable
  // אוטומטית, אבל קבצי הפונט תחת /public מקבלים כברירת מחדל max-age=0 ונטענים מחדש בכל
  // כניסה. הפונטים בטוחים לקאש ארוך: שמות הקבצים יציבים והתוכן אינו משתנה (החלפת פונט =
  // שם קובץ חדש). תמונות /public נשארו בכוונה ללא שינוי (החלטת המשתמש: אפס סיכון להתיישנות
  // תוכן על קבצים ללא hash). הכלל אינו נוגע ב-JS, ב-service-worker, ב-HTML או ב-404.
  async headers() {
    return [
      {
        // פונטים: מיובאים ב-custom.css ונטענים ב-preload ב-_document — מרוויחים הכי מהקאש.
        source: "/fonts/:path*",
        headers: [
          { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
        ],
      },
    ];
  },

  async redirects() {
    return [
      {
        source: "/about-us",
        destination: "/עלינו",
        permanent: true,
      },
      {
        source: "/terms-and-conditions",
        destination: "/תקנון-אתר",
        permanent: true,
      },
      {
        source: "/contact-us",
        destination: "/צרו-קשר",
        permanent: true,
      },
    ];
  },

  // proxy יחסי ל-/api: כשמוגדר API_PROXY_TARGET (סביבת Docker), בקשות הדפדפן
  // ל-/api מנותבות לקונטיינר ה-backend. מערך מוחזר רץ כ-afterFiles, כך
  // שמסלולי ה-API הפנימיים של Next (/api/manifest, /api/sitemap) קודמים.
  // ללא המשתנה (למשל ב-Vercel) לא משתנה דבר.
  async rewrites() {
    const target = process.env.API_PROXY_TARGET;
    if (!target) return [];
    return [
      {
        source: "/api/:path*",
        destination: `${target}/api/:path*`,
      },
    ];
  },
};

module.exports = nextTranslate(withPWA(baseConfig));