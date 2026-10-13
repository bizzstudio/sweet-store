// src/layout/Layout.js
import { useContext, useEffect, useState, useRef } from "react";
import Head from "next/head";
import { ToastContainer } from "react-toastify";
import Cookies from "js-cookie";
import { useRouter } from "next/router";
import useTranslation from "next-translate/useTranslation";

// Internal import
import Navbar from "@layout/navbar/Navbar";
import Footer from "@layout/footer/Footer";
import NavBarTop from "./navbar/NavBarTop";
import FooterTop from "@layout/footer/FooterTop";
import MobileFooter from "@layout/footer/MobileFooter";
import FeatureCard from "@component/feature-card/FeatureCard";
import MainModal from "@component/modal/MainModal";
import UserAddressInitialize from "@component/userAddressInitialize/UserAddressInitialize";
import RegisterSuccess from "@component/login/RegisterSuccess";
import PopupServices from "@services/PopupServices";
import LotteryServices from "@services/LotteryServices";
import useAsync from "@hooks/useAsync";
import DynamicPopup from "@component/modal/DynamicPopup";
import LotteryPopup, {
  wasLotteryPopupSeen,
  markLotteryPopupSeen,
} from "@component/modal/LotteryPopup";
import StickyCart from "@component/cart/StickyCart";
import useCart from "@hooks/useCart";
import useRegisterSuccessFlag from "@hooks/useRegisterSuccessFlag";
import { UserContext } from "@context/UserContext";
import useGetSetting from "@hooks/useGetSetting";
import FloatingWhatsApp from "@component/common/FloatingWhatsApp";
import CustomerServices from "@services/CustomerServices";
import RewardOffersManager from "@component/reward-offers/RewardOffersManager";
import WelcomeGiftManager from "@component/welcome-gift/WelcomeGiftManager";
import { STORE_CLOSED } from "@utils/storeMode";

