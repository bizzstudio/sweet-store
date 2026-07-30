// BeforeStartPopup.jsx
import React, { useEffect, useState } from "react";
import Cookies from "js-cookie";
import City from "@component/select/City";
import DeliveryServices from "@services/DeliveryServices";

function readBrowserCustomerHints() {
    const hints = { customerName: "", customerPhone: "" };
    if (typeof window === "undefined") return hints;

    try {
        const rawUser = Cookies.get("userInfo");
        if (rawUser) {
            const u = JSON.parse(rawUser);
            const name = [u?.name, u?.lastName].filter(Boolean).join(" ").trim();
            if (name) hints.customerName = name;
            if (u?.phone) hints.customerPhone = String(u.phone).trim();
        }
    } catch (_) {}

    try {
        if (!hints.customerName || !hints.customerPhone) {
            const rawGuest = localStorage.getItem("checkoutGuestData");
            if (rawGuest) {
                const g = JSON.parse(rawGuest);
                if (!hints.customerName) {
                    const gn = [g?.guestName, g?.guestLastName].filter(Boolean).join(" ").trim();
                    if (gn) hints.customerName = gn;
                }
                if (!hints.customerPhone && g?.guestPhone) {
                    hints.customerPhone = String(g.guestPhone).trim();
                }
            }
        }
    } catch (_) {}

    return hints;
}
// import { getNextDeliveryMessage } from "@utils/getNextDeliveryMessage";
import { checkDeliveryAvailability } from "@utils/checkDeliveryAvailability";
import MinimalTitle from "@component/common/MinimalTitle";
import MainBT from "@component/button/MainBT";
import useTranslation from "next-translate/useTranslation";
import useGetSetting from "@hooks/useGetSetting";
import useUtilsFunction from "@hooks/useUtilsFunction";

