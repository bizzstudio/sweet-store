// src/component/modal/CouponModal.jsx
import React, { useRef, useState } from "react";
import useTranslation from "next-translate/useTranslation";
import { FiTag } from "react-icons/fi";
import Cookies from "js-cookie";

//internal import
import MinimalTitle from "@component/common/MinimalTitle";
import MainBT from "@component/button/MainBT";
import { asset } from "@utils/basePath";

const CouponModal = ({ handleCouponCode, setModalOpen, couponRef }) => {
    const { t } = useTranslation();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

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

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            // קריאה ל-handleCouponCode עם event object
            // אם הקופון הוחל בהצלחה, הפונקציה תסתיים ללא שגיאה
            await handleCouponCode(e);

            // אם הגענו לכאן ללא שגיאה, הקופון הוחל בהצלחה - סוגרים את המודאל
            setModalOpen(false);
        } catch (err) {
            // אם יש שגיאה, נציג אותה ולא נסגור את המודאל
            setError(err?.message || err?.response?.data?.message || t("common:errorOccurred"));
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <div className="flex justify-between items-center mt-5 mb-4 bg-mainColor-superLight rounded-lg p-3">
                <MinimalTitle title={t("common:couponCode")} />
            </div>
            <form
                onSubmit={handleSubmit}
                className="flex flex-col justify-center"
            >
                <div className="grid grid-cols-1 gap-5">
                    <div className="form-group">
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <span className="text-gray-800 focus-within:text-gray-900 sm:text-base">
                                    <FiTag />
                                </span>
                            </div>
                            <input
                                ref={couponRef}
                                dir={currentLang ? 'rtl' : 'ltr'}
                                type="text"
                                name="couponCode"
                                placeholder={t("common:couponCode")}
                                className="py-2 px-4 pl-10 w-full appearance-none border text-sm opacity-75 text-input rounded-md placeholder-body min-h-12 transition duration-200 focus:ring-0 ease-in-out bg-white border-gray-300 focus:outline-none focus:border-mainColor h-11 md:h-12"
                                onKeyDown={(e) => {
                                    if (e.key === "Enter") {
                                        e.preventDefault();
                                        handleSubmit(e);
                                    }
                                }}
                            />
                        </div>
                    </div>

                    <MainBT
                        disabled={loading}
                        type="submit"
                    >
                        {loading ? (
                            <div className="flex items-center justify-center gap-2 whitespace-nowrap">
                                <img
                                    src={asset("/loader/spinner.gif")}
                                    alt="Loading"
                                    width={20}
                                    height={10}
                                    className="saturate-0"
                                />
                                <span>{t("common:processing")}</span>
                            </div>
                        ) : (
                            <>
                                {t("common:applyBtn")}
                            </>
                        )}
                    </MainBT>
                </div>
            </form>
        </>
    );
};

export default CouponModal;
