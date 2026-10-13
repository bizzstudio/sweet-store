// src/layout/navbar/Navbar.jsx
import { useCallback, useContext, useEffect, useState, useRef } from "react";
import Cookies from "js-cookie";
import Link from "next/link";
import Image from "@component/common/Img";
import dynamic from "next/dynamic";
import { useRouter } from "next/router";
import { IoHome, IoNewspaperOutline, IoSearchOutline } from "react-icons/io5";
import { FiShoppingCart, FiUser, FiBell, FiUserCheck } from "react-icons/fi";
import { FaX } from "react-icons/fa6";
import { MdPointOfSale } from "react-icons/md";
import useTranslation from "next-translate/useTranslation";
import debounce from "lodash.debounce";
import { RiCustomerServiceLine } from "react-icons/ri";
import { IoInformationCircleOutline } from "react-icons/io5";
import { FaList } from "react-icons/fa";

// Internal import
import NavbarPromo from "@layout/navbar/NavbarPromo";
import { UserContext } from "@context/UserContext";
import LoginModal from "@component/modal/LoginModal";
import CartDrawer from "@component/drawer/CartDrawer";
import { SidebarContext } from "@context/SidebarContext";
import useGetSetting from "@hooks/useGetSetting";
import { handleLogEvent } from "@utils/analytics";
import ProductServices from "@services/ProductServices";
import ResultWindow from "@component/resultWindow/resultWindow";
import AttributeServices from "@services/AttributeServices";
import useCart from "@hooks/useCart";
import VoiceSearchButton from "@component/voice-search/VoiceSearchButton";
import DropdownMenu from "@component/menu/DropdownMenu";
import MainModal from "@component/modal/MainModal";
import { STORE_CLOSED, CLOSED_HOME, LOGIN_PATH } from "@utils/storeMode";

