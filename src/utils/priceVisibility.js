// src/utils/priceVisibility.js
//
// מתג יחיד שמכבה את *הצגת* המחירים בכל ממשק החנות: מחיר מוצר בכרטיס, במודל
// ובעמוד המוצר, סכומי העגלה, סיכום העלויות בקופה, טבלת ההזמנות והחשבונית.
//
// המתג נוגע לתצוגה בלבד. החישובים (customCartTotal, total, shippingCost,
// הנחות, מינימום הזמנה) ממשיכים לרוץ כרגיל וההזמנה נשלחת לשרת עם אותם
// סכומים בדיוק — אחרת קליטת ההזמנה, החיוב ב-iCount והדוחות היו נשברים.
//
// ברירת המחדל היא הסתרה, והיא נקבעת ב-next.config.js תחת "env" — שם הערך
// נצרב כקבוע לתוך ה-bundle של השרת *ושל* הדפדפן בזמן ה-build, ולכן שני
// הצדדים תמיד מסכימים ואין אי-התאמה ב-hydration.
//
// להחזרת המחירים: ‎NEXT_PUBLIC_HIDE_PRICES=false **בזמן ה-build** ‎(npm run
// build), לא בסביבת הריצה. הגדרה בזמן ריצה בלבד לא תשפיע כלל.
export const HIDE_PRICES =
  String(process.env.NEXT_PUBLIC_HIDE_PRICES ?? "").trim().toLowerCase() !== "false";

export default HIDE_PRICES;
