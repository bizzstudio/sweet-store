// src/component/category/CategoryCard.js
import Image from "@component/common/Img";
import Link from "next/link";
import { useContext, useState } from "react";
import { useRouter } from "next/router";
import {
  IoChevronDownOutline,
  IoChevronBackOutline,
  IoRemoveSharp,
} from "react-icons/io5";

import { SidebarContext } from "@context/SidebarContext";
import useUtilsFunction from "@hooks/useUtilsFunction";
import useTranslation from "next-translate/useTranslation";

// פונקציה להחזיר אייקונים לפי קטגוריה (זמנית - צריך להגיע מהשרת)
const CATEGORY_ICON_FALLBACK = "/category-icons/general.svg";
const getCategoryIconByCode = (category) => {
  return {
    bw: category.icon || CATEGORY_ICON_FALLBACK,
    color: category.coloredIcon || category.icon || CATEGORY_ICON_FALLBACK
  };
};

const CategoryCard = ({ title, nested, id, onLinkClick }) => {
  const router = useRouter();
  const { query, pathname, asPath } = router;
  const { showingTranslateValue, getCategorySlug } = useUtilsFunction();
  const { closeCategoryDrawer, setIsLoading } = useContext(SidebarContext);

  // אם אין nested או זה ריק, לא מציגים כלום
  if (!nested || nested.length === 0) {
    return null;
  }

  const handleCategoryClick = (category) => {
    const categorySlug = getCategorySlug(category);
    const targetPath = `/product-category/${categorySlug}`;
    
    // בדיקה אם כבר נמצאים באותו מקום
    if (asPath === targetPath) {
      closeCategoryDrawer();
      if (onLinkClick) setTimeout(() => onLinkClick(), 100);
      return;
    }

    closeCategoryDrawer();
    if (onLinkClick) setTimeout(() => onLinkClick(), 100);
    router.push(targetPath);
  };

  const handleSubCategoryClick = (category, subCategory) => {
    const categorySlug = getCategorySlug(category);
    const subCategorySlug = getCategorySlug(subCategory);
    const targetPath = `/product-category/${categorySlug}/${subCategorySlug}`;
    
    // בדיקה אם כבר נמצאים באותו מקום
    if (asPath === targetPath) {
      closeCategoryDrawer();
      if (onLinkClick) setTimeout(() => onLinkClick(), 100);
      return;
    }

    // אחרת – מתחילים טעינה ומעבירים
    closeCategoryDrawer();
    if (onLinkClick) setTimeout(() => onLinkClick(), 100);
    router.push(targetPath);
  };

  return (
    <div className="space-y-1">
      {nested.map((category) => (
        <CategoryItem
          key={category._id}
          category={category}
          showingTranslateValue={showingTranslateValue}
          onCategoryClick={() => handleCategoryClick(category)}
          onSubCategoryClick={(subCategory) => handleSubCategoryClick(category, subCategory)}
        />
      ))}
    </div>
  );
};

// קומפוננטה נפרדת לכל קטגוריה
const CategoryItem = ({ category, showingTranslateValue, onCategoryClick, onSubCategoryClick }) => {
  const [show, setShow] = useState(false);
  const toggleShow = () => setShow(!show);
  const { getCategorySlug } = useUtilsFunction();
  const { t } = useTranslation();

  const categoryTitle = showingTranslateValue(category.name);
  const categorySlug = getCategorySlug(category);
  const icon = getCategoryIconByCode(category);
  const hasChildren = category.children && category.children.length > 0;

  return (
    <>
      <div className="flex items-center rounded-md hover:bg-mainColor-light w-full hover:text-mainColor-dark cursor-pointer select-none">
        <Link
          href={`/product-category/${categorySlug}`}
          // ‎onMouseDown לא נורה בניווט מקלדת (Enter) ולא באירועי מגע מסוימים,
          // ולכן המגירה נשארה פתוחה מעל עמוד היעד. ‎onClick נורה בכל המקרים.
          onClick={onCategoryClick}
          className="py-2.5 px-2 flex items-center w-full gap-3 group min-h-[44px]"
        >
          {/* שתי התמונות הן אותו אייקון בשני מצבי ריחוף — קישוט טהור לצד שם
              הקטגוריה. ‎alt="Category BW" / "Category Color" גרם לקורא מסך
              להקריא שתי מחרוזות אנגליות חסרות משמעות לפני כל שם קטגוריה. */}
          <div aria-hidden="true" className="relative w-[40px] h-[40px] shrink-0">
            <Image
              src={icon.bw}
              width={40}
              height={40}
              alt=""
              className="absolute top-0 left-0 object-contain transition-opacity duration-200 group-hover:opacity-0"
            />
            <Image
              src={icon.color}
              width={40}
              height={40}
              alt=""
              className="absolute top-0 left-0 object-contain opacity-0 transition-opacity duration-200 group-hover:opacity-100"
            />
          </div>
          <div className="inline-flex items-center justify-between text-lg font-medium w-full hover:text-mainColor-dark">
            {categoryTitle}
          </div>
        </Link>

        {hasChildren && (
          // ‎<span onClick> — לא מקבל פוקוס, לא מגיב ל-Enter/רווח ולא מוכרז
          // כרכיב לחיץ. במובייל זו הדרך היחידה להגיע לתת-הקטגוריות, כלומר
          // הן היו בלתי נגישות לחלוטין במקלדת ובקורא מסך.
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              toggleShow();
            }}
            aria-expanded={show}
            aria-label={`${show ? t("common:closeMenu") : t("common:openMenu")} – ${categoryTitle}`}
            className="p-2 min-w-[44px] min-h-[44px] flex items-center justify-center text-gray-600 hover:text-mainColor-dark"
          >
            {show
              ? <IoChevronDownOutline aria-hidden="true" />
              : <IoChevronBackOutline aria-hidden="true" />}
          </button>
        )}
      </div>

      {show && hasChildren && (
        <ul className="ps-10 pb-3">
          {category.children.map((child, ci) => {
            const childTitle = showingTranslateValue(child.name);
            const childSlug = getCategorySlug(child);
            return (
              <li key={child._id}>
                <Link
                  href={`/product-category/${categorySlug}/${childSlug}`}
                  onClick={() => onSubCategoryClick(child)}
                  // ‎py-1 = שורה בגובה ~30px. ‎py-2.5 מגיע ל-44px התקניים.
                  className="flex items-center gap-1 font-serif py-2.5 text-sm text-gray-700 hover:text-mainColor-dark min-h-[44px]"
                >
                  <span aria-hidden="true" className="text-lg text-gray-500 pe-1">
                    {/* <IoRemoveSharp /> */}
                    •
                  </span>
                  <span className="truncate max-w-[150px]" title={childTitle}>
                    {childTitle}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
};

export default CategoryCard;