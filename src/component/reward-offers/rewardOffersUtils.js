// src/component/reward-offers/rewardOffersUtils.js
// פונקציות עזר לזיהוי מוצרי מתנה זמינים מהמבצעים

import { findOptimalOfferCombination, getOfferRewardProducts } from '../../utils/offerCalculations';

/**
 * מציאת מוצרי מתנה זמינים מהמבצעים (BUY_X_GET_Y ו-THRESHOLD_GET_ITEM)
 * @param {Array} cartItems - פריטי העגלה
 * @param {Array} offers - כל המבצעים הזמינים
 * @returns {Array} - רשימת מוצרי מתנה זמינים עם פרטי המבצע
 */
export const findAvailableRewardProducts = (cartItems, offers = []) => {
    if (!Array.isArray(offers) || offers.length === 0 || !Array.isArray(cartItems) || cartItems.length === 0) {
        return [];
    }

    const { appliedOffers } = findOptimalOfferCombination(cartItems, offers);

    const availableRewards = [];

    const appliedRewardOffers = appliedOffers.filter(appliedOffer =>
        (appliedOffer.type === 'BUY_X_GET_Y' || appliedOffer.type === 'THRESHOLD_GET_ITEM') &&
        appliedOffer.timesApplied > 0
    );

    appliedRewardOffers.forEach(appliedOffer => {
        const offer = offers.find(o =>
            (o._id?.toString?.() ?? String(o._id)) ===
            (appliedOffer.offerId?.toString?.() ?? String(appliedOffer.offerId))
        );

        if (!offer) return;

        const rewardProducts = getOfferRewardProducts(offer);
        if (rewardProducts.length === 0) return;

        const requiresChoice = rewardProducts.length > 1;

        if (offer.type === 'BUY_X_GET_Y' && offer.triggerProduct) {
            availableRewards.push({
                offer,
                rewardProduct: requiresChoice ? null : rewardProducts[0],
                rewardProducts: requiresChoice ? rewardProducts : [],
                requiresChoice,
                rewardPrice: offer.rewardPrice,
                offerType: 'BUY_X_GET_Y',
                triggerProduct: offer.triggerProduct,
                offerName: offer.name || {},
                offerId: offer._id,
            });
        } else if (offer.type === 'THRESHOLD_GET_ITEM') {
            availableRewards.push({
                offer,
                rewardProduct: requiresChoice ? null : rewardProducts[0],
                rewardProducts: requiresChoice ? rewardProducts : [],
                requiresChoice,
                rewardPrice: offer.rewardPrice,
                offerType: 'THRESHOLD_GET_ITEM',
                triggerProduct: null,
                offerName: offer.name || {},
                offerId: offer._id,
            });
        }
    });

    return availableRewards;
};

/**
 * בדיקה אם מתנה מהמבצע כבר קיימת בעגלה
 */
export const isOfferRewardInCart = (cartItems, offerId) => {
    if (!Array.isArray(cartItems)) return false;

    const offerIdStr = offerId?.toString?.() ?? String(offerId);
    return cartItems.some(item =>
        item.isRewardProduct &&
        (item.rewardOfferId?.toString?.() ?? String(item.rewardOfferId)) === offerIdStr
    );
};

/**
 * @deprecated השתמש ב-isOfferRewardInCart
 */
export const isRewardProductInCart = (cartItems, rewardProductId, offerId) => {
    return isOfferRewardInCart(cartItems, offerId);
};

/**
 * סינון מוצרי מתנה זמינים שלא בעגלה
 */
export const filterRewardsNotInCart = (availableRewards, cartItems) => {
    return availableRewards.filter(reward =>
        !isOfferRewardInCart(cartItems, reward.offerId)
    );
};
