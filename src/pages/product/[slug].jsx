// src/pages/product/[slug].jsx
import useTranslation from "next-translate/useTranslation";
import Head from "next/head";
import Image from "@component/common/Img";
import Link from "next/link";
import { useRouter } from "next/router";
import { Fragment, useContext, useEffect, useState } from "react";
import { FiChevronLeft, FiChevronRight, FiMinus, FiPlus } from "react-icons/fi";
import {
  FacebookIcon,
  FacebookShareButton,
  LinkedinIcon,
  LinkedinShareButton,
  RedditIcon,
  RedditShareButton,
  TwitterIcon,
  TwitterShareButton,
  WhatsappIcon,
  WhatsappShareButton,
} from "react-share";

// Internal import
import Price from "@component/common/Price";
import { HIDE_PRICES } from "@utils/priceVisibility";
import Stock from "@component/common/Stock";
import Tags from "@component/common/Tags";
import Layout from "@layout/Layout";
import { notifyError } from "@utils/toast";
import useAddToCart from "@hooks/useAddToCart";
import Loading from "@component/preloader/Loading";
import ProductCard from "@component/product/ProductCard";
import ProductTrustBadges from "@component/product/ProductTrustBadges";
import VariantList from "@component/variants/VariantList";
import { SidebarContext } from "@context/SidebarContext";
import AttributeServices from "@services/AttributeServices";
import ProductServices from "@services/ProductServices";
import useUtilsFunction from "@hooks/useUtilsFunction";
import Discount from "@component/common/Discount";
import ImageCarousel from "@component/carousel/ImageCarousel";
import useCart from "@hooks/useCart";
import getOfferNames from "@component/offer/getOfferNames";
import { isFreeGiftProduct } from "@utils/offerCalculations";
import MainBT from "@component/button/MainBT";
import MinimalTitle from "@component/common/MinimalTitle";
import ImageWithFallback from "@component/common/ImageWithFallBack";
import { trackFbViewContent } from "@services/facebookPixel";
import { trackViewItem } from "@services/googleAnalytics";

