// src/hooks/useRegisterSuccessFlag.js
//
// useLoginSubmit מסמן הרשמה מוצלחת בכתיבה ל-localStorage ולא דרך state משותף,
// ולכן מי שמציג את פופאפ ההצלחה צריך להאזין לכתיבה הזו. localStorage אינו
// משדר אירוע בטאב שכתב אליו, ולכן setItem עטוף כדי לשדר אירוע פנימי.
//
// ההוק נועד לשמש כל מסך שממנו אפשר להירשם: ה-Layout של החנות ועמוד ההתחברות
// העצמאי, שאינו עטוף ב-Layout.
import { useEffect, useState } from "react";

const EVENT_NAME = "customLocalStorageChange";
const FLAG_KEY = "showRegisterSuccess";

// הדגל על window מבטיח עטיפה אחת בלבד. בלעדיו כל mount היה עוטף מחדש את
// הגרסה העטופה ומשדר את האירוע פעם נוספת בכל כתיבה
const patchLocalStorage = () => {
  if (typeof window === "undefined" || window.__localStorageEventPatched) return;
  window.__localStorageEventPatched = true;

  const originalSetItem = localStorage.setItem;
  localStorage.setItem = function (...args) {
    originalSetItem.apply(this, args);
    window.dispatchEvent(new Event(EVENT_NAME));
  };
};

const useRegisterSuccessFlag = () => {
  const [showRegisterSuccess, setShowRegisterSuccess] = useState(false);

  useEffect(() => {
    patchLocalStorage();

    const handleStorageChange = () => {
      try {
        if (localStorage[FLAG_KEY] && JSON.parse(localStorage[FLAG_KEY])) {
          setShowRegisterSuccess(true);
          localStorage.removeItem(FLAG_KEY);
        }
      } catch (e) {
        // ערך פגום לא אמור להשאיר את המסך תקוע על דגל שלא ניתן לפענוח
        localStorage.removeItem(FLAG_KEY);
      }
    };

    handleStorageChange();
    window.addEventListener(EVENT_NAME, handleStorageChange);

    return () => window.removeEventListener(EVENT_NAME, handleStorageChange);
  }, []);

  return [showRegisterSuccess, setShowRegisterSuccess];
};

export default useRegisterSuccessFlag;
