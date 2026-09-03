// src/pages/product-category/[categoryName].jsx
import React, { useContext, useEffect, useState, useCallback, useRef } from "react";
import Image from "@component/common/Img";
import useTranslation from "next-translate/useTranslation";

// Internal import
import Layout from "@layout/Layout";
import ProductServices from "@services/ProductServices";
import ProductCard from "@component/product/ProductCard";
import { SidebarContext } from "@context/SidebarContext";
import { useRouter } from "next/router";
import AttributeServices from "@services/AttributeServices";
import MainBT from "@component/button/MainBT";
import CatalogHeader from "@component/category/CatalogHeader";
import useUtilsFunction from "@hooks/useUtilsFunction";

// כמה מוצרים נטענים בכל פעם. הקטגוריה הגדולה בחנות מונה ~3,600 מוצרים, ולכן
// אי אפשר לשלוח את כולם ב-props של העמוד (המערך המלא נשלח פעמיים — פעם ב-HTML
// ופעם ב-JSON של ההידרציה, ~3MB לקטגוריה). הדפדוף הוא בצד השרת, ו"טען עוד"
// מושך את העמוד הבא בלבד.
const PAGE_SIZE = 48;

const CategoryPage = ({ products, totalProducts, attributes }) => {
    const { t } = useTranslation();
    const { offers, categories, setIsLoading } = useContext(SidebarContext);
    const router = useRouter();
    const { categoryName } = router.query; // זה יכול להיות slug או שם
    const { showingTranslateValue, findMainCategory, getCategorySlug } = useUtilsFunction();

    // מציאת הקטגוריה המלאה לפי slug או שם
    const currentCategory = findMainCategory(categories, categoryName);

    // שם הקטגוריה להצגה
    const displayCategoryName = currentCategory
        ? showingTranslateValue(currentCategory.name)
        : categoryName;

    // המיון עבר לצד השרת: מיון בדפדפן היה ממיין רק את המוצרים שכבר נטענו,
    // כלומר "מהזול ליקר" היה מחזיר את הזול מבין 48 ולא מבין 3,600.
    const [sortedField, setSortedField] = useState("Popular");
    const [items, setItems] = useState(products || []);
    const [total, setTotal] = useState(totalProducts || 0);
    const [page, setPage] = useState(1);
    const [isFetching, setIsFetching] = useState(false);
    // העמוד האחרון הגיע חלקי — סימן שאין יותר מה למשוך, גם אם total גדול יותר
    // (הקטלוג יכול להשתנות בין בקשה לבקשה)
    const [reachedEnd, setReachedEnd] = useState(false);

    // מונה בקשות: תשובה של בקשה שכבר הוחלפה (החלפת מיון, מעבר קטגוריה, לחיצה
    // כפולה) חייבת להיזרק. בלעדיו שתי בקשות שחוזרות בסדר הפוך משאירות על המסך
    // את התוצאה של הבקשה הישנה יותר.
    const requestIdRef = useRef(0);

    // CategoryCarousel מדליק את isLoading הגלובלי לפני הניווט לכאן ומסתמך על
    // עמוד היעד לכבות אותו — בדיוק כמו בדף הבית ובחיפוש.
    useEffect(() => {
        setIsLoading(false);
    }, [products, setIsLoading]);

    // מעבר בין קטגוריות משתמש באותה קומפוננטה, ולכן ה-state חייב להתאפס
    // כשמגיעים props חדשים — אחרת נשארים המוצרים של הקטגוריה הקודמת.
    useEffect(() => {
        requestIdRef.current += 1; // פוסל בקשות שעדיין באוויר מהקטגוריה הקודמת
        setItems(products || []);
        setTotal(totalProducts || 0);
        setPage(1);
        setSortedField("Popular");
        setReachedEnd(false);
        setIsFetching(false);
    }, [products, totalProducts]);

    const fetchPage = useCallback(
        async (nextPage, sort, { append }) => {
            const requestId = ++requestIdRef.current;
            setIsFetching(true);
            try {
                const data = await ProductServices.getShowingStoreProducts({
                    category: categoryName,
                    page: nextPage,
                    limit: PAGE_SIZE,
                    sort,
                });
                if (requestId !== requestIdRef.current) return; // בקשה מיושנת
                const fetched = Array.isArray(data?.products) ? data.products : [];

                setItems((prev) => {
                    if (!append) return fetched;
                    // הגנה מפני מפתחות כפולים ב-React: אם הקטלוג השתנה בין
                    // בקשה לבקשה, אותו מוצר יכול לחזור בשני עמודים עוקבים.
                    const seen = new Set(prev.map((p) => p._id));
                    return [...prev, ...fetched.filter((p) => !seen.has(p._id))];
                });

                if (typeof data?.totalProducts === "number") setTotal(data.totalProducts);
                if (fetched.length < PAGE_SIZE) setReachedEnd(true);
                setPage(nextPage);
            } catch (err) {
                if (requestId !== requestIdRef.current) return;
                console.error("category fetch failed:", err?.message || err);
            } finally {
                if (requestId === requestIdRef.current) setIsFetching(false);
            }
        },
        [categoryName]
    );

    // שינוי מיון מתחיל את הרשימה מחדש מהעמוד הראשון
    const handleSortChange = (value) => {
        if (value === sortedField) return;
        setSortedField(value);
        setReachedEnd(false);
        fetchPage(1, value, { append: false });
    };

    const hasMore = !reachedEnd && items.length < total;

    return (
        <Layout title={displayCategoryName}
            description={`גלו את מגוון המוצרים בקטגוריית ${displayCategoryName}. איכות מובטחת, מחירים מעולים ומשלוח מהיר.`}
        >
            <div className="mx-auto max-w-screen-2xl px-3 sm:px-10">
                <div className="flex pb-5">
                    <div className="flex w-full">
                        <div className="w-full">
                            <CatalogHeader
                                title={displayCategoryName}
                                breadcrumbs={[{ label: displayCategoryName }]}
                                totalProducts={total}
                                parentCategory={currentCategory}
                                parentCategorySlug={
                                    currentCategory ? getCategorySlug(currentCategory) : null
                                }
                                sortedField={sortedField}
                                onSortChange={handleSortChange}
                            />

                            {items.length === 0 && !isFetching && (
                                <div className="flex flex-col items-center text-center align-middle mx-auto p-5 my-5">
                                    <Image
                                        className="my-4"
                                        src="/no-result.svg"
                                        alt="no-result"
                                        width={400}
                                        height={380}
                                    />
                                    <h2 className="text-lg md:text-xl lg:text-2xl xl:text-2xl text-center mt-2 font-medium font-serif text-gray-600">
                                        {t("common:sorryText")}
                                    </h2>
                                </div>
                            )}

                            {/* הפריסה נקבעת במחלקות Tailwind בלבד. הגרסה הקודמת חישבה
                                gridTemplateColumns מ-window.innerWidth בתוך ה-render —
                                ערך שנקרא פעם אחת ולא מתעדכן בסיבוב מסך או בשינוי גודל
                                חלון, ומונע כל אפשרות לרנדר את העמוד בשרת. */}
                            {/* ‎<ul> ולא ‎<div>: קורא מסך מכריז "רשימה בת 48
                                פריטים" ומאפשר קפיצה בין הפריטים. ‎list-none
                                נדרש כי ‎@tailwind base מאפס את הסימון ממילא.
                                ‎xl:grid-cols-6 הורד ל-5: בשש עמודות הכרטיס
                                צר מכדי להכיל שם מוצר בשתי שורות + כפתור
                                "הוסף לסל" עם טקסט. */}
                            <ul className="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2.5 md:gap-3 list-none p-0">
                                {items.map((product) => (
                                    <li key={product._id} className="flex">
                                        <div className="w-full">
                                            <ProductCard
                                                product={product}
                                                attributes={attributes}
                                                offers={offers}
                                            />
                                        </div>
                                    </li>
                                ))}
                            </ul>

                            {hasMore && (
                                <div className="w-full flex justify-center mt-6">
                                    <MainBT
                                        disabled={isFetching}
                                        onClick={() => fetchPage(page + 1, sortedField, { append: true })}
                                        // ‎aria-busy: הכפתור מתחלף לטקסט "טוען"
                                        // אבל בלי זה קורא מסך לא מכריז את השינוי
                                        aria-busy={isFetching}
                                        className="!w-auto px-8"
                                    >
                                        {isFetching ? t("common:loadingMore") : t("common:loadMoreBtn")}
                                    </MainBT>
                                </div>
                            )}
                            {/* אזור הכרזה חי: אחרי "טען עוד" הפוקוס נשאר על
                                הכפתור ואין שום סימן שמוצרים חדשים נוספו. */}
                            <p className="sr-only" role="status" aria-live="polite">
                                {items.length} / {total}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default CategoryPage;

export const getServerSideProps = async (context) => {
    const { categoryName } = context.query;

    try {
        const [data, attributes] = await Promise.all([
            ProductServices.getShowingStoreProducts({
                category: categoryName,
                page: 1,
                limit: PAGE_SIZE,
                sort: "Popular",
            }),
            AttributeServices.getShowingAttributes({}),
        ]);

        return {
            props: {
                products: data?.products ?? [],
                totalProducts: data?.totalProducts ?? 0,
                attributes: attributes ?? [],
            },
        };
    } catch (err) {
        // נפילה של ה-API לא צריכה להחזיר 500 על עמוד קטגוריה — עדיף עמוד ריק
        // עם הודעת "לא נמצאו מוצרים" מאשר מסך שגיאה של Next.
        console.error("getServerSideProps (product-category):", err?.message || err);
        return { props: { products: [], totalProducts: 0, attributes: [] } };
    }
};