const Navbar = ({ cashierPage = false, disableSticky = false }) => {
  const { t } = useTranslation();
  const router = useRouter();

  // כיבוי כלי החנות (חיפוש, עגלה, פס קטגוריות) כשהחנות סגורה ללקוחות.
  // עמדת הקופה ממשיכה לעבוד כרגיל - הקופאי מזין שם הזמנות בחנות
  const storeUiOff = STORE_CLOSED && !cashierPage;

  const [imageUrl, setImageUrl] = useState("");
  const [searchText, setSearchText] = useState("");
  const [searchResults, setSearchResults] = useState();
  const [attributes, setAttributes] = useState();
  const [modalOpen, setModalOpen] = useState(false);

  const { toggleCartDrawer } = useContext(SidebarContext);
  const { state: { userInfo } } = useContext(UserContext);

  const { totalItems } = useCart();

  const { storeCustomizationSetting } = useGetSetting();

  const navbarRef = useRef(null);
  const logoRef = useRef(null);
  const [logoHeight, setLogoHeight] = useState(null);
  const [logoWidth, setLogoWidth] = useState(0);


  const handleSubmit = (e) => {
    e.preventDefault();
    if (searchText.trim()) {
      router.push(`/search?query=${searchText.trim()}`, null, { scroll: false });
      setSearchText("");
      handleLogEvent("search", `searched ${searchText}`);
    }
  };

  // חיפוש מיידי
  useEffect(() => {
    const fetchData = async () => {
      if (searchText.trim()) {
        // קבלת המוצרים המתאימים מהשרת
        let serverProducts = await ProductServices.getShowingStoreProducts({
          title: searchText,
        });
        setSearchResults(serverProducts.products);
        // קבלת התכונות מהשרת
        let attributes = await AttributeServices.getShowingAttributes();
        setAttributes(attributes);
      } else {
        setSearchResults();
      }
    };

    // הוצאה לפועל של הפונקציה אחרי מינימום 300 אלפיות כדי למנוע הצפת בקשות
    const debouncedFetch = debounce(fetchData, 300);

    debouncedFetch();

    return () => {
      debouncedFetch.cancel();
    };
  }, [searchText])


  useEffect(() => {
    if (Cookies.get("userInfo")) {
      const user = JSON.parse(Cookies.get("userInfo"));
      setImageUrl(user.image);
    }
  }, []);

  // מדידת גובה הNavbar והגדרת גובה הלוגו.
  //
  // קודם הלוגו נמתח ל-135% מגובה הסרגל וחרג ממנו כלפי מטה. עם הלוגו החדש
  // (יחס 5.47:1 במקום 4.2:1) זה הפך אותו לרצועה שבולעת את ההידר ודוחקת את
  // שורת החיפוש. עכשיו הוא ממורכז אנכית ותופס כמחצית מגובה הסרגל — יחס
  // שמשאיר לחיפוש את הרוחב שלו ונשאר קריא גם בנייד.
  const updateLogoDimensions = useCallback(() => {
    if (navbarRef.current) {
      const navbarHeight = navbarRef.current.offsetHeight;
      setLogoHeight(Math.max(30, Math.round(navbarHeight * 0.5)));
    }
    if (logoRef.current) {
      const width = logoRef.current.offsetWidth;
      setLogoWidth(width);
    }
  }, []);

  useEffect(() => {
    updateLogoDimensions();
    window.addEventListener('resize', updateLogoDimensions);

    // עדכון אחרי שהדף נטען
    const timer = setTimeout(updateLogoDimensions, 100);
    const timer2 = setTimeout(updateLogoDimensions, 500);

    return () => {
      window.removeEventListener('resize', updateLogoDimensions);
      clearTimeout(timer);
      clearTimeout(timer2);
    };
  }, [cashierPage, updateLogoDimensions]);

  return (
    <>

      {!storeUiOff && <CartDrawer />}
      {modalOpen && (
        <LoginModal modalOpen={modalOpen} setModalOpen={setModalOpen} />
      )}

      <>
        {/* ‎<header> ולא ‎<div>: אזור ציון banner שקורא מסך מנווט אליו ישירות.
            לפני כן לא היה באתר אף landmark — כל העמוד היה ‎div אחד גדול. */}
        <header
          ref={navbarRef}
          className={`${disableSticky ? "relative" : "sticky top-0"} z-20 bg-white flex xl:flex-row w-full drop-shadow-lg ${cashierPage ? "border-b" : ""}`}
        >
          {/* logo - בצד ימין, ממורכז אנכית בתוך ה-navbar */}
          <Link
            ref={logoRef}
            href={
              cashierPage
                ? "/cashier-desk"
                : STORE_CLOSED
                  ? CLOSED_HOME
                  : "/"
            }
            aria-label={t("common:breadcrumbHome")}
            className="absolute right-0 top-0 h-full flex items-center px-3 sm:px-5 pointer-events-auto z-10"
            // תקרת רוחב: הלוגו רחב פי ~5.5 מגובהו, ובלעדיה הוא בלע במסך
            // צר כמעט את כל ההידר והשאיר לשורת החיפוש כמה עשרות פיקסלים
            style={{ maxWidth: "40%" }}
          >
            <Image
              width={328}
              height={60}
              src={storeCustomizationSetting?.navbar?.logo}
              alt="logo"
              priority
              sizes="(max-width: 640px) 40vw, 328px"
              // maxHeight ולא height: כשתקרת הרוחב (40%) נכנסת לפעולה במסך צר,
              // גובה קשיח היה משאיר רצועות ריקות מעל ומתחת ללוגו במקום להקטין
              // אותו. שתי התקרות יחד שומרות על היחס בכל רוחב מסך.
              className="w-auto max-w-full h-auto object-contain"
              style={{ maxHeight: logoHeight ? `${logoHeight}px` : undefined }}
              // מדידה מחדש ברגע שהתמונה נטענה: עד אז רוחב הלוגו הוא 0 ושורת
              // החיפוש מקבלת רוחב שגוי. הטיימרים לבדם לא מכסים טעינה איטית
              onLoad={updateLogoDimensions}
            />
          </Link>

          {/* חיפוש + תפריט */}
          <div
            className="w-full"
            // הרוחב האמיתי של הלוגו ולא גובהו: הלוגו רחב בהרבה מגובהו, ושמירת
            // מקום לפי הגובה בלבד הניחה את שורת החיפוש מתחתיו
            style={{ paddingRight: logoWidth > 0 ? `${logoWidth}px` : '180px' }}
          >
            <div className="w-full flex flex-col-reverse md:flex-row items-center md:gap-3 gap-0">
              <div className="w-full">
                <div className="h-auto sm:h-16 lg:h-auto flex items-center justify-between mx-auto py-2.5 lg:py-5 2xl:py-3">

                  {/* Search Bar — כשהחנות סגורה אין קטלוג לחפש בו, ובמקומו
                      נשאר מרווח שמחזיק את פריסת ההידר */}
                  {storeUiOff ? (
                    <div className="w-full" />
                  ) : (
                  <div className="flex flex-col w-full max-w-[700px] mx-auto px-1.5 sm:px-2">
                    {/* ‎role="search" הופך את השורה לאזור ציון נפרד — קוראי מסך
                        מציעים קפיצה ישירה ל"חיפוש" ברשימת אזורי הדף. */}
                    <form onSubmit={handleSubmit} role="search" aria-label={t("common:submitSearch")}
                      className={`flex relative w-full h-[32px] sm:h-[40px] lg:min-w-[250px] items-center px-2 sm:px-3.5 rounded-[10px] transition-[border-radius] duration-500 ease-in-out bg-gray-100 focus-within:rounded-[1px] before:content-[''] before:absolute before:bg-mainColor before:transform before:scale-x-0 before:origin-center before:w-full before:h-[2px] before:left-0 before:bottom-0 before:rounded-[1px] before:transition-transform before:duration-300 before:ease-in-out focus-within:before:scale-100`}>
                      <button
                        type="submit"
                        aria-label={t("common:submitSearch")}
                        className="border-none bg-none text-[#6b6b85] focus:text-mainColor-dark text-base sm:text-lg flex-shrink-0 px-1.5 h-full flex items-center"
                      >
                        <IoSearchOutline aria-hidden="true" />
                      </button>
                      {/* ‎placeholder אינו תווית: הוא נעלם ברגע שמקלידים ואינו
                          מוכרז באופן אמין. תווית ‎sr-only נותנת לשדה שם קבוע. */}
                      <label htmlFor="store-search" className="sr-only">
                        {t("common:search-placeholder")}
                      </label>
                      <input
                        id="store-search"
                        onChange={(e) => setSearchText(e.target.value)}
                        className="peer text-xs sm:text-sm bg-transparent w-full h-full px-1.5 sm:px-2 py-0 sm:py-[0.7em] border-none focus:outline-none focus:ring-0"
                        placeholder={t(`common:search-placeholder`)}
                        required
                        type="search"
                        autoComplete="off"
                        // אין כאן ‎role="combobox": התבנית מחייבת ‎listbox של
                        // ‎option-ים ומודל מקלדת של חצים + ‎aria-activedescendant,
                        // וחלון התוצאות כאן הוא רשימת קישורים עם כפתורים בתוכה.
                        // הכרזת המצב נעשית דרך המונה החי בחלון התוצאות עצמו
                        // (ראה component/resultWindow/resultWindow.jsx).
                        value={searchText}
                      />
                      <button
                        onClick={() => { setSearchResults(), setSearchText("") }}
                        type="reset"
                        aria-label={t("common:clearSearch")}
                        className="border-none peer-placeholder-shown:opacity-0 peer-placeholder-shown:invisible transition-opacity duration-300 flex-shrink-0 px-1.5 h-full flex items-center"
                      >
                        <FaX size={10} className="sm:w-3 sm:h-3" aria-hidden="true" />
                      </button>

                      {/* כפתור התמלול הקולי */}
                      <VoiceSearchButton />

                      {searchResults && <ResultWindow
                        products={searchResults}
                        attributes={attributes}
                        clearInput={() => { setSearchResults(), setSearchText("") }}
                        closeResultWindow={() => setSearchResults()}
                      />}
                    </form>
                  </div>
                  )}

                  {/* תפריט נוסף */}
                  <div className="me-2 ms-1 sm:me-7 sm:ms-5">
                    <DropdownMenu
                      options={[
                        {
                          label: (
                            <Link href="/עלינו" className="group hover:underline">
                              <div className="flex items-center justify-center gap-1.5 font-semibold">
                                <IoInformationCircleOutline size={22} />
                                <span>{t("common:aboutUs")}</span>
                              </div>
                            </Link>
                          ),
                          onClick: () => { }, // אין צורך בפעולה כי זה לינק
                        },
                        {
                          label: (
                            <Link href="/צרו-קשר" className="group hover:underline">
                              <div className="flex items-center justify-center gap-1.5 font-semibold">
                                <RiCustomerServiceLine size={19} />
                                <span>{t("common:contactUs")}</span>
                              </div>
                            </Link>
                          ),
                          onClick: () => { }, // אין צורך בפעולה כי זה לינק
                        },
                        // הבלוג שייך לחנות הפעילה — כשהיא סגורה הוא חסום, ולכן הפריט יורד
                        ...(storeUiOff ? [] : [
                          {
                            label: (
                              <Link href="/blogs" className="group hover:underline">
                                <div className="flex items-center justify-center gap-1.5 font-semibold">
                                  <IoNewspaperOutline size={20} />
                                  <span>{t("common:blogsTitle")}</span>
                                </div>
                              </Link>
                            ),
                            onClick: () => { }, // אין צורך בפעולה כי זה לינק
                          },
                        ]),
                        {
                          label: (
                            <Link href="/תקנון-אתר" className="group hover:underline">
                              <div className="flex items-center justify-center gap-1.5 font-semibold">
                                <FaList size={17} />
                                <span>{t("common:termsAndConditions")}</span>
                              </div>
                            </Link>
                          ),
                          onClick: () => { }, // אין צורך בפעולה כי זה לינק
                        },
                      ]}
                    />
                  </div>

                  {/* כפתור סל הקניות */}
                  <div className="px-3 sm:px-10 hidden md:hidden md:items-center lg:flex gap-5 absolute inset-y-0 right-0 sm:static sm:inset-auto sm:pr-0">
                    {/* אין עגלה כשהחנות סגורה — אי אפשר להזמין */}
                    {!storeUiOff && (
                      <button
                        // "Total" לא אומר דבר לקורא מסך בעברית, ולא מסר כמה
                        // פריטים בעגלה. עכשיו התווית כוללת את המספר עצמו.
                        aria-label={
                          totalItems > 0
                            ? `${t("common:openCart")} – ${t("common:cartItemsCount", { count: totalItems })}`
                            : t("common:openCart")
                        }
                        onClick={toggleCartDrawer}
                        className="tap-target relative text-2xl font-bold"
                      >
                        {totalItems === 0 ? null :
                          // ‎aria-hidden: המספר כבר נאמר ב-aria-label של הכפתור,
                          // ובלעדיו קורא המסך מקריא אותו פעמיים.
                          <span aria-hidden="true" className="absolute z-10 top-0 right-0 inline-flex items-center justify-center p-1 h-5 text-xs font-bold leading-none text-white transform -translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full" style={{ minWidth: '20px', aspectRatio: '1/1' }}>
                            {totalItems}
                          </span>
                        }
                        <FiShoppingCart className="w-6 h-6 drop-shadow-xl" aria-hidden="true" />
                      </button>
                    )}

                    {/* כפתור פרופיל */}
                    {userInfo?.name ?
                      <Link
                        className="flex items-center justify-center bg-white hover:bg-mainColor hover:text-white text-2xl font-bold w-9 h-9 rounded-full leading-none outline outline-2 outline-mainColor outline-offset-2 hover:scale-110 hover:outline-none transition-all overflow-hidden"
                        aria-label={t("common:userArea")}
                        href="/user/dashboard"
                      >
                        {imageUrl || userInfo?.image ?
                          <Image
                            width={100}
                            height={100}
                            src={imageUrl || userInfo?.image}
                            alt="user"
                            className="min-w-full min-h-full object-cover"
                          /> :
                          <span className="flex items-center justify-center leading-none font-bold font-serif mb-0.5">
                            <FiUserCheck className="w-6 h-6 drop-shadow-xl" />
                          </span>}
                      </Link> :
                      // כשהחנות סגורה ההתחברות היא עמוד מלא ולא מודאל
                      storeUiOff ?
                        <Link className="flex items-center justify-center bg-white hover:bg-mainColor hover:text-white text-2xl font-bold w-9 h-9 rounded-full leading-none outline outline-2 outline-mainColor outline-offset-2 hover:scale-110 hover:outline-none transition-all overflow-hidden"
                          aria-label={t("common:loginToAccount")}
                          href={LOGIN_PATH}>
                          <FiUser className="w-6 h-6 drop-shadow-xl" />
                        </Link> :
                        <button className="flex items-center justify-center bg-white hover:bg-mainColor hover:text-white text-2xl font-bold w-9 h-9 rounded-full leading-none outline outline-2 outline-mainColor outline-offset-2 hover:scale-110 hover:outline-none transition-all overflow-hidden"
                          aria-label={t("common:loginToAccount")}
                          onClick={() => setModalOpen(!modalOpen)}>
                          <FiUser className="w-6 h-6 drop-shadow-xl" />
                        </button>
                    }

                    {/* כפתור עמוד קופה - רק לקופאים */}
                    {userInfo?.isCashier && (
                      <Link
                        href={cashierPage ? (STORE_CLOSED ? CLOSED_HOME : "/") : "/cashier-desk"}
                        className="flex items-center justify-center text-white bg-mainColor text-2xl font-bold w-9 h-9 rounded-full leading-none outline outline-2 outline-mainColor outline-offset-2 hover:scale-110 hover:outline-none transition-all overflow-hidden"
                        aria-label={cashierPage ? t("common:backToHomePgae") : t("common:cashierDesk")}
                        title={cashierPage ? t("common:backToHomePgae") : t("common:cashierDesk")}
                      >
                        {cashierPage ?
                          <IoHome className="w-5 h-5 drop-shadow-xl" /> :
                          <MdPointOfSale className="w-5 h-5 drop-shadow-xl" />
                        }
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* פס קטגוריות מתחת ל-navbar - בכל הרזולוציות (תמיד מתחת לחיפוש, לא עולה למעלה).
            כשהחנות סגורה אין גלישה בקטגוריות ולכן הפס יורד לגמרי */}
        {!cashierPage && !STORE_CLOSED && (
          <div className="block w-full">
            <NavbarPromo />
          </div>
        )}
      </>
    </>
  );
};
export default dynamic(() => Promise.resolve(Navbar), { ssr: false });