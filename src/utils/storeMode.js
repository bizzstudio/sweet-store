// src/utils/storeMode.js
//
// מצב "חנות סגורה": האתר ממשיך לפעול, אבל רק כאזור אישי. הקטלוג, החיפוש,
// העגלה והצ'קאאוט חסומים לחלוטין — כל כניסה מנותבת לעמוד ההתחברות (מבקר לא
// מחובר) או ישירות לאזור האישי (לקוח מחובר).
//
// להחזרת החנות לפעילות מלאה: להחליף ל-false ולבנות מחדש (npm run build).
// הקובץ מיובא גם ב-middleware (Edge runtime) וגם בקומפוננטות — לכן ללא תלויות.
//
// 27/08/2026: החנות נפתחה מחדש. הקטלוג, החיפוש, העגלה והצ'קאאוט פתוחים לכולם;
// שמירת ההזמנה דורשת חשבון (ראו AUTH_REQUIRED_PREFIXES למטה).
export const STORE_CLOSED = false;

// יעד ברירת המחדל של לקוח מחובר כשהחנות סגורה
export const CLOSED_HOME = "/user/dashboard";

// עמוד ההתחברות הייעודי שמבקר לא מחובר מגיע אליו
export const LOGIN_PATH = "/login";

// עמודים שנשארים פתוחים לכולם, גם ללא התחברות: תוכן ומידע משפטי בלבד.
// (‎/about-us,‎ /contact-us ו-‎/terms-and-conditions מופנים ב-next.config.js
// לגרסאות העבריות, ולכן מופיעים כאן משני הצדדים)
const PUBLIC_PATHS = [
  LOGIN_PATH,
  // עמוד הגיבוי של ה-PWA. ה-service worker מוריד אותו בזמן ההתקנה, ותשובת
  // הפניה (307) אינה ניתנת לשמירה ב-Cache — רשומה אחת שנכשלת מפילה את התקנת
  // ה-service worker כולה. העמוד סטטי ואינו חושף מידע, ולכן נשאר פתוח.
  "/_offline",
  "/עלינו",
  "/צרו-קשר",
  "/תקנון-אתר",
  "/about-us",
  "/contact-us",
  "/terms-and-conditions",
  "/privacy-policy",
  "/accessibility-statement",
  "/faqs",
];

// תחיליות פתוחות לכולם. אימות אימייל ואיפוס סיסמה מגיעים מקישור במייל דווקא
// כשהלקוח אינו מחובר — לכן הם חייבים להישאר ציבוריים למרות שהם תחת ‎/user
const PUBLIC_PREFIXES = [
  "/user/email-verification",
  "/user/forget-password",
];

// מסלולים שנשארים פתוחים אך דורשים התחברות **כשהחנות סגורה**. הבדיקה היא לפי
// תחילית, כך שגם תתי-העמודים (‎/user/my-orders,‎ /order/123) נכללים.
//
// הרשימה רחבה בכוונה: במצב "חנות סגורה" ממילא אין גלישה אנונימית, ולכן גם
// מסלולי הרכישה נכללים בה.
const PROTECTED_PREFIXES = [
  "/user", // האזור האישי על כל עמודיו
  "/order", // צפייה בהזמנה קיימת
  "/success", // סיום תשלום
  "/failed", // כישלון תשלום
  "/cashier-desk", // עמדת הקופה (מוגנת בנפרד בבדיקת isCashier)
];

// מסלולים שדורשים התחברות **גם כשהחנות פתוחה**.
//
// ‎/checkout אינו ברשימה בכוונה: אורח רשאי להגיע לעמוד ולראות את ההזמנה.
// מ-14/10/2026 אין רכישה כאורח, אבל דרישת ההתחברות יושבת על כפתור "שמירת
// ההזמנה" עצמו (component/checkout/CheckoutActions.jsx), והשרת חוסם את
// ‎/order/add-guest (sweet-backend/routes/customerOrderRoutes.js).
//
// מה שכן נכלל הוא מה שאין לו שום משמעות בלי משתמש מזוהה: האזור האישי ועמדת
// הקופה. עד כה הם היו מוגנים בהפניה בצד הלקוח בלבד (useEffect שמנתב כשאין
// userInfo), כלומר העמוד נשלח לדפדפן לפני שההפניה רצה.
const AUTH_REQUIRED_PREFIXES = [
  "/user", // האזור האישי — הזמנות, כתובות, פרטי לקוח
  "/cashier-desk", // עמדת הקופה (הרשאת isCashier נבדקת בנוסף בעמוד עצמו)
];

// נתיבים מגיעים מה-URL ולכן עלולים להיות מקודדים (עברית = ‎%D7%A2...).
// decodeURIComponent זורק על קידוד פגום — במקרה כזה עובדים על המחרוזת כמו שהיא.
const decodePath = (pathname) => {
  try {
    return decodeURIComponent(pathname);
  } catch (e) {
    return pathname;
  }
};

const matchesPrefix = (path, prefix) =>
  path === prefix || path.startsWith(`${prefix}/`);

// עמוד פתוח לכולם, גם למי שלא מחובר
export const isPublicPath = (pathname) => {
  const path = decodePath(pathname);
  if (PUBLIC_PATHS.includes(path)) return true;
  return PUBLIC_PREFIXES.some((prefix) => matchesPrefix(path, prefix));
};

// עמוד שנשאר זמין אך מחייב לקוח מחובר (רלוונטי כשהחנות סגורה)
export const isProtectedPath = (pathname) => {
  const path = decodePath(pathname);
  return PROTECTED_PREFIXES.some((prefix) => matchesPrefix(path, prefix));
};

// עמוד שמחייב לקוח מחובר גם בחנות פתוחה. חייב להיבדק *אחרי* isPublicPath,
// כי אימות אימייל ואיפוס סיסמה יושבים תחת ‎/user ומגיעים דווקא ממי שאינו מחובר.
export const isAuthRequiredPath = (pathname) => {
  const path = decodePath(pathname);
  return AUTH_REQUIRED_PREFIXES.some((prefix) => matchesPrefix(path, prefix));
};

// סניטציה של פרמטר redirect. מותר רק נתיב פנימי: "//host", "https://host"
// ו-"/\host" (הדפדפן מתרגם בקסלאש ללוכסן) הם ניווט אל מחוץ לאתר. ערך כפול
// בשאילתה מגיע כמערך ולכן נופל בבדיקת הטיפוס.
//
// פסילת תווי בקרה היא הכרחית ולא קוסמטית: מפענח ה-URL מוחק TAB/CR/LF לפני
// הפענוח, ולכן "/%09/evil.com" עובר כנתיב יחסי ואז הופך ל-"//evil.com" -
// כלומר Open Redirect אל דומיין זר.
//
// משמש גם ב-middleware וגם ב-useLoginSubmit כדי שיהיה כלל אחד בלבד
export const safeInternalPath = (value) =>
  typeof value === "string" &&
  /^\/(?![/\\])/.test(value) &&
  !/[\u0000-\u001F\u007F]/.test(value)
    ? value
    : null;
