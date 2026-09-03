// src/component/product/ProductCard.jsx
import dynamic from "next/dynamic";
import Link from "next/link";
import { useContext, useId, useState } from "react";
import { IoAdd, IoRemove } from "react-icons/io5";
import { LiaCartPlusSolid } from "react-icons/lia";

// Internal import
import Price from "@component/common/Price";
import { notifyError } from "@utils/toast";
import useAddToCart from "@hooks/useAddToCart";
import useGetSetting from "@hooks/useGetSetting";
import Discount from "@component/common/Discount";
import useUtilsFunction from "@hooks/useUtilsFunction";
import ProductModal from "@component/modal/ProductModal";
import ImageWithFallback from "@component/common/ImageWithFallBack";
import { handleLogEvent } from "@utils/analytics";
import { SidebarContext } from "@context/SidebarContext";
import useTranslation from "next-translate/useTranslation";
import getOfferNames from "@component/offer/getOfferNames";
import useCart from "@hooks/useCart";
import { isFreeGiftProduct } from "@utils/offerCalculations";
import { HIDE_PRICES } from "@utils/priceVisibility";

const ProductCard = ({ product, attributes, offers = [] }) => {
  const [modalOpen, setModalOpen] = useState(false);
  const { offers: allOffers } = useContext(SidebarContext);
  const { items, addItem, updateItemQuantity } = useCart();
  const { handleIncreaseQuantity } = useAddToCart();
  const { globalSetting } = useGetSetting();
  const { showingTranslateValue } = useUtilsFunction();
  const { t } = useTranslation();

  // מזהה לקישור בין הכרטיס (‎aria-labelledby) לכותרת שלו. קורא מסך שעובר על
  // הגריד מכריז את שם המוצר לכל כרטיס במקום "מאמר" חוזר 48 פעמים.
  //
  // ‎useId ולא ‎product._id: בדף הבית "פופולריים" ו"מבצעים" מגיעים משתי
  // רשימות נפרדות של אותה קריאת API, ומוצר פופולרי שגם בהנחה מופיע בשתיהן.
  // מזהה מבוסס ‎_id היה נוצר פעמיים באותו עמוד, ו-‎aria-labelledby של שני
  // הכרטיסים היה מצביע על אותה כותרת. ‎useId ייחודי לכל מופע.
  //
  // חשוב: הקריאה חייבת להישאר כאן, לצד שאר ה-hooks. בהמשך הקומפוננטה יש
  // ‎return null עבור מוצר שניתן במתנה, ו-hook שיושב אחריו לא היה נקרא
  // באותו רנדר — הפרה של Rules of Hooks שמשבשת את סדר ה-hooks.
  const titleId = useId();

  const currency = globalSetting?.default_currency || "₪";

  const title = showingTranslateValue(product?.title);
  const hasVariants = product?.variants?.length > 0;
  const outOfStock = product?.stock <= 0;

  const handleAddItem = (p) => {
    if (p.stock < 1) return notifyError(t("common:productStockOut"));

    if (p?.variants?.length > 0) {
      setModalOpen(!modalOpen);
      return;
    }
    const { slug, variants, categories, description, ...updatedProduct } =
      product;
    const newItem = {
      ...updatedProduct,
      title: p.title,
      id: p._id,
      variant: p.prices,
      price: p.prices.price,
      originalPrice: product.prices?.originalPrice,
      slug: p.slug,
    };
    addItem(newItem);
  };

  const offerName = getOfferNames(offers, product, ", ");

  // ‎image הוא מערך בסכימה, אבל ‎[""] אפשרי (יבוא שהשאיר מחרוזת ריקה) ולכן
  // לא די בבדיקת אורך. משמש להתאמת אזור התמונה: תמונה אמיתית מול placeholder.
  const hasImage = Boolean(
    Array.isArray(product?.image) ? product.image[0] : product?.image
  );

  // הסתרת מוצרים שניתנים במתנה במבצע — אי אפשר לקנותם כמוצר רגיל
  if (isFreeGiftProduct(product?._id, allOffers)) {
    return null;
  }

  const cartItem = items.find((item) => item.id === product._id);

  return (
    <>
      {modalOpen && (
        <ProductModal
          modalOpen={modalOpen}
          setModalOpen={setModalOpen}
          product={product}
          currency={currency}
          attributes={attributes}
          title={offerName}
        />
      )}

      {/* ‎<article> ולא ‎<div>: כל כרטיס הוא פריט תוכן עצמאי, וקוראי מסך
          מאפשרים דילוג בין פריטים כאלה. ‎aria-labelledby נותן לו שם.
          הכרטיס הוא ‎flex-col עם ‎h-full כדי שכל הכרטיסים בשורה יימתחו לאותו
          גובה ושורת הכפתור תיישר קו בכולם — בלי זה הגריד נראה משונן. */}
      <article
        aria-labelledby={titleId}
        className="product-card group box-border h-full overflow-hidden flex flex-col rounded-xl border border-gray-200 bg-white shadow-sm transition-shadow duration-200 hover:shadow-md relative"
      >
        <Discount product={product} title={offerName} card />

        {/* אזור התמונה — קישור אמיתי לעמוד המוצר במקום ‎<div onClick>.
            הגרסה הקודמת פתחה מודל מתוך ‎div ללא ‎role/tabIndex: לא נגיש
            במקלדת, לא מוכרז כרכיב לחיץ, ולא ניתן לפתיחה בלשונית חדשה. */}
        <Link
          href={`/product/${product.slug}`}
          onClick={() =>
            handleLogEvent("product", `opened ${title} product page`)
          }
          tabIndex={-1}
          aria-hidden="true"
          // התמונה והכותרת מובילות לאותו יעד; סימון התמונה כ-‎aria-hidden
          // ומחוץ לסדר ה-Tab מונע קישור כפול לכל מוצר בקורא מסך.
          className={`relative flex justify-center w-full h-28 sm:h-36 shrink-0 ${
            hasImage ? "bg-white" : "bg-mainColor-superLight"
          }`}
        >
          <div className={`relative w-full h-full ${hasImage ? "p-1.5" : "p-4 sm:p-5"}`}>
            <ImageWithFallback
              // ‎product.image[0] הישיר קורס אם השדה חסר לגמרי; הסכימה אמנם
              // מבטיחה מערך, אבל מסמך שנוצר מחוץ למודל אינו מחויב לה
              src={Array.isArray(product?.image) ? product.image[0] : product?.image}
              outOfStock={outOfStock}
              alt=""
              card={true}
            />
          </div>
        </Link>

        <div className="w-full px-3 pt-2.5 pb-3 flex flex-col flex-grow">
          {product.unit && (
            <span className="text-gray-500 font-medium text-xs mb-0.5 block">
              {product.unit}
            </span>
          )}

          {/* הכותרת היא הקישור הנגיש היחיד של הכרטיס. ‎text-gray-900 ולא
              ‎text-gray-800: על רקע לבן זה 17.9:1 מול 12.6:1 — שניהם עוברים,
              אבל הכהה קריא יותר בגודל הקטן הזה, והשם הוא המידע המרכזי בכרטיס.
              ‎min-h שומר על גובה שתי שורות בכל הכרטיסים כדי ששורת המחיר
              תתחיל באותו גובה ולא "תרקוד" לאורך הגריד. */}
          <h3 id={titleId} className="mb-2">
            <Link
              href={`/product/${product.slug}`}
              onClick={() =>
                handleLogEvent("product", `opened ${title} product page`)
              }
              className="product-card__title block text-sm sm:text-[15px] font-semibold text-gray-900 leading-snug min-h-[2rem] sm:min-h-[2.25rem]"
            >
              <span className="line-clamp-2">{title}</span>
            </Link>
          </h3>

          <div className="mt-auto">
            {/* בחנות ללא מחירים ‎<Price> מחזיר null, והשורה נשארת רצועה ריקה
                בגובה קבוע. כשגם המשקל חסר — מוותרים עליה לגמרי.
                ראה src/utils/priceVisibility.js */}
            <div
              className={
                HIDE_PRICES && !product?.weight
                  ? "hidden"
                  : "flex items-baseline justify-between gap-2 mb-2.5 min-h-[1.75rem]"
              }
            >
              <Price
                card
                product={product}
                currency={currency}
                price={
                  product?.isCombination
                    ? product?.variants[0]?.price
                    : product?.prices?.price
                }
                originalPrice={
                  product?.isCombination
                    ? product?.variants[0]?.originalPrice
                    : product?.prices?.originalPrice
                }
              />
              {product?.weight && (
                <span className="text-xs text-gray-500 whitespace-nowrap shrink-0">
                  {product.weight} ק&quot;ג
                </span>
              )}
            </div>

            {/* שורת הפעולה — ברוחב מלא ובגובה 44px לפחות (שטח מגע תקני).
                קודם זו הייתה משבצת אייקון ברוחב ~30px בפינה, בלי תווית טקסט:
                גם קטנה מדי לאצבע וגם לא ברור מה היא עושה. */}
            {cartItem ? (
              <div className="flex items-stretch h-11 rounded-lg bg-mainColor-dark text-white overflow-hidden">
                <button
                  type="button"
                  onClick={() =>
                    updateItemQuantity(cartItem.id, cartItem.quantity - 1)
                  }
                  aria-label={`${t("common:decreaseQuantity")} – ${title}`}
                  className="focus-ring-light w-12 shrink-0 flex items-center justify-center text-xl hover:bg-mainColor-superDark transition-colors"
                >
                  <IoRemove aria-hidden="true" />
                </button>
                {/* ‎aria-live: שינוי הכמות מוכרז לקורא מסך בלי לזוז מהכפתור */}
                <span
                  aria-live="polite"
                  aria-atomic="true"
                  className="flex-grow flex items-center justify-center font-bold text-base tabular-nums"
                >
                  <span className="sr-only">{t("common:quantityInCart")}: </span>
                  {cartItem.quantity}
                </span>
                <button
                  type="button"
                  // התנאי נבדק על *פריט העגלה* ולא על המוצר. ‎handleAddItem
                  // מפשיט את ‎variants בבניית פריט העגלה, ולכן פריט רגיל מגיע
                  // תמיד ל-‎handleIncreaseQuantity (שבודק מלאי). בדיקה על
                  // ‎product.variants הייתה שולחת מוצרי-וריאציה ל-handleAddItem,
                  // שמוסיף שורה חדשה של מוצר הבסיס ועוקף את בדיקת המלאי.
                  onClick={() =>
                    cartItem?.variants?.length > 0
                      ? handleAddItem(cartItem)
                      : handleIncreaseQuantity(cartItem)
                  }
                  aria-label={`${t("common:increaseQuantity")} – ${title}`}
                  className="focus-ring-light w-12 shrink-0 flex items-center justify-center text-xl hover:bg-mainColor-superDark transition-colors"
                >
                  <IoAdd aria-hidden="true" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                disabled={outOfStock}
                onClick={() => handleAddItem(product)}
                // ‎aria-label כולל את שם המוצר: בגריד של 48 כרטיסים, "הוסף
                // לעגלה" לבדו חוזר 48 פעמים ואינו מזהה על מה לוחצים.
                //
                // סדר המילים אינו שרירותי: WCAG 2.5.3 דורש שהשם הנגיש יכיל
                // את הטקסט הנראה כרצף רציף, כדי שפקודה קולית ("לחץ הוסף
                // לעגלה") תתאים. לכן התווית היא "הוסף לעגלה – <שם>" ולא
                // "הוסף <שם> לעגלה".
                //
                // וכשהמוצר אזל, הטקסט הנראה הוא "אזל מהמלאי" — תווית שאומרת
                // "הוסף לעגלה" הייתה סותרת אותו ישירות.
                aria-label={
                  outOfStock
                    ? t("common:outOfStockFor", { name: title })
                    : hasVariants
                      ? t("common:chooseOptionsFor", { name: title })
                      : t("common:addProductToCart", { name: title })
                }
                aria-haspopup={hasVariants ? "dialog" : undefined}
                className={
                  outOfStock
                    ? "w-full h-11 flex items-center justify-center gap-1.5 rounded-lg border border-gray-200 bg-gray-50 text-gray-500 text-sm font-semibold cursor-not-allowed"
                    : "w-full h-11 flex items-center justify-center gap-1.5 rounded-lg border-2 border-mainColor-dark text-mainColor-dark text-sm font-bold hover:bg-mainColor-dark hover:text-white active:scale-[0.98] transition-all"
                }
              >
                {outOfStock ? (
                  t("common:stockOut")
                ) : (
                  <>
                    <LiaCartPlusSolid className="text-xl" aria-hidden="true" />
                    <span>
                      {hasVariants ? t("common:options") : t("common:addToCart")}
                    </span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </article>
    </>
  );
};

export default dynamic(() => Promise.resolve(ProductCard), { ssr: false });