const Layout = ({ title, description, children, cashierPage = false }) => {
  const { t } = useTranslation();

  const { state: { userInfo }, dispatch } = useContext(UserContext);

  // כיבוי רכיבי ההזמנה כשהחנות סגורה ללקוחות. עמדת הקופה ממשיכה לעבוד כרגיל
  const storeUiOff = STORE_CLOSED && !cashierPage;

  // console.log('userInfo layout :>> ', userInfo);

  const { storeCustomizationSetting } = useGetSetting() || {};
  const { seo } = storeCustomizationSetting || {};
  const { favicon, meta_title } = seo || {};

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
  }

  const router = useRouter();
  const { pathname } = router;

  // Cart items to determine welcome gift presence
  const { items } = useCart();

  // משיכת פופאפים דינאמיים
  const [currentPopup, setCurrentPopup] = useState(null);
  const { data: popupData, loading, error } = useAsync(() => PopupServices.getAllPopups());

  // בדיקה האם להציג פופאפ בעמוד הנוכחי
  useEffect(() => {
    if (popupData && popupData.length > 0) {
      const matchedPopup = popupData.find(
        (popup) => popup.pageToShow === pathname && popup.isActive
      );

      // בדיקה אם הפופאפ כבר הוצג
      if (matchedPopup && !sessionStorage.getItem(`popupShown_${matchedPopup._id}`)) {
        setCurrentPopup(matchedPopup || null);
      }
    }
  }, [pathname, popupData]);

  // הצגת הפופאפ ושמירת המידע ב-sessionStorage
  useEffect(() => {
    if (currentPopup) {
      sessionStorage.setItem(`popupShown_${currentPopup._id}`, 'true');
    }
  }, [currentPopup]);

  const [addressPopup, setAddressPopup] = useState(false);
  useEffect(() => {
    let isFirstTime = false;
    try {
      isFirstTime = localStorage.firstTime && JSON.parse(localStorage.firstTime);
    } catch (e) {
      localStorage.removeItem("firstTime");
    }
    if (isFirstTime) {
      localStorage.removeItem("plsRegisterAgain");
      localStorage.removeItem("waitingForVerification");
      setTimeout(() => {
        setAddressPopup(true);
      }, 3000);
    }
  }, [localStorage.firstTime]);

  // האזנה לדגל ההרשמה המוצלחת. הועבר להוק משותף כדי שגם עמוד ההתחברות
  // העצמאי (‎/login), שאינו עטוף ב-Layout, יציג את אותו פופאפ
  const [showRegisterSuccess, setShowRegisterSuccess] = useRegisterSuccessFlag();


  // פופאפ הגרלה פעילה — מופיע ראשון, שאר הפופאפים ממתינים לסגירתו
  const [activeLottery, setActiveLottery] = useState(null);
  const [lotteryPopupOpen, setLotteryPopupOpen] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      LotteryServices.getActiveLottery()
        .then((lottery) => {
          if (!lottery?._id) return;
          if (wasLotteryPopupSeen(lottery._id, lottery.popupType)) return;
          setActiveLottery(lottery);
          setLotteryPopupOpen(true);
        })
        .catch(() => {});
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  const handleLotteryPopupClose = () => {
    if (activeLottery?._id) markLotteryPopupSeen(activeLottery._id, activeLottery.popupType);
    setLotteryPopupOpen(false);
  };

  // יצירת props דינאמיים לפי העמוד הנוכחי
  const getWhatsAppProps = () => {
    const { pathname, query } = router;

    // עמוד מוצר
    if (pathname.startsWith('/product/')) {
      const productName = title?.replace(` | ${meta_title || "המתוקים של בני"}`, '') || '';
      return {
        productName
      };
    }

    // עמוד קטגוריה
    if (pathname.startsWith('/product-category/')) {
      const categoryName = query.categoryName || '';
      const subCategoryName = query.subCategoryName || '';

      return {
        categoryName,
        subCategoryName,
        productName: ''
      };
    }

    // עמוד הזמנה
    if (pathname.startsWith('/order/')) {
      const orderNumber = title?.replace(` | ${meta_title || "המתוקים של בני"}`, '') || '';
      return {
        orderNumber
      };
    }

    // ברירת מחדל
    return {};
  };

  // בדיקת תקפות טוקן בריענון
  useEffect(() => {
    const validateUserToken = async () => {
      // רק אם יש משתמש מחובר
      if (!userInfo) return;

      try {
        const isValid = await CustomerServices.validateToken();
        if (!isValid) {
          // אם הטוקן לא תקין - נתק את המשתמש
          dispatch({ type: "USER_LOGOUT" });
          Cookies.remove("userInfo");
          Cookies.remove("couponInfo");
          // אם זה לא עמוד הבית - העבר לעמוד הבית
          if (router.pathname !== "/") {
            router.push("/");
          }
        }
      } catch (error) {
        console.error("Token validation error:", error);
      }
    };

    validateUserToken();
  }, []); // רץ רק פעם אחת בריענון

  // מדידת גובה ההידר הנעוץ (הניווט) ל-CSS var גלובלי --header-h.
  // גובה ההידר דינמי (הבר מוצג/מוסתר לפי הגדרות ומצב עגלה), ולכן אלמנטים שיושבים
  // "מתחת להידר" (dropdown קטגוריות, סיידבר dashboard, גלילה לשגיאה ב-checkout)
  // מתייחסים למשתנה הזה במקום לערכי px קשיחים — נכון בכל מצב.
  const headerRef = useRef(null);
  useEffect(() => {
    if (cashierPage) return; // עמוד הקופה שומר על ה-offsets הייעודיים שלו
    const el = headerRef.current;
    if (!el || typeof ResizeObserver === "undefined") return;

    const setHeaderVar = () => {
      document.documentElement.style.setProperty("--header-h", `${el.offsetHeight}px`);
    };
    setHeaderVar();
    const ro = new ResizeObserver(setHeaderVar);
    ro.observe(el);
    return () => ro.disconnect();
  }, [cashierPage]);

  return (
    <>
      <ToastContainer rtl={currentLang} />

      {/* פופאפ הגרלה פעילה — מופיע ראשון */}
      {lotteryPopupOpen && activeLottery && (
        <LotteryPopup lottery={activeLottery} onClose={handleLotteryPopupClose} />
      )}

      {!lotteryPopupOpen && (
        <>
          {addressPopup && (
            <MainModal modalOpen={addressPopup} setModalOpen={setAddressPopup}>
              <div className="px-3 sm:px-11 py-8 pt-10 max-w-xl">
                <UserAddressInitialize />
              </div>
            </MainModal>
          )}

          {showRegisterSuccess && (
            <MainModal modalOpen={showRegisterSuccess} setModalOpen={setShowRegisterSuccess}>
              <div className="px-3 sm:px-11 py-8 max-w-md">
                <RegisterSuccess />
              </div>
            </MainModal>
          )}

          {/* פופאפ דינאמי */}
          {!loading && !error && currentPopup && !addressPopup && !showRegisterSuccess && (
            <MainModal modalOpen={true} setModalOpen={() => setCurrentPopup(null)}>
              <div className="px-3 sm:px-11 py-7 max-w-md">
                <DynamicPopup popup={currentPopup} />
              </div>
            </MainModal>
          )}
        </>
      )}

      <div className="font-sans">
        {/* דילוג על הניווט — הרכיב הראשון בסדר ה-Tab בכל עמוד. בלעדיו משתמש
            מקלדת חייב לעבור את הלוגו, החיפוש, התפריט וכל פס
            הקטגוריות (עשרות עצירות) לפני שהוא מגיע לתוכן העמוד. */}
        {!cashierPage && (
          <a href="#main-content" className="skip-to-content">
            {t("common:skipToContent")}
          </a>
        )}
        <Head>
          <title>
            {title
              ? `${title} | ${meta_title || "המתוקים של בני"}`
              : meta_title || "המתוקים של בני"}
          </title>
          {description && <meta name="description" content={description} />}
        </Head>
        {/* <NavBarTop /> */}
        {/* הניווט נעוץ למעלה לכל אורך הגלישה במיכל sticky יחיד,
            ולכן ה-Navbar עצמו מקבל disableSticky. */}
        {cashierPage ? (
          <Navbar cashierPage={cashierPage} />
        ) : (
          <div ref={headerRef} className="sticky top-0 z-20">
            <Navbar cashierPage={cashierPage} disableSticky />
          </div>
        )}
        {/* ‎<main> ולא ‎<div>: אזור ציון (landmark) שקוראי מסך מנווטים אליו
            ישירות, וגם יעד הקישור "דלג לתוכן". ‎tabIndex={-1} מאפשר לקבל
            פוקוס תכנותית אחרי הדילוג בלי להוסיף עצירת Tab משלו. */}
        <main
          id="main-content"
          tabIndex={-1}
          data-skip-target
          className="bg-mainColor-superLight min-h-[calc(100vh-127px)]"
        >
          {!storeUiOff && <StickyCart />}
          {children}
        </main>
        {!storeUiOff && !cashierPage && <MobileFooter />}
        {!cashierPage &&
          <div className="w-full max-w-full overflow-hidden">
            <FooterTop />
            {storeCustomizationSetting &&
              storeCustomizationSetting?.home?.feature_promo_status !== false && (
              <div className="hidden relative lg:block mx-auto max-w-screen-2xl py-6 px-3 sm:px-10">
                <FeatureCard />
              </div>
            )}
            <hr className="hr-line"></hr>
            <div className="border-t border-gray-100 w-full">
              <Footer />
            </div>
          </div>
        }

        {/* כפתור וואטסאפ צף עם props דינאמיים */}
        <FloatingWhatsApp {...getWhatsAppProps()} />

        {/* Reward Offers Manager - מנהל את כל פופאפי המוצרי מתנה.
            מוצרי המתנה נכנסים לעגלה, ולכן אינם רלוונטיים בחנות סגורה */}
        {!storeUiOff && (
          <>
            <RewardOffersManager
              addressPopup={addressPopup}
              showRegisterSuccess={showRegisterSuccess}
              currentPopup={currentPopup}
            />

            <WelcomeGiftManager
              addressPopup={addressPopup}
              showRegisterSuccess={showRegisterSuccess}
              currentPopup={currentPopup}
              lotteryPopupOpen={lotteryPopupOpen}
            />
          </>
        )}
      </div>
    </>
  );
};

export default Layout;