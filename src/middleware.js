// src/middleware.js
//
// שער הכניסה לאתר כשהחנות סגורה (ראו src/utils/storeMode.js).
// רץ לפני כל בקשת עמוד ומנתב:
//   מבקר לא מחובר  ->  /login  (למעט עמודי מידע ותקנון)
//   לקוח מחובר      ->  /user/dashboard לכל ניסיון גלישה בחנות
// כשהדגל STORE_CLOSED כבוי הקובץ לא עושה דבר והאתר מתנהג כרגיל.
import { NextResponse } from "next/server";

import {
  STORE_CLOSED,
  CLOSED_HOME,
  LOGIN_PATH,
  isPublicPath,
  isProtectedPath,
  safeInternalPath,
} from "@utils/storeMode";

export function middleware(request) {
  if (!STORE_CLOSED) return NextResponse.next();

  const { pathname, search } = request.nextUrl;

  // עוגיית ההתחברות נכתבת ב-useLoginSubmit ונמחקת בהתנתקות. די בקיומה כדי
  // להחליט לאן לנתב — תקפות הטוקן עצמו נבדקת ממילא מול ה-API בכל עמוד.
  const isLoggedIn = Boolean(request.cookies.get("userInfo")?.value);

  const toLogin = () => {
    const url = request.nextUrl.clone();
    url.pathname = LOGIN_PATH;
    url.search = "";
    // שמירת היעד המקורי כדי לחזור אליו אחרי ההתחברות
    if (pathname !== "/") {
      url.searchParams.set("redirect", `${pathname}${search}`);
    }
    return NextResponse.redirect(url);
  };

  // מקבל נתיב פנימי מלא (כולל שאילתה) ומחזיר אליו הפניה באותו origin.
  //
  // חובה לעבור דרך nextUrl.clone() ולא דרך new URL(target, request.url): ב-
  // middleware הנתיב מגיע כבר בלי ה-basePath, ו-target הוא נתיב מוחלט ("/login")
  // שהיה דורס גם את תת-הנתיב — כלומר הפניה ל-srv2.bizzstudio.co.il/login במקום
  // ל-/sweet-store/login. nextUrl יודע להחזיר את ה-basePath בעצמו.
  const redirectTo = (target) => {
    const url = request.nextUrl.clone();
    const [pathnameOnly, queryString = ""] = target.split("?");
    url.pathname = pathnameOnly;
    url.search = queryString;
    return NextResponse.redirect(url);
  };

  const toDashboard = () => redirectTo(CLOSED_HOME);

  // עמוד ההתחברות: לקוח שכבר מחובר לא צריך אותו
  if (pathname === LOGIN_PATH) {
    if (!isLoggedIn) return NextResponse.next();

    // כיבוד היעד שנשמר לפני ההתחברות. זה גם מה שמציל את הזרימה מהמירוץ
    // שב-useLoginSubmit, שבו window.location.reload גובר על הניווט ומחזיר
    // את הדפדפן לעמוד ההתחברות דווקא אחרי שהעוגייה כבר נכתבה
    const wanted = safeInternalPath(
      request.nextUrl.searchParams.get("redirect")
    );
    // יעד שמצביע חזרה לעמוד ההתחברות היה יוצר לולאת הפניות
    const backToLogin =
      wanted === LOGIN_PATH || wanted?.startsWith(`${LOGIN_PATH}?`);

    return redirectTo(wanted && !backToLogin ? wanted : CLOSED_HOME);
  }

  // עמודי מידע ותקנון — פתוחים לכולם
  if (isPublicPath(pathname)) return NextResponse.next();

  // האזור האישי וההזמנות — פתוחים למחוברים בלבד
  if (isProtectedPath(pathname)) {
    return isLoggedIn ? NextResponse.next() : toLogin();
  }

  // כל שאר החנות (דף הבית, מוצרים, קטגוריות, חיפוש, עגלה, צ'קאאוט) סגורה
  return isLoggedIn ? toDashboard() : toLogin();
}

export const config = {
  matcher: [
    // דף הבית נרשם בנפרד: התבנית שמתחתיו נבנית ב-path-to-regexp כסגמנט
    // חובה, ולכן "/" לבדו אינו נתפס בה.
    //
    // שימו לב: בקשת ה-data של דף הבית (/_next/data/<build>/index.json), זו
    // שנשלחת בניווט פנימי בתוך האתר, אינה מגיעה ל-middleware בשום תצורת
    // matcher - להבדיל מכל שאר העמודים, שכן נבדקו ומכוסים. לכן החסימה של דף
    // הבית מוגדרת גם ב-getServerSideProps שלו (src/pages/index.js)
    "/",
    // מדלגים על ה-API, על נכסי Next הפנימיים ועל כל קובץ סטטי (כל נתיב שיש
    // בו נקודה: תמונות, פונטים, service-worker.js, manifest וכו').
    "/((?!api/|_next/|.*\\.).*)",
  ],
};
