import React, { useContext } from "react";
import Link from "next/link";
import Image from "@component/common/Img";
import dynamic from "next/dynamic";
import useTranslation from "next-translate/useTranslation";

import { FaRegCopyright } from "react-icons/fa";

// Internal import
import { UserContext } from "@context/UserContext";
import useGetSetting from "@hooks/useGetSetting";
import CMSkeleton from "@component/preloader/CMSkeleton";
import useUtilsFunction from "@hooks/useUtilsFunction";
import { PAYMENT_DISABLED } from "@utils/paymentDisabled";

const Footer = () => {
  const { t } = useTranslation();

  const {
    state: { userInfo },
  } = useContext(UserContext);
  const { showingTranslateValue } = useUtilsFunction();
  const { loading, storeCustomizationSetting } = useGetSetting();

  // console.log("storeCustomizationSetting?.footer: ", storeCustomizationSetting?.footer)

  return (
    // ‎<footer> ולא ‎<div>: זהו אזור ה-contentinfo של העמוד — פרטי החנות,
    // קישורי המדיניות והרשתות החברתיות. עד עכשיו לא היה באתר אף אזור כזה,
    // ולכן קורא מסך לא יכול היה לקפוץ לתחתית העמוד ישירות.
    <footer className="pb-16 lg:pb-0 xl:pb-0 bg-white">
      <div className="mx-auto max-w-screen-2xl px-4 sm:px-10">
        <div className="grid grid-cols-2 md:grid-cols-7 xl:grid-cols-12 gap-5 sm:gap-9 lg:gap-11 xl:gap-7 py-10 lg:py-16 justify-between">
          {storeCustomizationSetting?.footer?.block1_status && (
            <div className="pb-3.5 sm:pb-0 col-span-1 md:col-span-2 lg:col-span-3">
              <h3 className="text-md lg:leading-7 font-medium mb-4 sm:mb-5 lg:mb-6 pb-0.5">
                <CMSkeleton
                  count={1}
                  height={20}
                  // error={error}
                  loading={loading}
                  data={storeCustomizationSetting?.footer?.block1_title}
                />
              </h3>
              <ul className="text-sm flex flex-col space-y-3">
                <li className="flex items-baseline">
                  <Link
                    href={`${storeCustomizationSetting?.footer?.block1_sub_link1}`}
                    className="text-gray-600 inline-block w-full hover:text-mainColor-dark"
                  >
                    <CMSkeleton
                      count={1}
                      height={10}
                      // error={error}
                      loading={loading}
                      data={
                        storeCustomizationSetting?.footer?.block1_sub_title1
                      }
                    />
                  </Link>
                </li>
                <li className="flex items-baseline">
                  <Link
                    href={`${storeCustomizationSetting?.footer?.block1_sub_link2}`}
                    className="text-gray-600 inline-block w-full hover:text-mainColor-dark"
                  >
                    <CMSkeleton
                      count={1}
                      height={10}
                      // error={error}
                      loading={loading}
                      data={
                        storeCustomizationSetting?.footer?.block1_sub_title2
                      }
                    />
                  </Link>
                </li>
                <li className="flex items-baseline">
                  <Link
                    href={`${storeCustomizationSetting?.footer?.block1_sub_link3}`}
                    className="text-gray-600 inline-block w-full hover:text-mainColor-dark"
                  >
                    {showingTranslateValue(
                      storeCustomizationSetting?.footer_block_one_link_three_title
                    )}
                    <CMSkeleton
                      count={1}
                      height={10}
                      // error={error}
                      loading={loading}
                      data={
                        storeCustomizationSetting?.footer?.block1_sub_title3
                      }
                    />
                  </Link>
                </li>
                <li className="flex items-baseline">
                  <Link
                    href={`${storeCustomizationSetting?.footer?.block1_sub_link4}`}
                    className="text-gray-600 inline-block w-full hover:text-mainColor-dark"
                  >
                    <CMSkeleton
                      count={1}
                      height={10}
                      // error={error}
                      loading={loading}
                      data={
                        storeCustomizationSetting?.footer?.block1_sub_title4
                      }
                    />
                  </Link>
                </li>
              </ul>
            </div>
          )}
          {storeCustomizationSetting?.footer?.block2_status && (
            <div className="pb-3.5 sm:pb-0 col-span-1 md:col-span-2 lg:col-span-3">
              <h3 className="text-md lg:leading-7 font-medium mb-4 sm:mb-5 lg:mb-6 pb-0.5">
                <CMSkeleton
                  count={1}
                  height={20}
                  // error={error}
                  loading={loading}
                  data={storeCustomizationSetting?.footer?.block2_title}
                />
              </h3>
              <ul className="text-sm lg:text-15px flex flex-col space-y-3">
                <li className="flex items-baseline">
                  <Link
                    href={`${storeCustomizationSetting?.footer?.block2_sub_link1}`}
                    className="text-gray-600 inline-block w-full hover:text-mainColor-dark"
                  >
                    <CMSkeleton
                      count={1}
                      height={10}
                      // error={error}
                      loading={loading}
                      data={
                        storeCustomizationSetting?.footer?.block2_sub_title1
                      }
                    />
                  </Link>
                </li>

                <li className="flex items-baseline">
                  <Link
                    href={`${storeCustomizationSetting?.footer?.block2_sub_link2}`}
                    className="text-gray-600 inline-block w-full hover:text-mainColor-dark"
                  >
                    <CMSkeleton
                      count={1}
                      height={10}
                      // error={error}
                      loading={loading}
                      data={
                        storeCustomizationSetting?.footer?.block2_sub_title2
                      }
                    />
                  </Link>
                </li>
                <li className="flex items-baseline">
                  <Link
                    href={`${storeCustomizationSetting?.footer?.block2_sub_link3}`}
                    className="text-gray-600 inline-block w-full hover:text-mainColor-dark"
                  >
                    <CMSkeleton
                      count={1}
                      height={10}
                      // error={error}
                      loading={loading}
                      data={
                        storeCustomizationSetting?.footer?.block2_sub_title3
                      }
                    />
                  </Link>
                </li>
                <li className="flex items-baseline">
                  <Link
                    href={`${storeCustomizationSetting?.footer?.block2_sub_link4}`}
                    className="text-gray-600 inline-block w-full hover:text-mainColor-dark"
                  >
                    <CMSkeleton
                      count={1}
                      height={10}
                      // error={error}
                      loading={loading}
                      data={
                        storeCustomizationSetting?.footer?.block2_sub_title4
                      }
                    />
                  </Link>
                </li>
              </ul>
            </div>
          )}
          {storeCustomizationSetting?.footer?.block3_status && (
            <div className="pb-3.5 sm:pb-0 col-span-1 md:col-span-2 lg:col-span-3">
              <h3 className="text-md lg:leading-7 font-medium mb-4 sm:mb-5 lg:mb-6 pb-0.5">
                <CMSkeleton
                  count={1}
                  height={20}
                  // error={error}
                  loading={loading}
                  data={storeCustomizationSetting?.footer?.block3_title}
                />
              </h3>
              <ul className="text-sm lg:text-15px flex flex-col space-y-3">
                <li className="flex items-baseline">
                  <Link
                    href={`${
                      // userInfo?.email ?
                      storeCustomizationSetting?.footer?.block3_sub_link1
                      // : "#"
                      }`}
                    className="text-gray-600 inline-block w-full hover:text-mainColor-dark"
                  >
                    <CMSkeleton
                      count={1}
                      height={10}
                      // error={error}
                      loading={loading}
                      data={
                        storeCustomizationSetting?.footer?.block3_sub_title1
                      }
                    />
                  </Link>
                </li>
                <li className="flex items-baseline">
                  <Link
                    href={`${
                      // userInfo?.email ?
                      storeCustomizationSetting?.footer?.block3_sub_link2
                      // : "#"
                      }`}
                    className="text-gray-600 inline-block w-full hover:text-mainColor-dark"
                  >
                    <CMSkeleton
                      count={1}
                      height={10}
                      // error={error}
                      loading={loading}
                      data={
                        storeCustomizationSetting?.footer?.block3_sub_title2
                      }
                    />
                  </Link>
                </li>
                <li className="flex items-baseline">
                  <Link
                    href={`${
                      // userInfo?.email ?
                      storeCustomizationSetting?.footer?.block3_sub_link3
                      // : "#"
                      }`}
                    className="text-gray-600 inline-block w-full hover:text-mainColor-dark"
                  >
                    <CMSkeleton
                      count={1}
                      height={10}
                      // error={error}
                      loading={loading}
                      data={
                        storeCustomizationSetting?.footer?.block3_sub_title3
                      }
                    />
                  </Link>
                </li>
                <li className="flex items-baseline">
                  <Link
                    href={`${
                      // userInfo?.email ?
                      storeCustomizationSetting?.footer?.block3_sub_link4
                      // : "#"
                      }`}
                    className="text-gray-600 inline-block w-full hover:text-mainColor-dark"
                  >
                    <CMSkeleton
                      count={1}
                      height={10}
                      // error={error}
                      loading={loading}
                      data={
                        storeCustomizationSetting?.footer?.block3_sub_title4
                      }
                    />
                  </Link>
                </li>
              </ul>
            </div>
          )}
          {storeCustomizationSetting?.footer?.block4_status && (
            <div className="pb-3.5 sm:pb-0 col-span-1 md:col-span-2 lg:col-span-3">
              <Link
                href="/"
                className="mr-3 lg:mr-12 xl:mr-12"
                rel="noreferrer"
              >
                <Image
                  // המידות המוצהרות קובעות את התיבה שהדפדפן שומר לפני שהתמונה
                  // נטענת (הלוגו כאן lazy, מתחת לקפל). 300x300 שמרו ריבוע
                  // ואז התמונה כיווצה אותו לרצועה — קפיצת פריסה של ~150px.
                  // 300x55 הוא היחס האמיתי של הנעילה (5.47:1).
                  width={300}
                  height={55}
                  src={
                    storeCustomizationSetting?.footer?.block4_logo ||
                    "/logo/logo-color.svg"
                  }
                  alt="logo"
                  // ‎aspect-square הוסר: הלוגו הוא נעילה אופקית ביחס 5.47:1,
                  // ובתוך תיבה ריבועית עם object-contain הוא צויר בכ-18% מגובהה
                  // ונראה זעיר בתוך שטח ריק. עכשיו הגובה נגזר מהרוחב לפי היחס.
                  className="sm:w-2/3 w-1/2 h-auto object-contain"
                />
              </Link>
              <p className="leading-7 font-sans text-sm text-gray-600 mt-3">
                <CMSkeleton
                  count={1}
                  height={10}
                  // error={error}
                  loading={loading}
                  data={storeCustomizationSetting?.footer?.block4_address}

                />
                <br />
                <span className="break-words">
                  {t("common:phone")} : {storeCustomizationSetting?.footer?.block4_phone}
                </span>
                <br />
                <span className="break-words">
                  {t("common:email")} : {storeCustomizationSetting?.footer?.block4_email}
                </span>
              </p>
            </div>
          )}
        </div>

        {(storeCustomizationSetting?.footer?.bottom_contact_status ||
          (!PAYMENT_DISABLED && storeCustomizationSetting?.footer?.payment_method_status)) && (
          <>
            <hr className="hr-line"></hr>

            <div className="mx-auto max-w-screen-2xl px-4 sm:px-10 bg-mainColor-superLight shadow-sm border border-mainColor-superLight rounded-lg">
              <div className="flex flex-col sm:flex-row gap-6 sm:gap-8 lg:gap-11 py-6 sm:py-8 items-center justify-center sm:justify-evenly">
                {/* Contact Info - Second Column */}
                {storeCustomizationSetting?.footer?.bottom_contact_status && (
                  <div className="col-span-1 text-center order-2">
                    <div>
                      <p className="text-sm sm:text-base leading-7 font-medium block mb-2">
                        {t("common:footer-call-us")}
                      </p>
                      <h5 className="text-lg sm:text-xl lg:text-2xl font-bold text-black leading-7">
                        {/* +012345-67900 */}
                        {storeCustomizationSetting?.footer?.bottom_contact}
                      </h5>
                    </div>
                  </div>
                )}

                {/* Payment Methods - Third Column */}
                {/*
                  * חנות ללא תשלום (ראה src/utils/paymentDisabled.js): לוגואי
                  * חברות האשראי מבטיחים סליקה באתר שלא קיימת כרגע.
                  */}
                {!PAYMENT_DISABLED && storeCustomizationSetting?.footer?.payment_method_status && (
                  <div className="col-span-1 order-3">
                    <div className="text-center lg:text-right">
                      <ul>
                        <li className="transition hover:opacity-80 inline-flex w-full justify-center lg:justify-end">
                          <Image
                            width={350}
                            height={200}
                            className="w-full max-w-[300px] sm:max-w-[350px] h-auto"
                            src={
                              storeCustomizationSetting?.footer?.payment_method_img ||
                              "/payment-method/payment-logo.png"
                            }
                            alt="payment method"
                          />
                        </li>
                      </ul>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>

      <div className="mx-auto max-w-screen-2xl px-3 sm:px-10 flex justify-center py-4">
        <div className="flex sm:flex-row flex-col items-center sm:gap-2 gap-1 text-sm text-gray-500 leading-6">
          <span className="flex items-center gap-1">
            <FaRegCopyright /> כל הזכויות שמורות{" "}
            <Link
              href="/תקנון-אתר"
              target="_blank"
              rel="noopener noreferrer"
              className="text-mainColor-dark"
            >
              להמתוקים של בני
            </Link>
          </span>
          <hr className="sm:h-4 sm:w-[1px] h-[1px] w-7 bg-gray-400" />
          <span className="text-center">
            האתר נבנה על ידי
            <Link
              href="https://bizzstudio.co.il/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-mainColor-dark"
            > Bizz Studio</Link> בית תוכנה ובניית אתרים בע"מ
          </span>
        </div>
      </div>

    </footer>
  );
};

export default dynamic(() => Promise.resolve(Footer), { ssr: false });
