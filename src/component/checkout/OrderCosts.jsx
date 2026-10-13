// src/component/checkout/OrderCosts.jsx
import React from "react";
import Link from "next/link";
import { IoAlertCircle, IoBagHandle } from "react-icons/io5";
import useTranslation from "next-translate/useTranslation";
import Calculating from "@component/cart/Calculating";
import CartItem from "@component/cart/CartItem";
import useCart from "@hooks/useCart";
import CheckInput from "@component/form/checkInput";
import { HIDE_PRICES } from "@utils/priceVisibility";

const OrderCosts = ({
    storeCustomizationSetting,
    showingTranslateValue,
    currency,
    customCartTotal,
    minimumOrderAmount,
    shippingCost,
    total,
    isDeliverable,
    city,
    guestChosenCity,
    newsletterOptIn,
    setNewsletterOptIn,
    register,
    errors,
    storeSetting,
    rewardEligible = true,
    // סיכום ההזמנה (רשימת המוצרים) הוטמע בתוך כרטיס סיכום העלויות
    items = [],
    isEmpty,
}) => {
    const { t } = useTranslation("common");
    const { thresholdDiscount, appliedOffers } = useCart();

    // מציאת מבצע THRESHOLD_DISCOUNT שחל
    const thresholdDiscountOffer = appliedOffers?.find(o => o.type === 'THRESHOLD_DISCOUNT');

    return (
        <div className="w-full flex flex-col h-full">
            <div className="border p-5 lg:px-8 lg:py-8 rounded-lg bg-white">
                {/* סיכום ההזמנה - רשימת המוצרים (הועברה לכאן מסקשן נפרד) */}
                <div className="pb-4 mb-2 border-b">
                    <h3 className="font-medium font-serif text-sm text-gray-700 pb-2 flex items-center gap-2">
                        <IoBagHandle className="text-mainColor-dark text-base" />
                        {showingTranslateValue(
                            storeCustomizationSetting?.checkout?.order_items
                        ) || t("orderItems")}
                    </h3>
                    <div className="overflow-y-auto flex-grow scrollbar-hide w-full max-h-64 bg-mainColor-superLight block rounded-md">
                        {items.map((item) => (
                            <CartItem key={item.id} item={item} currency={currency} />
                        ))}

                        {isEmpty && (
                            <div className="text-center py-10">
                                <span className="flex justify-center my-auto text-gray-500 font-semibold text-4xl">
                                    <IoBagHandle />
                                </span>
                                <h2 className="font-medium font-serif text-sm pt-2 text-gray-600">
                                    {t("noItemAdded")}
                                </h2>
                            </div>
                        )}
                    </div>
                </div>

                {/* חנות ללא מחירים — כל שורות הסכומים יורדות, מינימום ההזמנה
                    כלול. הכלל עדיין נאכף ב-useCheckoutSubmit, שמנסח את
                    ההודעה בלי סכום. ראה src/utils/priceVisibility.js */}

                {/* עלות ההזמנה */}
                {!HIDE_PRICES && (
                <div className="flex items-center py-2 text-sm w-full font-semibold text-gray-500 last:border-b-0 last:text-base last:pb-0 gap-1.5">
                    {showingTranslateValue(
                        storeCustomizationSetting?.checkout?.sub_total
                    )}
                    <span className="flex-shrink-0 text-gray-800 font-bold">
                        {typeof customCartTotal === 'number' ?
                            <>
                                <small>{currency}</small>
                                {customCartTotal.toFixed(2)}
                            </>
                            : <Calculating />}
                    </span>
                    {customCartTotal < minimumOrderAmount && (
                        <span className="text-xs text-red-500 mb-[1px]">
                            ({t("minimumPurchaseAmount", { amount: minimumOrderAmount })})
                        </span>
                    )}
                </div>
                )}

                {/* מחיר משלוח - מוצג רק אם יש כתובת נבחרת וזמינה למשלוח */}
                {(!HIDE_PRICES && (city || guestChosenCity?.city_name_he) && isDeliverable === true) && (
                    <div className="flex items-center py-2 text-sm w-full font-semibold text-gray-500 last:border-b-0 last:text-base last:pb-0 gap-1.5">
                        {showingTranslateValue(
                            storeCustomizationSetting?.checkout?.shipping_cost
                        )}
                        <span className="flex-shrink-0 text-gray-800 font-bold">
                            {Number(shippingCost) === 0 ? (
                                <span className="text-green-600">{t("freeShipping")}</span>
                            ) : (
                                <>
                                    {currency}
                                    {shippingCost?.toFixed(2)}
                                </>
                            )}
                        </span>
                    </div>
                )}

                {/* הבטחת קופון לקנייה הבאה — כשהלקוח משלם משלוח (לא הגיע לסף המשלוח החינם)
                    ורק אם עדיין זכאי (ההטבה חד-פעמית לכל לקוח) */}
                {(!HIDE_PRICES && rewardEligible &&
                    (city || guestChosenCity?.city_name_he) &&
                    isDeliverable === true &&
                    Number(shippingCost) > 0 &&
                    storeSetting?.free_shipping_status &&
                    Number(storeSetting?.free_shipping_threshold) > 0) && (
                    <div className="my-2 rounded-md bg-amber-50 border border-amber-300 px-3 py-2.5 text-sm text-amber-800 flex items-start gap-2">
                        <span className="text-lg leading-none">🎁</span>
                        <span>
                            לא הגעת למשלוח חינם — בסיום ההזמנה יחכה לך{" "}
                            <strong>קופון 25 ₪</strong> לקנייה הבאה!
                        </span>
                    </div>
                )}

                {/* הנחת מבצע קניה מעל סכום */}
                {!HIDE_PRICES && thresholdDiscount > 0 && thresholdDiscountOffer && (
                    <div className="flex items-center py-2 text-sm w-full font-semibold text-gray-500 last:border-b-0 last:text-base last:pb-0 gap-1.5">
                        {t("thresholdDiscount")}
                        <span className="ml-auto flex-shrink-0 font-bold text-orange-400">
                            {currency}
                            {thresholdDiscount?.toFixed(2)}
                            <span className="text-xs ms-1 font-normal text-gray-500">
                                ({showingTranslateValue(thresholdDiscountOffer.name)})
                            </span>
                        </span>
                    </div>
                )}

                {/* סה"כ */}
                {!HIDE_PRICES && (
                <div className="border-t mt-4">
                    <div className="flex items-center font-bold font-serif justify-between pt-5 text-sm uppercase">
                        {showingTranslateValue(
                            storeCustomizationSetting?.checkout?.total_cost
                        )}
                        <span className="font-serif font-extrabold text-lg">
                            {typeof customCartTotal === 'number' ?
                                <>
                                    {currency}
                                    {parseFloat(total).toFixed(2)}
                                </>
                                : <Calculating />}
                        </span>
                    </div>
                </div>
                )}

                {/* צ'קבוקס ניוזלטר — כשכל שורות הסכומים מוסתרות אין ביניהן
                    לבין רשימת המוצרים תוכן, ושני קווי ההפרדה נצמדים זה לזה. */}
                <div className={`flex items-center gap-2 mt-4 ${HIDE_PRICES ? "" : "pt-4 border-t"}`}>
                    <CheckInput
                        id="checkoutNewsletterOptIn"
                        type="checkbox"
                        checked={newsletterOptIn}
                        onChange={(e) => setNewsletterOptIn(e.target.checked)}
                    />
                    <label htmlFor="checkoutNewsletterOptIn" className="text-sm text-gray-700 cursor-pointer">
                        {t("newsletterOptInLabel")}
                    </label>
                </div>

                {/* צ'קבוקס חובה - אישור קריאת תקנון האתר */}
                <div
                    id="terms-accept-section"
                    className={`terms-accept-section mt-3 ${errors?.acceptedTerms ? "terms-accept-section--error" : ""}`}
                >
                    <div className="flex items-center gap-2">
                        <CheckInput
                            id="checkoutAcceptedTerms"
                            type="checkbox"
                            aria-invalid={errors?.acceptedTerms ? "true" : "false"}
                            {...(register ? register("acceptedTerms", { required: t("termsAcceptRequired") }) : {})}
                        />
                        <label htmlFor="checkoutAcceptedTerms" className="text-sm text-gray-700 cursor-pointer">
                            {t("termsAcceptPrefix")}{" "}
                            <Link
                                href="/terms-and-conditions"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-mainColor-dark underline hover:no-underline"
                            >
                                {t("termsAcceptLink")}
                            </Link>
                            <span className="text-red-500"> *</span>
                        </label>
                    </div>
                    {errors?.acceptedTerms && (
                        <p
                            role="alert"
                            className="text-red-600 font-semibold text-base sm:text-sm mt-2 sm:mt-1.5 flex items-center gap-1.5"
                        >
                            <IoAlertCircle className="text-xl sm:text-base shrink-0" />
                            <span>{errors.acceptedTerms.message}</span>
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default OrderCosts;