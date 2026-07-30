// src/component/reward-offers/RewardProductModal.jsx
import React from "react";
import { FiGift, FiChevronRight, FiChevronLeft } from "react-icons/fi";
import { useRouter } from "next/router";
import useTranslation from "next-translate/useTranslation";
import useUtilsFunction from "@hooks/useUtilsFunction";
import useCart from "@hooks/useCart";
import { notifySuccess } from "@utils/toast";

import MainBT from "@component/button/MainBT";
import MainModal from "@component/modal/MainModal";

const RewardProductModal = ({
    isOpen,
    onClose,
    rewardData,
    currentIndex = 0,
    onNext,
    onPrevious,
    totalRewards = 1,
    isAutoPopup = false,
}) => {
    const { t } = useTranslation();
    const router = useRouter();
    const { showingTranslateValue } = useUtilsFunction();
    const { addItem } = useCart();

    if (!isOpen || !rewardData) return null;

    const {
        offer,
        rewardProduct,
        rewardProducts = [],
        requiresChoice,
        triggerProduct,
        offerName,
        offerType,
        rewardPrice = 0,
        offerId,
    } = rewardData;

    const choiceProducts = requiresChoice ? rewardProducts : [];
    const activeProduct = rewardProduct;
    const displayImage = offer?.image || activeProduct?.image?.[0] || "/gift_silan.png";
    const offerTitle = showingTranslateValue(offerName) || showingTranslateValue(offer?.name) || '';
    const productTitle = showingTranslateValue(activeProduct?.title) || '';

    const handleViewProduct = (product) => {
        const target = product || activeProduct;
        if (target?.slug) {
            router.push(`/product/${target.slug}`);
            onClose();
        }
    };

    // לחיצה על מוצר מתנה ברשת הבחירה מוסיפה אותו ישירות לעגלה — בלי מסך ביניים ובלי לחיצה נוספת
    const handleAddGiftToCart = (product) => {
        if (!product || !offerId) return;

        const productIdStr = product._id?.toString?.() ?? String(product._id);
        const offerIdStr = offerId?.toString?.() ?? String(offerId);
        const rewardItemId = `reward_${productIdStr}_${offerIdStr}`;

        const { slug, variants, categories, description, ...plainProduct } = product;

        addItem({
            ...plainProduct,
            id: rewardItemId,
            quantity: offer?.rewardQuantity || 1,
            price: rewardPrice ?? 0,
            isRewardProduct: true,
            rewardPrice: rewardPrice ?? 0,
            rewardOfferId: offerId,
            rewardOfferName: offer?.name || offerName || {},
            rewardOfferType: offerType,
        }, offer?.rewardQuantity || 1);

        notifySuccess(t("common:giftAddedToCart"));
        onClose();
    };

    const getOfferDescription = () => {
        if (requiresChoice) {
            return t("common:chooseGiftDescription");
        }
        if (offerType === 'BUY_X_GET_Y' && triggerProduct) {
            const triggerName = showingTranslateValue(triggerProduct?.title) || '';
            return t("common:buyXGetYDescription", { triggerName, rewardName: productTitle });
        }
        if (offerType === 'THRESHOLD_GET_ITEM' && offer?.thresholdAmount) {
            return t("common:thresholdGetItemDescription", { threshold: offer.thresholdAmount, rewardName: productTitle });
        }
        return showingTranslateValue(offer?.description) || '';
    };

    return (
        <MainModal
            modalOpen={isOpen}
            setModalOpen={(open) => { if (!open) onClose(); }}
            onClose={onClose}
            z={50}
        >
            <div className="w-full max-w-lg mx-auto">
                <div className="bg-white border-4 border-white rounded-t-2xl lg:rounded-2xl shadow-2xl max-h-[92vh] overflow-y-auto sm:max-h-screen sm:flex sm:flex-col pb-[env(safe-area-inset-bottom)] relative animate-[fadeIn_.50s_ease-out]">
                    {totalRewards > 1 && (
                        <div className="absolute top-2 right-2 z-10 bg-mainColor text-white px-3 py-1 rounded-full text-xs font-semibold">
                            {currentIndex + 1} / {totalRewards}
                        </div>
                    )}

                    {!requiresChoice && (
                        <div className="relative w-full sm:flex-shrink-0 sm:min-h-0">
                            <img
                                src={displayImage}
                                alt={productTitle}
                                className="w-full h-auto sm:max-h-[50vh] sm:h-auto object-contain block"
                            />
                            <div className="absolute top-2 left-2 sm:top-3 sm:left-3 lg:top-6 lg:left-6 bg-mainColor text-white px-2.5 py-1 sm:px-3 sm:py-1.5 lg:px-4 lg:py-2 rounded-full shadow-lg flex items-center gap-1.5 sm:gap-2 animate-bounce">
                                <FiGift size={14} className="sm:!w-4 sm:!h-4 lg:!w-5 lg:!h-5" />
                                <span className="font-bold text-[10px] sm:text-xs lg:text-sm">{t("common:free")}!</span>
                            </div>

                            {totalRewards > 1 && (
                                <>
                                    {currentIndex > 0 && (
                                        <button
                                            onClick={onPrevious}
                                            className="absolute top-1/2 left-2 sm:left-3 bg-white/80 hover:bg-white rounded-full p-2 shadow-lg transition-all"
                                        >
                                            <FiChevronLeft size={20} className="text-gray-700" />
                                        </button>
                                    )}
                                    {currentIndex < totalRewards - 1 && (
                                        <button
                                            onClick={onNext}
                                            className="absolute top-1/2 right-2 sm:right-3 bg-white/80 hover:bg-white rounded-full p-2 shadow-lg transition-all"
                                        >
                                            <FiChevronRight size={20} className="text-gray-700" />
                                        </button>
                                    )}
                                </>
                            )}
                        </div>
                    )}

                    <div className="p-3 sm:p-5 lg:p-8 w-full sm:flex-shrink-0">
                        <div className="text-center mb-4 sm:mb-5 lg:mb-6">
                            {isAutoPopup && (
                                <h2 className="text-base sm:text-xl lg:text-2xl font-bold text-gray-800 mb-1.5 sm:mb-2">
                                    {requiresChoice ? t("common:chooseYourGift") : t("common:rewardReceivedTitle")}
                                </h2>
                            )}
                            <h3 className={`text-sm sm:text-lg lg:text-xl font-semibold text-gray-700 ${isAutoPopup ? 'mb-1' : 'mb-1.5 sm:mb-2'}`}>
                                {offerTitle}
                            </h3>
                            <p className="text-[11px] sm:text-sm text-gray-500">
                                {getOfferDescription()}
                            </p>
                        </div>

                        {requiresChoice ? (
                            <div className="grid grid-cols-2 gap-3">
                                {choiceProducts.map((product) => {
                                    const title = showingTranslateValue(product?.title) || '';
                                    return (
                                        <button
                                            key={product._id}
                                            type="button"
                                            onClick={() => handleAddGiftToCart(product)}
                                            className="relative rounded-xl border-2 border-gray-200 p-2 text-right transition-all hover:border-mainColor hover:bg-mainColor/5 hover:shadow-md focus:border-mainColor"
                                        >
                                            <img
                                                src={product?.image?.[0] || "/gift_silan.png"}
                                                alt={title}
                                                className="w-full h-24 object-contain mb-2"
                                            />
                                            <p className="text-xs font-semibold text-gray-800 line-clamp-2">{title}</p>
                                        </button>
                                    );
                                })}
                            </div>
                        ) : (
                            <>
                                <div className="bg-gray-50 rounded-xl sm:rounded-2xl p-2.5 sm:p-4 mb-4 sm:mb-6">
                                    <h3 className="text-xs sm:text-base font-semibold text-gray-800 text-center">
                                        {productTitle}
                                    </h3>
                                </div>

                                {/* מציגים "צפייה במוצר" רק במבצע "קנה X קבל Y", שבו הכפתור מוביל למוצר הטריגר הנמכר.
                                    במתנת-סף/מתנה ישירה אין כפתור — מוצר המתנה מוסתר מהלקוח. */}
                                {triggerProduct && (
                                    <div className="flex flex-col gap-2 sm:gap-3">
                                        <MainBT
                                            onClick={() => handleViewProduct(triggerProduct)}
                                            className="w-full"
                                        >
                                            <div className="flex items-center justify-center gap-1.5 sm:gap-2 !py-2 sm:!py-3 lg:!py-4 text-xs sm:text-base">
                                                <FiGift size={14} className="sm:!w-5 sm:!h-5" />
                                                <span className="font-semibold">{t("common:viewProduct")}</span>
                                            </div>
                                        </MainBT>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </div>
        </MainModal>
    );
};

export default RewardProductModal;
