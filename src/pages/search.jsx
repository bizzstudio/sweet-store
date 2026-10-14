// src/pages/search.jsx
import React, { useCallback, useContext, useEffect, useRef, useState } from "react";
import Image from "@component/common/Img";
import useTranslation from "next-translate/useTranslation";

// Internal import
import Layout from "@layout/Layout";
import ProductServices from "@services/ProductServices";
import ProductCard from "@component/product/ProductCard";
import { SidebarContext } from "@context/SidebarContext";
import Loading from "@component/preloader/Loading";
import AttributeServices from "@services/AttributeServices";
import CategoryServices from "@services/CategoryServices";
import { useRouter } from "next/router";
import Breadcrumbs from "@component/breadcrumb/Breadcrumbs";

// זהה ל-PAGE_SIZE של עמוד הקטגוריה. עד כה החיפוש קיבל limit(100) קשיח מהשרת
// והציג "סה״כ 100 פריטים נמצאו" גם כשהיו יותר — כלומר גם קטיעה שקטה של
// התוצאות וגם מספר שקרי לצידה.
const PAGE_SIZE = 48;

const Search = ({ products, totalProducts, attributes }) => {
  const { t } = useTranslation();
  const { isLoading, setIsLoading, offers } = useContext(SidebarContext);
  const router = useRouter();
  const { query } = router;

  const [items, setItems] = useState(products || []);
  const [total, setTotal] = useState(totalProducts || 0);
  const [page, setPage] = useState(1);
  const [isFetching, setIsFetching] = useState(false);
  const [reachedEnd, setReachedEnd] = useState(false);

  // מונה בקשות — ראו ההסבר ב-pages/product-category/[categoryName].jsx.
  // בחיפוש זה קריטי במיוחד: המשתמש יכול להקליד שאילתה חדשה בזמן ש"טען עוד"
  // עדיין באוויר, ותשובה מאוחרת הייתה מצרפת תוצאות של החיפוש הקודם.
  const requestIdRef = useRef(0);

  useEffect(() => {
    setIsLoading(false);
  }, [products, setIsLoading]);

  // שאילתת חיפוש חדשה מגיעה כ-props חדשים ומאפסת את הרשימה
  useEffect(() => {
    requestIdRef.current += 1;
    setItems(products || []);
    setTotal(totalProducts || 0);
    setPage(1);
    setReachedEnd(false);
    setIsFetching(false);
  }, [products, totalProducts]);

  const fetchPage = useCallback(
    async (nextPage) => {
      const requestId = ++requestIdRef.current;
      setIsFetching(true);
      try {
        const data = await ProductServices.getShowingStoreProducts({
          category: query?._id ? query._id : "",
          title: query?.query ? query.query : "",
          page: nextPage,
          limit: PAGE_SIZE,
          sort: "Popular",
        });
        if (requestId !== requestIdRef.current) return; // בקשה מיושנת
        const fetched = Array.isArray(data?.products) ? data.products : [];

        setItems((prev) => {
          const seen = new Set(prev.map((p) => p._id));
          return [...prev, ...fetched.filter((p) => !seen.has(p._id))];
        });

        if (typeof data?.totalProducts === "number") setTotal(data.totalProducts);
        if (fetched.length < PAGE_SIZE) setReachedEnd(true);
        setPage(nextPage);
      } catch (err) {
        if (requestId !== requestIdRef.current) return;
        console.error("search fetch failed:", err?.message || err);
      } finally {
        if (requestId === requestIdRef.current) setIsFetching(false);
      }
    },
    [query?._id, query?.query]
  );

  const hasMore = !reachedEnd && items.length < total;

  // כניסה ל-‎/search בלי שאילתה (הכפתור בתפריט התחתון) אינה "לא נמצאו תוצאות"
  // אלא "עוד לא חיפשת" — הודעה נפרדת, כדי שהעמוד לא ייראה כמו כישלון חיפוש.
  const hasSearchTerm = Boolean(query?.query || query?._id);

  return (
    <Layout
      title={query?.query ? `${t("common:search")}: ${query.query}` : t("common:search")}
      description={t("common:searchDescription")}
    >
      <div className="mx-auto max-w-screen-2xl px-3 sm:px-10">
        <div className="flex pb-5">
          <div className="flex w-full">
            <div className="w-full">
              <div className="pt-3 pb-2">
                <Breadcrumbs
                  items={[
                    {
                      label: query?.query
                        ? `${t("common:resultsFor")} "${query.query}"`
                        : t("common:search"),
                    },
                  ]}
                />
              </div>

              {/* ‎<h1> — לעמוד החיפוש לא הייתה כותרת ראשית כלל, רק ‎<h6> עם
                  מונה. משתמש קורא-מסך שנחת כאן לא ידע על מה הוא מסתכל. */}
              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-3">
                {query?.query
                  ? `${t("common:resultsFor")} "${query.query}"`
                  : t("common:search")}
              </h1>

              {items.length === 0 && !isFetching ? (
                <div className="flex flex-col items-center text-center align-middle mx-auto p-5 my-5">
                  <Image
                    className="my-4"
                    src="/no-result.svg"
                    alt=""
                    width={400}
                    height={380}
                  />
                  <h2 className="text-lg md:text-xl lg:text-2xl xl:text-2xl text-center mt-2 font-medium font-serif text-gray-600">
                    {hasSearchTerm ? t("common:sorryText") : t("common:searchPrompt")}
                  </h2>
                </div>
              ) : (
                <div className="flex justify-between mb-3 bg-white border border-gray-200 rounded-xl px-4 py-3">
                  {/* ‎role="status" — מספר התוצאות מתעדכן אחרי "טען עוד"
                      ואחרי חיפוש חדש, וצריך להיות מוכרז. */}
                  <p role="status" aria-live="polite" className="text-sm text-gray-800">
                    {t("common:totalI")}{" "}
                    {/* המספר מגיע מ-countDocuments על כל ההתאמות, ולא מאורך
                        העמוד שהתקבל — אחרת הוא מציג את גודל העמוד כסך הכול */}
                    <span className="font-bold text-gray-900">{total}</span>{" "}
                    {t("common:itemsFound")}
                  </p>
                </div>
              )}

              {isLoading ? (
                <Loading loading={isLoading} />
              ) : (
                <>
                  {/* הפריסה נקבעת במחלקות Tailwind בלבד. הגרסה הקודמת חישבה
                      gridTemplateColumns מ-window.innerWidth בתוך ה-render — ערך
                      שנקרא פעם אחת ולא מתעדכן בסיבוב מסך או בשינוי גודל חלון,
                      ומונע כל אפשרות לרנדר את העמוד בשרת. */}
                  {/* ‎<ul> — ראה ההערה ב-pages/product-category/[categoryName].jsx */}
                  <ul className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2.5 md:gap-3 list-none p-0">
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
                    <button
                      type="button"
                      disabled={isFetching}
                      aria-busy={isFetching}
                      onClick={() => fetchPage(page + 1)}
                      className={`w-auto mx-auto mt-6 flex items-center gap-2 font-semibold cursor-pointer transition-all bg-mainColor text-white px-6 py-1.5 h-11 rounded-lg border-mainColor-dark border-b-[4px] hover:brightness-110 hover:-translate-y-[1px] hover:border-b-[6px] active:border-b-[2px] active:brightness-90 active:translate-y-[2px] ${
                        isFetching ? "opacity-40 cursor-not-allowed pointer-events-none" : ""
                      }`}
                    >
                      {isFetching ? t("common:loadingMore") : t("common:loadMoreBtn")}
                    </button>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Search;

// מחזיר את מסלול ה-slugs (הורה/ילד) של קטגוריה לפי slug או שם, או null.
// "+" בכתובת מפוענח כרווח, ולכן ‎?category=ח.ניקוי+ח"פ מגיע לכאן עם רווח —
// משווים אחרי שמיישרים את שני הצדדים.
const normalizeCategoryKey = (value) =>
  String(value ?? "").replace(/\+/g, " ").replace(/\s+/g, " ").trim();

const findCategoryPath = (nodes, identifier, trail = []) => {
  const wanted = normalizeCategoryKey(identifier);
  for (const node of nodes || []) {
    const slug = node.slug || node.name?.he || node.name?.en;
    const path = [...trail, slug];
    if (
      wanted &&
      [node.slug, node.name?.he, node.name?.en].some(
        (candidate) => normalizeCategoryKey(candidate) === wanted
      )
    ) {
      return path;
    }
    const found = findCategoryPath(node.children, identifier, path);
    if (found) return found;
  }
  return null;
};

export const getServerSideProps = async (context) => {
  const { query, _id, category } = context.query;

  // קישורי הפוטר שמוגדרים בפאנל הם בצורת ‎/search?category=<שם>, אבל העמוד הזה
  // מעולם לא קרא את category — ולכן כל קישור כזה נחת על "הקלידו בשורת החיפוש".
  // מפנים לעמוד הקטגוריה עצמו, לפי slug או שם.
  if (category && !_id && !query) {
    try {
      const categories = await CategoryServices.getShowingCategory();
      const path = findCategoryPath(categories?.[0]?.children, String(category).trim());
      if (path) {
        return {
          redirect: {
            destination: `/product-category/${path.map(encodeURIComponent).join("/")}`,
            permanent: false,
          },
        };
      }
    } catch (err) {
      console.error("getServerSideProps (search category):", err?.message || err);
    }
  }

  try {
    const [data, attributes] = await Promise.all([
      ProductServices.getShowingStoreProducts({
        category: _id ? _id : "",
        title: query ? query : "",
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
    // נפילה של ה-API לא צריכה להחזיר 500 על עמוד חיפוש
    console.error("getServerSideProps (search):", err?.message || err);
    return { props: { products: [], totalProducts: 0, attributes: [] } };
  }
};
