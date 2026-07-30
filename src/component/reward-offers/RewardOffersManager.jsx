// src/component/reward-offers/RewardOffersManager.jsx
import { useState, useEffect, useContext, useRef } from "react";
import { useRouter } from "next/router";
import { SidebarContext } from "@context/SidebarContext";
import useCart from "@hooks/useCart";
import RewardProductModal from "@component/reward-offers/RewardProductModal";
import RewardOffersBadge from "@component/reward-offers/RewardOffersBadge";
import { findAvailableRewardProducts, filterRewardsNotInCart } from "@component/reward-offers/rewardOffersUtils";

const RewardOffersManager = ({
    addressPopup,
    showRegisterSuccess,
    currentPopup,
}) => {
    const router = useRouter();
    const { pathname } = router;
    const { items } = useCart();
    const { offers } = useContext(SidebarContext);

    // State לניהול פופאפ מוצרי מתנה
    const [showRewardModal, setShowRewardModal] = useState(false);
    const [currentRewardIndex, setCurrentRewardIndex] = useState(0);
    const [availableRewards, setAvailableRewards] = useState([]);
    const [rewardsToShow, setRewardsToShow] = useState([]); // רשימת מוצרי מתנה להצגה בפופאפ
    const [isAutoPopup, setIsAutoPopup] = useState(false); // האם זה פופאפ אוטומטי כשמוצר נכנס לעגלה

    // מפתח sessionStorage עקבי לזיהוי האם כבר הוצג פופאפ עבור מתנה מסוימת
    const getRewardStorageKey = (reward) => {
        if (!reward) return null;
        if (reward.requiresChoice) {
            return `rewardModalShown_${reward.offerId}_choice`;
        }
        const productId = reward.rewardProduct?._id;
        if (!productId) return null;
        return `rewardModalShown_${reward.offerId}_${productId}`;
    };

    // איפוס כל דגלי ה"הוצג" של מבצע מסוים — נקרא כשהלקוח מאבד זכאות, כדי שיקפוץ שוב כשיחזור
    const clearRewardFlagsForOffer = (offerId) => {
        const prefix = `rewardModalShown_${offerId}_`;
        const keysToRemove = [];
        for (let i = 0; i < sessionStorage.length; i++) {
            const key = sessionStorage.key(i);
            if (key && key.startsWith(prefix)) keysToRemove.push(key);
        }
        keysToRemove.forEach((k) => sessionStorage.removeItem(k));
    };

    // מעקב אחרי המבצעים שהלקוח היה זכאי להם בבדיקה הקודמת
    const eligibleOffersRef = useRef(new Set());

    // חישוב מוצרי מתנה זמינים שלא בעגלה + זיהוי כניסה/יציאה מזכאות
    useEffect(() => {
        if (!Array.isArray(items) || !Array.isArray(offers)) return;

        const available = findAvailableRewardProducts(items, offers);
        const notInCart = filterRewardsNotInCart(available, items);
        setAvailableRewards(notInCart);

        // זכאות נמדדת לפי המבצעים המופעלים (לפני סינון מתנות שכבר בעגלה).
        // מבצע שהיה זכאי וכבר לא — מאפסים את דגל ה"הוצג" שלו כדי שהפופאפ יקפוץ שוב כשהלקוח יחזור להיות זכאי.
        const currentEligible = new Set(available.map((r) => String(r.offerId)));
        eligibleOffersRef.current.forEach((prevOfferId) => {
            if (!currentEligible.has(prevOfferId)) {
                clearRewardFlagsForOffer(prevOfferId);
            }
        });
        eligibleOffersRef.current = currentEligible;
    }, [items, offers]);

    // 1. פופאפ אוטומטי - כשמוצר מתנה נוסף לעגלה או כשזכאים לבחירת מתנה
    useEffect(() => {
        if (!Array.isArray(items) || !Array.isArray(offers)) return;
        if (addressPopup || showRegisterSuccess || currentPopup || showRewardModal) return;

        // בחירת מתנה — מבצע עם כמה מוצרים לבחירה
        const choiceRewards = availableRewards.filter(r => r.requiresChoice);
        for (const reward of choiceRewards) {
            const storageKey = getRewardStorageKey(reward);
            if (storageKey && !sessionStorage.getItem(storageKey)) {
                setRewardsToShow([reward]);
                setCurrentRewardIndex(0);
                setIsAutoPopup(true);
                setShowRewardModal(true);
                // הדגל יסומן רק כשהפופאפ באמת יוצג (ראה useEffect של סימון הצגה)
                return;
            }
        }

        // מוצר מתנה יחיד שנוסף אוטומטית לעגלה
        const rewardItemsInCart = items.filter(item =>
            item.isRewardProduct && item.rewardPrice === 0 && item.rewardOfferId
        );

        if (rewardItemsInCart.length === 0) return;

        // מציאת מוצר מתנה הראשון שלא הוצג עליו פופאפ
        for (const rewardItem of rewardItemsInCart) {
            const storageKey = `rewardModalShown_${rewardItem.rewardOfferId}_${rewardItem._id}`;
            const hasShown = sessionStorage.getItem(storageKey);

            if (!hasShown) {
                // מציאת המבצע המתאים
                const matchingOffer = offers.find(o => o._id === rewardItem.rewardOfferId);
                if (matchingOffer) {
                    const rewardData = {
                        offer: matchingOffer,
                        rewardProduct: rewardItem,
                        rewardPrice: rewardItem.rewardPrice,
                        offerType: rewardItem.rewardOfferType,
                        triggerProduct: matchingOffer.triggerProduct || null,
                        offerName: rewardItem.rewardOfferName || matchingOffer.name || {},
                        offerId: matchingOffer._id
                    };

                    setRewardsToShow([rewardData]);
                    setCurrentRewardIndex(0);
                    setIsAutoPopup(true); // זה פופאפ אוטומטי
                    setShowRewardModal(true);
                    // הדגל יסומן רק כשהפופאפ באמת יוצג (ראה useEffect של סימון הצגה)
                    return;
                }
            }
        }
    }, [items, offers, availableRewards, addressPopup, showRegisterSuccess, currentPopup, showRewardModal, pathname]);

    // 2. פופאפ תקופתי - כל 10 דקות
    useEffect(() => {
        if (!Array.isArray(availableRewards) || availableRewards.length === 0) return;
        if (addressPopup || showRegisterSuccess || currentPopup || showRewardModal) return;
        if (pathname === '/checkout') return; // לא בעמוד תשלום

        const checkPeriodicRewards = () => {
            // מציאת מוצרי מתנה שלא הוצג עליהם פופאפ
            const unrevealedRewards = availableRewards.filter(reward => {
                const storageKey = reward.requiresChoice
                    ? `rewardModalShown_${reward.offerId}_choice`
                    : `rewardModalShown_${reward.offerId}_${reward.rewardProduct._id}`;
                return !sessionStorage.getItem(storageKey);
            });

            if (unrevealedRewards.length > 0) {
                setRewardsToShow([unrevealedRewards[0]]);
                setCurrentRewardIndex(0);
                setIsAutoPopup(false);
                setShowRewardModal(true);
                // הדגל יסומן רק כשהפופאפ באמת יוצג (ראה useEffect של סימון הצגה)
            }
        };

        // בדיקה ראשונית אחרי 10 דקות
        const initialTimer = setTimeout(checkPeriodicRewards, 10 * 60 * 1000);

        // בדיקה תקופתית כל 10 דקות
        const interval = setInterval(checkPeriodicRewards, 10 * 60 * 1000);

        return () => {
            clearTimeout(initialTimer);
            clearInterval(interval);
        };
    }, [availableRewards, addressPopup, showRegisterSuccess, currentPopup, showRewardModal, pathname]);

    // 3. סימון מתנה כ"הוצגה" — רק כשהפופאפ באמת נראה למשתמש ולא נחסם ע"י פופאפ אחר.
    // התנאי כאן זהה לתנאי הרינדור של הפופאפ למטה, כך שלא נסמן "הוצג" בלי שהמשתמש ראה.
    useEffect(() => {
        if (!showRewardModal || rewardsToShow.length === 0 || currentPopup) return;
        const reward = rewardsToShow[currentRewardIndex];
        const storageKey = getRewardStorageKey(reward);
        if (storageKey) {
            sessionStorage.setItem(storageKey, 'true');
        }
    }, [showRewardModal, rewardsToShow, currentRewardIndex, currentPopup]);

    // פונקציות לניווט בין מוצרי מתנה בפופאפ
    const handleNextReward = () => {
        if (currentRewardIndex < rewardsToShow.length - 1) {
            setCurrentRewardIndex(currentRewardIndex + 1);
        }
    };

    const handlePreviousReward = () => {
        if (currentRewardIndex > 0) {
            setCurrentRewardIndex(currentRewardIndex - 1);
        }
    };

    // סגירת פופאפ מוצרי מתנה
    const handleCloseRewardModal = () => {
        setShowRewardModal(false);
        setRewardsToShow([]);
        setCurrentRewardIndex(0);
        setIsAutoPopup(false);
    };

    // פתיחת פופאפ מוצרי מתנה מהבאדג'
    const handleOpenRewardModalFromBadge = () => {
        if (availableRewards.length > 0) {
            setRewardsToShow(availableRewards);
            setCurrentRewardIndex(0);
            setIsAutoPopup(false); // זה לא פופאפ אוטומטי
            setShowRewardModal(true);
        }
    };

    return (
        <>
            {/* Reward Product Modal - לא מוצג אם יש פופאפ דינאמי */}
            {showRewardModal && rewardsToShow.length > 0 && !currentPopup && (
                <RewardProductModal
                    isOpen={showRewardModal}
                    onClose={handleCloseRewardModal}
                    rewardData={rewardsToShow[currentRewardIndex]}
                    currentIndex={currentRewardIndex}
                    onNext={handleNextReward}
                    onPrevious={handlePreviousReward}
                    totalRewards={rewardsToShow.length}
                    isAutoPopup={isAutoPopup}
                />
            )}

            {/* Reward Offers Badge - מוצג בפינת המסך, לא מוצג אם יש פופאפ דינאמי */}
            {availableRewards.length > 0 && !showRewardModal && !currentPopup && (
                <div className="fixed bottom-24 left-3 z-40">
                    <RewardOffersBadge
                        onClick={handleOpenRewardModalFromBadge}
                        count={availableRewards.length}
                    />
                </div>
            )}
        </>
    );
};

export default RewardOffersManager;