// src/component/checkout/PersonalDetails.jsx
import React from "react";
import { CiUser } from "react-icons/ci";
import useTranslation from "next-translate/useTranslation";
import GuestAddressForm from "@component/guestAddress/GuestAddressForm";
import { HIDE_PRICES } from "@utils/priceVisibility";

const PersonalDetails = ({
    userInfo,
    city,
    setModalOpen,
    isDeliverable,
    guestAddressFormRef,
    register,
    setValue,
    errors,
    setFormError,
    clearErrors,
    watch,
    guestChosenCity,
    setGuestChosenCity,
    minimumOrderAmount,
}) => {
    const { t } = useTranslation();

    return (
        <div className="w-full">
            {userInfo ? (
                // משתמש מחובר
                <div className="bg-white border border-gray-200 rounded-lg">
                    <div className="p-4 sm:p-6">
                        <div className="flex items-start gap-4">
                            <div className="flex-shrink-0">
                                <div className="w-12 h-12 bg-mainColor-light rounded-full flex items-center justify-center">
                                    <CiUser className="text-2xl text-mainColor-dark" />
                                </div>
                            </div>
                            <div className="flex-grow min-w-0">
                                <div className="flex flex-col xs:flex-row items-start xs:items-center justify-between gap-2">
                                    <h2 className="text-lg font-semibold text-gray-900 truncate">
                                        {userInfo?.name}

                                        {city && (
                                            <p className="text-sm text-gray-600 leading-relaxed">
                                                <span className="font-medium">{city}</span>
                                                {!HIDE_PRICES && minimumOrderAmount != null && isDeliverable === true && (
                                                    <span className="mr-1 text-xs text-mainColor-dark font-semibold">
                                                        {" "}(מינימום קנייה: {minimumOrderAmount}₪)
                                                    </span>
                                                )}
                                                {userInfo?.address?.street && (
                                                    <span>, {userInfo?.address?.street}</span>
                                                )}
                                                {userInfo?.address?.houseNumber && (
                                                    <span> {userInfo?.address?.houseNumber}</span>
                                                )}
                                                {userInfo?.address?.apartmentNumber && (
                                                    <span>/{userInfo?.address?.apartmentNumber}</span>
                                                )}
                                            </p>
                                        )}
                                    </h2>
                                    <button
                                        type="button"
                                        className="text-sm text-stone-700 hover:text-mainColor-dark font-medium underline flex-shrink-0 transition-colors"
                                        onClick={() => setModalOpen(true)}
                                    >
                                        {t("common:changeAddress")}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                // טופס אורח
                <div ref={guestAddressFormRef}>
                    <GuestAddressForm
                        register={register}
                        setValue={setValue}
                        errors={errors}
                        setError={setFormError}
                        clearErrors={clearErrors}
                        watch={watch}
                    />
                </div>
            )}
        </div>
    );
};

export default PersonalDetails;