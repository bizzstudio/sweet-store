// src/component/login/PhoneLogin.jsx
import React, { useState } from "react";
import { FiPhone, FiHash } from "react-icons/fi";
import useTranslation from "next-translate/useTranslation";

// Internal import
import useLoginSubmit from "@hooks/useLoginSubmit";
import { notifyError } from "@utils/toast";
import MainBT from "@component/button/MainBT";
import MinimalTitle from "@component/common/MinimalTitle";
import { asset } from "@utils/basePath";

// עיצוב זהה לשדות של InputArea, אך כאן השדות מבוקרים (controlled) ולא דרך react-hook-form,
// כי הטופס דו-שלבי והערכים נדרשים גם בין השלבים
const inputClass =
  "py-2 px-4 pl-10 w-full appearance-none border text-sm opacity-75 text-input rounded-md placeholder-body min-h-12 transition duration-200 focus:ring-0 ease-in-out bg-white border-gray-300 focus:outline-none focus:border-mainColor h-11 md:h-12";

// משאירים ספרות בלבד - גם בהדבקה של מספר עם מקפים/רווחים
const digitsOnly = (value) => value.replace(/[^0-9]/g, "");

// נרמול לפורמט מקומי 05XXXXXXXX, במקביל ל-canonicalPhone שבשרת.
// כך מתקבלת גם הדבקה של 052-123-4567, של +972521234567 ושל 521234567.
// מחושב רק בשליחה ולא בכל הקלדה, כדי לא לשבש מספר שנמצא באמצע הקלדה
const canonicalPhone = (digits) => {
  const last9 = digits.slice(-9);
  return last9.length === 9 ? `0${last9}` : digits;
};

const SEND_CODE = 1;
const VERIFY_CODE = 2;

// כניסה בטלפון היא קיצור דרך ללקוח רשום בלבד. מספר שאין לו חשבון מקבל onNoAccount,
// שמעביר למסך ההרשמה במקום להשאיר את הלקוח תקוע מול הודעת שגיאה
const PhoneLogin = ({ setModalOpen, newsletterOptIn = false, onNoAccount }) => {
  const { sendOtp, verifyOtp, loading } = useLoginSubmit(
    setModalOpen,
    newsletterOptIn
  );
  const { t } = useTranslation();

  const [step, setStep] = useState(SEND_CODE);
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");

  // המספר שנשלח לשרת ומוצג בשלב האימות - תמיד בפורמט מקומי מלא
  const normalizedPhone = canonicalPhone(phone);

  const handleSendCode = async () => {
    // ולידציה בסיסית של נייד ישראלי - השרת מאמת שוב
    if (!/^05\d{8}$/.test(normalizedPhone)) {
      notifyError(t("common:invalidPhone"));
      return;
    }
    const { sent, keyWord } = await sendOtp(normalizedPhone);
    if (sent || keyWord === "otpAlreadySent") {
      // otpAlreadySent: קוד תקף כבר בדרך ואי אפשר לשלוח חדש בדקה הקרובה. בלי מעבר
      // למסך הקוד הלקוח היה נתקע כאן בלי שום דרך להקליד את הקוד שכבר קיבל
      setStep(VERIFY_CODE);
    } else if (keyWord === "customerNotFound") {
      onNoAccount?.(normalizedPhone);
    }
  };

  const handleVerify = async () => {
    if (code.length < 6) {
      notifyError(t("common:enterCode"));
      return;
    }
    const { keyWord } = await verifyOtp(normalizedPhone, code);
    if (keyWord === "customerNotFound") {
      onNoAccount?.(normalizedPhone);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (loading) return;
    return step === SEND_CODE ? handleSendCode() : handleVerify();
  };

  return (
    <>
      <div className="flex justify-between items-center mt-5 mb-4 bg-mainColor-superLight rounded-lg p-3">
        <MinimalTitle title={t("common:loginTitle")} />
      </div>
      <form onSubmit={handleSubmit} className="flex flex-col justify-center">
        <div className="grid grid-cols-1 gap-5">
          {step === SEND_CODE ? (
            <>
              <p className="text-sm text-gray-500 text-center">
                {t("common:phoneLoginSubtitle")}
              </p>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-800">
                  <FiPhone />
                </div>
                <input
                  dir="rtl"
                  type="tel"
                  inputMode="numeric"
                  autoComplete="tel"
                  autoFocus
                  value={phone}
                  onChange={(e) => setPhone(digitsOnly(e.target.value))}
                  placeholder={t("common:phonePlaceholder")}
                  className={inputClass}
                />
              </div>
            </>
          ) : (
            <>
              <p className="text-sm text-gray-500 text-center">
                {t("common:codeSentTo")} <span dir="ltr">{normalizedPhone}</span>
              </p>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-800">
                  <FiHash />
                </div>
                <input
                  dir="ltr"
                  type="tel"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  autoFocus
                  value={code}
                  onChange={(e) => setCode(digitsOnly(e.target.value).slice(0, 6))}
                  placeholder={t("common:codePlaceholder")}
                  className={`${inputClass} tracking-widest text-center`}
                />
              </div>
              <button
                type="button"
                onClick={() => {
                  setCode("");
                  setStep(SEND_CODE);
                }}
                className="text-sm text-heading underline hover:no-underline focus:outline-none"
              >
                {t("common:changePhone")}
              </button>
            </>
          )}

          <MainBT disabled={loading} type="submit">
            {loading ? (
              <div className="flex items-center justify-center gap-2 whitespace-nowrap">
                <img
                  src={asset("/loader/spinner.gif")}
                  alt="Loading"
                  width={20}
                  height={10}
                  className="saturate-0"
                />
                <span>{t("common:processing")}</span>
              </div>
            ) : step === SEND_CODE ? (
              t("common:sendCode")
            ) : (
              t("common:verifyAndLogin")
            )}
          </MainBT>
        </div>
      </form>
    </>
  );
};

export default PhoneLogin;
