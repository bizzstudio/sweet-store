// src/component/guestAddress/GuestAddressForm.jsx
import React, { useEffect } from "react";
import { CiUser } from "react-icons/ci";
import useTranslation from "next-translate/useTranslation";

// Internal import
import Error from "@component/form/Error";
import InputArea from "@component/form/InputArea";
import useGetSetting from "@hooks/useGetSetting";
import useUtilsFunction from "@hooks/useUtilsFunction";

// אין משלוחים בחנות, ולכן האורח ממלא פרטים כלליים בלבד — בלי כתובת.
const GuestAddressForm = ({ register, errors, setError, clearErrors, watch }) => {
    const { storeCustomizationSetting } = useGetSetting();
    const { showingTranslateValue } = useUtilsFunction();
    const { t } = useTranslation();

    const validateInput = (data) => {
        const { name, lastName, phone } = data;

        // בדיקת רווחים בשדות שם פרטי ושם משפחה
        if (!name?.trim()) {
            setError('name', { type: 'manual', message: t('common:invalidName') });
            return false;
        }

        if (!lastName?.trim()) {
            setError('lastName', { type: 'manual', message: t('common:invalidLastName') });
            return false;
        }

        // בדיקת מספר טלפון - מתחיל ב־05 וכולל 10 ספרות בדיוק
        const phoneRegex = /^05\d{8}$/;
        if (!phoneRegex.test(phone)) {
            setError('phone', { type: 'manual', message: t('common:invalidPhone') });
            return false;
        }

        // בדיקת אימייל
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(data.email)) {
            setError('email', { type: 'manual', message: t('common:invalidEmail') || 'נא להזין אימייל תקין' });
            return false;
        }

        return true;
    };

    // חשיפה של פונקציית הוולידציה להורה
    useEffect(() => {
        if (window.guestAddressValidate) {
            window.guestAddressValidate.current = validateInput;
        }
    }, [watch]);

    // מעקב אחרי השדות וניקוי errors כשהקלט תקין
    const guestName = watch("guestName");
    const guestLastName = watch("guestLastName");
    const guestPhone = watch("guestPhone");
    const guestEmail = watch("guestEmail");

    const phoneRegex = /^05\d{8}$/;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    // ניקוי error של שם פרטי
    useEffect(() => {
        if (guestName?.trim() && errors.guestName) {
            clearErrors("guestName");
        }
    }, [guestName, errors.guestName, clearErrors]);

    // ניקוי error של שם משפחה
    useEffect(() => {
        if (guestLastName?.trim() && errors.guestLastName) {
            clearErrors("guestLastName");
        }
    }, [guestLastName, errors.guestLastName, clearErrors]);

    // ניקוי error של טלפון
    useEffect(() => {
        if (guestPhone && phoneRegex.test(guestPhone) && errors.guestPhone) {
            clearErrors("guestPhone");
        }
    }, [guestPhone, errors.guestPhone, clearErrors]);

    // ניקוי error של אימייל
    useEffect(() => {
        if (guestEmail && emailRegex.test(guestEmail) && errors.guestEmail) {
            clearErrors("guestEmail");
        }
    }, [guestEmail, errors.guestEmail, clearErrors]);

    return (
        <div className="w-full">
            <div className="bg-white border border-gray-200 rounded-lg">
                <div className="p-4 sm:p-6">
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2 mb-6">
                        <CiUser className="text-mainColor-dark text-xl" />
                        {t("common:generalDetails")}
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {/* שם פרטי */}
                        <div>
                            <InputArea
                                register={register}
                                label={showingTranslateValue(
                                    storeCustomizationSetting?.dashboard?.full_name
                                )}
                                name="guestName"
                                type="text"
                                placeholder={showingTranslateValue(
                                    storeCustomizationSetting?.dashboard?.full_name
                                )}
                            />
                            <Error errorName={errors.guestName} />
                        </div>

                        {/* שם משפחה */}
                        <div>
                            <InputArea
                                register={register}
                                label={showingTranslateValue(
                                    storeCustomizationSetting?.dashboard?.last_name
                                )}
                                name="guestLastName"
                                type="text"
                                placeholder={showingTranslateValue(
                                    storeCustomizationSetting?.dashboard?.last_name
                                )}
                            />
                            <Error errorName={errors.guestLastName} />
                        </div>

                        {/* טלפון */}
                        <div>
                            <InputArea
                                register={register}
                                label={showingTranslateValue(
                                    storeCustomizationSetting?.dashboard?.user_phone
                                )}
                                name="guestPhone"
                                type="tel"
                                placeholder={showingTranslateValue(
                                    storeCustomizationSetting?.dashboard?.user_phone
                                )}
                            />
                            <Error errorName={errors.guestPhone} />
                        </div>

                        {/* אימייל */}
                        <div>
                            <InputArea
                                register={register}
                                label={showingTranslateValue(
                                    storeCustomizationSetting?.dashboard?.user_email
                                )}
                                name="guestEmail"
                                type="email"
                                placeholder={showingTranslateValue(
                                    storeCustomizationSetting?.dashboard?.user_email
                                )}
                            />
                            <Error errorName={errors.guestEmail} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default GuestAddressForm;