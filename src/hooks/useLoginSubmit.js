// src/hooks/useLoginSubmit.js
import Cookies from "js-cookie";
import { useRouter } from "next/router";
import { useContext, useState } from "react";
import { set, useForm } from "react-hook-form";

// Internal import
import { UserContext } from "@context/UserContext";
import { notifyError, notifyInfo, notifySuccess } from "@utils/toast";
import CustomerServices from "@services/CustomerServices";
import { STORE_CLOSED, CLOSED_HOME, safeInternalPath } from "@utils/storeMode";
import useTranslation from "next-translate/useTranslation";
import { trackNewsletterSignup } from "@services/flashy";
import notifyApiResponse from "@utils/notifyApiResponse";

const useLoginSubmit = (setModalOpen, newsletterOptIn = false) => {
  const router = useRouter();
  const { redirect } = router.query;
  const { dispatch } = useContext(UserContext);
  const { t } = useTranslation();

  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
    watch,
    setError,
  } = useForm();

  const cookieTimeOut = 10;

  // אותו כלל סניטציה שה-middleware מפעיל: יעד פנימי בלבד, לא ניווט החוצה
  const safeRedirect = safeInternalPath(redirect);

  // לאן מנווטים אחרי כניסה מוצלחת. בצ'קאאוט אין פרמטר redirect, ולכן ברירת המחדל "/"
  // הייתה זורקת לדף הבית לקוח שהתחבר באמצע הקנייה - כאן נשארים בעמוד. שאר העמודים
  // מתנהגים בדיוק כמקודם. כשהחנות סגורה אין לאן לחזור בחנות - תמיד לאזור האישי
  const postLoginPath = () => {
    if (safeRedirect) return safeRedirect;
    if (STORE_CLOSED) return CLOSED_HOME;
    return router.pathname === "/checkout" ? router.asPath : "/";
  };

  const submitHandler = ({
    name,
    lastName,
    email,
    registerEmail,
    verifyEmail,
    password,
    phone
  }) => {
    setLoading(true);

    // console.log({
    //   name,
    //   lastName,
    //   email,
    //   registerEmail,
    //   verifyEmail,
    //   password,
    //   phone
    // })

    // login
    if (registerEmail && password) {
      if (localStorage.getItem("plsRegisterAgain")) {
        setLoading(false);
        notifyError(t("common:pls_register_again"));
        return;
      } else {
        CustomerServices.customerLogin({
          registerEmail,
          password,
        })
          .then((res) => {
            // console.log(res);
            setLoading(false);
            setModalOpen(false);
            localStorage.removeItem("plsRegisterAgain");
            localStorage.removeItem("waitingForVerification");
            // גרימה לפופאפ הזנת כתובת לקפוץ אם אין לו כתובת
            if (!res.address.city) {
              localStorage.setItem("firstTime", true);
            }
            // העוגייה נכתבת לפני הניווט: הניווט מפעיל בדיקת הרשאה בשרת
            // (middleware), ואם העוגייה עדיין לא קיימת ברגע הזה הבקשה נדחית
            // חזרה למסך ההתחברות
            dispatch({ type: "USER_LOGIN", payload: res });
            Cookies.set("userInfo", JSON.stringify(res), {
              expires: cookieTimeOut,
            });
            notifySuccess(t("common:loginSuccess"));
            router.push(postLoginPath());

            // רישום לניוזלטר אם המשתמש סימן את הצ'קבוקס
            if (newsletterOptIn && res.email) {
              trackNewsletterSignup(res.email, res.name, res.lastName, res.phone || res.contact || '');
            }

            window.location.reload();
          })
          .catch((err) => {
            // בדיקה אם המשתמש כבר נרשם וממתין לאימות
            if (localStorage.getItem("waitingForVerification") == registerEmail) {
              setLoading(false);
              notifyError(t("common:waiting_for_verification"));
              return;
            } else {
              notifyError(err ? err.response.data.message : err.message);
              setLoading(false);
            }
          });
      }
    }

    // register
    if (name && email && password) {
      // ווידוא שהשם משתמש הוא 2 מילים לפחות
      // const usernameWords = name.trim().split(" ");
      // if (usernameWords.length < 2) {
      //   setLoading(false);
      //   notifyError(t("common:username_at_least_two_words"));
      //   return;
      // }
      CustomerServices.verifyEmailAddress({ name, lastName, email, password, phone })
        .then((res) => {
          // טיפול בלקוח קיים שמסומן כלא רשום ועכשיו נרשם
          if (res.keyWord === "customerRegistered") {
            // הלקוח כבר קיים ועכשיו נרשם - התחברות ישירה
            setLoading(false);
            setModalOpen(false);
            localStorage.removeItem("plsRegisterAgain");
            localStorage.removeItem("waitingForVerification");

            // שמירת פרטי המשתמש והתחברות
            dispatch({ type: "USER_LOGIN", payload: res });
            Cookies.set("userInfo", JSON.stringify(res), {
              expires: cookieTimeOut,
            });

            notifyApiResponse(res, true);

            // רישום לניוזלטר אם המשתמש סימן את הצ'קבוקס
            if (newsletterOptIn && res.email) {
              trackNewsletterSignup(res.email, res.name, res.lastName, res.phone || res.contact || '');
            }

            router.push(postLoginPath());
            window.location.reload();
            return;
          }

          // תהליך הרשמה רגיל - שליחת אימייל אימות
          if (res.waitingForVerification) {
            localStorage.setItem("waitingForVerification", res.waitingForVerification);
            // מחיקת האימייל מהלוקל סטורג' תוך רבע שעה
            setTimeout(() => {
              localStorage.removeItem("waitingForVerification");
              // אחרי רבע שעה החלפת ההודעה לנא להרשם מחדש
              localStorage.setItem("plsRegisterAgain", true);
            }, 1000 * 60 * 15);
          }
          setLoading(false);
          setModalOpen(false);
          // notifySuccess(res.message);
          localStorage.setItem("showRegisterSuccess", true); // פופאפ במקום נוטיפיי

          // רישום לניוזלטר אם המשתמש סימן את הצ'קבוקס
          if (newsletterOptIn) {
            trackNewsletterSignup(email, name, lastName, phone || '');
          }
        })
        .catch((err) => {
          console.log(err)
          setLoading(false);
          notifyApiResponse(err, false);
        });
    }

    // forget password
    if (verifyEmail) {
      CustomerServices.forgetPassword({ verifyEmail })
        .then((res) => {
          setLoading(false);
          notifySuccess(res.message);
          setValue("verifyEmail");
        })
        .catch((err) => {
          setLoading(false);
          notifyError(err ? err.response.data.message : err.message);
        });
    }
  };

  // ===== כניסה בטלפון + קוד אימות ב-SMS =====

  // מצבים שאינם כישלון אלא שלב בזרימה: אין חשבון (ממשיכים להרשמה) וקוד שכבר נשלח
  // (ממשיכים למסך הקוד). הצגתם כשגיאה אדומה סותרת את מה שקורה על המסך בפועל
  const OTP_INFO_KEYWORDS = ["customerNotFound", "otpAlreadySent"];

  const notifyOtpFailure = (data, fallbackMessage) => {
    const message = data?.message || fallbackMessage;
    if (OTP_INFO_KEYWORDS.includes(data?.keyWord)) {
      notifyInfo(message);
    } else {
      notifyError(message);
    }
  };

  // שלב 1: שליחת קוד ל-SMS. מחזיר { sent, keyWord } - הקומפוננטה צריכה לדעת גם אם
  // להתקדם לשלב הקוד וגם להבחין ב-keyWord שמכתיב מסך אחר
  const sendOtp = (phone) => {
    setLoading(true);
    return CustomerServices.sendOtp({ phone })
      .then((res) => {
        setLoading(false);
        notifySuccess(res.message || t("common:codeSent"));
        return { sent: true };
      })
      .catch((err) => {
        setLoading(false);
        const data = err?.response?.data;
        notifyOtpFailure(data, err.message);
        return { sent: false, keyWord: data?.keyWord };
      });
  };

  // שלב 2: אימות הקוד. בהצלחה - מחבר בדיוק כמו כניסה רגילה.
  // מחזיר את אותו חוזה של sendOtp, כדי שגם כאן החשבון שנמחק בין השלבים יוביל להרשמה
  const verifyOtp = (phone, code) => {
    setLoading(true);
    return CustomerServices.verifyOtp({ phone, code })
      .then((res) => {
        setLoading(false);
        setModalOpen(false);
        // גרימה לפופאפ הזנת כתובת לקפוץ אם אין לו כתובת
        if (!res.address?.city) {
          localStorage.setItem("firstTime", true);
        }
        notifySuccess(t("common:loginSuccess"));
        dispatch({ type: "USER_LOGIN", payload: res });
        Cookies.set("userInfo", JSON.stringify(res), {
          expires: cookieTimeOut,
        });

        // רישום לניוזלטר אם המשתמש סימן את הצ'קבוקס
        if (newsletterOptIn && res.email) {
          trackNewsletterSignup(res.email, res.name, res.lastName, res.phone || res.contact || '');
        }

        router.push(postLoginPath());
        window.location.reload();
        return { verified: true };
      })
      .catch((err) => {
        setLoading(false);
        const data = err?.response?.data;
        notifyOtpFailure(data, err.message);
        return { verified: false, keyWord: data?.keyWord };
      });
  };

  const handleGoogleSignIn = (credentialResponse) => {
    if (credentialResponse) {
      CustomerServices.signUpWithProvider({
        credential: credentialResponse?.credential
      })
        .then((res) => {
          setModalOpen(false);
          // גם כאן: העוגייה קודמת לניווט, אחרת ה-middleware יחזיר להתחברות
          dispatch({ type: "USER_LOGIN", payload: res });
          Cookies.set("userInfo", JSON.stringify(res), {
            expires: cookieTimeOut,
          });
          notifySuccess(t("common:loginSuccess"));
          router.push(postLoginPath());

          // רישום לניוזלטר אם המשתמש סימן את הצ'קבוקס
          if (newsletterOptIn && res.email) {
            trackNewsletterSignup(res.email, res.name, res.lastName, res.phone || res.contact || '');
          }

          window.location.reload();
        })

        .catch((err) => {
          notifyError(err.message);
          setModalOpen(false);
        });
    }
  };

  return {
    handleSubmit,
    submitHandler,
    handleGoogleSignIn,
    sendOtp,
    verifyOtp,
    register,
    setValue,
    errors,
    loading,
    watch,
    setError
  };
};

export default useLoginSubmit;
