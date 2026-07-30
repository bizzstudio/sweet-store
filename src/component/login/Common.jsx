// src/component/login/Common.jsx
import React, { useState } from "react";
import { GoogleLogin } from "@react-oauth/google";
import Cookies from "js-cookie";
import useTranslation from "next-translate/useTranslation";

// Internal import
import useAsync from "@hooks/useAsync";
import Login from "@component/login/Login";
import PhoneLogin from "@component/login/PhoneLogin";
import { notifyError } from "@utils/toast";
import useLoginSubmit from "@hooks/useLoginSubmit";
import Register from "@component/login/Register";
import ResetPassword from "@component/login/ResetPassword";
import SettingServices from "@services/SettingServices";
import CheckInput from "@component/form/checkInput";

const LOGIN_METHODS = {
  PHONE: "phone",
  EMAIL: "email",
};

const Common = ({ setModalOpen }) => {
  const [showRegister, setShowRegister] = useState(false);
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [newsletterOptIn, setNewsletterOptIn] = useState(false);
  const [loginMethod, setLoginMethod] = useState(LOGIN_METHODS.PHONE);
  // המספר שהוקלד בכניסה בטלפון ולא נמצא לו חשבון - מועבר כמילוי מראש למסך ההרשמה
  const [phoneToRegister, setPhoneToRegister] = useState("");

  const { handleGoogleSignIn } = useLoginSubmit(setModalOpen, newsletterOptIn);
  const { data: storeSetting } = useAsync(SettingServices.getStoreSetting);
  const { t } = useTranslation();

  const handleModal = () => {
    setShowRegister(!showRegister);
    setShowResetPassword(false);
    // מעבר ידני בין הכניסה להרשמה מנקה את המילוי מראש, אחרת חזרה למסך ההרשמה
    // הייתה דורסת מספר שהמשתמש הספיק לתקן בעצמו
    setPhoneToRegister("");
  };

  // מספר טלפון ללא חשבון - מעבר להרשמה עם המספר שכבר הוקלד
  const handleNoAccount = (phone) => {
    setPhoneToRegister(phone);
    setShowRegister(true);
  };

  const lang = Cookies.get("_lang") || "he";

  const tabClass = (method) =>
    `flex-1 py-2 rounded-md text-sm font-semibold transition ${
      loginMethod === method
        ? "bg-white text-mainColor-superDark shadow"
        : "text-gray-500"
    }`;

  return (
    <>
      <div className="bg-white mx-auto">
        {showResetPassword ? (
          <ResetPassword
            setShowResetPassword={setShowResetPassword}
            setModalOpen={setModalOpen}
          />
        ) : showRegister ? (
          <Register
            setShowResetPassword={setShowResetPassword}
            setModalOpen={setModalOpen}
            newsletterOptIn={newsletterOptIn}
            initialPhone={phoneToRegister}
          />
        ) : (
          <>
            {/* מתג בחירה בין כניסה בטלפון לכניסה באימייל */}
            <div className="flex mt-5 rounded-lg bg-gray-100 p-1">
              <button
                type="button"
                onClick={() => setLoginMethod(LOGIN_METHODS.PHONE)}
                className={tabClass(LOGIN_METHODS.PHONE)}
              >
                {t("common:phone")}
              </button>
              <button
                type="button"
                onClick={() => setLoginMethod(LOGIN_METHODS.EMAIL)}
                className={tabClass(LOGIN_METHODS.EMAIL)}
              >
                {t("common:email")}
              </button>
            </div>

            {loginMethod === LOGIN_METHODS.PHONE ? (
              <PhoneLogin
                setModalOpen={setModalOpen}
                newsletterOptIn={newsletterOptIn}
                onNoAccount={handleNoAccount}
              />
            ) : (
              <Login
                setShowResetPassword={setShowResetPassword}
                setModalOpen={setModalOpen}
                newsletterOptIn={newsletterOptIn}
              />
            )}
          </>
        )}

        {/* צ'קבוקס ניוזלטר - מופיע בכל המצבים (רלוונטי גם לכניסה עם גוגל שמוצגת מתחתיו) */}
        {!showResetPassword && (
          <div className="flex items-center gap-2 mt-4 mb-4 px-2">
            <CheckInput
              id="newsletterOptIn"
              type="checkbox"
              checked={newsletterOptIn}
              onChange={(e) => setNewsletterOptIn(e.target.checked)}
            />
            <label htmlFor="newsletterOptIn" className="text-sm text-gray-700 cursor-pointer">
              {t("common:newsletterOptInLabel")}
            </label>
          </div>
        )}

        <div>
          {storeSetting?.google_login_status && !showRegister && (
            <>
              <div className="mt-7 mb-3 after:bg-gray-100 before:bg-gray-100 fo10t-sans text-center font-medium">
                {t("common:orGoogle")}
              </div>
              <div className="flex items-center justify-center w-full max-w-sm mx-auto">
                <GoogleLogin
                  onSuccess={handleGoogleSignIn}
                  onFailure={(err) =>
                    notifyError(
                      err?.message || "Something wrong on your auth setup!"
                    )
                  }
                  theme="outline"
                  size="large"
                  text="signin_with"
                  shape="pill"
                  logo_alignment="center"
                  width={384}
                  locale={lang}
                />
              </div>
            </>
          )}
        </div>
        <div className="text-center text-sm text-gray-900 mt-4">
          <div className="text-gray-500 mt-2.5">
            {showRegister ? t("common:alreadyHaveAccount") : t("common:notAccount")}
            <button
              onClick={handleModal}
              className="text-gray-800 hover:text-blackfont-bold mx-1 underline"
            >
              {showRegister ? t("common:loginBtn") : t("common:register")}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Common;
