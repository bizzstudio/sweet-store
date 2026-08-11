// src/component/common/Img.jsx
//
// עטיפה דקה סביב next/image שמוסיפה את ה-basePath ל-src מקומי.
//
// למה זה נחוץ:
// Next מוסיף את ה-basePath לכתובת של ‎/_next/image, אבל **לא** לערך שבתוך
// ‎?url=. כשהחנות מוגשת מתת-נתיב, src="/logo/logo-mark.png" גורם למנוע המיטוב
// לחפש את הקובץ בשורש הדומיין — שם הוא לא קיים — והתמונה נשברת (400).
//
// למה כאן ולא ב-images.loader:
// כל loader מותאם ב-next.config.js מכבה את endpoint המיטוב המובנה, וכל
// התמונות באתר מחזירות 404. העטיפה שומרת על המיטוב (avif/webp, resize, cache)
// ומתקנת רק את ה-src.
//
// למה לא לעטוף כל קריאה בנפרד:
// חלק גדול מה-src-ים מגיעים מה-DB (הלוגו נשמר כ-"/logo/logo-mark.png",
// ואייקוני קטגוריות בדומה), ולכן אי אפשר לדעת בזמן כתיבה אילו מהם מקומיים.
// assetFromSetting מזהה זאת בזמן ריצה: URL מלא עובר כמו שהוא, נתיב מקומי
// מקבל קידומת, ונתיב שכבר נושא אותה לא מקבל אותה פעמיים.
//
// שימוש: `import Image from "@component/common/Img";` במקום מ-"next/image".
import NextImage from "next/image";

import { assetFromSetting } from "@utils/basePath";

// ייבוא סטטי מגיע כאובייקט ({src, width, height}) וכבר נושא את הקידומת —
// נוגעים רק במחרוזות. מחרוזת ריקה נשארת ריקה כדי לא לשנות התנהגות קיימת.
const normalize = (src) =>
  typeof src === "string" && src ? assetFromSetting(src) : src;

const Img = ({ src, ...rest }) => <NextImage src={normalize(src)} {...rest} />;

export default Img;
