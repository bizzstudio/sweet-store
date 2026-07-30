// src/layout/Layout.js
import { useContext, useEffect, useState, useRef } from "react";
import Head from "next/head";
import { ToastContainer } from "react-toastify";
import Cookies from "js-cookie";
import { useRouter } from "next/router";

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
import FreeShippingBar from "@component/common/FreeShippingBar";
import useCart from "@hooks/useCart";
import { UserContext } from "@context/UserContext";
import useGetSetting from "@hooks/useGetSetting";
import FloatingWhatsApp from "@component/common/FloatingWhatsApp";
import CustomerServices from "@services/CustomerServices";
import RewardOffersManager from "@component/reward-offers/RewardOffersManager";
import WelcomeGiftManager from "@component/welcome-gift/WelcomeGiftManager";

const Layout = ({ title, description, children, cashierPage = false }) => {

  const { state: { userInfo }, dispatch } = useContext(UserContext);

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

  const [showRegisterSuccess, setShowRegisterSuccess] = useState(false);
  useEffect(() => {
    const handleStorageChange = () => {
      if (localStorage.showRegisterSuccess && JSON.parse(localStorage.showRegisterSuccess)) {
        setShowRegisterSuccess(true);
        localStorage.removeItem('showRegisterSuccess');
      }
    };

    handleStorageChange();
    window.addEventListener("customLocalStorageChange", handleStorageChange);

    return () => {
      window.removeEventListener("customLocalStorageChange", handleStorageChange);
    };
  }, []);

  useEffect(() => {
    const originalSetItem = localStorage.setItem;
    localStorage.setItem = function (key, value) {
      const event = new Event('customLocalStorageChange');
      originalSetItem.apply(this, arguments);
      window.dispatchEvent(event);
    };
  }, []);


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
      const productName = title?.replace(` | ${meta_title || "תמרים בתומר"}`, '') || '';
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
      const orderNumber = title?.replace(` | ${meta_title || "תמרים בתומר"}`, '') || '';
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

  // מדידת גובה ההידר הנעוץ (פס משלוח חינם + ניווט) ל-CSS var גלובלי --header-h.
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
        <Head>
          <title>
            {title
              ? `${title} | ${meta_title || "תמרים בתומר"}`
              : meta_title || "תמרים בתומר"}
          </title>
          {description && <meta name="description" content={description} />}
        </Head>
        {/* <NavBarTop /> */}
        {/* פס משלוח חינם + ניווט נעוצים יחד למעלה לכל אורך הגלישה.
            ה-Navbar מקבל disableSticky כדי שלא "יטפס" מעל הפס (מיכל sticky יחיד). */}
        {cashierPage ? (
          <Navbar cashierPage={cashierPage} />
        ) : (
          <div ref={headerRef} className="sticky top-0 z-20">
            <FreeShippingBar />
            <Navbar cashierPage={cashierPage} disableSticky />
          </div>
        )}
        <div className="bg-mainColor-superLight min-h-[calc(100vh-127px)]">
          <StickyCart />
          {children}
        </div>
        {!cashierPage && <MobileFooter />}
        {!cashierPage &&
          <div className="w-full max-w-full overflow-hidden">
            <FooterTop />
            <div className="hidden relative lg:block mx-auto max-w-screen-2xl py-6 px-3 sm:px-10">
              <FeatureCard />
            </div>
            <hr className="hr-line"></hr>
            <div className="border-t border-gray-100 w-full">
              <Footer />
            </div>
          </div>
        }

        {/* כפתור וואטסאפ צף עם props דינאמיים */}
        <FloatingWhatsApp {...getWhatsAppProps()} />

        {/* Reward Offers Manager - מנהל את כל פופאפי המוצרי מתנה */}
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
      </div>
    </>
  );
};

export default Layout;