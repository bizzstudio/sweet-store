// src/hooks/useCheckoutSubmit.js
import Cookies from "js-cookie";
import dayjs from "dayjs";
import { useRouter } from "next/router";
import { useContext, useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { CardElement, useElements } from "@stripe/react-stripe-js";

// Internal import
import useAsync from "@hooks/useAsync";
import { UserContext } from "@context/UserContext";
import OrderServices from "@services/OrderServices";
import CouponServices from "@services/CouponServices";
import { notifyError, notifySuccess } from "@utils/toast";
import SettingServices from "@services/SettingServices";
import NotificationServices from "@services/NotificaitonServices";
import useTranslation from "next-translate/useTranslation";
import useCart from "./useCart";
import useAddToCart from "./useAddToCart";
import { SidebarContext } from "@context/SidebarContext";
import notifyApiResponse from "@utils/notifyApiResponse";
import { identifyUser, trackNewsletterSignup } from "@services/flashy";
import { HIDE_PRICES } from "@utils/priceVisibility";

const useCheckoutSubmit = (isCashierMode = false, newsletterOptIn = false) => {
  const {
    state: { userInfo, shippingAddress },
    dispatch,
  } = useContext(UserContext);
  const { refreshOffers } = useContext(SidebarContext);
  const { t } = useTranslation("common");

  const [error, setError] = useState("");
  const [total, setTotal] = useState("");
  const [couponInfo, setCouponInfo] = useState({});
  const [minimumAmount, setMinimumAmount] = useState(0);
  const [showCard, setShowCard] = useState(false);
  const [shippingCost, setShippingCost] = useState(0);
  const [isDeliveryMetod, setIsDeliveryMetod] = useState(false);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [discountPercentage, setDiscountPercentage] = useState({});
  const [isCheckoutSubmit, setIsCheckoutSubmit] = useState(false);
  const [isCouponApplied, setIsCouponApplied] = useState(false);
  const [paymentSrc, setPaymentSrc] = useState(null);
  const [shippingPercentageIncrease, setShippingPercentageIncrease] = useState(0);
  const [readyToSubmit, setReadyToSubmit] = useState(null);

  // סטייטים לקונפליקטים
  const [missingProductsModal, setMissingProductsModal] = useState(false);
  const [missingProducts, setMissingProducts] = useState([]);
  const [priceConflictsModal, setPriceConflictsModal] = useState(false);
  const [priceConflicts, setPriceConflicts] = useState([]);
  const [offerConflictsModal, setOfferConflictsModal] = useState(false);
  const [offerConflicts, setOfferConflicts] = useState([]);
  const [addUpdatedProducts, setAddUpdatedProducts] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);

  // סטייטים לוולידציה - מנוהלים בהוק
  const [guestChosenCity, setGuestChosenCity] = useState(null);
  const [isDeliverable, setIsDeliverable] = useState(null);
  const [minimumOrderAmount, setMinimumOrderAmount] = useState(process.env.NEXT_PUBLIC_ENV === 'dev' ? 1 : 150);
  const guestAddressFormRef = useRef(null);

  /*
   * נעילת שליחה כפולה.
   *
   * הכפתור נחסם דרך isCheckoutSubmit, אבל setState של React אינו מיידי:
   * שתי הקשות מהירות (double-tap במובייל) יכולות שתיהן להיכנס ל-submitHandler
   * לפני שהרינדור המחודש חוסם את הכפתור. במסלול התשלום התוצאה הייתה טיוטה
   * כפולה שהשנייה מוחקת את הראשונה; בחנות ללא תשלום כל שליחה היא **הזמנה
   * אמיתית** שיורדת מהמלאי ומפיקה תעודת משלוח — כלומר כפילות של ממש.
   * ref מתעדכן מיידית ולכן חוסם בפועל.
   */
  const isSubmittingRef = useRef(false);

  const router = useRouter();
  // const stripe = useStripe();
  // const elements = useElements();
  const couponRef = useRef("");
  const {
    isEmpty,
    emptyCart,
    items,
    customCartTotal,
    removeItem,
    addItem,
    inCart,
    thresholdDiscount,
  } = useCart();

  // מודל ההתחברות לא נפתח אוטומטית בכניסה לצ'קאאוט - רק בלחיצה מפורשת של המשתמש
  // על כפתור ההתחברות בטופס.

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
    setError: setFormError,
    clearErrors,
  } = useForm({
    defaultValues: {
      callOnArrival: true, // ברירת מחדל שהשליח ייצור קשר
    },
  });

  const { data: globalSetting } = useAsync(SettingServices.getGlobalSetting);
  const currency = globalSetting?.default_currency || "₪";

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

  // קופון נטען רק בקופה: בעמוד התשלום של החנות אין יותר הזנת קופון, ועוגייה
  // ישנה הייתה מחילה הנחה שהלקוח לא רואה ולא יכול להסיר.
  useEffect(() => {
    if (isCashierMode && Cookies.get("couponInfo")) {
      const coupon = JSON.parse(Cookies.get("couponInfo"));
      // console.log('coupon information',coupon)
      setCouponInfo(coupon);
      setDiscountPercentage(coupon.discountType);
      setMinimumAmount(Number(coupon.minimumAmount) || 0);
    }
  }, [isCouponApplied]);

  // מוצר חינם שנשאר בעגלה מקופון הרשמה ישן: בלי קופון השרת דוחה את ההזמנה
  // ("מוצר חינם נמצא בעגלה ללא קופון הרשמה תקף"), והלקוח נתקע בלי דרך להסיר אותו.
  useEffect(() => {
    if (isCashierMode) return;
    items.forEach((it) => {
      if (it.isCouponFreeProduct) removeItem(it.id);
    });
  }, [isCashierMode, items]);

  // הסרת קופון אם העגלה ריקה או מתחת לסכום מינימום (כמו ב-/coupon/use בשרת)
  useEffect(() => {
    if (isEmpty) {
      setDiscountPercentage(0);
      setDiscountAmount(0);
      setCouponInfo({});
      Cookies.remove("couponInfo");
      return;
    }
    if (minimumAmount > 0 && customCartTotal < minimumAmount) {
      setDiscountPercentage(0);
      setDiscountAmount(0);
      setCouponInfo({});
      Cookies.remove("couponInfo");
    }
  }, [minimumAmount, customCartTotal, isEmpty]);

  // קופון קבוע: בשרת מנוכה רק אם value < סכום אחרי threshold — אחרת אין הנחה; מסירים קופון לא תקף
  useEffect(() => {
    const th = Number(thresholdDiscount) || 0;
    const baseAfterThreshold = Math.max(0, Number(customCartTotal) - th);
    if (
      discountPercentage?.type === "fixed" &&
      baseAfterThreshold > 0 &&
      Number(discountPercentage.value) >= baseAfterThreshold
    ) {
      setDiscountPercentage(0);
      setDiscountAmount(0);
      setCouponInfo({});
      Cookies.remove("couponInfo");
      dispatch({ type: "SAVE_COUPON", payload: {} });

      if (!isCashierMode) {
        notifyError(t("couponRemovedDueToHighDiscount"));
      }
    }
  }, [customCartTotal, thresholdDiscount, discountPercentage, isCashierMode, dispatch, t]);

  /**
   * סדר כמו ב-customerOrderController: סכום פריטים → מינוס THRESHOLD_DISCOUNT → מינוס קופון (אחוז/קבוע על הסכום אחרי סף) → פלוס משלוח.
   */
  useEffect(() => {
    const th = Number(thresholdDiscount) || 0;
    const ct = Number(customCartTotal) || 0;
    const ship = Number(shippingCost) || 0;
    const baseAfterThreshold = Math.max(0, ct - th);

    const dt = discountPercentage;
    const hasValidCoupon =
      dt &&
      typeof dt === "object" &&
      (dt.type === "fixed" || dt.type === "percentage") &&
      typeof dt.value === "number";

    let couponDiscount = 0;
    if (hasValidCoupon) {
      if (dt.type === "fixed") {
        if (dt.value < baseAfterThreshold) {
          couponDiscount = dt.value;
        }
      } else {
        couponDiscount = (dt.value / 100) * baseAfterThreshold;
      }
    }

    couponDiscount = Number(couponDiscount.toFixed(2));
    const totalValue = Number((baseAfterThreshold - couponDiscount + ship).toFixed(2));

    setDiscountAmount(couponDiscount);
    setTotal(totalValue);
  }, [customCartTotal, shippingCost, discountPercentage, thresholdDiscount]);

  // מילוי נתוני משלוח רק אם המשתמש מחובר
  useEffect(() => {
    // רק במצב רגיל (לא קופה) - מילוי נתוני משלוח
    if (!isCashierMode && userInfo) {
      setValue("firstName", shippingAddress.firstName);
      setValue("lastName", shippingAddress.lastName);
      setValue("address", shippingAddress.address);
      setValue("contact", shippingAddress.contact);
      setValue("email", shippingAddress.email);
      setValue("city", shippingAddress.city);
      setValue("country", shippingAddress.country);
      setValue("zipCode", shippingAddress.zipCode);
    }
  }, [isCashierMode, userInfo]);

  // פונקציה חדשה: ריענון מבצעים + שליחה לשרת
  const submitWithRefreshOffers = async (data) => {
    try {
      // 1) רענון המבצעים
      await refreshOffers();
      // עכשיו הסטייט של offers ב-SidebarContext יתעדכן

      // 2) לחכות טיפה שהעגלת useCart תעשה applyOffers (אסינכרוני):
      await new Promise((resolve) => setTimeout(resolve, 300));

      // 3) רק עכשיו שולחים את ההזמנה
      setReadyToSubmit(data)
    } catch (err) {
      console.error("submitWithRefreshOffers error:", err);
    }
  };

  // useEffect(() => {
  //   if (readyToSubmit) {
  //     submitHandler(readyToSubmit)
  //   };
  // }, [readyToSubmit])

  // שליחת ההזמנה לשרת
  const submitHandler = async (data) => {
    // שליחה כבר בדרך — ראה isSubmittingRef
    if (isSubmittingRef.current) return;

    try {
      // console.log('items :>> ', items);

      // אין רכישה כאורח (מ-14/10/2026): בלי חשבון אין שמירה — פותחים התחברות.
      // הכפתור של אורח ממילא אינו שולח את הטופס; זו הגנה גם מ-Enter בשדה.
      // הקופה פועלת בשם לקוחות אחרים ולכן אינה כפופה לכלל.
      if (!userInfo && !isCashierMode) {
        setShowLoginModal(true);
        return;
      }

      // מינימום הזמנה: בחנות ללא מחירים הכלל אינו נאכף כלל. הלקוח לא רואה
      // סכומים, ולכן חסימה על סף שהוא לא יכול למדוד הייתה משאירה אותו תקוע
      // בלי דרך לדעת כמה חסר. השדה עצמו (‎minimumOrderAmount) עדיין נטען
      // מהגדרת המשלוח ליעד ומשמש כשהמחירים גלויים.
      // ראה src/utils/priceVisibility.js
      if (
        !HIDE_PRICES &&
        userInfo &&
        minimumOrderAmount !== undefined &&
        customCartTotal < minimumOrderAmount
      ) {
        const cityName = userInfo?.address?.city?.city_name_he || "";
        notifyError(t("minimumOrderAmount", { amount: minimumOrderAmount, city: cityName }));
        window.scrollTo({ top: 0, behavior: "smooth" });
        return; // עצור את הביצוע
      }

      dispatch({ type: "SAVE_SHIPPING_ADDRESS", payload: data });
      Cookies.set("shippingAddress", JSON.stringify(data));
      isSubmittingRef.current = true;
      setIsCheckoutSubmit(true);
      setError("");

      let userDetails;
      let orderInfo;

      if (isCashierMode) {
        // במצב קופה - פרטי הלקוח מהטופס
        userDetails = {
          name: data.customerName || null,
          phone: data.customerPhone || null,
        };

        orderInfo = {
          user_info: userDetails,
          cart: items.sort((a, b) => a.barcode - b.barcode) || items,
          subTotal: Number(customCartTotal.toFixed(2)),
          discount: discountAmount,
          total: total,
          coupon: couponInfo._id || null,
        };

        // יצירת הזמנת קופה
        const result = await OrderServices.addCashierOrder(orderInfo);

        notifyApiResponse(result, true);

        // ניקוי העגלה והקופון
        emptyCart();
        Cookies.remove("couponInfo");
        setCouponInfo({});
        setDiscountAmount(0);

        // איפוס הטופס
        setValue("customerName", "");
        setValue("customerPhone", "");

        isSubmittingRef.current = false;
        setIsCheckoutSubmit(false);

        // החזרת פונקציה לניקוי שם הלקוח בקומפוננטה
        return { success: true, clearCustomerName: true };

      } else {
        // במצב רגיל - הזמנת אתר רגילה
        let orderInfo;
        let orderService;

        { // לקוח מחובר בלבד — אורח נעצר בתחילת submitHandler
          userDetails = {
            name: userInfo.name,
            lastName: userInfo.lastName || '',
            contact: userInfo.phone,
            email: userInfo.email,
            address: userInfo.address,
            country: 'Isral',
            zipCode: userInfo?.address?.postalCode,
          };

          orderInfo = {
            user_info: userDetails,
            // אין משלוחים בחנות: ההזמנה נרשמת תמיד כאיסוף ("1"), כמו אצל אורח,
            // כדי שהשרת לא יחשב דמי משלוח לפי עיר הלקוח
            shippingOption: "1",
            callOnArrival: data.callOnArrival,
            paymentMethod: "creditCard",
            status: "Pending",
            cart: items.sort((a, b) => a.barcode - b.barcode) || items,
            subTotal: Number(customCartTotal.toFixed(2)),
            shippingCost: shippingCost,
            discount: discountAmount,
            total: total,
            coupon: couponInfo._id || null,
          };

          orderService = OrderServices.addOrder(orderInfo);
        }

        /*
         * בזרימה ללא תשלום מפנים ל-/success, והמעבר בין העמודים אינו מיידי.
         * שחרור הכפתור ב-finally היה פותח חלון של כמה מאות אלפיות שנייה שבו
         * הלקוח רואה כפתור פעיל על הזמנה שכבר נשמרה — ולחיצה בו יוצרת הזמנה
         * שנייה אמיתית. לכן בזרימה הזו הכפתור נשאר נעול עד עזיבת העמוד.
         */
        let navigatingAway = false;

        // יצירת ההזמנה בדטאבייס עם סטטוס Pending
        await orderService
          .then((res) => {
            /*
             * חנות ללא תשלום: השרת כבר סגר את ההזמנה והעביר אותה לאדמין, ולא
             * החזיר paymentUrl אלא את מזהה ההזמנה והטוקן — מפנים ישירות לעמוד
             * התודה, בלי שלב סליקה.
             *
             * התנאי נשען על res.paymentDisabled שהשרת מחזיר, ובכוונה *לא* על
             * המתג המקומי PAYMENT_DISABLED: המתג בחנות נצרב ב-build ואילו
             * המתג בשרת הוא משתנה סביבה, ושניהם יכולים להיפרד לרגע (פריסה
             * חלקית, build ישן). מי שיודע מה באמת קרה להזמנה הוא השרת. המתג
             * המקומי אחראי רק על הניסוח בממשק.
             * ראה src/utils/paymentDisabled.js
             *
             * ההפניה נעשית כאן ולא דרך setPaymentSrc: המסלול של paymentSrc
             * רץ ב-render של checkout.jsx ומיועד לכתובת חיצונית של קארדקום.
             */
            if (res?.paymentDisabled) {
              navigatingAway = true;
              const orderId = res?.orderId || "";
              const token = res?.orderToken || "";
              // ניקוי העגלה נעשה בעמוד ה-/success, כמו במסלול התשלום.
              router.push(
                `/success?orderId=${encodeURIComponent(orderId)}${token ? `&token=${encodeURIComponent(token)}` : ""}`
              );
            } else {
              setPaymentSrc(res.paymentUrl);
            }

            // רישום לפלאשי - גם לאורחים וגם למשתמשים רשומים
            if (userInfo) {
              // משתמש מחובר - עדכון/זיהוי בפלאשי
              const loggedInUser = {
                email: userInfo.email,
                name: userInfo.name,
                lastName: userInfo.lastName || '',
                phone: userInfo.phone || userInfo.contact || '',
              };

              // זיהוי המשתמש בפלאשי
              identifyUser(loggedInUser);

              // אם המשתמש בחר להירשם לניוזלטר
              if (newsletterOptIn) {
                trackNewsletterSignup(
                  userInfo.email,
                  userInfo.name,
                  userInfo.lastName || '',
                  userInfo.phone || userInfo.contact || ''
                );
              }
            } else if (orderInfo.email) {
              // אורח - יצירת אובייקט משתמש מהפרטים של האורח
              const guestUser = {
                email: orderInfo.email,
                name: orderInfo.name,
                lastName: orderInfo.lastName,
                phone: orderInfo.phone,
              };

              // זיהוי המשתמש בפלאשי
              identifyUser(guestUser);

              // אם המשתמש בחר להירשם לניוזלטר
              if (newsletterOptIn) {
                trackNewsletterSignup(
                  orderInfo.email,
                  orderInfo.name,
                  orderInfo.lastName,
                  orderInfo.phone || ''
                );
              }
            }
          }).catch((error) => {
            // בדיקת שגיאות מיוחדות
            if (error?.response?.status === 409) {
              const errorData = error?.response?.data;
              handleConflicts(errorData);
              return;
            } else {
              notifyError(error?.response?.data?.message || "שגיאה ביצירת ההזמנה. מומלץ לרוקן את העגלה ולנסות שוב.");
            }
          }).finally(() => {
            if (!navigatingAway) {
              isSubmittingRef.current = false;
              setIsCheckoutSubmit(false);
            }
          })
      }
    } catch (err) {
      console.error("Error in submitHandler:", err);
      // שחרור לפני כל הסתעפות — כולל ה-return של 409 — אחרת הכפתור נשאר
      // חסום לצמיתות ואי אפשר לשלוח שוב אחרי תיקון העגלה.
      isSubmittingRef.current = false;

      // טיפול בקונפליקטים
      if (err?.response?.status === 409) {
        const errorData = err?.response?.data;
        handleConflicts(errorData);
        return;
      } else {
        notifyError(err?.response?.data?.message || "שגיאה ביצירת ההזמנה. אנא נסה שוב.");
      }
      setIsCheckoutSubmit(false);
    }
  };

  // עדכון המוצרים ששונה להם המחיר
  useEffect(() => {
    if (addUpdatedProducts) {
      priceConflicts.forEach((conflict) => {
        const { product, serverPrice, clientPrice } = conflict;

        const oldQuantity = product.oldQuantity;

        let selectVariant = null;
        let stock = product.stock;
        let price = product.prices.price;
        let originalPrice = product.prices.originalPrice;
        let img = product.image[0];

        if (
          product?.variants.map(
            (variant) =>
              Object.entries(variant).sort().toString() ===
              Object.entries(selectVariant).sort().toString()
          )
        ) {
          const { variants, categories, description, ...updatedProduct } = product;
          const newItem = {
            ...updatedProduct,
            id: `${product.variants.length <= 1
              ? product._id
              : product._id +
              variantTitle
                ?.map(
                  // (att) => selectVariant[att.title.replace(/[^a-zA-Z0-9]/g, '')]
                  (att) => selectVariant[att._id]
                )
                .join("-")
              }`,

            title: product.variants.length <= 1
              ? product.title
              : {
                he: product.title.he +
                  "-" +
                  variantTitle
                    ?.map(
                      // (att) => selectVariant[att.title.replace(/[^a-zA-Z0-9]/g, '')]
                      (att) =>
                        att.variants?.find((v) => v._id === selectVariant[att._id])
                    )
                    .map((el) => el?.name),
                en: product.title.en +
                  "-" +
                  variantTitle
                    ?.map(
                      // (att) => selectVariant[att.title.replace(/[^a-zA-Z0-9]/g, '')]
                      (att) =>
                        att.variants?.find((v) => v._id === selectVariant[att._id])
                    )
                    .map((el) => el?.name)
              },
            image: img,
            variant: selectVariant,
            price: price,
            originalPrice: originalPrice,
          };

          addItem(newItem, oldQuantity);
        }
      });

      localStorage.removeItem("priceConflicts");
      setAddUpdatedProducts(false);
    }
  }, [addUpdatedProducts]);

  // פונקציית התמודדות עם קונפליקטים מהשרת
  const handleConflicts = async (errorData) => {
    if (!errorData || !errorData.keyWord) return;

    switch (errorData.keyWord) {
      case "missingProducts": {
        // מוצרים חסרים
        const missingProducts = errorData.missingProducts || [];

        // שמירה ב-localStorage אם רוצים לשחזר אחרי רענון
        localStorage.setItem("missingProducts", JSON.stringify(missingProducts));

        // אפשר, אם רוצים, להסיר אותם מייד מהעגלה:
        missingProducts.forEach((p) => removeItem(p._id));

        // הצגת המודאל עם המוצרים החסרים
        setMissingProducts(missingProducts);
        setMissingProductsModal(true);
        break;
      }

      case "priceConflicts": {
        // קונפליקט מחירים
        const priceConflicts = errorData.priceConflicts || [];

        // שמירה ב-localStorage
        localStorage.setItem("priceConflicts", JSON.stringify(priceConflicts));

        // **עדכון מיידי של מחיר המוצרים בעגלה**:
        // הרעיון: להסיר את המוצר הישן ולהוסיף אותו מחדש עם המחיר החדש מהשרת
        let productsWithQ = priceConflicts;
        priceConflicts.forEach((conflict) => {
          const { product } = conflict;

          // 1) מוצאים את הפריט כפי שהוא בעגלה
          const cartItem = items.find((cartI) => cartI._id === product._id);

          if (cartItem) {
            const oldQuantity = cartItem.quantity;

            productsWithQ = productsWithQ.map(p => {
              if (p.product._id === cartItem.id) {
                return { ...p, product: { ...product, oldQuantity } }
              }
              return p;
            });

            // 2) הסרת הפריט הישן
            removeItem(cartItem.id);

            setAddUpdatedProducts(true);
          };
        });

        // פתיחת מודאל ייעודי
        setPriceConflicts(productsWithQ);
        setPriceConflictsModal(true);
        break;
      }

      case "offerConflicts": {
        // קונפליקט מבצעים
        const offerConflicts = errorData.offerConflicts || [];

        // שמירה ב-localStorage
        localStorage.setItem("offerConflicts", JSON.stringify(offerConflicts));
        // window.location.reload();
        await refreshOffers();
        break;
      }

      case "customerAlreadyRegistered": {
        // לקוח רשום שמנסה לקנות כאורח
        setShowLoginModal(true);
        notifyError(errorData.message || t("customerAlreadyRegistered") || "האימייל כבר רשום במערכת. יש להתחבר לפני הרכישה.");
        break;
      }

      default:
        // במקרה שאין keyWord מוכר, או שאין צורך בטיפול מיוחד
        console.warn("No specific conflict handling for keyWord:", errorData.keyWord);
        notifyError("שגיאה ביצירת ההזמנה. מומלץ לרוקן את העגלה ולנסות שוב.");
        break;
    }
  };

  const handleShippingCost = (value) => {
    setShippingCost(value);
    setIsDeliveryMetod(true);
  };

  // ווידוא שהאחוזים מתעדכנים כל פעם שהמחיר משתנה
  useEffect(() => {
    if (shippingCost != 0) {
      const originalValue = ((customCartTotal / 11) * 10);
      if (originalValue) {
        if (originalValue > 0) {
          setShippingPercentageIncrease(shippingCost / originalValue * 100);
        } else {
          setShippingPercentageIncrease(0);
          setShippingCost(0);
          setIsDeliveryMetod(false);
        }
      }
    } else {
      setShippingPercentageIncrease(0);
    }
  }, [customCartTotal, shippingCost, isDeliveryMetod]);

  const handleCouponCode = async (e) => {
    e.preventDefault();

    const value = couponRef.current.value ? couponRef.current.value.trim() : '';

    if (!value) {
      const errorMsg = t("enterCouponCode");
      throw new Error(errorMsg);
    }

    try {
      const cartTotal = typeof customCartTotal === "number" ? customCartTotal : 0;
      const { data } = await CouponServices.useCoupon({ couponCode: value, cartTotal });

      // ===== קופון הרשמה (מוצר חינם) =====
      if (data.freeProduct) {
        const fp = data.freeProduct;
        const freeItemId = `coupon_free_${fp._id}`;

        // מניעת כפילות — אם המוצר החינמי כבר בעגלה
        if (!inCart(freeItemId)) {
          const { slug, variants, categories, description, ...plainProduct } = fp;
          addItem(
            {
              ...plainProduct,
              id: freeItemId,
              title: fp.title,
              price: 0,
              image: fp.image?.[0] || fp.image,
              variant: fp.prices,
              sku: fp.sku,
              isCouponFreeProduct: true,
              couponId: data._id,
            },
            1
          );
        }

        // שמירת קופון רזה (ללא אובייקט המוצר המלא) ל-Cookie/Context
        const slimCoupon = {
          couponCode: data.couponCode,
          _id: data._id,
          freeProductId: fp._id,
        };
        setIsCouponApplied(!isCouponApplied);
        dispatch({ type: "SAVE_COUPON", payload: slimCoupon });
        Cookies.set("couponInfo", JSON.stringify(slimCoupon));

        notifySuccess(
          currentLang
            ? `הקופון ${data.couponCode} הוחל בהצלחה — מוצר חינם נוסף לעגלה`
            : `Your Coupon ${data.couponCode} is applied — a free product was added`
        );
        return;
      }

      const th = Number(thresholdDiscount) || 0;
      const baseAfterThreshold = Math.max(0, cartTotal - th);
      if (
        data.discountType.type === "fixed" &&
        baseAfterThreshold > 0 &&
        data.discountType.value >= baseAfterThreshold
      ) {
        const errorMsg = t("couponTooHighForTotal");
        throw new Error(errorMsg);
      }

      notifySuccess(
        currentLang
          ? `הקופון ${data.couponCode} הוחל בהצלחה`
          : `Your Coupon ${data.couponCode} is applied successfully!`
      );

      setIsCouponApplied(!isCouponApplied);
      setMinimumAmount(Number(data.minimumAmount) || 0);
      setDiscountPercentage(data.discountType);

      // שמירת המידע על הקופון ב-Context וב-Cookies
      dispatch({ type: "SAVE_COUPON", payload: data });
      Cookies.set("couponInfo", JSON.stringify(data));

    } catch (error) {
      console.log('error: ', error);
      const errorMsg = error?.response?.data?.message || error?.message || t("errorOccurred");
      notifyError(errorMsg);
      throw error; // זריקת השגיאה כדי שהקומפוננטה תוכל לטפל בה
    }
  };

  const handleRemoveCoupon = () => {
    // הסרת מוצר חינם של קופון הרשמה מהעגלה (אם קיים)
    items.forEach((it) => {
      if (it.isCouponFreeProduct) removeItem(it.id);
    });
    Cookies.remove("couponInfo");
    setCouponInfo({});
    setDiscountPercentage(0);
    setDiscountAmount(0);
    setMinimumAmount(0);
    dispatch({ type: "SAVE_COUPON", payload: {} });
    if (couponRef.current && typeof couponRef.current.value === "string") {
      couponRef.current.value = "";
    }
    setIsCouponApplied((prev) => !prev);
    notifySuccess(t("couponRemoved"));
  };

  return {
    handleSubmit,
    submitHandler,
    submitWithRefreshOffers,
    handleShippingCost,
    register,
    watch,
    setValue,
    errors,
    showCard,
    setShowCard,
    error,
    // stripe,
    couponInfo,
    couponRef,
    handleCouponCode,
    handleRemoveCoupon,
    discountPercentage,
    discountAmount,
    shippingCost,
    total,
    isEmpty,
    items,
    customCartTotal,
    currency,
    isCheckoutSubmit,
    isCouponApplied,
    isDeliveryMetod,
    paymentSrc,
    setPaymentSrc,
    shippingPercentageIncrease,

    // הנחת מבצע THRESHOLD_DISCOUNT (משמש לחישוב ה-total)
    thresholdDiscount,

    missingProductsModal,
    setMissingProductsModal,
    missingProducts,
    setMissingProducts,
    priceConflictsModal,
    setPriceConflictsModal,
    priceConflicts,
    setPriceConflicts,
    offerConflictsModal,
    setOfferConflictsModal,
    offerConflicts,
    setOfferConflicts,
    showLoginModal,
    setShowLoginModal,
    setError: setFormError,
    clearErrors,

    // סטייטים לוולידציה
    guestChosenCity,
    setGuestChosenCity,
    isDeliverable,
    setIsDeliverable,
    minimumOrderAmount,
    setMinimumOrderAmount,
    guestAddressFormRef,
  };
};

export default useCheckoutSubmit;