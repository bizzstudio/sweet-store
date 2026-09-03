// src/pages/product-category/[categoryName]/[subCategoryName].jsx
import React, { useContext, useEffect, useState } from "react";
import Image from "@component/common/Img";
import useTranslation from "next-translate/useTranslation";

// Internal import
import Layout from "@layout/Layout";
import useFilter from "@hooks/useFilter";
import ProductServices from "@services/ProductServices";
import ProductCard from "@component/product/ProductCard";
import { SidebarContext } from "@context/SidebarContext";
import Loading from "@component/preloader/Loading";
import { useRouter } from "next/router";
import AttributeServices from "@services/AttributeServices";
import MainBT from "@component/button/MainBT";
import CatalogHeader from "@component/category/CatalogHeader";
import useUtilsFunction from "@hooks/useUtilsFunction";

const SubCategoryPage = ({ products, attributes }) => {
    const { t } = useTranslation();
    const { isLoading, setIsLoading, offers, categories } = useContext(SidebarContext);
    const [visibleProduct, setVisibleProduct] = useState(24);
    const router = useRouter();
    const { categoryName, subCategoryName } = router.query; // אלו יכולים להיות slugs או שמות
    const { showingTranslateValue, findMainCategory, findSubCategory, getCategorySlug } = useUtilsFunction();

    // מציאת הקטגוריה הראשית לפי slug או שם
    const currentCategory = findMainCategory(categories, categoryName);

    // מציאת תת-הקטגוריה לפי slug או שם
    const currentSubCategory = findSubCategory(currentCategory, subCategoryName);

    // שמות להצגה
    const displayCategoryName = currentCategory 
        ? showingTranslateValue(currentCategory.name)
        : categoryName;
    
    const displaySubCategoryName = currentSubCategory 
        ? showingTranslateValue(currentSubCategory.name)
        : subCategoryName;

    useEffect(() => {
        setIsLoading(false);
    }, [products]);

    const { setSortedField, productData, sortedField } = useFilter(products);

    return (
        <Layout title={`${displayCategoryName} - ${displaySubCategoryName}`} 
        description={`גלו את מגוון המוצרים בקטגוריה ${displayCategoryName} - ${displaySubCategoryName}. איכות מובטחת, מחירים מעולים ומשלוח מהיר.`}>
            <div className="mx-auto max-w-screen-2xl px-3 sm:px-10">
                <div className="flex pb-5">
                    <div className="flex w-full">
                        <div className="w-full">
                            <CatalogHeader
                                title={displaySubCategoryName}
                                breadcrumbs={[
                                    {
                                        label: displayCategoryName,
                                        href: currentCategory
                                            ? `/product-category/${getCategorySlug(currentCategory)}`
                                            : undefined,
                                    },
                                    { label: displaySubCategoryName },
                                ]}
                                totalProducts={productData?.length}
                                parentCategory={currentCategory}
                                parentCategorySlug={
                                    currentCategory ? getCategorySlug(currentCategory) : null
                                }
                                activeSubCategorySlug={
                                    currentSubCategory ? getCategorySlug(currentSubCategory) : null
                                }
                                sortedField={sortedField}
                                onSortChange={setSortedField}
                            />

                            {productData?.length === 0 && (
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

                            {isLoading ? (
                                <Loading loading={isLoading} />
                            ) : (
                                <>
                                    {/* ראה ההערה ב-[categoryName].jsx: החישוב מ-window.innerWidth
                                        בתוך ה-render נקרא פעם אחת בלבד ואינו מתעדכן בשינוי
                                        גודל חלון. */}
                                    {/* ‎<ul> — ראה ההערה ב-[categoryName].jsx.
                                        ‎key לפי ‎_id ולא לפי אינדקס: עם אינדקס
                                        React ממחזר כרטיס קיים כשהמיון משתנה
                                        ומצב ה"בעגלה" נדבק למוצר הלא נכון. */}
                                    <ul className="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2.5 md:gap-3 list-none p-0">
                                        {productData?.slice(0, visibleProduct).map((product) => (
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

                                    {productData?.length > visibleProduct && (
                                        <div className="w-full flex justify-center mt-6">
                                            <MainBT
                                                onClick={() => setVisibleProduct((pre) => pre + 36)}
                                                className="!w-auto px-8"
                                            >
                                                {t("common:loadMoreBtn")}
                                            </MainBT>
                                        </div>
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

export default SubCategoryPage;

export const getServerSideProps = async (context) => {
    const { subCategoryName } = context.query;

    const [data, attributes] = await Promise.all([
        ProductServices.getShowingStoreProducts({
            category: subCategoryName,
        }),
        AttributeServices.getShowingAttributes({}),
    ]);

    return {
        props: {
            products: data?.products,
            attributes,
        },
    };
};