// src/pages/api/sitemap.js
import CategoryServices from "@services/CategoryServices";
import ProductServices from "@services/ProductServices";
import { BASE_PATH } from "@utils/basePath";

/*
 * כתובת הבסיס של מפת האתר.
 *
 * הייתה כאן כתובת קשיחה של הפרויקט שממנו הועתקה החנות (tmarim-betomer.com),
 * כלומר מפת האתר הפנתה את כל הקטלוג לאתר אחר. הסדר כאן:
 *   1. NEXT_PUBLIC_SITE_URL — אם הוגדר, זו הכתובת הקנונית.
 *   2. הכתובת שממנה הגיעה הבקשה בפועל — נכון גם בלי להגדיר משתנה סביבה.
 * בשני המקרים מתווסף BASE_PATH: החנות מוגשת מתת-תיקייה (/sweet-store), ובלעדיו
 * כל כתובת במפה מצביעה לשורש הדומיין ומחזירה 404.
 */
const resolveBaseUrl = (req) => {
  const configured = (process.env.NEXT_PUBLIC_SITE_URL || "").trim();
  if (configured) return configured.replace(/\/+$/, "");

  const proto =
    (req.headers["x-forwarded-proto"] || "https").toString().split(",")[0].trim() ===
    "http"
      ? "http"
      : "https";

  /*
   * ‏Host ו-X-Forwarded-Host נשלטים בידי מי ששולח את הבקשה. בלי אימות אפשר
   * לבקש את המפה עם Host מזויף ולקבל XML שכל הכתובות בו מצביעות לאתר אחר
   * (Host header injection) — ואם שכבת cache כלשהי תשמור את התשובה, גם גולשים
   * אחרים יקבלו אותה. האימות כאן מוודא שמדובר בשם מארח בלבד: אותיות, ספרות,
   * נקודות ומקפים, ואופציונלית פורט. כל תו אחר (לוכסן, רווח, CRLF) נפסל.
   *
   * זו הקשחה, לא פתרון: הדרך הנכונה היא להגדיר NEXT_PUBLIC_SITE_URL.
   */
  const rawHost = (req.headers["x-forwarded-host"] || req.headers.host || "")
    .toString()
    .split(",")[0]
    .trim();

  const host = /^[A-Za-z0-9.-]+(:\d{1,5})?$/.test(rawHost) ? rawHost : "";

  // בלי מארח תקין עדיף להחזיר כתובות יחסיות מאשר כתובות שגויות
  if (!host) return BASE_PATH.replace(/\/+$/, "");

  return `${proto}://${host}${BASE_PATH}`.replace(/\/+$/, "");
};

// תווים שאסורים כמות שהם בתוך <loc>
const xmlEscape = (value) =>
  String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");

// סגמנט נתיב בעברית חייב להיות מקודד ב-<loc>; encodeURI לבדו משאיר אותו גולמי
const encodePath = (path) =>
  String(path)
    .split("/")
    .map((segment) => encodeURIComponent(segment))
    .join("/");

const loc = (baseUrl, path) => xmlEscape(`${baseUrl}${encodePath(path)}`);

export default async function handler(req, res) {
  try {
    const baseUrl = resolveBaseUrl(req);

    /*
     * עמודים סטטיים.
     *
     * ‎/best-sellers ו-/purchased-products הוסרו: אין להם עמוד בפרויקט, ולכן כל
     * סריקה של גוגל קיבלה עליהם 404. אם הם ייבנו בעתיד — להחזיר לכאן.
     */
    const staticPages = [
      '',
      '/עלינו',
      '/צרו-קשר',
      '/offers',
      '/faqs',
      '/privacy-policy',
      '/תקנון-אתר',
      '/accessibility-statement',
    ];

    // Get categories
    let categoriesData = [];
    try {
      categoriesData = await CategoryServices.getShowingCategory() || [];
    } catch (error) {
      console.error('Error fetching categories:', error);
    }

    // Get products (limited to avoid timeout)
    let products = [];
    try {
      const productData = await ProductServices.getShowingProducts();
      products = productData || [];
    } catch (error) {
      console.error('Error fetching products:', error);
    }

    // Helper function to get category slug
    const getCategorySlug = (category) => {
      if (!category) return "";
      if (category.slug) {
        return category.slug;
      }
      // Fallback to Hebrew name if no slug
      return category.name?.he || category.name?.en || "";
    };

    // Generate category URLs
    const generateCategoryUrls = (categories) => {
      let urls = [];
      
      categories.forEach(category => {
        // Main category URL
        const categorySlug = getCategorySlug(category);
        if (categorySlug) {
          urls.push(`
  <url>
    <loc>${loc(baseUrl, `/product-category/${categorySlug}`)}</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>`);
        }

        // Sub-category URLs
        if (category.children && category.children.length > 0) {
          category.children.forEach(subCategory => {
            const subCategorySlug = getCategorySlug(subCategory);
            if (subCategorySlug) {
              urls.push(`
  <url>
    <loc>${loc(baseUrl, `/product-category/${categorySlug}/${subCategorySlug}`)}</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.6</priority>
  </url>`);
            }
          });
        }
      });
      
      return urls.join('');
    };

    // Generate sitemap XML
    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${staticPages.map(page => `
  <url>
    <loc>${loc(baseUrl, page)}</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>daily</changefreq>
    <priority>${page === '' ? '1.0' : '0.8'}</priority>
  </url>`).join('')}
  
  ${categoriesData.length > 0 && categoriesData[0].children ? generateCategoryUrls(categoriesData[0].children) : ''}
  
  ${products.map(product => `
  <url>
    <loc>${loc(baseUrl, `/product/${product.slug}`)}</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.5</priority>
  </url>`).join('')}
</urlset>`;

    res.setHeader('Content-Type', 'application/xml');
    res.status(200).send(sitemap);
  } catch (error) {
    console.error('Sitemap generation error:', error);
    res.status(500).json({ error: 'Error generating sitemap' });
  }
} 