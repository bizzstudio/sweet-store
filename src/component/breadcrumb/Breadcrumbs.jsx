// src/component/breadcrumb/Breadcrumbs.jsx
import Link from "next/link";
import { IoChevronBack } from "react-icons/io5";
import useTranslation from "next-translate/useTranslation";

/**
 * פירורי לחם — "איפה אני באתר" בראש כל עמוד פנימי.
 *
 * עד עכשיו לא היה באתר שום סימון מיקום: לקוח שהגיע לעמוד קטגוריה מתוצאות
 * חיפוש בגוגל לא ידע מה הקטגוריה שמעליו ואיך לחזור לקטלוג, וגם קורא מסך לא
 * קיבל את ההיררכיה. זה גם רכיב שמנועי חיפוש מציגים בתוצאה עצמה.
 *
 * @param {{label: string, href?: string}[]} items
 *        הפריט האחרון הוא העמוד הנוכחי ולכן בלי href.
 *        "דף הבית" מתווסף כאן ולא צריך להישלח.
 */
const Breadcrumbs = ({ items = [] }) => {
  const { t } = useTranslation();

  const trail = [{ label: t("common:breadcrumbHome"), href: "/" }, ...items];

  return (
    <nav aria-label={t("common:breadcrumb")} className="w-full">
      {/* ‎<ol> ולא ‎<div>: הסדר הוא המשמעות כאן, וקורא מסך מכריז "פריט 2 מתוך 3" */}
      <ol className="flex flex-wrap items-center gap-x-1 gap-y-1 text-sm text-gray-600">
        {trail.map((item, index) => {
          const isLast = index === trail.length - 1;
          return (
            <li key={`${item.label}-${index}`} className="flex items-center gap-x-1">
              {index > 0 && (
                // ‎aria-hidden: המפריד הוא קישוט. בלעדיו קורא מסך מקריא
                // "חץ שמאלה" בין כל שני פריטים.
                <IoChevronBack
                  aria-hidden="true"
                  className="text-gray-500 shrink-0"
                  size={14}
                />
              )}
              {isLast || !item.href ? (
                // ‎aria-current="page" הוא הסימון התקני לפריט הנוכחי בשרשרת
                <span
                  aria-current="page"
                  className="font-semibold text-gray-900 line-clamp-1"
                >
                  {item.label}
                </span>
              ) : (
                <Link
                  href={item.href}
                  className="hover:text-mainColor-superDark hover:underline underline-offset-2 py-1"
                >
                  {item.label}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};

export default Breadcrumbs;
