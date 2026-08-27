import Cookies from "js-cookie";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

// Internal import
// import useAsync from "./useAsync";
import SettingServices from "@services/SettingServices";
import { addSetting } from "@redux/slice/settingSlice";
import { storeCustomization } from "@utils/storeCustomizationSetting";

// ההגדרות נשמרות ל-sessionStorage, ולכן בלי רענון יזום לקוח שהטאב שלו פתוח
// ממשיך לראות את הגרסה שנטענה בכניסה הראשונה - שינוי בפאנל הניהול לא מגיע
// אליו כלל. הדגל ברמת המודול מבטיח רענון אחד בדיוק לכל טעינת עמוד, במקום
// בקשה נפרדת מכל אחד מעשרות הרכיבים שקוראים להוק הזה.
let settingsRefreshed = false;

const useGetSetting = () => {
  const lang = Cookies.get("_lang");
  const dispatch = useDispatch();

  // const { data: globalSetting } = useAsync(SettingServices.getGlobalSetting);
  // const {
  //   data: storeCustomizationSetting,
  //   loading,
  //   error,
  // } = useAsync(SettingServices.getStoreCustomizationSetting);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const settings = useSelector((state) => state.setting.settingItem);

  const globalSetting = settings.find(
    (value) => value.name === "globalSetting"
  );

  const storeCustomizationSetting = settings.find(
    (value) => value.name === "storeCustomizationSetting"
  );

  // useEffect(() => {
  //   setSocket(io(process.env.NEXT_PUBLIC_API_BASE_URL));
  //   // setSocket(io("http://localhost:5065"));
  // }, []);

  useEffect(() => {
    // Function to fetch and add the setting.
    // showSkeleton מבדיל בין טעינה ראשונה (אין מה להציג - מגיע סקלטון) לבין
    // רענון ברקע של עותק שכבר מוצג. בלי ההבחנה הזו כל טעינת עמוד הייתה
    // מהבהבת בסקלטון למרות שהתוכן כבר על המסך
    const fetchAndAddSetting = async (showSkeleton = true) => {
      try {
        if (showSkeleton) setLoading(true);
        // console.log("storeCustomizationSetting setting not available");
        const res = await SettingServices.getStoreCustomizationSetting();
        // console.log("res", res);
        const storeCustomizationSettingData = {
          ...res,
          name: "storeCustomizationSetting",
        };

        if (Object.keys(res).length > 0) {
          dispatch(addSetting(storeCustomizationSettingData));
        } else {
          // console.log(
          //   "store customization setting not available in db! use local one"
          // );
          const storeCustomizationData = {
            ...storeCustomization?.setting,
            name: "storeCustomizationSetting",
          };
          dispatch(addSetting(storeCustomizationData));
        }

        setLoading(false);
      } catch (err) {
        // בדיקה אם יש הודעת שגיאה מותאמת מהשרת
        if (err.response && err.response.data && err.response.data.message) {
          setError(err.response.data.message);
        } else {
          setError(err.message);
        }
        console.log("Error on getting storeCustomizationSetting setting", err);
      }
    };

    const fetchGlobalSetting = async () => {
      try {
        // setLoading(true);
        // console.log("globalSetting setting not available");
        const res = await SettingServices.getGlobalSetting();
        const globalSettingData = {
          ...res,
          name: "globalSetting",
        };

        dispatch(addSetting(globalSettingData));

        // setLoading(false);
      } catch (err) {
        setError(err.message);
        console.log("Error on getting globalSetting setting", err);
      }
    };

    // רענון אחד לכל טעינת עמוד: העותק השמור מוצג מיד, והנתונים הטריים
    // מחליפים אותו כשהם מגיעים. אם משום מה הרענון כבר בוצע והמידע עדיין
    // חסר, הבקשה שכבר בדרך תמלא אותו
    if (!settingsRefreshed) {
      settingsRefreshed = true;
      // סקלטון רק כשאין עדיין מה להציג
      fetchAndAddSetting(!storeCustomizationSetting);
      fetchGlobalSetting();
    } else {
      if (!storeCustomizationSetting) fetchAndAddSetting();
      if (!globalSetting) fetchGlobalSetting();
    }

    // Check if the "lang" value is not set and set a default value
    if (!lang) {
      Cookies.set("_lang", "he", {
        sameSite: "None",
        secure: true,
      });
    }
  }, [lang]);

  return {
    lang,
    error,
    loading,
    globalSetting,
    storeCustomizationSetting,
  };
};

export default useGetSetting;
