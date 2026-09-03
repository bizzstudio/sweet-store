// src/layout/navbar/NavbarPromo.jsx
import { Fragment, useState, useEffect, useContext, useRef } from "react";
import Link from "next/link";
import { Transition, Popover } from "@headlessui/react";
import SettingServices from "@services/SettingServices";
import Cookies from "js-cookie";
import { useRouter } from "next/router";
import { FaAnglesLeft, FaAnglesRight } from "react-icons/fa6";

// Internal import
import { notifyError } from "@utils/toast";
import useGetSetting from "@hooks/useGetSetting";
import { SidebarContext } from "@context/SidebarContext";
import useUtilsFunction from "@hooks/useUtilsFunction";
import Image from "@component/common/Img";
import LoginModal from "@component/modal/LoginModal";
import useTranslation from "next-translate/useTranslation";

// גודל אייקון הקטגוריה. היה משוכפל שלוש פעמים במחרוזת אחת ארוכה (ולכן גם
// התיישן בשלושה מקומות שונים), והיה גדול מדי — 67px בדסקטופ, כך שסרגל של חמש
// קטגוריות תפס גובה של באנר. ‎object-contain ולא object-cover: אלה אייקונים,
// ו-cover חותך אותם כשהיחס אינו ריבועי בדיוק.
const CATEGORY_ICON_CLASS =
  "object-contain shrink-0 2xl:w-[46px] 2xl:h-[46px] xl:w-[42px] xl:h-[42px] lg:w-[38px] lg:h-[38px] md:w-[34px] md:h-[34px] sm:w-[32px] sm:h-[32px] w-[30px] h-[30px]";

