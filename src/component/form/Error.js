import { notifyError } from "@utils/toast";
import Cookies from "js-cookie";
import React, { useEffect } from "react";

const Error = ({ errorName, notifyMsg = '' }) => {

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

  const translateError = (error) => {
    if (!error) return;
    if (errorName?.type == "required") {
      if (currentLang) {
        return "שדה זה חובה"
      } else {
        return "This field is required"
      }
    } else {
      return error;
    }
  };

  useEffect(() => {
    if (notifyMsg) {
      notifyError(notifyMsg)
    }
  }, [notifyMsg, errorName])
  

  return (
    <>
      {errorName && (
        // ‎role="alert" — ההודעה מופיעה אחרי שליחת הטופס, כשהפוקוס נמצא על
        // כפתור השליחה. בלי ההכרזה משתמש קורא-מסך לוחץ "שלח", שום דבר לא
        // קורה מבחינתו, והוא אינו יודע שיש שדה שגוי בטופס.
        // ‎block + mt-1: קודם זה היה ‎<span> inline עם ‎mt-2 שלא השפיע כלל.
        <span role="alert" className="block text-red-700 text-sm font-medium mt-1">{
          translateError(
          errorName.message
          )
        }</span>
      )}
    </>
  );
};

export default Error;
