// src/pages/success/index.jsx
import React, { useContext, useEffect, useState } from "react";
import useTranslation from "next-translate/useTranslation";
import { IoHome } from "react-icons/io5";
import { PiListMagnifyingGlassBold } from "react-icons/pi";
import { useRouter } from "next/router";

// Internal import
import cartSuccess from "public/cart success2.svg"
import leaf from "public/leaf.svg"
import Link from "next/link";
import Layout from "@layout/Layout";
import Loading from "@component/preloader/Loading";
import { SidebarContext } from "@context/SidebarContext";
import Cookies from "js-cookie";
import useCart from "@hooks/useCart";
import scrollUp from "src/functions/scrollUp";
import MainBT from "@component/button/MainBT";
import { trackPurchase as trackFlashyPurchase } from "@services/flashy";
import googleAnalytics, { trackPurchase } from "@services/googleAnalytics";
import { trackFbPurchase } from "@services/facebookPixel";
import OrderServices from "@services/OrderServices";
import { UserContext } from "@context/UserContext";
import { HIDE_PRICES } from "@utils/priceVisibility";
import { PAYMENT_DISABLED } from "@utils/paymentDisabled";

const Success = () => {
  const { isLoading, setIsLoading } = useContext(SidebarContext);
  const { state: { userInfo }, dispatch } = useContext(UserContext);
  const { t } = useTranslation();
  const router = useRouter();
  const [order, setOrder] = useState(null);
  const [purchaseTracked, setPurchaseTracked] = useState(false);
  const [codeCopied, setCodeCopied] = useState(false);
  // מאמת שהתשלום באמת בוצע לפני שמציגים "הצלחה" (אחרת מפנים ל-/failed)
  const [paymentVerified, setPaymentVerified] = useState(false);

  const { emptyCart } = useCart();

  // קבלת פרטי ההזמנה מ-URL parameters + אימות שהתשלום בוצע
  useEffect(() => {
    if (!router.isReady) return;

    const getOrderInfo = async () => {
      try {
        // חילוץ orderId ו-token מה-URL
        const orderId = router.query.orderId;
        const token = router.query.token;

        if (!orderId) {
          // ללא orderId אי אפשר לאמת — שומרים על התנהגות קיימת
          setPaymentVerified(true);
          return;
        }

        // קבלת פרטי ההזמנה מהשרת והעברת הטוקן לשרת (אם קיים)
        const orderData = await OrderServices.getOrderById(orderId, token || null);

        // הזמנת אשראי שעדיין "Pending" = התשלום לא הושלם → מפנים ל-/failed
        // (תשלום מוצלח מעביר אוטומטית ל-"Processing" דרך ה-WebHook של Cardcom)
        const statusName = orderData?.status?.name;
        const isCardOrder = orderData?.paymentMethod === "creditCard";
        if (isCardOrder && statusName === "Pending") {
          router.replace(
            `/failed?orderId=${orderId}${token ? `&token=${token}` : ""}`
          );
          return;
        }

        // התשלום אומת — מציגים "הצלחה" ומפעילים מעקב רכישה
        setOrder(orderData);
        setPaymentVerified(true);
      } catch (error) {
        console.error('Error fetching order:', error);
        // במקרה של תקלה בשליפה לא חוסמים לקוח ששילם — מציגים הצלחה כברירת מחדל
        setPaymentVerified(true);
      }
    };

    getOrderInfo();
  }, [router.isReady, router.query]);

  // Flashy Purchase Tracking
  useEffect(() => {
    if (order && !purchaseTracked && typeof window !== 'undefined') {
      // מניעת שליחה כפולה
      if (window.__flashyPurchaseSent) return;

      trackFlashyPurchase(order);
      setPurchaseTracked(true);
      window.__flashyPurchaseSent = true;
    }
  }, [order, purchaseTracked]);

  // GA4 Purchase Tracking
  useEffect(() => {
    if (
      order &&                      // יש הזמנה
      googleAnalytics.isDataLayerAvailable() &&     // dataLayer זמין
      !window.__gaPurchaseSent      // לא נשלח כבר
    ) {
      trackPurchase(order);
      // למנוע דאבל-פייר
      window.__gaPurchaseSent = true;
    }
  }, [order]);

  // עדכון סטטוס מתנת ברוכים הבאים לאחר הזמנה מוצלחת
  useEffect(() => {
    if (!order?.cart || !userInfo?.welcomeGift?.sku) return;

    const usedWelcomeGift = order.cart.some((item) => item.isWelcomeGift);
    if (!usedWelcomeGift || userInfo.welcomeGift.isUsed) return;

    const updatedUser = {
      ...userInfo,
      welcomeGift: { ...userInfo.welcomeGift, isUsed: true },
    };
    dispatch({ type: "USER_LOGIN", payload: updatedUser });
    Cookies.set("userInfo", JSON.stringify(updatedUser), { expires: 10 });
    sessionStorage.removeItem("welcomeGiftModalDismissed");
  }, [order, userInfo, dispatch]);

  // Meta Pixel Purchase Tracking
  useEffect(() => {
    if (
      order &&
      typeof window !== "undefined" &&
      !window.__fbPurchaseSent
    ) {
      trackFbPurchase(order);
      window.__fbPurchaseSent = true; // למנוע כפילות
    }
  }, [order]);

  // ריקון העגלה
  useEffect(() => {
    scrollUp();
    Cookies.remove("couponInfo");
    sessionStorage.removeItem("products");
    emptyCart();

    return () => {
      Cookies.remove("couponInfo");
      sessionStorage.removeItem("products");
      emptyCart();
    }
  }, [])

  return (
    <>
      {/*
        * חנות ללא תשלום (ראה src/utils/paymentDisabled.js): אין כאן "רכישה".
        * הכיתוב מדבר על הזמנה שנשמרה ועברה לטיפול — לא על תשלום שהתקבל.
        */}
      <Layout
        title={PAYMENT_DISABLED ? t("common:orderSavedSuccessfully") : t("common:orderCompletedSuccessfully")}
        description={t("common:orderCompletedDescription")}
      >
        {(isLoading || !paymentVerified) ? (
          <Loading loading={true} />
        ) : (
          <div className='w-full mx-auto flex flex-col justify-center items-center gap-2 py-20 px-10 lg:px-0'>
            <img
              className="md:w-1/5 w-2/3 mr-8"
              src={cartSuccess.src}
              alt={PAYMENT_DISABLED ? "ההזמנה נשמרה בהצלחה" : "הרכישה הושלמה בהצלחה"}
            />
            <h1 className="text-4xl text-center font-bold">
              {PAYMENT_DISABLED ? t("common:thankYouForOrder") : t("common:thankYouForPurchase")}
            </h1>
            <h3 className="text-xl text-center">
              {PAYMENT_DISABLED ? t("common:orderSavedInProcess") : t("common:orsderInProcess")}
            </h3>

            {/* קופון "לקנייה הבאה" — למי ששילם משלוח ולא הגיע למשלוח חינם */}
            {order?.rewardCouponCode && (
              <div className="mt-5 w-full max-w-md rounded-lg border-2 border-dashed border-amber-400 bg-amber-50 px-6 py-5 text-center">
                <p className="text-lg font-bold text-amber-800">🎁 מתנה לקנייה הבאה!</p>
                <p className="mt-1 text-sm text-gray-700">
                  {/* ראה src/utils/priceVisibility.js */}
                  {HIDE_PRICES
                    ? "קיבלתם קופון הנחה לקנייה הבאה. שמרו את הקוד:"
                    : "קיבלת קופון בשווי 25 ₪ לקנייה הבאה (בקנייה מעל 150 ₪). שמרו את הקוד:"}
                </p>
                {/* dir=ltr + ריווח מתון: הקוד חייב להיקרא בדיוק כפי שהוא, בלי תווים שנראים כרווח */}
                <p
                  dir="ltr"
                  className="mt-3 inline-block rounded-md border border-amber-400 bg-white px-5 py-2 text-2xl font-extrabold text-mainColor-dark font-mono select-all"
                >
                  {order.rewardCouponCode}
                </p>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard
                      ?.writeText(order.rewardCouponCode)
                      .then(() => setCodeCopied(true))
                      .catch(() => { });
                  }}
                  className="mt-3 block mx-auto text-sm font-semibold text-mainColor-dark underline hover:no-underline"
                >
                  {codeCopied ? "✓ הקוד הועתק" : "העתקת הקוד"}
                </button>
              </div>
            )}

            <div className="flex items-center justify-center flex-wrap gap-5 mt-3 h-11">
              <Link href="/" target="_top">
                <MainBT className='!w-fit px-6'>
                  <div className="flex items-center gap-2">
                    <IoHome /> {t("common:backToHome")}
                  </div>
                </MainBT>
              </Link>
              <Link href="/user/my-orders" target="_top">
                <MainBT className='!w-fit px-6'>
                  <div className="flex items-center gap-2">
                    <PiListMagnifyingGlassBold size={20} /> {t("common:viewOrder")}
                  </div>
                </MainBT>
              </Link>
            </div>
          </div>
        )}
        <style>
          {`
          #enable-toolbar-trigger {
            display: none;
            }
            `}
        </style>
      </Layout>
    </>
  );
};

export default Success;