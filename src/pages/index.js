// pages/index.js
import React, { useCallback, useContext, useEffect, useRef, useState } from "react";
import Image from "@component/common/Img";
import useTranslation from "next-translate/useTranslation";

// Internal import
import Layout from "@layout/Layout";
import ProductServices from "@services/ProductServices";
import ProductCard from "@component/product/ProductCard";
import { SidebarContext } from "@context/SidebarContext";
import AttributeServices from "@services/AttributeServices";
import MainBT from "@component/button/MainBT";
import CatalogHeader from "@component/category/CatalogHeader";
import { STORE_CLOSED, CLOSED_HOME, LOGIN_PATH } from "@utils/storeMode";

// דף הבית הוא רשימת כל המוצרים — בלי קרוסלה, באנרים, קטגוריות מובלטות,
// מבצעים ובלוג. המבנה זהה לעמוד הקטגוריה (pages/product-category/[categoryName].jsx),
// רק בלי סינון קטגוריה: דפדוף ומיון בצד השרת, 48 מוצרים בכל טעינה.
const PAGE_SIZE = 48;

const Home = ({ products, totalProducts, attributes }) => {
  const { t } = useTranslation();
  const { offers, setIsLoading } = useContext(SidebarContext);

  const [sortedField, setSortedField] = useState("Popular");
  const [items, setItems] = useState(products || []);
  const [total, setTotal] = useState(totalProducts || 0);
  const [page, setPage] = useState(1);
  const [isFetching, setIsFetching] = useState(false);
  const [reachedEnd, setReachedEnd] = useState(false);

  // מונה בקשות — ראו ההסבר ב-pages/product-category/[categoryName].jsx
  const requestIdRef = useRef(0);

  useEffect(() => {
    setIsLoading(false);
  }, [products, setIsLoading]);

  // ניווט חוזר לדף הבית מביא props חדשים ומאפס את הרשימה
  useEffect(() => {
    requestIdRef.current += 1;
    setItems(products || []);
    setTotal(totalProducts || 0);
    setPage(1);
    setSortedField("Popular");
    setReachedEnd(false);
    setIsFetching(false);
  }, [products, totalProducts]);

  const fetchPage = useCallback(async (nextPage, sort, { append }) => {
    const requestId = ++requestIdRef.current;
    setIsFetching(true);
    try {
      const data = await ProductServices.getShowingStoreProducts({
        all: true,
        page: nextPage,
        limit: PAGE_SIZE,
        sort,
      });
      if (requestId !== requestIdRef.current) return; // בקשה מיושנת
      const fetched = Array.isArray(data?.products) ? data.products : [];

      setItems((prev) => {
        if (!append) return fetched;
        const seen = new Set(prev.map((p) => p._id));
        return [...prev, ...fetched.filter((p) => !seen.has(p._id))];
      });

      if (typeof data?.totalProducts === "number") setTotal(data.totalProducts);
      if (fetched.length < PAGE_SIZE) setReachedEnd(true);
      setPage(nextPage);
    } catch (err) {
      if (requestId !== requestIdRef.current) return;
      console.error("home fetch failed:", err?.message || err);
    } finally {
      if (requestId === requestIdRef.current) setIsFetching(false);
    }
  }, []);

  // שינוי מיון מתחיל את הרשימה מחדש מהעמוד הראשון
  const handleSortChange = (value) => {
    if (value === sortedField) return;
    setSortedField(value);
    setReachedEnd(false);
    fetchPage(1, value, { append: false });
  };

  const hasMore = !reachedEnd && items.length < total;

  return (
    <Layout>
      <div className="mx-auto max-w-screen-2xl px-3 sm:px-10">
        <div className="flex pb-5">
          <div className="flex w-full">
            <div className="w-full">
              <CatalogHeader
                title={t("common:allProducts")}
                hideBreadcrumbs
                totalProducts={total}
                sortedField={sortedField}
                onSortChange={handleSortChange}
              />

              {items.length === 0 && !isFetching && (
                <div className="flex flex-col items-center text-center align-middle mx-auto p-5 my-5">
                  <Image
                    className="my-4"
                    src="/no-result.svg"
                    alt=""
                    width={400}
                    height={380}
                  />
                  <h2 className="text-lg md:text-xl lg:text-2xl xl:text-2xl text-center mt-2 font-medium font-serif text-gray-600">
                    {t("common:sorryText")}
                  </h2>
                </div>
              )}

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
                    aria-busy={isFetching}
                    className="!w-auto px-8"
                  >
                    {isFetching ? t("common:loadingMore") : t("common:loadMoreBtn")}
                  </MainBT>
                </div>
              )}
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

export const getServerSideProps = async (context) => {
  const { cookies } = context.req;

  // חסימת דף הבית כשהחנות סגורה. ה-middleware חוסם כאן כל בקשה ישירה, אבל
  // בקשת ה-data של דף הבית (ניווט פנימי בתוך האתר) עוקפת אותו - זו הנקודה
  // היחידה שבה זה קורה, ולכן החסימה חוזרת כאן.
  if (STORE_CLOSED) {
    return {
      redirect: {
        destination: cookies?.userInfo ? CLOSED_HOME : LOGIN_PATH,
        permanent: false,
      },
    };
  }

  // allSettled ולא all: כשל בקריאת המאפיינים לא צריך להפיל את רשימת המוצרים,
  // וכשל במוצרים לא צריך להחזיר 500 על דף הבית.
  const [productsRes, attributesRes] = await Promise.allSettled([
    ProductServices.getShowingStoreProducts({
      all: true,
      page: 1,
      limit: PAGE_SIZE,
      sort: "Popular",
    }),
    AttributeServices.getShowingAttributes(),
  ]);

  for (const [name, result] of [
    ["products", productsRes],
    ["attributes", attributesRes],
  ]) {
    if (result.status === "rejected") {
      console.error(
        `getServerSideProps (index): ${name} failed —`,
        result.reason?.message || result.reason
      );
    }
  }

  const data = productsRes.status === "fulfilled" ? productsRes.value : null;
  const attributes =
    attributesRes.status === "fulfilled" ? attributesRes.value : [];

  return {
    props: {
      products: data?.products ?? [],
      totalProducts: data?.totalProducts ?? 0,
      attributes: attributes ?? [],
    },
  };
};

export default Home;
