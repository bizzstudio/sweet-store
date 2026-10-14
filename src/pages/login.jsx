// src/pages/login.jsx
//
// עמוד ההתחברות הייעודי (ראו src/utils/storeMode.js). עומד בפני עצמו בלי
// ה-Layout של החנות — אין ניווט, חיפוש, קטגוריות או עגלה. הניתוב אליו נעשה
// ב-middleware: בחנות סגורה לכל מבקר, ובחנות פתוחה לאורח שמנסה לסיים הזמנה.
import Head from "next/head";
import Image from "@component/common/Img";
import Cookies from "js-cookie";
import Link from "next/link";
import { ToastContainer } from "react-toastify";

// Internal import
import Common from "@component/login/Common";
import MainModal from "@component/modal/MainModal";
import RegisterSuccess from "@component/login/RegisterSuccess";
import useGetSetting from "@hooks/useGetSetting";
import useRegisterSuccessFlag from "@hooks/useRegisterSuccessFlag";
import { STORE_CLOSED } from "@utils/storeMode";

const LoginPage = () => {
  const { storeCustomizationSetting } = useGetSetting();
  // אותו לוגו של ההידר, ואם אינו מוגדר בהגדרות - הנכס המקומי של המותג
  const logo = storeCustomizationSetting?.navbar?.logo || "/logo/logo-full.png";
  const metaTitle = storeCustomizationSetting?.seo?.meta_title || "המתוקים של בני";

  // פופאפ "נשלח אליך מייל אימות" בסיום הרשמה. ב-Layout הוא מגיע מאותו הוק,
  // וכאן הוא חייב להופיע במפורש כי העמוד אינו עטוף ב-Layout
  const [showRegisterSuccess, setShowRegisterSuccess] = useRegisterSuccessFlag();

  const isRtl = (Cookies.get("_lang") || "he") === "he";

  return (
    <>
      <Head>
        <title>{`כניסה לאזור האישי | ${metaTitle}`}</title>
        <meta name="description" content="כניסה לאזור האישי של לקוחות החנות" />
        <meta name="robots" content="noindex,nofollow" />
      </Head>

      <ToastContainer rtl={isRtl} />

      {showRegisterSuccess && (
        <MainModal
          modalOpen={showRegisterSuccess}
          setModalOpen={setShowRegisterSuccess}
        >
          <div className="px-3 sm:px-11 py-8 max-w-md">
            <RegisterSuccess />
          </div>
        </MainModal>
      )}

      <div className="font-sans min-h-screen bg-mainColor-superLight flex items-center justify-center px-3 py-10">
        <div className="w-full max-w-lg">
          {logo && (
            <div className="flex justify-center mb-4">
              <Image
                src={logo}
                alt={metaTitle}
                width={240}
                height={112}
                priority
                sizes="240px"
                // תיבה בגודל קבוע ולא w-auto: קובץ לוגו בפורמט SVG מגיע ללא
                // מידות פנימיות, ורוחב אוטומטי היה מכווץ אותו לאפס
                className="h-28 w-60 object-contain"
              />
            </div>
          )}

          <div className="bg-white rounded-2xl shadow-xl px-5 sm:px-10 pt-6 pb-8">
            <p className="text-center text-sm text-gray-600 leading-6">
              {STORE_CLOSED
                ? "החנות סגורה כרגע להזמנות. הכניסה מיועדת לאזור האישי — צפייה בהזמנות שלכם ועדכון פרטים."
                : "ההזמנה באתר זמינה ללקוחות רשומים בלבד. התחברו כדי להשלים את ההזמנה — העגלה שלכם שמורה."}
            </p>

            {/* setModalOpen מקבל פונקציה ריקה: כאן אין מודאל לסגור */}
            <Common setModalOpen={() => {}} />
          </div>

          {/* בחנות פתוחה העמוד הוא תחנת ביניים בדרך לצ'קאאוט — דרך חזרה לקטלוג */}
          {!STORE_CLOSED && (
            <p className="text-center mt-4">
              <Link href="/" className="text-sm text-gray-700 underline hover:text-gray-900">
                חזרה לחנות
              </Link>
            </p>
          )}
        </div>
      </div>
    </>
  );
};

export default LoginPage;