const BeforeStartPopup = ({ onClose }) => {
    const { t } = useTranslation();
    const { storeCustomizationSetting } = useGetSetting();
    const { showingTranslateValue } = useUtilsFunction();

    // state עבור בחירת עיר
    const [chosenCity, setChosenCity] = useState(null);
    // state עבור הודעת המשלוח
    const [deliveryMessage, setDeliveryMessage] = useState(null);
    // מינימום הזמנה ליישוב הנבחר
    const [cityMinimumOrder, setCityMinimumOrder] = useState(null);
    // האם המשלוח ליישוב הנבחר מגיע פעם בשבועיים
    const [cityBiweekly, setCityBiweekly] = useState(false);
    // מצב שמראה אם אנחנו טוענים את נתוני המשלוח (ימים וכו')
    const [loadingDelivery, setLoadingDelivery] = useState(false);

    // הטקסט של הכפתור בתחתית
    const [buttonText, setButtonText] = useState("אני מזמין/ה באיסוף עצמי");

    // בכל פעם שמשתמש בוחר עיר, נביא משרת ה־delivery את הנתונים ונחשב את ההודעה
    useEffect(() => {
        if (!chosenCity) {
            setDeliveryMessage(null);
            setCityMinimumOrder(null);
            setCityBiweekly(false);
            setButtonText("אני מזמין/ה באיסוף עצמי");
            return;
        }

        // אם נבחרה עיר, נביא את הימים והמחיר
        const fetchDelivery = async () => {
            try {
                setLoadingDelivery(true);
                const res = await DeliveryServices.getByCityName(
                    chosenCity.city_name_he,
                    readBrowserCustomerHints()
                );
                // console.log("res", res);
                const days = res?.days?.map((day) => day?.value) || [];
                setCityMinimumOrder(typeof res?.minimumOrder === 'number' ? res.minimumOrder : null);
                setCityBiweekly(!!res?.biweekly);
                const supportCard = storeCustomizationSetting?.footer?.support_card;
                const phoneNumber = typeof supportCard === 'object' && supportCard?.he
                    ? supportCard.he
                    : (typeof supportCard === 'string' ? supportCard : null);
                // const msg = getNextDeliveryMessage(chosenCity.city_name_he, days);
                const msg = checkDeliveryAvailability(chosenCity.city_name_he, days, phoneNumber);
                setDeliveryMessage(msg);
                setButtonText("אישור");
            } catch (err) {
                console.error("Error fetching delivery data:", err);
                setCityMinimumOrder(null);
                setCityBiweekly(false);
                const supportCard = storeCustomizationSetting?.footer?.support_card;
                const phoneNumber = typeof supportCard === 'object' && supportCard?.he
                    ? supportCard.he
                    : (typeof supportCard === 'string' ? supportCard : null);
                const errorMessage = phoneNumber
                    ? `מצטערים, אין עדיין משלוחים ל${chosenCity.city_name_he?.trim()}. בבקשה תפנו אלינו בווטסאפ ${phoneNumber} ונחזור אליך טלפונית למציאת פתרון.`
                    : `מצטערים, אין עדיין משלוחים ל${chosenCity.city_name_he?.trim()}. בבקשה תפנו אלינו בווטסאפ ונחזור אליך טלפונית למציאת פתרון.`;
                setDeliveryMessage({
                    message: errorMessage,
                    phoneNumber: phoneNumber
                });
            } finally {
                setLoadingDelivery(false);
            }
        };

        fetchDelivery();
    }, [chosenCity]);

    // כשיש משלוח לעיר – סגירת הפופאפ אוטומטית אחרי ~3.5 שניות (זמן לקרוא את ההודעה)
    const AUTO_CLOSE_DELAY_MS = 3500;
    useEffect(() => {
        if (!deliveryMessage?.message || loadingDelivery) return;
        if (!deliveryMessage.message.includes("יש משלוחים זמינים")) return;

        const timer = setTimeout(() => {
            onClose();
        }, AUTO_CLOSE_DELAY_MS);
        return () => clearTimeout(timer);
    }, [deliveryMessage?.message, loadingDelivery, onClose]);

    // בלחיצה על הכפתור התחתון: נסגור את הפופאפ בכל מקרה
    const handleButtonClick = () => {
        onClose();
    };

    return (
        <div className="px-3 sm:px-11 py-8 max-w-md">
            {/* כותרת */}
            <div className="flex justify-between items-center mt-5 mb-4 bg-mainColor-superLight rounded-lg p-3">
                <MinimalTitle title={t("common:beforeStartTitle")} />
            </div>

            {/* טקסט הסבר */}
            <p className="text-center text-lg font-semibold mb-6">
                כדי שנוכל להגיד לך האם יש משלוח לביתך,<br />
                איפה את/ה גר/ה?
            </p>

            {/* קומפוננטת העיר */}
            <div className="">
                <City setValue={setChosenCity} placeholder={null} />
            </div>

            {/* הצגת הודעת המשלוח (או מצב טוען) */}
            {loadingDelivery ? (
                <p className="text-center text-sm text-gray-500 mt-3">
                    טוען פרטי משלוח...
                </p>
            ) : (
                deliveryMessage && (
                    <div className="mt-3">
                        <p className="text-center text-lg font-medium">
                            {deliveryMessage.phoneNumber && typeof deliveryMessage.phoneNumber === 'string' ? (
                                <>
                                    {deliveryMessage.message.split(deliveryMessage.phoneNumber)[0]}
                                    <a
                                        href={`https://wa.me/972${deliveryMessage.phoneNumber.replace(/-/g, "").replace(/^0/, "")}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-mainColor-dark hover:text-mainColor underline font-semibold"
                                    >
                                        {deliveryMessage.phoneNumber}
                                    </a>
                                    {deliveryMessage.message.split(deliveryMessage.phoneNumber)[1]}
                                </>
                            ) : (
                                deliveryMessage.message
                            )}
                        </p>
                        {/* מינימום קנייה – רק כשיש משלוחים זמינים */}
                        {deliveryMessage.message?.includes("יש משלוחים זמינים") && cityMinimumOrder !== null && (
                            <p className="text-center text-base font-semibold mt-2 text-mainColor-dark">
                                מינימום קנייה: {cityMinimumOrder}₪
                            </p>
                        )}
                        {/* יעד שמגיע פעם בשבועיים – רק כשיש משלוחים זמינים */}
                        {deliveryMessage.message?.includes("יש משלוחים זמינים") && cityBiweekly && (
                            <p className="text-center text-base font-semibold mt-2 text-mainColor-dark">
                                מגיע פעם בשבועיים
                            </p>
                        )}
                        {/* כפתור פנייה לווטסאפ לבירור משלוח – רק כשאין משלוחים לעיר */}
                        {(deliveryMessage.message?.includes("אין עדיין משלוחים") || deliveryMessage.message?.includes("לא זמינים פרטי משלוח")) && chosenCity?.city_name_he && (
                            <div className="flex justify-center mt-3">
                                <a
                                    href={`https://wa.me/972${(deliveryMessage.phoneNumber || "0522071809").replace(/-/g, "").replace(/^0/, "")}?text=${encodeURIComponent(`שלום, אבקש לברר אפשרות משלוח לעיר ${chosenCity.city_name_he.trim()}.`)}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center justify-center px-4 py-2 rounded-md bg-[#25D366] hover:bg-[#20bd5a] text-white font-medium text-sm transition-colors"
                                >
                                    פנייה לווטסאפ לבירור משלוח
                                </a>
                            </div>
                        )}
                    </div>
                )
            )}

            {/* הכפתור התחתון – סוגר את הפופאפ תמיד */}
            {/* <MainBT onClick={handleButtonClick}>
                {buttonText}
            </MainBT> */}
        </div>
    );
};

export default BeforeStartPopup;