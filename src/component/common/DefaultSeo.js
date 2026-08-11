// src/component/common/DefaultSeo.js
import React from "react";
import { DefaultSeo as NextSeo } from "next-seo";

// Internal import
import useGetSetting from "@hooks/useGetSetting";
import { asset } from "@utils/basePath";

const DefaultSeo = () => {
  const { storeCustomizationSetting } = useGetSetting() || {};
  const { seo } = storeCustomizationSetting || {};
  const { favicon, meta_description, meta_img, meta_keywords, meta_title, meta_url } = seo || {};

  return (
    <NextSeo
      title={meta_title || "המתוקים של בני"}
      openGraph={{
        type: "website",
        locale: "he_IL",
        url: meta_url || "https://tmarim-betomer.com",
        site_name: meta_title || "המתוקים של בני",
      }}
      twitter={{
        handle: "@handle",
        site: "@site",
        cardType: "summary_large_image",
      }}
      additionalMetaTags={[
        {
          name: "viewport",
          content:
            "minimum-scale=1, initial-scale=1, width=device-width, shrink-to-fit=no, viewport-fit=cover",
        },
        {
          name: "mobile-web-app-capable",
          content: "yes",
        },
        {
          name: "apple-mobile-web-app-capable",
          content: "yes",
        },
        {
          name: "theme-color",
          content: "#ffffff",
        },
      ]}
      additionalLinkTags={[
        {
          rel: "apple-touch-icon",
          href: asset("/logo/logo-square-180.png"),
        },
        {
          rel: "manifest",
          href: asset("/api/manifest"),
        },
      ]}
    />
  );
};

export default DefaultSeo;