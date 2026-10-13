// src/component/checkout/CheckoutPrompts.jsx
import React from "react";
import { IoPersonOutline } from "react-icons/io5";
import useTranslation from "next-translate/useTranslation";
import CheckoutPromptBar from "@component/checkout/CheckoutPromptBar";

// הכפתור הבולט מעל סיכום העלויות: כניסת משתמש קיים (מוצג לאורחים בלבד -
// מי שמחובר ממילא לא צריך).
const CheckoutPrompts = ({
    isGuest,
    onLoginClick,
}) => {
    const { t } = useTranslation("common");

    const showLogin = isGuest && typeof onLoginClick === "function";

    if (!showLogin) return null;

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
        </div>
    );
};

export default CheckoutPrompts;
