// src/component/checkout/CheckoutActions.jsx
import React from "react";
import Link from "next/link";
import { IoReturnUpBackOutline, IoCheckmarkCircle } from "react-icons/io5";
import useTranslation from "next-translate/useTranslation";
import Cookies from "js-cookie";
import Calculating from "@component/cart/Calculating";
import { asset } from "@utils/basePath";
import { HIDE_PRICES } from "@utils/priceVisibility";
import { PAYMENT_DISABLED } from "@utils/paymentDisabled";

const CheckoutActions = ({
    isEmpty,
    isCheckoutSubmit,
    customCartTotal,
    storeCustomizationSetting,
    showingTranslateValue,
    minimumOrderAmount,
    formId = "checkout-form",
    // אורח: אין רכישה בלי חשבון (מ-14/10/2026). הכפתור נראה אותו דבר ("שמירת
    // ההזמנה"), אבל במקום לשלוח את הטופס הוא פותח התחברות. type="button" ולא
    // submit — אחרת ולידציית הטופס (תקנון) הייתה רצה לפני ההתחברות.
    onLoginRequired,
}) => {
    const { t } = useTranslation();

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
    };

    const paymentButtonContent = (
        <div className="w-full flex items-center justify-center relative z-10">
            {typeof customCartTotal !== 'number' ? (
                <Calculating />
            ) : isCheckoutSubmit ? (
                <span className="flex flex-row-reverse justify-center text-center items-center gap-2">
                    <span>
                        {t("common:processing")}
                    </span>
                    <img
                        src={asset("/loader/spinner.gif")}
                        alt="Loading"
                        width={20}
                        height={20}
                        className="saturate-0 brightness-0 invert"
                    />
                </span>
            ) : (
                <span className={currentLang ? "flex justify-center gap-2 text-center items-center" : "flex flex-row-reverse justify-center gap-2 text-center items-center"}>
                    <IoCheckmarkCircle className="text-2xl" />
                    {/*
                      * חנות ללא תשלום (ראה src/utils/paymentDisabled.js): הכיתוב
                      * קבוע בקוד ולא נלקח מ-confirm_button שבהגדרות החנות. ההגדרה
                      * ההיא נערכת באדמין ואומרת "לתשלום", וטקסט כזה על כפתור
                      * שרק שומר הזמנה היה מבטיח ללקוח מסך סליקה שלא קיים.
                      */}
                    {PAYMENT_DISABLED
                        ? t("common:saveOrder")
                        : showingTranslateValue(
                            storeCustomizationSetting?.checkout
                                ?.confirm_button
                        )}
                    {!HIDE_PRICES && (
                        <span className="text-xs text-green-100 mb-[1px] font-normal">
                            ({t("common:minimumPurchaseAmount", { amount: minimumOrderAmount })})
                        </span>
                    )}
                </span>
            )}
        </div>
    );

    // חסימת הכפתור עצמו (עגלה ריקה / שליחה בתהליך) — לא קשור למתג PAYMENT_DISABLED
    const isSubmitBlocked = isEmpty || isCheckoutSubmit || typeof customCartTotal !== 'number';

    // מאפייני הכפתור — זהים לכפתור בשורה ולכפתור הצף במובייל
    const buttonProps = onLoginRequired
        ? { type: "button", onClick: onLoginRequired, disabled: isEmpty }
        : { type: "submit", form: formId, disabled: isSubmitBlocked };

    return (
        <>
            {/* שורת כפתורים בתוך הזרימה - רק כפתור חזרה, כפתור התשלום עבר לצף */}
            <div className="border rounded-lg bg-white px-5 lg:px-8 py-5 flex flex-col sm:flex-row gap-4 lg:gap-6">
                <div className="sm:block hidden">
                    <Link href="/" passHref>
                        <button type="button" className="back-btn-simple font-serif">
                            <div className={currentLang ? "flex justify-center items-center gap-2" : "flex flex-row-reverse justify-center items-center gap-2"}>
                                <IoReturnUpBackOutline
                                    className={`text-xl ${currentLang ? "transform scale-x-[-1]" : ""}`}
                                />
                                {showingTranslateValue(
                                    storeCustomizationSetting?.checkout?.continue_button
                                )}
                            </div>
                        </button>
                    </Link>
                </div>
                {/* במובייל: מקום שמור (הכפתור הצף למטה). בדסקטופ: כפתור תשלום בשורה */}
                <div className="flex-1 hidden sm:block">
                    <button
                        {...buttonProps}
                        className="payment-glow-btn text-sm font-serif font-medium flex justify-center items-center w-full"
                    >
                        {paymentButtonContent}
                    </button>
                </div>
                <div className="flex-1 sm:hidden" aria-hidden="true">
                    <div className="payment-glow-btn opacity-0 pointer-events-none min-h-[52px] rounded-lg" />
                </div>
            </div>

            {/* כפתור תשלום צף - רק במובייל */}
            <div className="checkout-floating-payment sm:hidden">
                <button
                    {...buttonProps}
                    className="payment-glow-btn payment-glow-btn--floating text-sm font-serif font-medium flex justify-center items-center w-full"
                >
                    {paymentButtonContent}
                </button>
            </div>
        </>
    );
};

export default CheckoutActions;