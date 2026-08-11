// src/utils/basePath.js
//
// תת-הנתיב שממנו החנות מוגשת. בשרת הנוכחי היא יושבת תחת
// https://srv2.bizzstudio.co.il/sweet-store, ולכן NEXT_PUBLIC_BASE_PATH="/sweet-store".
// בפיתוח (ובדומיין ייעודי בעתיד) המשתנה ריק והכל מתנהג כרגיל.
//
// Next מוסיף את ה-basePath לבדו ל-<Link>, ל-router.push ול-next/image, אבל **לא**
// לנתיבים שנכתבים ידנית: <img src="/...">, url() ב-CSS, ו-href של ה-manifest.
// לכל אלה חייבים לעטוף ב-asset(). זהו המקור היחיד לאמת.
//
// הערך נצרב ל-bundle בזמן ה-build (NEXT_PUBLIC_*), ולכן שינוי שלו מחייב build מחדש.
export const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH || "";

// נתיב לנכס סטטי מתוך public/. תמיד לקרוא עם נתיב שמתחיל ב-"/".
export const asset = (path = "") => `${BASE_PATH}${path}`;

// ערך שמגיע מהגדרות החנות בשרת (favicon, meta_img). הוא יכול להיות URL מלא
// (Cloudinary/S3), נתיב יחסי שנשמר בדשבורד ("/logo/logo-square.png"), או ריק.
// רק נתיב יחסי צריך את הקידומת — ולכן אי אפשר להסתפק כאן ב-`value || asset(...)`,
// שהיה מדלג על הקידומת בדיוק כשהערך כן קיים.
export const assetFromSetting = (value, fallback = "") => {
  const raw = typeof value === "string" ? value.trim() : "";
  if (!raw) return fallback ? asset(fallback) : "";
  // URL מלא, protocol-relative או data: — מוגש כמו שהוא
  if (/^(https?:)?\/\//i.test(raw) || raw.startsWith("data:")) return raw;
  const path = raw.startsWith("/") ? raw : `/${raw}`;
  // הגנה מפני קידומת כפולה אם הערך כבר נשמר עם תת-הנתיב
  if (BASE_PATH && (path === BASE_PATH || path.startsWith(`${BASE_PATH}/`))) return path;
  return asset(path);
};
