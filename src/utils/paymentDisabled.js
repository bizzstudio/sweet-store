// src/utils/paymentDisabled.js
//
// מתג יחיד שמכבה את שלב התשלום בחנות. במצב הזה הכפתור בסוף הקופה הוא
// "שמירת ההזמנה": ההזמנה נשמרת, עוברת ישירות לאדמין לטיפול, ואין הפניה
// לדף הסליקה של קארדקום כלל. הגבייה נעשית מחוץ לאתר.
//
// המתג נוגע רק לזרימת התשלום — לא לחישובים. הסכומים (customCartTotal, total,
// shippingCost, הנחות) ממשיכים להישלח לשרת בדיוק כמו קודם, אחרת קליטת
// ההזמנה, החיוב ב-iCount והדוחות היו נשברים.
//
// ברירת המחדל היא "ללא תשלום", במקביל להסתרת המחירים
// (ראה src/utils/priceVisibility.js) — חנות שלא מציגה מחירים גם לא גובה.
//
// להחזרת התשלום צריך *שני* דברים, אחרת המסלול נשבר באמצע:
//   1. בחנות:  NEXT_PUBLIC_PAYMENT_DISABLED=false **בזמן ה-build** (npm run build),
//              לא בסביבת הריצה — הערך נצרב ב-bundle דרך "env" ב-next.config.js.
//   2. בשרת:   PAYMENT_DISABLED=false ב-sweet-backend (משתנה סביבה + restart).
// אם רק צד אחד ישתנה, החנות תמתין לקישור תשלום שלא יגיע (או להפך).
export const PAYMENT_DISABLED =
  String(process.env.NEXT_PUBLIC_PAYMENT_DISABLED ?? "").trim().toLowerCase() !== "false";

export default PAYMENT_DISABLED;
