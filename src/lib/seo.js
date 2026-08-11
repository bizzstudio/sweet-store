// src/lib/seo.js
import { BASE_PATH, asset } from "@utils/basePath";

export function buildSeo({ defaults = {}, page = {} }) {
  const baseUrl = (defaults.meta_url || "").replace(/\/$/, "");
  const siteName = defaults.meta_title || "המתוקים של בני";
  const title = page.title || defaults.meta_title || siteName;
  const description = page.description || defaults.meta_description || "";
  const image = absUrl(baseUrl, page.image || defaults.meta_img || "/logo/logo-color.png");
  const url = absUrl(baseUrl, page.path || "/");

  return {
    title,
    description,
    canonical: url,
    openGraph: {
      url,
      title,
      description,
      site_name: siteName,
      images: [{ url: image, width: 1200, height: 630, alt: title }],
      type: page.type || "website",
      locale: "he_IL",
    },
    twitter: { cardType: "summary_large_image" },
    additionalLinkTags: [
      ...(defaults.favicon ? [{ rel: "icon", href: absUrl(baseUrl, defaults.favicon) }] : []),
      { rel: "manifest", href: asset("/api/manifest") },
    ],
  };
}

export function withOrigin(defaults, req) {
  const proto = (req.headers["x-forwarded-proto"] || "https").toString().split(",")[0];
  const host = (req.headers["x-forwarded-host"] || req.headers["host"]).toString().split(",")[0];
  // ה-Host שמגיע מה-proxy הוא שורש הדומיין בלבד. כשהחנות יושבת בתת-נתיב
  // (‎/sweet-store) חייבים לצרף אותו, אחרת ה-canonical וה-og:url מצביעים
  // לשורש srv2 — כתובת שאינה החנות.
  const origin = `${proto}://${host}${BASE_PATH}`;
  return { ...defaults, meta_url: defaults?.meta_url || origin };
}

// base כבר כולל את תת-הנתיב (ראה withOrigin), ולכן asset() חל רק כשאין base.
function absUrl(base, pth) {
  if (!pth) return "";
  if (/^https?:\/\//i.test(pth)) return pth;
  if (!base) return asset(pth.startsWith("/") ? pth : `/${pth}`);
  return `${base}/${pth.replace(/^\//, "")}`;
}