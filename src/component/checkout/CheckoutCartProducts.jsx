// מוצרי עגלה – 4 מוצרים שסומנו כ-isCartpprod, מוצגים בין סיכום עלויות לתשלום
import React from "react";
import { IoCartOutline } from "react-icons/io5";
import { LiaCartPlusSolid } from "react-icons/lia";
import { IoAdd, IoRemove } from "react-icons/io5";
import useTranslation from "next-translate/useTranslation";
import useAsync from "@hooks/useAsync";
import ProductServices from "@services/ProductServices";
import useCart from "@hooks/useCart";
import useAddToCart from "@hooks/useAddToCart";
import useUtilsFunction from "@hooks/useUtilsFunction";
import ImageWithFallback from "@component/common/ImageWithFallBack";
import Price from "@component/common/Price";
import { notifyError } from "@utils/toast";

const CheckoutCartProducts = ({ currency, showingTranslateValue }) => {
  const { t } = useTranslation();
  const { data: cartProducts = [], loading } = useAsync(ProductServices.getCartProducts);
  const { addItem, items, inCart, updateItemQuantity } = useCart();
  const { handleIncreaseQuantity } = useAddToCart();

  const handleAddToCart = (product) => {
    if (product?.stock <= 0) {
      notifyError(t("common:productStockOut"));
      return;
    }
    if (product?.variants?.length > 0) return; // מוצר עם וריאציות – לא מוסיפים מכאן
    const { slug, variants, categories, description, ...rest } = product;
    const itemToAdd = {
      ...rest,
      id: product._id,
      title: product.title,
      variant: product.prices,
      price: product.prices?.price,
      originalPrice: product.prices?.originalPrice,
      slug: product.slug,
    };
    addItem(itemToAdd);
  };

  if (loading || !cartProducts?.length) return null;

  return (
    <div className="w-full flex flex-col h-full">
      <div className="border p-5 lg:px-8 lg:py-6 rounded-lg bg-white">
        <h2 className="font-semibold font-serif text-lg pb-4 flex items-center gap-2">
          <IoCartOutline className="text-mainColor-dark text-xl" />
          {t("common:checkoutCartProducts")}
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          {cartProducts.map((product) => {
            const isInCart = inCart(product._id);
            const cartItem = items.find((i) => i.id === product._id);
            const isSimple = !product?.variants?.length;

            return (
              <div
                key={product._id}
                className="flex flex-col rounded-lg border border-gray-100 overflow-hidden bg-gray-50/50 hover:border-mainColor-dark/20 transition-colors"
              >
                <div className="relative flex justify-center w-full h-24 sm:h-28 bg-white p-2">
                  <ImageWithFallback
                    src={Array.isArray(product.image) ? product.image[0] : product.image}
                    alt={showingTranslateValue(product?.title)}
                    card
                  />
                </div>
                <div className="p-2 flex flex-col flex-grow">
                  <h3 className="text-xs sm:text-sm font-medium text-gray-700 line-clamp-2 min-h-[2rem]">
                    {showingTranslateValue(product?.title)}
                  </h3>
                  <div className="mt-1 flex items-center">
                    <Price
                      card
                      product={product}
                      currency={currency}
                      price={product?.prices?.price}
                      originalPrice={product?.prices?.originalPrice}
                    />
                  </div>
                  <div className="mt-2">
                    {!isSimple ? (
                      <a
                        href={`/product/${product.slug}`}
                        className="text-xs text-mainColor-dark underline"
                      >
                        {t("common:options")}
                      </a>
                    ) : isInCart && cartItem ? (
                      <div className="flex items-center justify-between gap-1 bg-mainColor-dark text-white rounded py-1 px-2">
                        <button
                          type="button"
                          onClick={() => updateItemQuantity(product._id, cartItem.quantity - 1)}
                          className="p-0.5"
                          aria-label="הפחת"
                        >
                          <IoRemove className="text-sm" />
                        </button>
                        <span className="text-xs font-semibold">{cartItem.quantity}</span>
                        <button
                          type="button"
                          onClick={() => handleIncreaseQuantity(cartItem)}
                          className="p-0.5"
                          aria-label="הוסף"
                        >
                          <IoAdd className="text-sm" />
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleAddToCart(product)}
                        disabled={product?.stock <= 0}
                        className="w-full flex items-center justify-center gap-1 py-1.5 px-2 rounded border border-mainColor-dark text-mainColor-dark hover:bg-mainColor-dark hover:text-white transition-colors text-xs font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <LiaCartPlusSolid className="text-base" />
                        {t("common:addToCart")}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default CheckoutCartProducts;
