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

// תמונת ברירת המחדל של כל מוצר: הסוכריה מתוך הלוגו.
//
// לאף מוצר אין צילום אמת. שדה image ב-DB מצביע על ‎/product-images/<מק"ט>.webp —
// אייקון קווי (בקבוק, שקית...) שנוצר ב-generate-product-images.js. הנתיבים האלה
// מוחלפים כאן בסוכריה במקום לייצר את הקבצים מחדש: ‎/_next/image שומר כל תמונה
// 31 יום (minimumCacheTTL), כך שקובץ שהוחלף באותו שם היה ממשיך להופיע בגרסתו
// הישנה. תמונה אמיתית (URL מלא או נתיב אחר) עוברת כרגיל.
export const PRODUCT_PLACEHOLDER = "/logo/candy.svg";
const GENERATED_PRODUCT_IMAGE = /\/product-images\//;

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
  if (GENERATED_PRODUCT_IMAGE.test(path)) return asset(PRODUCT_PLACEHOLDER);
  // הגנה מפני קידומת כפולה אם הערך כבר נשמר עם תת-הנתיב
  if (BASE_PATH && (path === BASE_PATH || path.startsWith(`${BASE_PATH}/`))) return path;
  return asset(path);
};
