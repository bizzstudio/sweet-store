// src/component/checkout/CheckoutPrompts.jsx
import React from "react";
import { IoPersonOutline } from "react-icons/io5";
import { FiTag } from "react-icons/fi";
import useTranslation from "next-translate/useTranslation";
import CheckoutPromptBar from "@component/checkout/CheckoutPromptBar";

// שני הכפתורים הבולטים מעל סיכום העלויות:
// 1. כניסת משתמש קיים (מוצג לאורחים בלבד - מי שמחובר ממילא לא צריך).
// 2. הזנת קופון (מוצג כל עוד לא הוחל קופון על ההזמנה).
const CheckoutPrompts = ({
    isGuest,
    hasCoupon,
    onLoginClick,
    onCouponClick,
}) => {
    const { t } = useTranslation("common");

    const showLogin = isGuest && typeof onLoginClick === "function";
    const showCoupon = !hasCoupon && typeof onCouponClick === "function";

    if (!showLogin && !showCoupon) return null;

    return (
        <div className="w-full flex flex-col gap-3">
            {showLogin && (
                <CheckoutPromptBar
                    icon={<IoPersonOutline />}
                    question={t("checkoutLoginPromptQuestion")}
                    cta={t("checkoutLoginPromptCta")}
                    onClick={onLoginClick}
                />
            )}
            {showCoupon && (
                <CheckoutPromptBar
                    icon={<FiTag />}
                    question={t("checkoutCouponPromptQuestion")}
                    cta={t("checkoutCouponPromptCta")}
                    onClick={onCouponClick}
                />
            )}
        </div>
    );
};

export default CheckoutPrompts;
