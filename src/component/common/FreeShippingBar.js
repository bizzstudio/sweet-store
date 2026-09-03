import dynamic from "next/dynamic";
import React from "react";
import Cookies from "js-cookie";
import { IoRocketOutline, IoCheckmarkCircle } from "react-icons/io5";

// Internal import
import useAsync from "@hooks/useAsync";
import SettingServices from "@services/SettingServices";
import useCart from "@hooks/useCart";
import useGetSetting from "@hooks/useGetSetting";
import { HIDE_PRICES } from "@utils/priceVisibility";

/**
 * פס משלוח חינם — מוצג לאורך כל האתר (מעל ה-Navbar).
 * מראה ללקוח כמה כסף נותר להוסיף כדי לזכות במשלוח חינם, עם פס התקדמות.
 *
 * בסיס החישוב זהה ל-checkout.jsx: סכום המוצרים אחרי הנחת סף (threshold) וקופון,
 * *בלי* דמי המשלוח עצמם — כדי לא להבטיח ללקוח משלוח חינם שלא יתקבל בקופה.
 */
const FreeShippingBar = () => {
    const { totalItems, customCartTotal, thresholdDiscount } = useCart();
    const { data: storeSetting } = useAsync(SettingServices.getStoreSetting);
    // המטבע נשלף מ-Redux (redux-persist) דרך useGetSetting — ללא בקשת רשת נוספת
    const { globalSetting } = useGetSetting() || {};

    const currency = globalSetting?.default_currency || "₪";

    const freeShippingStatus = storeSetting?.free_shipping_status;
    const threshold = Number(storeSetting?.free_shipping_threshold);

    // הפס מוצג רק אם משלוח חינם מוגדר ופעיל
    if (!freeShippingStatus || !(threshold > 0)) return null;

    // חנות ללא מחירים — כל תוכן הפס הוא סכומים ("עוד ₪X למשלוח חינם"),
    // ולכן הוא יורד כולו. ראה src/utils/priceVisibility.js
    if (HIDE_PRICES) return null;

    // חישוב סכום זכאות — עקבי עם checkout.jsx ו-useCheckoutSubmit:
    // סכום מוצרים − הנחת סף − הנחת קופון (קבוע/אחוז על הסכום שאחרי הסף).
    const ct = Number(customCartTotal) || 0;
    const th = Number(thresholdDiscount) || 0;
    const baseAfterThreshold = Math.max(0, ct - th);

    // עוגיית הקופון קיימת בשני מבנים: רגיל (עם discountType) ורזה (מוצר חינם, ללא discountType).
    // מטופלים שניהם — מבנה רזה פשוט אינו מזכה בהנחה כספית, כמו בקופה.
    let couponDiscount = 0;
    try {
        const raw = Cookies.get("couponInfo");
        if (raw) {
            const coupon = JSON.parse(raw);
            const dt = coupon?.discountType;
            if (dt && typeof dt === "object" && typeof dt.value === "number") {
                if (dt.type === "fixed") {
                    if (dt.value < baseAfterThreshold) couponDiscount = dt.value;
                } else if (dt.type === "percentage") {
                    couponDiscount = (dt.value / 100) * baseAfterThreshold;
                }
            }
        }
    } catch (e) {
        couponDiscount = 0;
    }
    // עיגול זהה ל-useCheckoutSubmit כדי למנוע אי-התאמה בגבול הסף
    couponDiscount = Number(couponDiscount.toFixed(2));

    const eligibleAmount = Math.max(0, baseAfterThreshold - couponDiscount);
    const remaining = Math.max(0, threshold - eligibleAmount);
    const qualified = eligibleAmount >= threshold;
    const progress = Math.min(100, (eligibleAmount / threshold) * 100);

    const formatAmount = (value) =>
        Number.isInteger(value) ? `${value}` : value.toFixed(2);

    return (
        <div className="w-full bg-mainColor-dark text-white text-center">
            <div className="mx-auto max-w-screen-2xl px-3 py-1.5">
                <div className="flex items-center justify-center gap-2 text-xs sm:text-sm font-medium">
                    {qualified ? (
                        <>
                            <IoCheckmarkCircle className="text-base sm:text-lg shrink-0" />
                            <span>כל הכבוד! זכית במשלוח חינם 🎉</span>
                        </>
                    ) : (
                        <>
                            <IoRocketOutline className="text-base sm:text-lg shrink-0" />
                            {totalItems > 0 ? (
                                <span>
                                    עוד <b>{currency}{formatAmount(remaining)}</b> וקבלת משלוח חינם!
                                </span>
                            ) : (
                                <span>
                                    משלוח חינם בקנייה מעל <b>{currency}{formatAmount(threshold)}</b>
                                </span>
                            )}
                        </>
                    )}
                </div>

                {/* פס התקדמות — מוצג רק כשיש פריטים בעגלה ועדיין לא זכאי */}
                {totalItems > 0 && !qualified && (
                    <div className="mx-auto mt-1 h-1 w-full max-w-md overflow-hidden rounded-full bg-white/25">
                        <div
                            className="h-full rounded-full bg-white transition-all duration-500 ease-out"
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                )}
            </div>
        </div>
    );
};

// ssr:false — תלוי בעגלה (react-use-cart) ובעוגיות, מידע זמין רק בצד הלקוח
export default dynamic(() => Promise.resolve(FreeShippingBar), { ssr: false });
