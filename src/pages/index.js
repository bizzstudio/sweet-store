// pages/index.js
import { SidebarContext } from "@context/SidebarContext";
import { Suspense, useContext, useEffect, useRef, useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";

// Internal import
import Layout from "@layout/Layout";
import Banner from "@component/banner/Banner";
import useGetSetting from "@hooks/useGetSetting";
import CardTwo from "@component/cta-card/CardTwo";
import OfferCard from "@component/offer/OfferCard";
import StickyCart from "@component/cart/StickyCart";
import Loading from "@component/preloader/Loading";
import ProductServices from "@services/ProductServices";
import ProductCard from "@component/product/ProductCard";
import MainCarousel from "@component/carousel/MainCarousel";
import FeatureCategory from "@component/category/FeatureCategory";
import AttributeServices from "@services/AttributeServices";
import BlogServices from "@services/BlogServices";
import BlogCard from "@component/blog/BlogCard";
import MainBT from "@component/button/MainBT";
import CMSkeleton from "@component/preloader/CMSkeleton";
import { MdKeyboardDoubleArrowLeft } from "react-icons/md";
import useTranslation from "next-translate/useTranslation";
import MinimalTitle from "@component/common/MinimalTitle";
import useUtilsFunction from "@hooks/useUtilsFunction";
import useFilter from "@hooks/useFilter";
import { STORE_CLOSED, CLOSED_HOME, LOGIN_PATH } from "@utils/storeMode";

const Home = ({ popularProducts, discountProducts, attributes, blogs, totalBlogs }) => {
  const router = useRouter();
  const { isLoading, setIsLoading, offers } = useContext(SidebarContext);
  const { loading, error, storeCustomizationSetting } = useGetSetting();
  const { t } = useTranslation();
  const [fakeLoading, setFakeLoading] = useState(true)

  const { showingTranslateValue } = useUtilsFunction();

  // מיון מוצרים פופולריים
  const { productData: sortedPopularProducts } = useFilter(popularProducts);

  // מיון מוצרים בהנחה
  const { productData: sortedDiscountProducts } = useFilter(discountProducts);

  useEffect(() => {
    if (router.asPath === "/") {
      setIsLoading(false);
    } else {
      setIsLoading(false);
    }
  }, [router]);

  // האזנה לגודל הקרוסלה וקביעת גובה הקונטיינר של המבצעים לאחר מכן
  const carouselRef = useRef(null);
  const [carouselHeight, setCarouselHeight] = useState(0);
  useEffect(() => {
    const updateCarouselHeight = () => {
      if (carouselRef.current) {
        setCarouselHeight(carouselRef.current.offsetHeight);
      }
    };

    if (fakeLoading) {
      updateCarouselHeight();

      const resizeObserver = new ResizeObserver(() => {
        updateCarouselHeight();
      });

      if (carouselRef.current) {
        resizeObserver.observe(carouselRef.current);
      }

      return () => {
        if (carouselRef.current) {
          resizeObserver.unobserve(carouselRef.current);
        }
      };
    }
  }, [fakeLoading, carouselRef.current]);

  if (storeCustomizationSetting?.home?.popular_products_status && popularProducts && discountProducts && attributes && Array.isArray(offers) && fakeLoading) {
    return (
      <>
        {isLoading ? (
          <Loading loading={isLoading} />
        ) : (
          <Layout>
            <div className="min-h-screen w-full max-w-full overflow-hidden">
              <div className="bg-white">
                <div className="mx-auto sm:py-5 max-w-screen-2x1 px-3 sm:px-10">
                  {/* פאנל המבצעים מוצג רק כשיש מה להציג בו. OfferCard מרנדר את
                      הכותרת "מבצעים אחרונים" גם ברשימה ריקה, וכשאין בקטלוג אף
                      מוצר בהנחה התוצאה הייתה קופסה ריקה לצד הקרוסלה. במצב הזה
                      הקרוסלה מקבלת את מלוא הרוחב במקום שישית ריקה. */}
                  <div className="flex flex-col lg:flex-row gap-6 mx-auto py-5 max-w-screen-2xl px-3 sm:px-10">
                    <div
                      ref={carouselRef}
                      className={`flex-shrink-0 lg:block h-fit w-full ${discountProducts?.length > 0 ? "lg:w-3/5" : "lg:w-full"
                        }`}
                    >
                      <MainCarousel />
                    </div>
                    {discountProducts?.length > 0 && (
                      <div className="w-full hidden lg:flex">
                        <OfferCard
                          discountProducts={discountProducts}
                          // קבלת הגובה של הבאנר המתחלף (קרוסלה)
                          height={carouselHeight}
                          attributes={attributes}
                        />
                      </div>
                    )}
                  </div>
                  {storeCustomizationSetting?.home?.promotion_banner_status && (
                    <div className="bg-gray-100 px-10 py-6 mt-6">
                      <Banner />
                    </div>
                  )}
                </div>
              </div>

              {/* feature category's */}
              {storeCustomizationSetting?.home?.featured_status && (
                <div className="hidden md:block bg-gray-100 lg:py-12 py-10">
                  <div className="mx-auto max-w-screen-2x1 px-3 sm:px-10">
                    {/* כותרת ותיאור */}
                    {(showingTranslateValue(storeCustomizationSetting?.home?.feature_title) || showingTranslateValue(storeCustomizationSetting?.home?.feature_description)) && (
                      <div className="mb-10 flex justify-center">
                        <div className="text-center w-full lg:w-2/5">
                          <h2 className="text-xl lg:text-2xl mb-2 font-serif font-semibold">
                            <CMSkeleton
                              count={1}
                              height={30}
                              // error={error}
                              loading={loading}
                              data={storeCustomizationSetting?.home?.feature_title}
                            />
                          </h2>
                          <div className="text-base font-sans text-gray-600 leading-6">
                            <CMSkeleton
                              count={4}
                              height={10}
                              error={error}
                              loading={loading}
                              data={
                                storeCustomizationSetting?.home?.feature_description
                              }
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    <FeatureCategory />
                  </div>
                </div>
              )}

              {/* popular products */}
              {storeCustomizationSetting?.home?.popular_products_status && (
                <div className="bg-mainColor-superLight lg:pt-10 lg:pb-4 py-4 mx-auto max-w-screen-2xl px-3 sm:px-10">
                  <div className="w-full sm:mb-9 mb-5 bg-mainColor-light rounded p-3">
                    <CMSkeleton
                      count={1}
                      height={30}
                      error={error}
                      loading={loading}
                      title={storeCustomizationSetting?.home?.popular_title}
                      subTitle={storeCustomizationSetting?.home?.popular_description}
                    // data={popolarTitle.src}
                    // isImage={true}
                    />
                  </div>

                  {/* כרטיסי המוצרים הפופולריים */}
                  <div className="flex">
                    <div className="w-full">
                      {loading ? (
                        <CMSkeleton
                          count={20}
                          height={20}
                          error={error}
                          loading={loading}
                        />
                      ) : (
                        <div className="grid grid-cols-1 xss:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-2 md:gap-3 lg:gap-3">
                          {sortedPopularProducts
                            ?.slice(
                              0,
                              storeCustomizationSetting?.home
                                ?.popular_product_limit
                            )
                            .map((product) => (
                              <ProductCard
                                key={product._id}
                                product={product}
                                attributes={attributes}
                                offers={offers}
                              />
                            ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* promotional banner card */}
              {storeCustomizationSetting?.home?.delivery_status && (
                // <div className="block mx-auto max-w-screen-2xl">
                <div className="w-full">
                  {/* <div className="lg:p-16 p-6 bg-mainColor shadow-sm border rounded-lg"> */}
                  <CardTwo />
                  {/* </div> */}
                </div>
                // </div>
              )}

              {/* discounted products */}
              {storeCustomizationSetting?.home?.discount_product_status &&
                discountProducts?.length > 0 && (
                  <div
                    id="discount"
                    className="bg-mainColor-superLight lg:py-10 py-4 mx-auto max-w-screen-2xl px-3 sm:px-10"
                  >
                    <div className="w-full sm:mb-9 mb-5 bg-mainColor-light rounded p-3">
                      <CMSkeleton
                        count={1}
                        height={30}
                        error={error}
                        loading={loading}
                        title={storeCustomizationSetting?.home?.latest_discount_title}
                        subTitle={storeCustomizationSetting?.home?.latest_discount_description}
                      // data={popolarTitle.src}
                      // isImage={true}
                      />
                    </div>

                    {/* כרטיסי המוצרים שבמבצע */}
                    <div className="flex">
                      <div className="w-full">
                        {loading ? (
                          <CMSkeleton
                            count={20}
                            height={20}
                            error={error}
                            loading={loading}
                          />
                        ) : (
                          <div className="grid grid-cols-1 xss:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-2 md:gap-3 lg:gap-3">
                            {sortedDiscountProducts
                              ?.slice(
                                0,
                                storeCustomizationSetting?.home
                                  ?.latest_discount_product_limit
                              )
                              .map((product, index) => (
                                <ProductCard
                                  key={product._id + index}
                                  product={product}
                                  attributes={attributes}
                                  offers={offers}
                                />
                              ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

              {/* Blog Section */}
              {blogs && blogs.length > 0 && (
                <div className="bg-mainColor-light px-3 sm:px-10 md:px-14 lg:px-20 2xl:px-40 py-5">
                  <div className="flex justify-between items-center my-3 bg-mainColor-superLight border border-gray-100 rounded-md p-3">
                    <MinimalTitle title={t("common:blogsTitle")} subtitle={t("common:blogsSubtitle")} />
                  </div>

                  {/* Blog Cards */}
                  <div className="flex overflow-x-auto gap-4 md:gap-6 mb-8 pb-4 scrollbar-hide">
                    <div className="flex gap-4 md:gap-6 min-w-full sm:grid sm:grid-cols-2 lg:grid-cols-3 sm:min-w-0">
                      {blogs.map((blog) => (
                        <div key={blog._id} className="w-80 sm:w-auto flex-shrink-0 sm:flex-shrink flex">
                          <BlogCard blog={blog} isHome={true} />
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* View All Blogs Button */}
                  {totalBlogs > 3 && (
                    <div className="flex justify-center">
                      <Link href="/blogs">
                        <MainBT className="!w-auto px-6 py-3 text-base">
                          <div className="flex justify-center items-center gap-2">
                            {t("common:allBlogs")}
                            <MdKeyboardDoubleArrowLeft size={24} className="mt-[3px]" />
                          </div>
                        </MainBT>
                      </Link>
                    </div>
                  )}
                </div>
              )}
            </div>
          </Layout>
        )}
      </>
    );
  } else {
    return <Loading loading={true} />;
  }
};

export const getServerSideProps = async (context) => {
  const { cookies } = context.req;
  const { query, _id } = context.query;

  // חסימת דף הבית כשהחנות סגורה. ה-middleware חוסם כאן כל בקשה ישירה, אבל
  // בקשת ה-data של דף הבית (ניווט פנימי בתוך האתר) עוקפת אותו - זו הנקודה
  // היחידה שבה זה קורה, ולכן החסימה חוזרת כאן. בונוס: חוסך שלוש קריאות API
  if (STORE_CLOSED) {
    return {
      redirect: {
        destination: cookies?.userInfo ? CLOSED_HOME : LOGIN_PATH,
        permanent: false,
      },
    };
  }

  const fallbackProps = {
    popularProducts: [],
    discountProducts: [],
    cookies: cookies ?? {},
    attributes: [],
    blogs: [],
    totalBlogs: 0,
    error: true,
  };

  try {
    const [data, attributes, blogsData] = await Promise.all([
      ProductServices.getShowingStoreProducts({
        category: _id ? _id : "",
        title: query ? query : "",
      }),

      AttributeServices.getShowingAttributes(),

      BlogServices.getPublishedBlogs({
        page: 1,
        limit: 3,
        category: "",
        tag: ""
      }),
    ]);

    const sortedPopularProducts = data?.popularProducts ?? [];
    const sortedDiscountProducts = data?.discountedProducts ?? [];

    return {
      props: {
        popularProducts: sortedPopularProducts,
        discountProducts: sortedDiscountProducts,
        cookies: cookies ?? {},
        attributes: attributes ?? [],
        blogs: blogsData?.blogs ?? [],
        totalBlogs: blogsData?.totalBlogs ?? 0,
        error: false,
      },
    };
  } catch (err) {
    console.error("getServerSideProps (index):", err?.message || err);
    return { props: fallbackProps };
  }
};

export default Home;