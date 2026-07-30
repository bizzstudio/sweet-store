// src/context/UserContext.js
import Cookies from 'js-cookie';
import React, { createContext, useReducer, useEffect } from 'react';
import { identifyUser } from '@services/flashy';

export const UserContext = createContext();

// פענוח בטוח של עוגייה: אם התוכן פגום (JSON לא תקין — למשל עוגייה שנחתכה
// בגבול הגודל או פורמט ישן), במקום לזרוק שגיאה שמפילה את כל האתר, מוחקים את
// העוגייה הפגומה ומחזירים ערך ברירת מחדל. זה תוקן אחרי ששחזרנו שעוגיית userInfo
// פגומה גורמת ל"client-side exception" ומסך לבן לגולש.
const safeParseCookie = (name, fallback) => {
  const raw = Cookies.get(name);
  if (!raw) return fallback;
  try {
    return JSON.parse(raw);
  } catch (e) {
    Cookies.remove(name);
    return fallback;
  }
};

const initialState = {
  userInfo: safeParseCookie('userInfo', null),
  shippingAddress: safeParseCookie('shippingAddress', {}),
  couponInfo: safeParseCookie('couponInfo', {}),
};

function reducer(state, action) {
  switch (action.type) {
    case 'USER_LOGIN':
      return { ...state, userInfo: action.payload };

    case 'USER_LOGOUT':
      return {
        ...state,
        userInfo: null,
      };

    case 'SAVE_SHIPPING_ADDRESS':
      return { ...state, shippingAddress: action.payload };

    case 'SAVE_COUPON':
      return { ...state, couponInfo: action.payload };
  }
}

export const UserProvider = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initialState);
  
  // Flashy User Identification
  useEffect(() => {
    if (state.userInfo?.email) {
      identifyUser(state.userInfo);
    }
  }, [state.userInfo]);

  const value = { state, dispatch };
  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};
