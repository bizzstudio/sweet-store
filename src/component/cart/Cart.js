// src/component/cart/Cart.js
import { useRouter } from "next/router";
import React, { useContext, useEffect, useRef } from "react";
import { IoBagCheckOutline, IoClose, IoBagHandle } from "react-icons/io5";
import useTranslation from "next-translate/useTranslation";
import Cookies from "js-cookie";

// Internal import
import CartItem from "@component/cart/CartItem";
import { UserContext } from "@context/UserContext";
import { SidebarContext } from "@context/SidebarContext";
import useUtilsFunction from "@hooks/useUtilsFunction";
import useCart from "@hooks/useCart";
import { trackViewCart } from "@services/googleAnalytics";
import { trackFbInitiateCheckout } from "@services/facebookPixel";
import Calculating from "./Calculating";
import MainBT from "@component/button/MainBT";
import ThresholdDiscountSlider from "./ThresholdDiscountSlider";
import { HIDE_PRICES } from "@utils/priceVisibility";
import { PAYMENT_DISABLED } from "@utils/paymentDisabled";
import { LOGIN_PATH } from "@utils/storeMode";

const Cart = () => {
  const router = useRouter();
  const { isEmpty, items, customCartTotal, totalItems } = useCart();
  const { closeCartDrawer } = useContext(SidebarContext);
  const { currency } = useUtilsFunction();
  const { t } = useTranslation();
  const buttonRef = useRef(null);

  const {
    state: { userInfo },
  } = useContext(UserContext);

  // Google Analytics - view_cart כשהעגלה נפתחת
  const { cartDrawerOpen } = useContext(SidebarContext);
  useEffect(() => {
    // רק כשהעגלה נפתחת (cartDrawerOpen משתנה ל-true) ויש פריטים
    if (cartDrawerOpen && !isEmpty && items.length > 0) {
      trackViewCart(items, customCartTotal);
    }
  }, [cartDrawerOpen]); // רק כשהעגלה נפתחת

  const handleCheckoutClick = (e) => {
    e.stopPropagation(); // Prevent event propagation

    // רענון קופונים – בכל מעבר לתשלום מתחילים בלי קופון מפעם קודמת
    Cookies.remove("couponInfo");

    // Meta Pixel - InitiateCheckout לפני הניווט
    if (!isEmpty && items.length > 0 && typeof customCartTotal === "number") {
      trackFbInitiateCheckout(items, customCartTotal);
    }

    closeCartDrawer(); // Call the closeCartDrawer function

    // רק לקוח רשום מסיים הזמנה — אורח עובר לעמוד ההתחברות וחוזר משם לצ'קאאוט.
    // עמוד ולא חלון התחברות: אחרי הכניסה useLoginSubmit מרענן את הדף, ורק
    // ב-‎/login?redirect=‎ ה-middleware יודע להשלים את המעבר לצ'קאאוט.
    if (!userInfo) {
      router.push({ pathname: LOGIN_PATH, query: { redirect: "/checkout" } });
      return;
    }

    if (userInfo && !userInfo?.address?.city) {
      localStorage.setItem("firstTime", true);
    } else {
      router.push("/checkout"); // Redirect to checkout page
    }
  };

  const handleMouseEnter = () => {
    if (buttonRef.current) {
      buttonRef.current.classList.add('bg-mainColor-dark');
    }
  };

  const handleMouseLeave = () => {
    if (buttonRef.current) {
      buttonRef.current.classList.remove('bg-mainColor-dark');
    }
  };

  const checkoutClass = (
    <MainBT
      ref={buttonRef}
      className="w-full !h-fit"
      onClick={handleCheckoutClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* חנות ללא מחירים — הכפתור מציג רק את מספר הפריטים במקום סכום לתשלום */}
      <span className="w-full font-medium font-serif text-xl flex flex-col justify-start items-start py-3 px-5">
        {HIDE_PRICES ? (
          <span className="text-base">
            {totalItems} {t("common:items")}
          </span>
        ) : (
          <>
            <small className="text-sm font-light">
              {t("common:totalToPay")}
            </small>
            <span>
              {typeof customCartTotal === 'number' ?
                <>
                  <small>{currency}</small>
                  {customCartTotal.toFixed(2)}
                </>
                : <Calculating />}
            </span>
          </>
        )}
        {/* <FiInfo title={t("common:additonalLikut")} className="cursor-pointer mb-0.5"/> */}
        {/* <small className="text-sm">{t("common:additonalLikut")}</small> */}
      </span>
      <span
        className="whitespace-nowrap rounded-lg font-bold font-serif text-stone-800 cursor-pointer px-5 py-2"
      >
        {/* חנות ללא תשלום — ראה src/utils/paymentDisabled.js */}
        {PAYMENT_DISABLED ? t("common:proceedToOrderBtn") : t("common:proceedToCheckoutBtn")}
      </span>
    </MainBT>
  );

  return (
    <>
      {/* ‎rc-drawer אינו מוסיף סמנטיקת דיאלוג בעצמו (בניגוד ל-Headless UI
          שמשמש בשאר המודלים), ולכן העגלה נקראה כאזור אנונימי באמצע העמוד.
          ‎role="dialog" + ‎aria-modal + ‎aria-labelledby נותנים לה זהות. */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="cart-drawer-title"
        className="flex flex-col w-full h-full justify-between items-middle bg-white rounded"
      >
        <div className="w-full flex justify-between items-center relative px-5 py-4 border-b bg-mainColor-light border-gray-100">
          <h2 id="cart-drawer-title" className="font-semibold font-serif text-lg m-0 text-heading flex items-center gap-1 justify-center">
            <span aria-hidden="true" className="text-xl mr-2 mb-1">
              <IoBagCheckOutline />
            </span>
            {t("common:shoppingCartDrawerTitle")}
          </h2>
          <button
            type="button"
            onClick={closeCartDrawer}
            aria-label={t("common:closeBtn")}
            className="tap-target flex text-base items-center justify-center text-gray-600 p-2 transition-opacity hover:text-red-700 group"
          >
            <IoClose aria-hidden="true" />
            <span aria-hidden="true" className="font-sens text-sm text-gray-600 ml-1 group-hover:text-red-700 pb-0.5">
              {t("common:closeBtn")}
            </span>
          </button>
        </div>
        <div className="overflow-y-auto flex-grow scrollbar-hide w-full max-h-full">
          {isEmpty && (
            <div className="flex flex-col h-full justify-center">
              <div className="flex flex-col items-center">
                <div className="flex justify-center items-center w-20 h-20 rounded-full bg-mainColor-light">
                  <span className="text-mainColor-dark text-4xl block">
                    <IoBagHandle />
                  </span>
                </div>
                <h3 className="font-serif font-semibold text-gray-700 text-lg pt-5">
                  {t("common:cartEmptyTitle")}
                </h3>
                <p className="px-12 text-center text-sm text-gray-500 pt-2">
                  {t("common:cartEmptyText")}
                </p>
              </div>
            </div>
          )}

          {items.map((item, i) => (
            <CartItem key={i + 1} item={item} currency={currency} />
          ))}
        </div>
        <div className="mx-5 my-3">
          {/* סליידר הנחת קניה מעל סכום */}
          <ThresholdDiscountSlider />
          
          {checkoutClass}
        </div>
      </div>
    </>
  );
};

export default Cart;