const NavbarPromo = () => {
  const { t } = useTranslation();
  const [LoginModalOpen, setLoginModalOpen] = useState(false);
  const [activePopover, setActivePopover] = useState(null);
  const { storeCustomizationSetting } = useGetSetting();
  const { categories, categoriesLoading } = useContext(SidebarContext);

  const { showingTranslateValue, getCategorySlug, findMainCategory } = useUtilsFunction();

  const router = useRouter();

  const scrollContainerRef = useRef(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(false);

  const handleLanguage = (lang) => {
    Cookies.set("_lang", lang?.iso_code, {
      sameSite: "None",
      secure: true,
    });
  };

  // get language
  useEffect(() => {
    (async () => {
      {
        try {
          const res = await SettingServices.getShowingLanguage();
          // console.log("res", res);
          const result = res?.find((language) => language?.iso_code === "he");
          handleLanguage(result);
        } catch (err) {
          notifyError(err);
          console.log("error on getting lang", err);
        }
      }
    })();
  }, []);

  const [isHover, setIsHover] = useState(null);
  const categoriesLength = categories[0]?.children?.length;
  useEffect(() => {
    setIsHover(categoriesLength + 1)
  }, [categories])

  const [selectedCategory, setSelectedCategory] = useState(null);
  const { asPath } = router; // כאן נשתמש ב-asPath כדי לגשת לנתיב המלא

  // set selected category
  useEffect(() => {
    if (asPath.startsWith("/product-category/")) {
      const pathParts = asPath.split("/product-category/")[1].split("/");
      const categoryIdentifier = decodeURIComponent(pathParts[0]);

      // חיפוש הקטגוריה לפי slug או שם (fallback)
      const foundCategory = findMainCategory(categories, categoryIdentifier);

      if (foundCategory) {
        const index = categories[0]?.children?.indexOf(foundCategory);
        setSelectedCategory(index !== -1 ? index : null);
      }
    } else if (asPath === "/offers") {
      setSelectedCategory(categoriesLength);
    } else {
      setSelectedCategory(null);
    }
  }, [asPath, categories]);

  const updateScrollArrows = () => {
    const el = scrollContainerRef.current;
    if (!el) return;

    const children = el.children;
    if (!children || children.length === 0) {
      setShowLeftArrow(false);
      setShowRightArrow(false);
      return;
    }

    const containerRect = el.getBoundingClientRect();

    let minLeft = Infinity;
    let maxRight = -Infinity;

    Array.from(children).forEach((child) => {
      const rect = child.getBoundingClientRect();
      minLeft = Math.min(minLeft, rect.left);
      maxRight = Math.max(maxRight, rect.right);
    });

    const threshold = 4;

    // אם יש תוכן שמתחיל לפני תחילת הקונטיינר → יש מה לגלול לשמאל
    setShowLeftArrow(minLeft < containerRect.left - threshold);

    // אם יש תוכן שממשיך אחרי סוף הקונטיינר → יש מה לגלול לימין
    setShowRightArrow(maxRight > containerRect.right + threshold);
  };

  useEffect(() => {
    const el = scrollContainerRef.current;
    if (!el) return;

    // בדיקה ראשונית
    updateScrollArrows();

    el.addEventListener("scroll", updateScrollArrows);
    window.addEventListener("resize", updateScrollArrows);

    // לעזור אחרי רנדר / שינוי קטגוריות
    const t1 = setTimeout(updateScrollArrows, 100);
    const t2 = setTimeout(updateScrollArrows, 400);

    return () => {
      el.removeEventListener("scroll", updateScrollArrows);
      window.removeEventListener("resize", updateScrollArrows);
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [categories, categoriesLoading]);

  const SCROLL_AMOUNT = 200;

  const scrollRight = () => {
    const el = scrollContainerRef.current;
    if (!el) return;
    el.scrollBy({ left: SCROLL_AMOUNT, behavior: "smooth" });
  };

  const scrollLeft = () => {
    const el = scrollContainerRef.current;
    if (!el) return;
    el.scrollBy({ left: -SCROLL_AMOUNT, behavior: "smooth" });
  };

  // צבע רקע הסרגל – משמש ל-gradient שמאחורי חצי הגלילה כדי לדהות את האייקון שמתחתם
  const barBg = asPath === "/" ? "#f2fbf7" : "#ffffff";

  return (
    <>
      {LoginModalOpen && (
        <LoginModal modalOpen={LoginModalOpen} setModalOpen={setLoginModalOpen} />
      )}

      {/* ‎<nav> ולא ‎<div>: פס הקטגוריות הוא הניווט הראשי של החנות, וכאזור
          ציון מסומן קורא מסך יכול לקפוץ אליו ישירות במקום לגלול דרך ההידר. */}
      <nav
        aria-label={t("common:categoriesNav")}
        className={`${asPath === "/" ? "bg-mainColor-superLight" : "bg-white"} w-full relative`}
      >
        {/* אין יותר paddingRight לפי גובה הלוגו: הלוגו היה נמתח ל-135% מגובה
            ה-navbar וגלש אל תוך הפס הזה, ולכן הפס נאלץ לפנות לו מקום. מאז
            שהלוגו ממורכז בתוך ה-navbar אין גלישה, והריפוד רק דחף את הקטגוריות
            הצידה ומנע מהן להתמרכז. */}
        <div className="relative w-full px-3 sm:px-6 md:pt-2 md:pb-1 flex justify-center lg:justify-between items-center">
          {/* קונטיינר גלילה אמיתי */}
          <div className="w-full relative md:pt-2 pt-3 pb-1">
            {/* חץ שמאלה (צד שמאל של המסך) – גולל שמאלה */}
            {showLeftArrow && (
              <div
                className="absolute left-0 top-0 bottom-0 z-10 flex items-center justify-start pl-1 pr-8 pointer-events-none"
                style={{ background: `linear-gradient(to right, ${barBg} 45%, transparent)` }}
              >
                <button
                  onClick={scrollLeft}
                  className="pointer-events-auto flex items-center justify-center w-7 h-7 rounded-full bg-white/95 shadow-md ring-1 ring-gray-200 hover:bg-white hover:scale-105 transition-all duration-200"
                  aria-label={t("common:scrollCategoriesLeft")}
                >
                  <FaAnglesLeft className="w-3.5 h-3.5 text-mainColor left-right-animation" />
                </button>
              </div>
            )}

            {/* חץ ימינה (צד ימין של המסך) – גולל ימינה */}
            {showRightArrow && (
              <div
                className="absolute right-0 top-0 bottom-0 z-10 flex items-center justify-end pr-1 pl-8 pointer-events-none"
                style={{ background: `linear-gradient(to left, ${barBg} 45%, transparent)` }}
              >
                <button
                  onClick={scrollRight}
                  className="pointer-events-auto flex items-center justify-center w-7 h-7 rounded-full bg-white/95 shadow-md ring-1 ring-gray-200 hover:bg-white hover:scale-105 transition-all duration-200"
                  aria-label={t("common:scrollCategoriesRight")}
                >
                  <FaAnglesRight className="w-3.5 h-3.5 text-mainColor right-left-animation" />
                </button>
              </div>
            )}

            <div
              dir="ltr"
              ref={scrollContainerRef}
              className="flex flex-row-reverse justify-start sm:justify-between lg:justify-center w-full scrollbar-hide 2xl:gap-8 xl:gap-6 lg:gap-4 gap-3 sm:overflow-visible overflow-x-auto"
              style={{
                scrollbarWidth: "none", // Firefox
                msOverflowStyle: "none", // IE/Edge
              }}
            >
              {storeCustomizationSetting?.navbar?.categories_menu_status &&
                !categoriesLoading &&
                categories &&
                categories[0]?.children?.map((category, index) => {
                  const title = showingTranslateValue(category?.name);
                  const categorySlug = getCategorySlug(category);

                  return (
                    <div
                      key={category._id}
                      className="relative shrink-0"
                      onMouseEnter={() =>
                        category.children?.length > 0 &&
                        setActivePopover(category._id)
                      }
                      onMouseLeave={() => setActivePopover(null)}
                      // התפריט נפתח קודם רק ב-‎onMouseEnter, כלומר משתמש מקלדת
                      // או קורא מסך לא יכלו להגיע לתת-הקטגוריות בכלל. אירועי
                      // focus ב-React עולים במעלה העץ, ולכן פוקוס על הקטגוריה
                      // או על כל פריט בתת-התפריט מחזיק אותו פתוח.
                      onFocus={() =>
                        category.children?.length > 0 &&
                        setActivePopover(category._id)
                      }
                      // ‎relatedTarget הוא האלמנט שמקבל את הפוקוס. סוגרים רק
                      // כשהוא מחוץ לקבוצה — אחרת התפריט נסגר בכל Tab פנימי.
                      onBlur={(e) => {
                        if (!e.currentTarget.contains(e.relatedTarget)) {
                          setActivePopover(null);
                        }
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Escape") setActivePopover(null);
                      }}
                    >
                      <Link
                        onMouseEnter={() => setIsHover(index)}
                        onMouseLeave={() => setIsHover(null)}
                        href={"/product-category/" + categorySlug}
                        // ‎role="button" היה שגוי: זה קישור ניווט, ולא כפתור.
                        // הוא גרם לקורא מסך להכריז "לחצן" ולמנוע מהמשתמש לדעת
                        // שאפשר לפתוח אותו בלשונית חדשה.
                        aria-current={selectedCategory == index ? "page" : undefined}
                        // ‎aria-haspopup לא מוצהר: ערכו "true" שקול ל-"menu"
                        // ומבטיח מודל מקלדת של תפריט (חצים) שאינו ממומש —
                        // תת-התפריט כאן הוא רשימת קישורים בסדר Tab רגיל.
                        aria-expanded={
                          category.children?.length > 0
                            ? activePopover === category._id
                            : undefined
                        }
                        className={`shrink-0 px-2 py-1 flex flex-col items-center xl:gap-2 md:gap-1 gap-0 rounded-md transform transition duration-300 hover:scale-105 hover:text-mainColor-superDark ${selectedCategory == index ? "scale-105" : ""
                          }`}
                      >
                        {category.icon ? (
                          isHover == index || selectedCategory == index ? (
                            <Image
                              src={category.coloredIcon}
                              width={130}
                              height={130}
                              alt=""
                              className={CATEGORY_ICON_CLASS}
                            />
                          ) : (
                            <Image
                              src={category.icon}
                              width={130}
                              height={130}
                              alt=""
                              className={`${CATEGORY_ICON_CLASS} opacity-90`}
                            />
                          )
                        ) : (
                          <Image
                            src="/category-icons/general.svg"
                            width={400}
                            height={400}
                            alt=""
                            className={CATEGORY_ICON_CLASS}
                          />
                        )}

                        <div
                          // הקטגוריה הפעילה סומנה קודם בצבע בלבד — מידע שאובד
                          // למי שאינו מבחין בגוונים. עכשיו נוסף גם משקל גופן
                          // וקו תחתון, בנוסף ל-aria-current שלמעלה.
                          className={`inline-flex items-center justify-center text-center 2xl:text-[15px] xl:text-[14px] lg:text-[14px] md:text-[13px] sm:text-[13px] text-[12px] w-full whitespace-nowrap ${selectedCategory == index
                            ? "text-mainColor-superDark font-bold underline underline-offset-4 decoration-2"
                            : "font-medium text-gray-800"
                            }`}
                        >
                          {title}
                        </div>
                      </Link>

                      {/* Dropdown for subcategories */}
                      <Transition
                        show={
                          activePopover === category._id &&
                          category.children?.length > 0
                        }
                        as={Fragment}
                        enter="transition ease-out duration-200"
                        enterFrom="opacity-0 translate-y-1"
                        enterTo="opacity-100 translate-y-0"
                        leave="transition ease-in duration-150"
                        leaveFrom="opacity-100 translate-y-0"
                        leaveTo="opacity-0 translate-y-1"
                      >
                        <div className="fixed sm:absolute top-[var(--header-h)] sm:top-[105%] left-1/2 sm:left-auto sm:end-0 -translate-x-1/2 sm:translate-x-0 z-20 min-w-[200px] bg-white shadow-lg rounded-md ring-1 ring-black ring-opacity-5"
                        >
                          <ul dir="rtl" aria-label={t("common:subCategories")}>
                            {category.children &&
                              category.children.map((subCategory) => {
                                const subCategorySlug =
                                  getCategorySlug(subCategory);
                                return (
                                  <li key={subCategory._id}>
                                    <Link
                                      href={`/product-category/${categorySlug}/${subCategorySlug}`}
                                      // ‎py-1 נתן שורה בגובה ~30px — מתחת לשטח
                                      // המגע התקני. ‎py-2.5 מביא אותה ל-44px.
                                      className="px-3 py-2.5 flex items-center gap-1 text-base font-medium text-gray-800 hover:text-black hover:bg-gray-100 rounded-md transition-all duration-100"
                                    >
                                      <span aria-hidden="true" className="text-lg text-gray-500 pe-1">
                                        •
                                      </span>
                                      <span className="whitespace-nowrap">
                                        {showingTranslateValue(
                                          subCategory.name
                                        )}
                                      </span>
                                    </Link>
                                  </li>
                                );
                              })}
                          </ul>
                        </div>
                      </Transition>
                    </div>
                  );
                })}
            </div>
          </div>
        </div>
      </nav>
    </>
  );
};

export default NavbarPromo;
