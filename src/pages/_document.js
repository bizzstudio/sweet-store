// src/pages/_document.js
import SettingServices from "@services/SettingServices";
import Document, { Html, Head, Main, NextScript } from "next/document";

class MyDocument extends Document {
  static async getInitialProps(ctx) {
    const initialProps = await Document.getInitialProps(ctx);

    const reqUrl = ctx.req?.url;
    const asPath = ctx.asPath;
    const pathname = ctx.pathname;
    const path = reqUrl || asPath || pathname || "";

    let seoSetting = null;
    let scriptSetting = { head: "", bodyStart: "", bodyEnd: "" };
    let error = null;

    try {
      // Fetch general metadata from backend API
      seoSetting = await SettingServices.getStoreSeoSetting(path);
      // ✅ חדש: טעינת סקריפטים דינמיים
      scriptSetting = await SettingServices.getStoreScripts();
    } catch (err) {
      error = true; // Mark error
      console.error("Failed to fetch settings:", err);
    }

    return { ...initialProps, seoSetting, scriptSetting, error };
  }

  render() {
    const { seoSetting, scriptSetting, error } = this.props;
    const { seo } = seoSetting || {};
    const { head, bodyStart, bodyEnd } = scriptSetting || {};
    const isDev = process.env.NODE_ENV === "development";

    // המרת קישורי תמונה לא מאובטחים (http://) ל-https:// כדי למנוע חסימת Mixed Content.
    // URL שכבר https או נתיב יחסי נשאר כמו שהוא — אין שינוי לוגיקה.
    const toHttps = (url) =>
      typeof url === "string" ? url.replace(/^http:\/\//i, "https://") : url;

    // הוספת defer לכל <script src=...> חיצוני שמוזרק מהשרת (סקריפט הנגישות, cookie-consent
    // וכו'). ללא defer הם חוסמים את הרינדור (~900ms ב-render-blocking). defer לא חוסם parsing,
    // רץ אחרי בניית ה-DOM, ושומר על סדר ההרצה בין הסקריפטים. סקריפטים inline (בלי src) נשארים
    // כמו שהם — אי אפשר לדחות אותם, והם בד"כ רק snippet קטן של אתחול.
    const deferExternalScripts = (html) =>
      typeof html === "string"
        ? html.replace(/<script\b([^>]*?)>/gi, (match, attrs) => {
            if (!/\bsrc\s*=/.test(attrs)) return match; // inline — משאירים
            if (/\b(?:async|defer)\b/.test(attrs)) return match; // כבר לא-חוסם
            return `<script${attrs} defer>`;
          })
        : html;

    const { meta_description, meta_keywords, meta_title, meta_url } = seo || {};
    const favicon = toHttps(seo?.favicon);
    const meta_img = toHttps(seo?.meta_img);

    // יצירת manifest דינמי
    const manifestData = {
      name: meta_title,
      short_name: meta_title,
      description: meta_description,
      start_url: "/",
      display: "standalone",
      background_color: "#ffffff",
      theme_color: "#ffffff",
      icons: [
        {
          src: favicon,
          sizes: "any",
          type: "image/x-icon"
        },
        {
          src: meta_img,
          sizes: "192x192",
          type: "image/png",
          purpose: "any maskable"
        },
        {
          src: meta_img,
          sizes: "512x512",
          type: "image/png",
          purpose: "any maskable"
        }
      ]
    };

    // הערה: גם אם טעינת ה-SEO נכשלה (error=true), לא מפילים את כל העמוד.
    // עדיף לוותר על תגי ה-SEO לרגע מאשר להציג ללקוח "האתר אינו זמין".
    // ה-render ממשיך כרגיל עם ערכי ברירת מחדל (seo ריק => meta tags ריקים).

    return (
      <Html lang="he" dir="rtl">
        <Head>
          {/* Google Tag Manager — dataLayer מאותחל מיד (אירועים מצטברים ולא הולכים לאיבוד),
              אבל gtm.js עצמו נטען רק באינטראקציה ראשונה או אחרי 3.5s (מה שקודם) — כך ההרצה
              הכבדה יורדת מהנתיב הקריטי בלי לפגוע במעקב של משתמש מעורב. */}
          {!isDev && (
            <script
              dangerouslySetInnerHTML={{
                __html: `(function(w,d,l,i){
  w[l]=w[l]||[];
  w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});
  var loaded=false;
  var evts=['scroll','mousemove','touchstart','keydown','click'];
  function loadGtm(){
    if(loaded)return;loaded=true;
    for(var k=0;k<evts.length;k++){w.removeEventListener(evts[k],loadGtm);}
    var j=d.createElement('script');j.async=true;
    j.src='https://www.googletagmanager.com/gtm.js?id='+i;
    var f=d.getElementsByTagName('script')[0];
    f.parentNode.insertBefore(j,f);
  }
  for(var k=0;k<evts.length;k++){w.addEventListener(evts[k],loadGtm,{passive:true});}
  setTimeout(loadGtm,3500);
})(window,document,'dataLayer','GTM-5CFPG5F');`,
              }}
            />
          )}

          {/* cookie-consent עבר גם הוא לטעינה מאוחרת (idle) — ראה ה-bootstrap בתחתית ה-body */}

          {/* Hotjar עבר לטעינה מאוחרת (idle אחרי load) בתחתית ה-body — ראה andi+hotjar bootstrap */}

          {/* רמזי חיבור ל-origins החיצוניים החוסמים-רינדור (סקריפט הנגישות + cookie-consent).
              אנחנו לא נוגעים בסקריפטים עצמם ולא דוחים אותם — רק מחממים DNS+TLS מראש כדי לקצר
              את ~940-990ms שרובם handshake ולא הורדה. ללא crossOrigin: הסקריפטים נטענים ללא
              CORS, אחרת החיבור המחומם לא ימוחזר. */}
          <link rel="preconnect" href="https://system.user-a.co.il" />
          <link rel="dns-prefetch" href="https://system.user-a.co.il" />
          <link rel="preconnect" href="https://bizzstudio.co.il" />
          <link rel="dns-prefetch" href="https://bizzstudio.co.il" />
          {/* GTM + Hotjar נטענים כעת מוקדם ב-<head> — חימום החיבור מקצר את ה-handshake */}
          <link rel="preconnect" href="https://www.googletagmanager.com" />
          <link rel="dns-prefetch" href="https://www.googletagmanager.com" />
          <link rel="preconnect" href="https://static.hotjar.com" crossOrigin="anonymous" />
          <link rel="dns-prefetch" href="https://static.hotjar.com" />

          {/* preload לפונט הראשי (משקל 400) — מתחיל את ההורדה מוקדם ומקצר LCP */}
          <link
            rel="preload"
            as="font"
            type="font/woff2"
            href="/fonts/assistant/Assistant-Regular.woff2"
            crossOrigin="anonymous"
          />

          <link rel="icon" href={favicon || "/Tomer dates.png"} />
          <link rel="shortcut icon" href={favicon || "/Tomer dates.png"} />
          <link rel="apple-touch-icon" href={favicon || "/Tomer dates.png"} />
          <link rel="apple-touch-icon" sizes="180x180" href={favicon || "/Tomer dates.png"} />
          <link rel="icon" type="image/png" sizes="32x32" href={favicon || "/Tomer dates.png"} />
          <link rel="icon" type="image/png" sizes="16x16" href={favicon || "/Tomer dates.png"} />

          {/* Regular meta tags that Google prefers */}
          <title>{meta_title}</title>
          <meta
            name="description"
            content={meta_description}
          />

          <meta
            property="og:title"
            content={
              meta_title
            }
          />
          <meta property="og:type" content="eCommerce Website" />
          <meta
            property="og:description"
            content={
              meta_description
            }
          />
          <meta
            name="keywords"
            content={meta_keywords}
          />
          <meta
            property="og:url"
            content={
              meta_url
            }
          />
          <meta
            property="og:image"
            content={meta_img}
          />


          {/* יצירת manifest דינמי */}
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify(manifestData)
            }}
          />

          {/* עדכון הקישור ל-manifest */}
          <link rel="manifest" href="/api/manifest" />

          {/* בפיתוח מדלגים על סקריפטים מה-API (פרסומות/GTM) — חוסך Mixed Content ו-SyntaxError מ-HTML במקום JS */}
          {!isDev && head && (
            <span dangerouslySetInnerHTML={{ __html: deferExternalScripts(head) }} />
          )}

        </Head>
        <body>
          {/* Google Tag Manager (noscript) — חייב להיות אלמנט אמיתי, לא מוזרק כמחרוזת */}
          {!isDev && (
            <noscript>
              <iframe
                src="https://www.googletagmanager.com/ns.html?id=GTM-5CFPG5F"
                height="0"
                width="0"
                style={{ display: "none", visibility: "hidden" }}
              />
            </noscript>
          )}

          {!isDev && bodyStart && (
            <script dangerouslySetInnerHTML={{ __html: bodyStart }} />
          )}

          <Main />
          <NextScript />

          {!isDev && bodyEnd && (
            <span dangerouslySetInnerHTML={{ __html: deferExternalScripts(bodyEnd) }} />
          )}

          {/* טעינה מאוחרת של cookie-consent + Hotjar + סקריפט הנגישות (andi): מחכים ל-load
              ואז ל-idle, כדי שלא יתחרו על ה-thread הראשי בזמן הרינדור (המקור העיקרי ל-Script
              Evaluation ב-TBT). ה-dataLayer של GTM נשאר מוקדם ב-<head> — רק אלה נדחים. */}
          {!isDev && (
            <script
              dangerouslySetInnerHTML={{
                __html: `(function(){
  var done=false;
  function loadLate(){
    if(done)return;done=true;
    var c=document.createElement('script');
    c.src='https://bizzstudio.co.il/consent/cookie-consent.js';
    c.defer=true;document.head.appendChild(c);
    (function(h,o,t,j,a,r){
      h.hj=h.hj||function(){(h.hj.q=h.hj.q||[]).push(arguments)};
      h._hjSettings={hjid:3341645,hjsv:6};
      a=o.getElementsByTagName('head')[0];
      r=o.createElement('script');r.async=1;
      r.src=t+h._hjSettings.hjid+j+h._hjSettings.hjsv;
      a.appendChild(r);
    })(window,document,'https://static.hotjar.com/c/hotjar-','.js?sv=');
    var s=document.createElement('script');
    s.src='https://system.user-a.co.il/Customers/3748629/_tmarim-betomer_com-/andifn1.js';
    s.id='andipath';document.body.appendChild(s);
  }
  function schedule(){
    if('requestIdleCallback' in window){requestIdleCallback(loadLate,{timeout:4000});}
    else{setTimeout(loadLate,3000);}
  }
  if(document.readyState==='complete')schedule();
  else window.addEventListener('load',schedule);
})();`,
              }}
            />
          )}
        </body>
      </Html>
    );
  }
}

export default MyDocument;