const ProductScreen = ({ product, attributes, relatedProducts }) => {
  // console.log('ProductScreen product: ', product);
  const router = useRouter();

  const { lang, showingTranslateValue, getNumber, currency } = useUtilsFunction();

  const { isLoading, setIsLoading, offers } = useContext(SidebarContext);
  const { handleAddItem, item, setItem } = useAddToCart();

  const [value, setValue] = useState("");
  const [price, setPrice] = useState(0);
  const [img, setImg] = useState("");
  const [originalPrice, setOriginalPrice] = useState(0);
  const [stock, setStock] = useState(0);
  const [stockLoaded, setStockLoaded] = useState(false);
  const [discount, setDiscount] = useState(0);
  const [selectVariant, setSelectVariant] = useState({});
  const [isReadMore, setIsReadMore] = useState(true);
  const [selectVa, setSelectVa] = useState({});
  const [variantTitle, setVariantTitle] = useState([]);
  const [variants, setVariants] = useState([]);

  const { items } = useCart();
  const [offerTitle, setOfferTitle] = useState();

  // מוצר שניתן במתנה במבצע — לא ניתן לרכוש אותו כמוצר רגיל
  const isGiftOnly = isFreeGiftProduct(product?._id, offers);

  // עדכון מחיר המוצר על סמך המבצע שלו
  useEffect(() => {
    const offerName = getOfferNames(offers, product);
    if (offerName) {
      setOfferTitle(offerName);
    } else {
      setOfferTitle('');
    }
  }, [offers]);

  // Meta Pixel - ViewContent + GA4 view_item עבור עמוד מוצר
  useEffect(() => {
    if (product?._id) {
      // מומלץ לוודא שה־sku קיים ומתאים לפיד
      trackFbViewContent({
        ...product,
        // לוודא שיש price בסיסי
        price: product?.prices?.price,
      });

      // GA4 view_item דרך dataLayer (GTM) — ערך לפי מחיר הבסיס של המוצר
      trackViewItem(product, product?.prices?.price);
    }
  }, [product?._id]);

  useEffect(() => {
    // console.log('value', value, product);
    if (value) {
      const result = product?.variants?.filter((variant) =>
        Object.keys(selectVa).every((k) => selectVa[k] === variant[k])
      );

      const res = result?.map(
        ({
          originalPrice,
          price,
          discount,
          quantity,
          barcode,
          sku,
          productId,
          image,
          ...rest
        }) => ({
          ...rest,
        })
      );

      const filterKey = Object.keys(Object.assign({}, ...res));
      const selectVar = filterKey?.reduce(
        (obj, key) => ({ ...obj, [key]: selectVariant[key] }),
        {}
      );
      const newObj = Object.entries(selectVar).reduce(
        (a, [k, v]) => (v ? ((a[k] = v), a) : a),
        {}
      );

      // const result2 = result?.find((v) =>
      //   Object.keys(newObj).every((k) => newObj[k] === v[k])
      // );
      const result2 = result[0];

      // console.log("result2", result2);

      if (result.length <= 0 || result2 === undefined) {
        setStock(0);
        setStockLoaded(true);
        return;
      }

      setVariants(result);
      setSelectVariant(result2);
      setSelectVa(result2);
      setImg(result2?.image);
      setStock(result2?.quantity);
      const price = getNumber(result2?.price);
      const originalPrice = getNumber(result2?.originalPrice);
      const discountPercentage = getNumber(
        ((originalPrice - price) / originalPrice) * 100
      );
      setDiscount(getNumber(discountPercentage));
      setPrice(price);
      setOriginalPrice(originalPrice);
      setStockLoaded(true);
    } else if (product?.variants?.length > 0) {
      const result = product?.variants?.filter((variant) =>
        Object.keys(selectVa).every((k) => selectVa[k] === variant[k])
      );

      setVariants(result);
      setStock(product.variants[0]?.quantity);
      setSelectVariant(product.variants[0]);
      setSelectVa(product.variants[0]);
      setImg(product.variants[0]?.image);
      const price = getNumber(product.variants[0]?.price);
      const originalPrice = getNumber(product.variants[0]?.originalPrice);
      const discountPercentage = getNumber(
        ((originalPrice - price) / originalPrice) * 100
      );
      setDiscount(getNumber(discountPercentage));
      setPrice(price);
      setOriginalPrice(originalPrice);
      setStockLoaded(true);
    } else {
      setStock(product?.stock);
      setImg(product?.image[0]);
      const price = getNumber(product?.prices?.price);
      const originalPrice = getNumber(product?.prices?.originalPrice);
      const discountPercentage = getNumber(
        ((originalPrice - price) / originalPrice) * 100
      );
      setDiscount(getNumber(discountPercentage));
      setPrice(price);
      setOriginalPrice(originalPrice);
      setStockLoaded(true);
    }
  }, [
    product?.prices?.discount,
    product?.prices?.originalPrice,
    product?.prices?.price,
    product?.stock,
    product.variants,
    selectVa,
    selectVariant,
    value,
  ]);

  useEffect(() => {
    const res = Object.keys(Object.assign({}, ...product?.variants));
    const varTitle = attributes?.filter((att) => res.includes(att?._id));

    setVariantTitle(varTitle?.sort());
  }, [variants, attributes]);

  useEffect(() => {
    setIsLoading(false);
    setStockLoaded(false);
  }, [product]);

  // בניית האובייקט שנשלח לעגלה — משותף להוספה לעגלה ולרכישה מהירה
  const buildCartItem = (p) => {
    if (p.variants.length === 1 && p.variants[0].quantity < 1) {
      notifyError(t("common:productStockOut"));
      return null;
    }
    if (stock <= 0) {
      notifyError(t("common:productStockOut"));
      return null;
    }

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
        id: `${p.variants.length <= 1
          ? p._id
          : p._id +
          variantTitle
            ?.map(
              // (att) => selectVariant[att.title.replace(/[^a-zA-Z0-9]/g, '')]
              (att) => selectVariant[att._id]
            )
            .join("-")
          }`,

        title: p.variants.length <= 1
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
      return newItem;
    }

    notifyError("Please select all variant first!");
    return null;
  };

  const handleAddToCart = (p) => {
    const newItem = buildCartItem(p);
    if (!newItem) return;
    handleAddItem(newItem);
  };

  // רכישה מהירה: הוספת המוצר לעגלה (רק אם עוד לא נמצא בה) ומעבר לדף התשלום
  const handleQuickBuy = (p) => {
    const newItem = buildCartItem(p);
    if (!newItem) return;

    const alreadyInCart = items?.some((i) => i.id === newItem.id);
    if (!alreadyInCart) {
      handleAddItem(newItem);
    }
    router.push("/checkout");
  };

  const handleChangeImage = (img) => {
    setImg(img);
  };

  const { t } = useTranslation();
  const { getCategorySlug, findMainCategory, findSubCategory } = useUtilsFunction();
  const { categories } = useContext(SidebarContext);

  // זיהוי אם הקטגוריה היא קטגוריה ראשית או תת-קטגוריה
  const currentCategory = product?.category;

  // חיפוש הקטגוריה במבנה הקטגוריות מה-SidebarContext
  let foundCategory = null;
  let parentCategory = null;

  // חיפוש בקטגוריות הראשיות
  if (categories?.[0]?.children) {
    foundCategory = categories[0].children.find(cat => cat._id === currentCategory?._id);
    if (foundCategory) {
      // זה קטגוריה ראשית
      parentCategory = null;
    } else {
      // חיפוש בתת-קטגוריות
      for (const mainCat of categories[0].children) {
        if (mainCat.children) {
          const subCat = mainCat.children.find(sub => sub._id === currentCategory?._id);
          if (subCat) {
            foundCategory = subCat;
            parentCategory = mainCat;
            break;
          }
        }
      }
    }
  }

  // יצירת פירורי הלחם הנכונים
  const breadcrumbItems = [];

  // תמיד מתחילים מהבית
  breadcrumbItems.push({
    name: t("common:HOME"),
    href: "/",
    isActive: false
  });

  // אם יש קטגוריה ראשית - נוסיף אותה
  if (parentCategory) {
    const parentSlug = getCategorySlug(parentCategory);
    breadcrumbItems.push({
      name: showingTranslateValue(parentCategory.name),
      href: `/product-category/${parentSlug}`,
      isActive: false
    });
  }

  // נוסיף את הקטגוריה הנוכחית (ראשית או תת-קטגוריה)
  if (foundCategory) {
    const categorySlug = getCategorySlug(foundCategory);
    breadcrumbItems.push({
      name: showingTranslateValue(foundCategory.name),
      href: parentCategory ? `/product-category/${getCategorySlug(parentCategory)}/${categorySlug}` : `/product-category/${categorySlug}`,
      isActive: false
    });
  }

  // נוסיף את שם המוצר
  breadcrumbItems.push({
    name: showingTranslateValue(product?.title),
    href: null,
    isActive: true
  });

  // ---- SEO / Microdata for Meta ----
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
  const productUrl = `${siteUrl}/product/${product.slug}`;
  // JSON-LD מחייב כתובת מוחלטת. הגיבוי היה תמונת דמו ב-Cloudinary של הפרויקט
  // המקורי — ומכיוון שלאף מוצר בקטלוג אין תמונה, כל המוצרים היו מפרסמים
  // בנתוני המבנה תמונה מדומיין זר שאינו בשליטתנו.
  // נתיב ‎/product-images/ הוא אייקון שנוצר אוטומטית (ויחסי, לא מוחלט) — בחנות
  // הוא מוחלף בסוכריה, וכאן בלוגו: מנועי חיפוש ורשתות לא מקבלים SVG כתמונת מוצר.
  const realImage = /^https?:\/\//i.test(product?.image?.[0] || "")
    ? product.image[0]
    : null;
  const productImage = realImage || `${siteUrl}/logo/logo-stacked.png`;
  const basePrice = price || product?.prices?.price || 0;
  const availability =
    stock > 0
      ? "https://schema.org/InStock"
      : "https://schema.org/OutOfStock";

  // ‎offers מכיל את המחיר, ו-JSON-LD נכתב אל תוך ה-HTML עצמו: השארתו כאן
  // הייתה מדליפה את המחיר לכל מי שפותח "הצג מקור", ובעיקר מגישה אותו
  // ל-Google להצגה כ-rich result בתוצאות החיפוש — כלומר מחיר גלוי לגמרי
  // בחנות שאמורה להיות בלי מחירים. ‎offers הוא שדה מומלץ ולא חובה בסכימת
  // Product, ולכן השמטתו משאירה מבנה תקין (בניגוד ל-Offer בלי price).
  // ראה src/utils/priceVisibility.js
  const productJsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    "@id": productUrl,
    name: showingTranslateValue(product.title),
    description: showingTranslateValue(product.description),
    image: [productImage],
    sku: product.sku,
    ...(HIDE_PRICES
      ? {}
      : {
          offers: {
            "@type": "Offer",
            priceCurrency: "ILS",
            price: basePrice,
            availability,
            url: productUrl,
            itemCondition: "https://schema.org/NewCondition",
          },
        }),
  };

  // console.log("discount", discount);

  return (
    <>
      <Head>
        {/* Open Graph בסיסי למוצר */}
        <meta
          property="og:title"
          content={showingTranslateValue(product.title)}
        />
        <meta
          property="og:description"
          content={showingTranslateValue(product.description)}
        />
        <meta property="og:type" content="product" />
        <meta property="og:url" content={productUrl} />
        <meta property="og:image" content={productImage} />
        <meta property="og:locale" content="he_IL" />

        {/* זה ה-id שמטה מחפשת לקטלוג */}
        <meta
          property="product:retailer_item_id"
          content={product.sku || product._id}
        />

        {/* JSON-LD – Schema.org Product */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(productJsonLd),
          }}
        />
      </Head>

      {isLoading ? (
        <Loading loading={isLoading} />
      ) : (
        <Layout
          title={showingTranslateValue(product?.title)}
          description={showingTranslateValue(product.description)}
        >
          <div className="px-0 py-4 lg:py-10">
            <div className="mx-auto px-3 lg:px-10 max-w-screen-2xl">
              {/* ‎<nav aria-label> — בלי זה ה-‎<ol> הזה הוא רשימה סתמית, ולא
                  "מיקומך באתר" שקורא מסך יכול לדלג אליה.
                  שינוי נוסף: קודם היה כאן ‎<button> בתוך ‎<Link> — HTML לא חוקי
                  (רכיב אינטראקטיבי בתוך רכיב אינטראקטיבי). התוצאה: שתי עצירות
                  Tab לכל פירור, והכרזה כפולה של "לחצן, קישור". */}
              <nav aria-label={t("common:breadcrumb")} className="flex items-center pb-4">
                <ol className="flex items-center w-full min-w-0 overflow-hidden font-serif text-gray-700">
                  {breadcrumbItems.map((item, index) => (
                    <Fragment key={index}>
                      {index > 0 && (
                        <li aria-hidden="true" className="text-xs sm:text-sm mt-[1px] flex-shrink-0">
                          <FiChevronLeft />
                        </li>
                      )}
                      <li className={`text-xs sm:text-sm ${index === breadcrumbItems.length - 1 ? 'min-w-0 flex-1 overflow-hidden' : 'flex-shrink-0'} ${index === 0 ? 'pr-1' : index === breadcrumbItems.length - 1 ? 'px-1' : 'pl-1'} transition duration-200 ease-in`}>
                        {item.href ? (
                          <Link
                            href={item.href}
                            onClick={() => setIsLoading(!isLoading)}
                            className={`py-1 hover:text-black hover:underline underline-offset-2 font-semibold ${index === breadcrumbItems.length - 1 ? 'block truncate' : 'block'}`}
                          >
                            {item.name}
                          </Link>
                        ) : (
                          <span
                            aria-current="page"
                            className={`font-bold text-gray-900 ${index === breadcrumbItems.length - 1 ? 'block truncate' : 'block'}`}
                          >
                            {item.name}
                          </span>
                        )}
                      </li>
                    </Fragment>
                  ))}
                </ol>
              </nav>
              {/* <div className="rounded-lg p-3 lg:p-12 bg-white"> */}
              <div className="w-full rounded-lg p-3 lg:p-12 bg-white">
                <div className="w-full flex flex-col items-center justify-center lg:flex-row">
                <div className="max-w-lg flex-shrink-0 lg:block md:w-6/12">
                  <Discount slug product={product} discount={discount} title={offerTitle}
                  // title={product.isCombination ? (selectVariant?.offers?.length > 0 ? (
                  //   selectVariant.offers.reduce((title, obj) => (
                  //     <>
                  //       {title}
                  //       {title && <br />}
                  //       {obj.name}
                  //     </>
                  //   ), null)
                  // ) : '') : (product?.prices?.offers?.length > 0 ? (
                  //   product?.prices?.offers.reduce((title, obj) => (
                  //     <>
                  //       {title}
                  //       {title && <br />}
                  //       {obj.name}
                  //     </>
                  //   ), null)
                  // ) : '')}
                  />

                  <div className="relative lg:w-[500px] lg:h-[500px] lg:max-h-[300px] md:w-[300px] md:h-[300px] w-[250px] h-[250px]">
                    <ImageWithFallback
                      src={img || product.image[0]}
                      alt={showingTranslateValue(product?.title)}
                      noPadding={true}
                      outOfStock={stockLoaded && stock <= 0}
                      slug
                      enableZoom
                    />
                  </div>

                  {product?.image?.length > 1 && (
                    <div className="flex flex-row flex-wrap mt-4 border-t">
                      <ImageCarousel
                        images={product.image}
                        handleChangeImage={handleChangeImage}
                      />
                    </div>
                  )}
                </div>

                {/* <div className="w-full"> */}
                <div className="flex flex-col md:flex-row md:w-1/2 lg:flex-row lg:w-1/2 xl:flex-row xl:w-1/2">
                  <div className="xl:pr-6 md:pr-6 w-full">
                    <div className="mb-3">
                      <h1 className="leading-tight text-xl md:text-2xl lg:text-3xl mb-1 font-bold font-serif text-gray-900">
                        {showingTranslateValue(product?.title)}
                      </h1>

                      <p className="uppercase font-serif font-medium text-gray-600 text-sm">
                        {t("common:SKU")} :{" "}
                        <span className="font-bold text-gray-800">
                          {product.sku}
                        </span>
                      </p>

                      {/* <div className="relative h-5">
                        <Stock stock={stock} top={1} />
                      </div> */}
                    </div>
                    <Price
                      price={price}
                      product={product}
                      currency={currency}
                      originalPrice={originalPrice}
                    />

                    <div className="mb-4">
                      {variantTitle?.map((a, i) => (
                        <span key={a._id}>
                          <h4 className="text-sm py-1">
                            {showingTranslateValue(a?.name)}:
                          </h4>
                          <div className="flex flex-row items-center justify-center gap-2 w-fit mb-3">
                            <VariantList
                              att={a._id}
                              lang={lang}
                              option={a.option}
                              setValue={setValue}
                              varTitle={variantTitle}
                              variants={product?.variants}
                              setSelectVa={setSelectVa}
                              selectVariant={selectVariant}
                              setSelectVariant={setSelectVariant}
                            />
                          </div>
                        </span>
                      ))}
                    </div>

                    <div>
                      {showingTranslateValue(product?.description) &&
                        <div className="text-base leading-6 text-gray-600 md:leading-7">
                          {isReadMore
                            ? <>{showingTranslateValue(
                              product?.description
                            )?.slice(0, 220)}{product?.description[lang]?.length > 220 && '...'}</>
                            : showingTranslateValue(product?.description)}
                          <br />
                          {Object?.keys(product?.description)?.includes(lang)
                            ? product?.description[lang]?.length > 230 && (
                              // ‎<span onClick> אינו נגיש במקלדת ואינו מוכרז
                              // כרכיב לחיץ. ‎<button> + aria-expanded מתקן זאת.
                              <button
                                type="button"
                                onClick={() => setIsReadMore(!isReadMore)}
                                aria-expanded={!isReadMore}
                                className="read-or-hide"
                              >
                                {isReadMore
                                  ? t("common:moreInfo")
                                  : t("common:showLess")}
                              </button>
                            )
                            : product?.description?.en?.length > 230 && (
                              // ‎<span onClick> אינו נגיש במקלדת ואינו מוכרז
                              // כרכיב לחיץ. ‎<button> + aria-expanded מתקן זאת.
                              <button
                                type="button"
                                onClick={() => setIsReadMore(!isReadMore)}
                                aria-expanded={!isReadMore}
                                className="read-or-hide"
                              >
                                {isReadMore
                                  ? t("common:moreInfo")
                                  : t("common:showLess")}
                              </button>
                            )}
                        </div>}

                      {isGiftOnly ? (
                        <div className="flex items-center mt-4">
                          <div className="w-full rounded-md border border-mainColor-dark bg-mainColor/10 px-4 py-3 text-center text-sm font-semibold text-mainColor-dark">
                            {t("common:giftProductNotPurchasable")}
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center mt-4">
                          <div className="flex flex-wrap items-start justify-start w-full gap-3">
                            <div className="group flex items-center justify-between rounded-md overflow-hidden flex-shrink-0 border h-11 md:h-12 border-gray-300">
                              {/* ‎focus:outline-none ללא תחליף הסתיר לגמרי את
                                  סימון הפוקוס. השכבה הגלובלית ב-custom.css
                                  מחזירה אותו ב-‎:focus-visible, וכאן הוא
                                  מוסר כדי לא להתנגש. */}
                              <button
                                type="button"
                                onClick={() => setItem(item - 1)}
                                disabled={item === 1}
                                aria-label={t("common:decreaseQuantity")}
                                className="flex items-center justify-center flex-shrink-0 h-full transition ease-in-out duration-300 w-11 md:w-12 text-heading border-e border-gray-300 hover:text-gray-500 disabled:opacity-40"
                              >
                                <span className="text-dark text-base">
                                  <FiMinus aria-hidden="true" />
                                </span>
                              </button>
                              {/* ‎aria-live: הכמות משתנה בלחיצה, והפוקוס נשאר
                                  על הכפתור — בלי ההכרזה אין שום משוב. */}
                              <p
                                aria-live="polite"
                                aria-atomic="true"
                                className="font-semibold flex items-center justify-center h-full transition-colors duration-250 ease-in-out cursor-default flex-shrink-0 text-base text-heading w-10 md:w-20 xl:w-24 tabular-nums"
                              >
                                <span className="sr-only">{t("common:quantity")}: </span>
                                {item}
                              </p>
                              <button
                                type="button"
                                onClick={() => setItem(item + 1)}
                                disabled={selectVariant?.quantity <= item}
                                aria-label={t("common:increaseQuantity")}
                                className="flex items-center justify-center h-full flex-shrink-0 transition ease-in-out duration-300 w-11 md:w-12 text-heading border-s border-gray-300 hover:text-gray-500 disabled:opacity-40"
                              >
                                <span className="text-dark text-base">
                                  <FiPlus aria-hidden="true" />
                                </span>
                              </button>
                            </div>
                            {/* במובייל: "הוסף לעגלה" ליד בורר הכמות ו"רכישה מהירה" בשורה נפרדת ברוחב מלא.
                                מ-sm ומעלה: שני הכפתורים בטור אחד לצד בורר הכמות. */}
                            <div className="contents sm:flex sm:flex-col sm:gap-3 sm:flex-1">
                              <MainBT
                                onClick={() => handleAddToCart(product)}
                                className="text-sm flex-1 sm:flex-none w-auto sm:w-full h-12 px-6"
                              >
                                {t("common:addToCart")}
                              </MainBT>
                              <button
                                type="button"
                                onClick={() => handleQuickBuy(product)}
                                className="basis-full sm:basis-auto w-full h-12 px-6 rounded-md bg-[#1d4356] text-white text-sm font-serif font-semibold transition duration-300 hover:bg-[#16333f] focus:outline-none"
                              >
                                {t("common:quickBuy")}
                              </button>
                            </div>
                          </div>
                        </div>
                      )}

                      <div className="flex flex-col mt-4">
                        <span className="font-serif font-semibold py-1 text-sm d-block">
                          <span className="text-gray-800">
                            {t("common:category")}:
                          </span>{" "}
                          {/* ‎<button> בתוך ‎<Link> — ראה ההערה בפירורי הלחם */}
                          <Link
                            href={parentCategory ? `/product-category/${getCategorySlug(parentCategory)}/${getCategorySlug(foundCategory)}` : `/product-category/${getCategorySlug(foundCategory)}`}
                            onClick={() => setIsLoading(!isLoading)}
                            className="text-gray-700 font-serif font-medium underline underline-offset-2 ml-2 hover:text-mainColor-superDark"
                          >
                            {showingTranslateValue(product?.category?.name)}{product?.weight ? "," : ""}
                          </Link>
                          {product?.weight ? (
                            <>
                              {" "}
                              <span className="text-gray-800">{t("common:weight")}: </span>
                              <span className="text-gray-600 font-serif font-medium">{product.weight} ק&quot;ג</span>
                            </>
                          ) : null}
                        </span>
                        <Tags product={product} />
                      </div>

                      {/* <div className="mt-8">
                        <p className="text-xs sm:text-sm text-gray-700 font-medium">
                          Call Us To Order By Mobile Number :{" "}
                          <span className="text-mainColor-dark font-semibold">
                            +0044235234
                          </span>{" "}
                        </p>
                      </div> */}

                      {/* social share */}
                      <div className="mt-2">
                        {/* <h3 className="text-base font-semibold mb-1 font-serif">
                          {t("common:shareYourSocial")}
                        </h3> */}
                        {/* <p className="font-sans text-sm text-gray-500">
                          {t("common:shareYourSocialText")}
                        </p> */}
                        {/* <ul className="flex gap-2 mt-4">
                          <li className="flex items-center text-center border border-gray-100 rounded-full hover:bg-mainColor transition ease-in-out duration-500">
                            <FacebookShareButton
                              url={`https://המתוקים של בני-store-nine.vercel.app/product/${router.query.slug}`}
                              quote=""
                            >
                              <FacebookIcon size={32} round />
                            </FacebookShareButton>
                          </li>
                          <li className="flex items-center text-center border border-gray-100 rounded-full hover:bg-mainColor transition ease-in-out duration-500">
                            <TwitterShareButton
                              url={`https://המתוקים של בני-store-nine.vercel.app/product/${router.query.slug}`}
                              quote=""
                            >
                              <TwitterIcon size={32} round />
                            </TwitterShareButton>
                          </li>
                          <li className="flex items-center text-center border border-gray-100 rounded-full hover:bg-mainColor transition ease-in-out duration-500">
                            <RedditShareButton
                              url={`https://המתוקים של בני-store-nine.vercel.app/product/${router.query.slug}`}
                              quote=""
                            >
                              <RedditIcon size={32} round />
                            </RedditShareButton>
                          </li>
                          <li className="flex items-center text-center border border-gray-100 rounded-full hover:bg-mainColor transition ease-in-out duration-500">
                            <WhatsappShareButton
                              url={`https://המתוקים של בני-store-nine.vercel.app/product/${router.query.slug}`}
                              quote=""
                            >
                              <WhatsappIcon size={32} round />
                            </WhatsappShareButton>
                          </li>
                          <li className="flex items-center text-center border border-gray-100 rounded-full hover:bg-mainColor transition ease-in-out duration-500">
                            <LinkedinShareButton
                              url={`https://המתוקים של בני-store-nine.vercel.app/product/${router.query.slug}`}
                              quote=""
                            >
                              <LinkedinIcon size={32} round />
                            </LinkedinShareButton>
                          </li>
                        </ul> */}
                      </div>
                    </div>
                  </div>

                  {/* shipping description card */}

                  {/* <div className="w-full xl:w-5/12 lg:w-6/12 md:w-5/12">
                        <div className="mt-6 md:mt-0 lg:mt-0 bg-mainColor-superLight border border-gray-100 p-4 lg:p-8 rounded-lg">
                          <Card />
                        </div>
                      </div> */}
                </div>
                {/* </div> */}
                {/* </div> */}
                </div>

                {/* אייקוני חוזקות */}
                <ProductTrustBadges />
              </div>

              {/* related products */}
              {relatedProducts?.length >= 2 && (
                <div className="pt-10 lg:pt-10 lg:pb-10">
                  <div className="flex justify-between items-center mt-5 mb-4 bg-mainColor-light rounded-lg p-3">
                    <MinimalTitle title={t("common:relatedProductsTitle")} />
                  </div>
                  <div className="flex">
                    <div className="w-full">
                      <div className="grid grid-cols-1 xss:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-2 md:gap-3 lg:gap-3">
                        {relatedProducts?.slice(1, 13).map((product, i) => (
                          <ProductCard
                            key={product._id}
                            product={product}
                            attributes={attributes}
                            offers={offers}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </Layout>
      )}
    </>
  );
};

/** Slug מהנתיב (עברית וכו') — נורמליזציה כדי להתאים לערך מה-API */
function normalizeProductSlugParam(s) {
  if (!s || typeof s !== "string") return "";
  let out = s.trim();
  try {
    if (/%[0-9A-Fa-f]{2}/.test(out)) {
      out = decodeURIComponent(out);
    }
  } catch {
    /* נשארים עם המקור */
  }
  try {
    return out.normalize("NFC");
  } catch {
    return out;
  }
}

export const getServerSideProps = async (context) => {
  const raw = context.params?.slug;
  const slugParam = Array.isArray(raw) ? raw[0] : raw;
  if (!slugParam || typeof slugParam !== "string") {
    return { notFound: true };
  }

  const normalizedSlug = normalizeProductSlugParam(slugParam);
  if (!normalizedSlug) {
    return { notFound: true };
  }

  let product = null;
  let relatedProducts = [];
  let attributes = [];

  try {
    const [data, attrs] = await Promise.all([
      ProductServices.getShowingStoreProducts({
        category: "",
        slug: normalizedSlug,
      }),
      AttributeServices.getShowingAttributes({}),
    ]);

    attributes = attrs || [];
    relatedProducts = data?.relatedProducts ?? [];

    const products = data?.products ?? [];
    const matchSlug = (p) => {
      if (!p?.slug) return false;
      return normalizeProductSlugParam(p.slug) === normalizedSlug;
    };

    product =
      products.find(matchSlug) ||
      products.find((p) => p.slug === slugParam.trim()) ||
      products.find((p) => p.slug === normalizedSlug);

    if (!product?._id) {
      try {
        const direct = await ProductServices.getProductBySlug(normalizedSlug);
        if (direct?._id) {
          product = direct;
        } else if (direct?.product?._id) {
          product = direct.product;
        } else if (direct?.data?._id) {
          product = direct.data;
        }
      } catch {
        /* API החזיר 404 או שגיאה */
      }
    }
  } catch (err) {
    console.error("product page getServerSideProps:", err);
    return { notFound: true };
  }

  if (!product?._id) {
    return { notFound: true };
  }

  return {
    props: {
      product,
      relatedProducts,
      attributes,
    },
  };
  // const { slug } = context.params;

  // // Encode the slug to handle special characters
  // const encodedSlug = encodeURIComponent(slug);

  // try {
  //   const product = await ProductServices.getProductBySlug(encodedSlug);

  //   // Ensure no undefined values are serialized
  //   if (product === undefined) {
  //     return {
  //       notFound: true,
  //     };
  //   }

  //   // Handle undefined values in the product object
  //   const serializedProduct = JSON.parse(JSON.stringify(product, (key, value) => {
  //     return value === undefined ? null : value;
  //   }));

  //   return {
  //     props: {
  //       product: serializedProduct,
  //     },
  //   };
  // } catch (error) {
  //   console.error(error);
  //   return {
  //     notFound: true,
  //   };
  // }
};

export default ProductScreen;