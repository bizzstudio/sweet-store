// src/utils/checkDeliveryAvailability.js
// פונקציה שבודקת אם יש משלוחים למקום מסוים ומחזירה הודעה מתאימה

export function checkDeliveryAvailability(cityNameHe, shippingDays, phoneNumber = null) {
    // אם אין עיר או אין ימי משלוח - אין משלוחים
    if (!cityNameHe || !shippingDays?.length) {
        const message = phoneNumber
            ? `לא זמינים פרטי משלוח לעיר זו. בבקשה תפנו אלינו בווטסאפ ${phoneNumber} וננסה לעזור.`
            : "לא זמינים פרטי משלוח לעיר זו. בבקשה תפנו אלינו בווטסאפ וננסה לעזור.";
        return {
            message: message,
            phoneNumber: phoneNumber
        };
    }

    // אם יש ימי משלוח - יש משלוחים
    return {
        message: `מעולה! יש משלוחים זמינים ל${cityNameHe?.trim()}.`,
        phoneNumber: null
    };
};