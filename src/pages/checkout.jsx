// checkout.jsx
import React, { useContext, useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import useTranslation from "next-translate/useTranslation";
import Cookies from "js-cookie";
import { useRouter } from "next/router";

// Internal import
import Layout from "@layout/Layout";
import useAsync from "@hooks/useAsync";
import useGetSetting from "@hooks/useGetSetting";
import useCheckoutSubmit from "@hooks/useCheckoutSubmit";
import useUtilsFunction from "@hooks/useUtilsFunction";
import SettingServices from "@services/SettingServices";
import { UserContext } from "@context/UserContext";
import Loading from "@component/preloader/Loading";
import CustomerServices from "@services/CustomerServices";
import MainModal from "@component/modal/MainModal";
import UserAddressUpdate from "@component/userAddressUpdate/UserAddressUpdate";
import LoginModal from "@component/modal/LoginModal";
import MissingProductsModal from "@component/modal/MissingProductsModal";
import websiteClose from 'public/websiteClose2.svg'
import Image from "@component/common/Img";
import PriceUpdatedModal from "@component/modal/PriceUpdatedModal";
import { SidebarContext } from "@context/SidebarContext";
import { notifyError } from "@utils/toast";
import { trackBeginCheckout } from "@services/googleAnalytics";
// Checkout Components
import OrderCosts from "@component/checkout/OrderCosts";
import CheckoutCartProducts from "@component/checkout/CheckoutCartProducts";
import PersonalDetails from "@component/checkout/PersonalDetails";
import CheckoutActions from "@component/checkout/CheckoutActions";
import CheckoutPrompts from "@component/checkout/CheckoutPrompts";

const Checkout = () => {
  const router = useRouter();
  const { t } = useTranslation();
  const { storeCustomizationSetting } = useGetSetting();
  const { showingTranslateValue } = useUtilsFunction();
  const { data: storeSetting } = useAsync(SettingServices.getStoreSetting);

  const { state: { userInfo } } = useContext(UserContext);
  const city = userInfo?.address?.city?.city_name_he;
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(true);
  const [missingProductsState, setMissingProductsState] = useState([]);
  const [keySequence, setKeySequence] = useState([]);
  const [newsletterOptIn, setNewsletterOptIn] = useState(false);
  // זכאות לקופון "לקנייה הבאה" — ההטבה חד-פעמית לכל לקוח, ולכן לא מבטיחים אותה למי שכבר קיבל
  const [rewardEligible, setRewardEligible] = useState(true);

  const {
    handleSubmit,
    submitHandler,
    submitWithRefreshOffers,
    handleShippingCost,
    register,
    errors,
    showCard,
    setShowCard,
    error,
    // stripe,
    discountAmount,
    thresholdDiscount,
    shippingCost,
    total,
    isEmpty,
    items,
    customCartTotal,
    currency,
    isCheckoutSubmit,
    isDeliveryMetod,
    paymentSrc,
    shippingPercentageIncrease,

    missingProductsModal,
    setMissingProductsModal,
    missingProducts,
    priceConflictsModal,
    setPriceConflictsModal,
    priceConflicts,
    showLoginModal,
    setShowLoginModal,

    // סטייטים לוולידציה מהוק
    guestChosenCity,
    isDeliverable,
    setIsDeliverable,
    minimumOrderAmount,
    setMinimumOrderAmount,
  } = useCheckoutSubmit(false, newsletterOptIn);


  // רענון המבצעים בכניסה לעמוד התשלום
  const { refreshOffers } = useContext(SidebarContext);
  useEffect(() => {
    refreshOffers();
  }, []);

  // GA4 begin_checkout דרך dataLayer (GTM) — יורה פעם אחת כשהעגלה נטענה עם מוצרים.
  // הערך הוא סכום המוצרים בעגלה (customCartTotal), לפני משלוח/קופון.
  const beginCheckoutFired = useRef(false);
  useEffect(() => {
    if (beginCheckoutFired.current) return;
    if (isEmpty || !items || items.length === 0) return;
    beginCheckoutFired.current = true;
    trackBeginCheckout(items, customCartTotal);
  }, [items, isEmpty, customCartTotal]);

  // בעת שחזור הזמנה הודעה על מוצרים לא זמינים
  useEffect(() => {
    const missingProducts = localStorage.getItem("missingProducts");
    if (missingProducts) {
      try {
        const missingProductsArray = JSON.parse(missingProducts);

        if (missingProductsArray.length > 0) {
          setMissingProductsModal(true);
          setMissingProductsState(missingProductsArray);
        }

        // מחיקת הנתונים מה-localStorage לאחר הצגת ההודעה
        localStorage.removeItem("missingProducts");
      } catch (error) {
        console.error("Failed to parse missing products:", error);
      }
    };

    const offersError = localStorage.getItem("offerConflicts");
    if (offersError) {
      setTimeout(() => {
        // מחיקת הנתונים מה-localStorage לאחר הצגת ההודעה
        localStorage.removeItem("offerConflicts");
        notifyError(t("common:pleaseNote"))
      }, 300);
    };
  }, [isCheckoutSubmit]);

  // משיכת הגדרת ההזמנות ובדיקה אם ההזמנה מאופשרת או לא
  useEffect(() => {
    if (storeSetting.optionToOrder_status !== undefined) {
      setIsCheckoutOpen(storeSetting.optionToOrder_status);
    }
  }, [storeSetting]);

  // בדיקה אם צריך להציג טופס אורח או פרטי משתמש מחובר
  useEffect(() => {
    if (userInfo) {
      // משתמש מחובר - בדיקה אם יש כתובת
      if (!userInfo?.address?.city) {
        localStorage.setItem("firstTime", true);
        router.push("/");
      } else {
        setLoading(false);
      }
    } else {
      // אורח רואה את העמוד, אבל כפתור השמירה פותח אצלו התחברות (CheckoutActions)
      setLoading(false);
    }
  }, [userInfo]);


  // בדיקת זכאות לקופון "לקנייה הבאה" עבור לקוח מחובר.
  // עד לתשובת השרת לא מבטיחים כלום (false), כדי שלא תוצג הבטחה שגויה למי שכבר קיבל.
  // אורחים: אין זיהוי לפני שליחת הטופס — ברירת המחדל היא להציג (בדיקה לפי אימייל
  // הייתה חושפת האם אימייל קיים במערכת).
  useEffect(() => {
    if (!userInfo) {
      setRewardEligible(true);
      return;
    }

    let cancelled = false;
    setRewardEligible(false);

    CustomerServices.getShippingRewardEligibility()
      .then((res) => {
        if (!cancelled) setRewardEligible(res?.eligible !== false);
      })
      .catch(() => {
        // כשל בבדיקה — לא מבטיחים קופון (ההנפקה בשרת ממילא לא תלויה בתצוגה הזו)
        if (!cancelled) setRewardEligible(false);
      });

    return () => {
      cancelled = true;
    };
  }, [userInfo]);


  const navToPaymentPage = () => {
    router.push(paymentSrc)
  }

  // כשהוולידציה של הטופס נכשלת - גלילה לשדה הראשון שחסר (בדגש על אישור התקנון)
  const onInvalidSubmit = (formErrors) => {
    if (typeof window === "undefined") return;

    // אורח (Enter בשדה, בלי תקנון מסומן): אותה תשובה כמו בכפתור — התחברות.
    // אין טעם להפנות אותו לשדה חסר בטופס שהוא ממילא לא יכול לשלוח
    if (!userInfo) {
      setShowLoginModal(true);
      return;
    }

    // עדיפות לתיבת אישור התקנון אם היא חסרה
    const targetId = formErrors?.acceptedTerms ? "terms-accept-section" : null;
    let element = targetId ? document.getElementById(targetId) : null;


    if (element) {
      // קיזוז לפי גובה ההידר הנעוץ האמיתי (--header-h) + מרווח, כדי שהשדה לא ייחבא
      // מתחת להידר. תואם-לאחור: כשהבר כבוי (~127px) הקיזוז יוצא ~160 כמו קודם.
      const headerH =
        parseFloat(
          getComputedStyle(document.documentElement).getPropertyValue("--header-h")
        ) || 127;
      const offsetPosition =
        element.getBoundingClientRect().top + window.pageYOffset - headerH - 33;
      window.scrollTo({ top: offsetPosition, behavior: "smooth" });

      // מיקוד לנגישות — רק כשהיעד הוא באמת תיבת התקנון
      if (targetId) {
        const checkbox = document.getElementById("checkoutAcceptedTerms");
        if (checkbox) {
          setTimeout(() => checkbox.focus({ preventScroll: true }), 400);
        }
      }
    }
  };

  // סתם משהו נחמד
  useEffect(() => {
    // רק אם החנות סגורה
    if (isCheckoutOpen === false) {
      const handleKeyPress = (e) => {
        // המרת אותיות לאותיות קטנות (case insensitive)
        let key = e.code.toLowerCase();

        const newSequence = [...keySequence, key];
        setKeySequence(newSequence);

        // שמירה על 12 תווים אחרונים
        if (newSequence.length > 12) {
          setKeySequence(newSequence.slice(-12));
        }

        // בדיקת התאמה לרצף "1 8 0 0 4 0 0 4 0 0 a i g"
        const secretCode = [
          "digit1", "numpad1",
          "digit8", "numpad8",
          "digit0", "numpad0",
          "digit0", "numpad0",
          "digit4", "numpad4",
          "digit0", "numpad0",
          "digit0", "numpad0",
          "digit4", "numpad4",
          "digit0", "numpad0",
          "digit0", "numpad0",
          "keya", "keyi", "keyg"
        ];
        const lastChars = newSequence.slice(-13); // Changed to match longest possible sequence

        if (lastChars.length === 13) {
          let matches = true;
          let j = 0;
          for (let i = 0; i < lastChars.length; i++) {
            // Check if current char matches either regular digit or numpad
            if (j < secretCode.length - 3) { // For number keys
              if (lastChars[i] !== secretCode[j] && lastChars[i] !== secretCode[j + 1]) {
                matches = false;
                break;
              }
              j += 2;
            } else { // For letter keys
              if (lastChars[i] !== secretCode[j]) {
                matches = false;
                break;
              }
              j++;
            }
          }

          if (matches) {
            setIsCheckoutOpen(true);
            setKeySequence([]); // איפוס הרצף לאחר הצלחה
          }
        }
      };

      window.addEventListener("keydown", handleKeyPress);
      return () => window.removeEventListener("keydown", handleKeyPress);
    }

    // אם החנות פתוחה, אין צורך להאזין למקשים
    return () => { };
  }, [keySequence, isCheckoutOpen]);


  if (loading) {
    return <Loading loading={loading} />;
  }

  let currentLang = Cookies.get('_lang');

  switch (currentLang) {
    case 'he':
      currentLang = true;
      break;
    case 'en':
      currentLang = false;
      break;
    default:
      currentLang = false;
      break;
  };

  return (
    <>
      {/* modals */}
      {missingProductsModal && (
        <MainModal modalOpen={missingProductsModal} setModalOpen={setMissingProductsModal}>
          <div className="px-11 py-8">
            <MissingProductsModal missingProducts={missingProductsState.length > 0 ? missingProductsState : missingProducts} />
          </div>
        </MainModal>
      )}
      {priceConflictsModal && (
        <MainModal modalOpen={priceConflictsModal} setModalOpen={setPriceConflictsModal}>
          <div className="px-11 py-8">
            <PriceUpdatedModal priceUpdatedItems={priceConflicts} closeModal={() => setPriceConflictsModal(false)} />
          </div>
        </MainModal>
      )}
      {/* {deliveryMsg && (
        <MainModal modalOpen={deliveryMsg} setModalOpen={setDeliveryMsg}>
          <div className="px-11 py-8">
            <DeliveryMsgModal closeModal={() => setDeliveryMsg(false)} cityName={city?.trim()}
              shippingDays={availableDays}
            // shippingDays={["1", "2", "3", "4", "5", "6", "7"]}
            />
          </div>
        </MainModal>
      )}
      {pickupMsg && (
        <MainModal modalOpen={pickupMsg} setModalOpen={setPickupMsg}>
          <div className="px-11 py-8">
            <PickupMsgModal closeModal={() => setPickupMsg(false)} />
          </div>
        </MainModal>
      )} */}
      {modalOpen && (
        <MainModal modalOpen={modalOpen} setModalOpen={setModalOpen}>
          <div className="px-3 sm:px-11 py-8 pt-10 max-w-xl">
            <UserAddressUpdate />
          </div>
        </MainModal>
      )}
      {showLoginModal && (
        <LoginModal modalOpen={showLoginModal} setModalOpen={setShowLoginModal} />
      )}
      <Layout title={t("common:checkout")} description={t("common:checkoutDescription")}>
        <div className="mx-auto max-w-screen-2xl px-3 sm:px-10">
          <div className="py-0 md:py-10 lg:py-12 px-0 2xl:max-w-screen-2xl w-full xl:max-w-screen-xl flex flex-col items-center gap-8">
            <div className="w-full flex h-full flex-col order-2 sm:order-1 lg:order-1">
              {isCheckoutOpen ? (
                paymentSrc ?

                  // redirect option
                  navToPaymentPage()

                  // iframe option
                  // <div className="flex flex-col gap-3 items-center justify-center">
                  //   {scrollUp()}
                  //   <iframe
                  //     src={paymentSrc}
                  //     id='cardcomiframe'
                  //     className="max-w-[800px] w-3/4 h-[550px] flex items-center justify-center"
                  //   />
                  // </div>
                  : <div className="mt-5 md:mt-0 md:col-span-2">
                    <form id="checkout-form" onSubmit={handleSubmit(submitHandler, onInvalidSubmit)}>
                      <div className="w-full flex flex-col gap-4 pb-6">
                        {/* אורח ומחובר באותו סדר: לאורח PersonalDetails ריק, והכפתור
                            פותח התחברות במקום לשמור (אין רכישה כאורח) */}
                        {/* כפתור פעולה בולט - כניסת משתמש קיים */}
                        <CheckoutPrompts
                          isGuest={!userInfo}
                          onLoginClick={() => setShowLoginModal(true)}
                        />

                        {/* 1. פרטים אישיים */}
                        <PersonalDetails
                          userInfo={userInfo}
                          city={city}
                          setModalOpen={setModalOpen}
                          isDeliverable={isDeliverable}
                          minimumOrderAmount={minimumOrderAmount}
                        />

                        {/* סיכום עלויות (כולל סיכום ההזמנה - רשימת המוצרים) */}
                        <OrderCosts
                          storeCustomizationSetting={storeCustomizationSetting}
                          showingTranslateValue={showingTranslateValue}
                          currency={currency}
                          customCartTotal={customCartTotal}
                          minimumOrderAmount={minimumOrderAmount}
                          shippingCost={shippingCost}
                          total={total}
                          isDeliverable={isDeliverable}
                          city={city}
                          guestChosenCity={guestChosenCity}
                          newsletterOptIn={newsletterOptIn}
                          setNewsletterOptIn={setNewsletterOptIn}
                          register={register}
                          errors={errors}
                          storeSetting={storeSetting}
                          rewardEligible={rewardEligible}
                          items={items}
                          isEmpty={isEmpty}
                        />

                        {/* 5.5 מוצרי עגלה (עד 4 מוצרים שסומנו isCartpprod) */}
                        <CheckoutCartProducts
                          currency={currency}
                          showingTranslateValue={showingTranslateValue}
                        />

                        {/* 6. כפתורי אישור וחזרה */}
                        <CheckoutActions
                          isEmpty={isEmpty}
                          isCheckoutSubmit={isCheckoutSubmit}
                          customCartTotal={customCartTotal}
                          storeCustomizationSetting={storeCustomizationSetting}
                          showingTranslateValue={showingTranslateValue}
                          minimumOrderAmount={minimumOrderAmount}
                          onLoginRequired={userInfo ? undefined : () => setShowLoginModal(true)}
                        />
                      </div>
                    </form>
                  </div>
              ) : (
                <div className="mx-auto my-11 flex flex-col items-center justify-center gap-2 p-5">
                  <Image
                    src={websiteClose.src}
                    width={440}
                    height={440}
                    alt="websiteClose"
                  />
                  <h2 className="text-4xl font-bold mt-5 text-center">{t("common:storeClose")}</h2>
                  <p className="text-gray-500 text-center">{t("common:storeCloseMessage")}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </Layout>
    </>
  );
};

export default dynamic(() => Promise.resolve(Checkout), { ssr: false });