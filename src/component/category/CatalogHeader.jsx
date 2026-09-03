// src/component/category/CatalogHeader.jsx
import Link from "next/link";
import useTranslation from "next-translate/useTranslation";

import Breadcrumbs from "@component/breadcrumb/Breadcrumbs";
import SortDropdown from "@component/common/SortDropdown";
import useUtilsFunction from "@hooks/useUtilsFunction";

/**
 * כותרת אחידה לכל עמודי הקטלוג (קטגוריה, תת-קטגוריה, חיפוש).
 *
 * קודם כל עמוד בנה לעצמו בלוק כותרת משלו מתוך ‎MinimalTitle + ‎<h6> + מיון,
 * בלי פירורי לחם ובלי דרך לעבור בין תת-קטגוריות: מי שנחת בקטגוריה ראשית לא
 * ראה בכלל שיש בה חלוקה פנימית, והדרך היחידה אליה הייתה תפריט ריחוף בהידר
 * שאינו קיים במובייל. הרכיב הזה מרכז את שלושתם:
 *
 *   1. פירורי לחם  — היכן אני והדרך חזרה
 *   2. ‎<h1> + מונה — מה אני רואה וכמה
 *   3. שורת תת-קטגוריות + מיון — לאן אפשר להמשיך מכאן
 */
const CatalogHeader = ({
  title,
  breadcrumbs = [],
  totalProducts,
  // הקטגוריה הראשית — ממנה נגזרות התת-קטגוריות המוצגות כשורת צ'יפים
  parentCategory,
  parentCategorySlug,
  activeSubCategorySlug,
  sortedField,
  onSortChange,
}) => {
  const { t } = useTranslation();
  const { showingTranslateValue, getCategorySlug } = useUtilsFunction();

  const subCategories = parentCategory?.children ?? [];

  return (
    <header className="w-full">
      <div className="pt-3 pb-2">
        <Breadcrumbs items={breadcrumbs} />
      </div>

      <div className="bg-white border border-gray-200 rounded-xl px-4 py-3.5 sm:px-5 sm:py-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <span aria-hidden="true" className="w-1.5 self-stretch min-h-[2.5rem] bg-mainColor rounded shrink-0" />
            <div className="min-w-0">
              {/* ‎<h1> אחד לעמוד — לפני כן ‎MinimalTitle הפיק ‎<h1> לכותרת
                  ו-‎<h2> לתת-הכותרת, וברשימת הכותרות של קורא מסך זה נראה
                  כמו שני מסמכים שונים. */}
              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 leading-tight break-words">
                {title}
              </h1>
              {typeof totalProducts === "number" && (
                // ‎aria-live: המספר משתנה כשמחליפים מיון או טוענים עוד,
                // וללא ההכרזה משתמש קורא-מסך לא יודע שמשהו קרה.
                <p
                  aria-live="polite"
                  className="text-sm text-gray-600 mt-0.5"
                >
                  <span className="font-bold text-gray-900">{totalProducts}</span>{" "}
                  {t("common:itemsFound")}
                </p>
              )}
            </div>
          </div>

          {typeof totalProducts === "number" && totalProducts > 0 && onSortChange && (
            <div className="shrink-0">
              <SortDropdown
                sortedField={sortedField}
                setSortedField={onSortChange}
              />
            </div>
          )}
        </div>

        {/* שורת תת-קטגוריות — הדרך היחידה לראות במובייל שלקטגוריה יש חלוקה
            פנימית. גלילה אופקית ולא עטיפה לשורות, כדי שהכותרת לא תתפח
            לחצי מסך בקטגוריה עם 20 תת-קטגוריות. */}
        {subCategories.length > 0 && parentCategorySlug && (
          <nav
            aria-label={t("common:subCategories")}
            className="mt-3 pt-3 border-t border-gray-100"
          >
            <ul className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
              <li className="shrink-0">
                <Link
                  href={`/product-category/${parentCategorySlug}`}
                  aria-current={!activeSubCategorySlug ? "page" : undefined}
                  className={
                    !activeSubCategorySlug
                      ? "inline-flex items-center h-9 px-4 rounded-full text-sm font-bold bg-mainColor-dark text-white whitespace-nowrap"
                      : "inline-flex items-center h-9 px-4 rounded-full text-sm font-medium bg-gray-100 text-gray-800 hover:bg-mainColor-light whitespace-nowrap transition-colors"
                  }
                >
                  {t("common:allInCategory")}
                </Link>
              </li>
              {subCategories.map((sub) => {
                const slug = getCategorySlug(sub);
                const isActive = slug === activeSubCategorySlug;
                return (
                  <li key={sub._id} className="shrink-0">
                    <Link
                      href={`/product-category/${parentCategorySlug}/${slug}`}
                      aria-current={isActive ? "page" : undefined}
                      className={
                        isActive
                          ? "inline-flex items-center h-9 px-4 rounded-full text-sm font-bold bg-mainColor-dark text-white whitespace-nowrap"
                          : "inline-flex items-center h-9 px-4 rounded-full text-sm font-medium bg-gray-100 text-gray-800 hover:bg-mainColor-light whitespace-nowrap transition-colors"
                      }
                    >
                      {showingTranslateValue(sub.name)}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>
        )}
      </div>
    </header>
  );
};

export default CatalogHeader;
