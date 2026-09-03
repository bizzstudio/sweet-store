// sr/layou/foote/MobileFooter.js
import React, { useContext, useState } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { useRouter } from "next/router";

import { TbCategoryPlus, TbDiscount, TbHomeDot } from "react-icons/tb";
import { MdOutlineSettingsBackupRestore } from "react-icons/md";
import { FaList } from "react-icons/fa6";
import { RiHome6Line, RiShoppingCartLine, RiUserAddLine } from "react-icons/ri";
import { HiOutlineUser } from "react-icons/hi";
import useTranslation from "next-translate/useTranslation";

import { UserContext } from "@context/UserContext";
import LoginModal from "@component/modal/LoginModal";
import { SidebarContext } from "@context/SidebarContext";
import CategoryDrawer from "@component/drawer/CategoryDrawer";
import useCart from "@hooks/useCart";
import { BsFire } from "react-icons/bs";
import { FiRefreshCcw, FiSearch } from "react-icons/fi";
import useUtilsFunction from "@hooks/useUtilsFunction";

const MobileFooter = () => {
  const router = useRouter();
  const [modalOpen, setModalOpen] = useState(false);
  const { toggleCartDrawer, toggleCategoryDrawer, categories } = useContext(SidebarContext);
  const { totalItems } = useCart();
  const { getCategorySlug, showingTranslateValue, findCategoryByIdentifier } = useUtilsFunction();

  const {
    state: { userInfo },
  } = useContext(UserContext);

  const { t } = useTranslation();

  // Fallbacks לטקסטים אם אין מפתח i18n קיים
  const lblAllProducts = t("common:allProducts");
  const lblDeals = t("common:deals");
  const lblCart = t("common:cart");
  const lblLogin = t("common:login");
  const lblRestore = t("common:restoreOrderBTN");
  const lblHome = t("common:homeBTN");
  const lblSearch = t("common:search");

  // מציאת קטגוריית המבצעים.
  //
  // כשאין קטגוריה כזו (המצב בחנות הזו) ה-fallback הקודם היה הסלאג הקבוע
  // "מבצעים" — כלומר כפתור קבוע בתפריט התחתון שמוביל לקטגוריה לא קיימת ולעמוד
  // ריק. במקומו מוצג כאן כפתור חיפוש, שהוא שימושי ממילא בקטלוג של 4,000 פריטים
  // ושומר על חמש המשבצות של הגריד (העגלה חייבת להישאר במשבצת האמצעית).
  const offersCategory = categories?.[0]?.children
    ? findCategoryByIdentifier(categories[0].children, "מבצעים")
    : null;
  const offersCategorySlug = offersCategory ? getCategorySlug(offersCategory) : null;

  return (
    <>
      <LoginModal modalOpen={modalOpen} setModalOpen={setModalOpen} />
      <div className="flex flex-col h-full justify-between align-middle bg-white rounded cursor-pointer overflow-y-scroll flex-grow scrollbar-hide w-full">
        <CategoryDrawer className="w-6 h-6 drop-shadow-xl" />
      </div>

      {/* ‎<nav> ולא ‎<footer>: הרכיב הזה הוא סרגל ניווט (בית / קטגוריות /
          עגלה / אזור אישי) ולא "מידע על התוכן". ‎<footer> היה מכריז אותו
          כאזור ‎contentinfo, שהוא התפקיד של הכותרת התחתונה בדסקטופ. */}
      <nav
        aria-label={t("common:mainNavigation")}
        className="lg:hidden fixed z-30 bottom-0 w-full rounded-t-3xl"
        style={{
          boxShadow:
            "0 -10px 15px -3px rgb(0 0 0 / 0.1), 0 -4px 6px -4px rgb(0 0 0 / 0.1)",
        }}
      >
        {/* בר עליון מעוגל עם קו עליון בצבע המותג */}
        <div className="relative bg-mainColor-superLight text-[#064e35] w-full px-4 sm:px-8 pt-3 pb-2 border-t-0 border-[#064e35] rounded-t-3xl">
          {/* גריד של 5 – העגלה באמצע ומוגבהת */}
          <div className="grid grid-cols-5 items-end gap-1 text-center">
            {/* 1. כל המוצרים – אותה פונקציונליות של כפתור הקטגוריות */}
            <button
              aria-label={lblAllProducts}
              onClick={toggleCategoryDrawer}
              className="grid grid-cols-1 gap-0.5 items-center justify-center h-full min-h-[44px]"
            >
              <div className="w-[6vw] h-[6vw] min-w-[24px] min-h-[24px] max-w-[32px] max-h-[32px] flex items-center justify-center mx-auto">
                <TbCategoryPlus className="w-full h-full drop-shadow" aria-hidden="true" />
              </div>
              <span className="text-[12px] font-medium leading-tight">{lblAllProducts}</span>
            </button>

            {/* 2. מבצעים – רק אם קטגוריית המבצעים קיימת; אחרת חיפוש */}
            {offersCategorySlug ? (
              <Link
                href={`/product-category/${offersCategorySlug}`}
                aria-label={lblDeals}
                aria-current={router.asPath.includes(offersCategorySlug) ? "page" : undefined}
                className="grid grid-cols-1 gap-0.5 items-center justify-center h-full min-h-[44px] text-red-700"
              >
                <div className="w-[6vw] h-[6vw] min-w-[24px] min-h-[24px] max-w-[32px] max-h-[32px] flex items-center justify-center mx-auto">
                  <BsFire className="w-full h-full drop-shadow" aria-hidden="true" />
                </div>
                <span className="text-[12px] font-medium leading-tight">{lblDeals}</span>
              </Link>
            ) : (
              <Link
                href="/search"
                aria-label={lblSearch}
                aria-current={router.pathname === "/search" ? "page" : undefined}
                className="grid grid-cols-1 gap-0.5 items-center justify-center h-full min-h-[44px]"
              >
                <div className="w-[6vw] h-[6vw] min-w-[24px] min-h-[24px] max-w-[32px] max-h-[32px] flex items-center justify-center mx-auto">
                  <FiSearch className="w-full h-full drop-shadow" aria-hidden="true" />
                </div>
                <span className="text-[12px] font-medium leading-tight">{lblSearch}</span>
              </Link>
            )}

            {/* 3. עגלה – מעוצב כמו בתמונה */}
            <button
              onClick={toggleCartDrawer}
              aria-label={
                totalItems > 0
                  ? `${t("common:openCart")} – ${t("common:cartItemsCount", { count: totalItems })}`
                  : t("common:openCart")
              }
              className="relative grid grid-cols-1 items-center justify-center"
              style={{ marginTop: 'calc(-1 * (15vw + 12px))' }}
            >
              <div
                className="rounded-full bg-mainColor text-white ring-[0px] ring-[#064e35] shadow-md flex items-center justify-center"
                style={{
                  width: 'clamp(55px, 15vw, 75px)',
                  height: 'clamp(55px, 15vw, 75px)',
                  marginBottom: 'clamp(8px, 2vw, 12px)'
                }}
              >
                <div className="relative flex items-center justify-center mx-auto" style={{ width: 'clamp(32px, 9vw, 44px)', height: 'clamp(32px, 9vw, 44px)' }}>
                  <RiShoppingCartLine className="w-full h-full" aria-hidden="true" />
                  {totalItems > 0 && (
                    <span aria-hidden="true" className="absolute text-[11px] xs:text-[12px] sm:text-[13px] font-bold top-[45%] left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                      {totalItems}
                    </span>
                  )}
                </div>
              </div>
              {/* <span className="text-[11px] leading-tight mt-1">{lblCart}</span> */}
            </button>

            {/* 4. כניסה/שחזור הזמנה – תלוי אם המשתמש מחובר */}
            {userInfo ? (
              <Link
                href="/user/my-orders"
                aria-label={lblRestore}
                aria-current={router.pathname === "/user/my-orders" ? "page" : undefined}
                className="grid grid-cols-1 gap-0.5 items-center justify-center h-full min-h-[44px]"
              >
                <div className="w-[6vw] h-[6vw] min-w-[24px] min-h-[24px] max-w-[32px] max-h-[32px] flex items-center justify-center mx-auto">
                  <FiRefreshCcw className="w-full h-full drop-shadow" aria-hidden="true" />
                </div>
                <span className="text-[12px] font-medium leading-tight">{lblRestore}</span>
              </Link>
            ) : (
              <button
                aria-label={lblLogin}
                onClick={() => setModalOpen(true)}
                className="grid grid-cols-1 gap-0.5 items-center justify-center h-full min-h-[44px]"
              >
                <div className="w-[6vw] h-[6vw] min-w-[24px] min-h-[24px] max-w-[32px] max-h-[32px] flex items-center justify-center mx-auto">
                  <RiUserAddLine className="w-full h-full drop-shadow" aria-hidden="true" />
                </div>
                <span className="text-[12px] font-medium leading-tight">{lblLogin}</span>
              </button>
            )}

            {/* 5. בית */}
            <Link
              href="/"
              aria-label={lblHome}
              aria-current={router.pathname === "/" ? "page" : undefined}
              className="grid grid-cols-1 gap-0.5 items-center justify-center h-full min-h-[44px]"
            >
              <div className="w-[6vw] h-[6vw] min-w-[24px] min-h-[24px] max-w-[32px] max-h-[32px] flex items-center justify-center mx-auto">
                <TbHomeDot className="w-full h-full drop-shadow" aria-hidden="true" />
              </div>
              <span className="text-[12px] font-medium leading-tight">{lblHome}</span>
            </Link>
          </div>
        </div>
      </nav>
    </>
  );
};

export default dynamic(() => Promise.resolve(MobileFooter), { ssr: false });