// src/component/common/Price.js
import useUtilsFunction from "@hooks/useUtilsFunction";
import useTranslation from "next-translate/useTranslation";
import { HIDE_PRICES } from "@utils/priceVisibility";

// המחיר הוא המידע השני בחשיבותו בכרטיס אחרי השם, ולכן הוא מקבל משקל ‎bold
// וגודל גדול מהשם — כמו בחנויות מזון מקוונות. גם הצבעים כאן תוקנו:
//   ‎text-gray-400 (‎#9ca3af) על לבן = 2.54:1 — מתחת ל-4.5:1 שהתקן דורש
//   ‎text-gray-500 (‎#6b7280) על לבן = 4.83:1 — עובר
// המחיר הישן המחוק היה בגוון הראשון ולמעשה לא היה קריא לחלק מהמשתמשים.
const Price = ({ product, price, card, currency, originalPrice }) => {
  const { getNumberTwo } = useUtilsFunction();
  const { t } = useTranslation();

  const currentPrice = product?.isCombination ? price : product?.prices?.price;
  const hasDiscount = originalPrice > price;

  // חנות ללא מחירים — ראה src/utils/priceVisibility.js. הרכיב הוא נקודת
  // התצוגה היחידה של מחיר מוצר (כרטיס, מודל, עמוד מוצר, תוצאות חיפוש,
  // מוצרי העגלה בקופה), ולכן די בבדיקה אחת כאן.
  if (HIDE_PRICES) return null;

  return (
    <div className="flex flex-wrap gap-x-2 items-baseline font-serif product-price font-bold me-auto">
      <span
        className={
          card
            ? "inline-block text-base sm:text-lg font-bold text-gray-900 tabular-nums"
            : "inline-block text-2xl font-bold text-gray-900 tabular-nums"
        }
      >
        {currency}
        {getNumberTwo(currentPrice)}
      </span>

      {hasDiscount && (
        <del
          className={
            card
              ? "text-xs sm:text-sm font-normal text-gray-500 tabular-nums"
              : "text-lg font-normal text-gray-500 tabular-nums"
          }
        >
          {/* ‎<del> לבדו אינו מוכרז בחלק מקוראי המסך, והמשתמש שומע שני מחירים
              עוקבים בלי לדעת מי מהם התקף. התווית המוסתרת מבהירה זאת. */}
          <span className="sr-only">{t("common:oldPrice")}: </span>
          {currency}
          {getNumberTwo(originalPrice)}
        </del>
      )}
    </div>
  );
};

export default Price;
