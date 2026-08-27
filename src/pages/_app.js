// src/pages/_app.js
import "@styles/custom.css";
import { CartProvider } from "react-use-cart";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { PersistGate } from "redux-persist/integration/react";
import { persistStore } from "redux-persist";
import { Provider } from "react-redux";
import { useEffect } from "react";
import { useRouter } from "next/router";
import dynamic from "next/dynamic";
import Script from "next/script";

// צ'אט Tawk נטען דינמית (ssr:false) כדי לא להעמיס על ה-bundle הראשי ועל זמן ה-JS
// ההתחלתי. הוא ממילא נטען מאוחר ומותנה בהגדרה, אז אין השפעה על התצוגה הראשונה.
const TawkMessengerReact = dynamic(
  () => import("@tawk.to/tawk-messenger-react"),
  { ssr: false }
);

// Internal import
import store from "@redux/store";
import useAsync from "@hooks/useAsync";
import { UserProvider } from "@context/UserContext";
import DefaultSeo from "@component/common/DefaultSeo";
import ErrorBoundary from "@component/common/ErrorBoundary";
import { SidebarProvider } from "@context/SidebarContext";
import SettingServices from "@services/SettingServices";
import { trackPageView as trackFlashyPageView } from "@services/flashy";
import { trackPageView } from "@services/googleAnalytics";
import { trackFbPageView } from "@services/facebookPixel";

let persistor = persistStore(store);

function MyApp({ Component, pageProps }) {
  const router = useRouter();

  const {
    data: storeSetting,
    loading,
    error,
  } = useAsync(SettingServices.getStoreSetting);

  // Route change tracking: Flashy + GA4 + Meta Pixel
  useEffect(() => {
    if (!loading && !error) {
      const handleRouteChange = (url) => {
        // 1. Flashy Page View
        trackFlashyPageView(url);

        // 2. GA4 Page View דרך dataLayer (GTM-friendly)
        trackPageView(url);

        // 3. Meta Pixel PageView (בשביל SPA ניווט)
        trackFbPageView();
      };

      router.events.on("routeChangeComplete", handleRouteChange);
      return () => {
        router.events.off("routeChangeComplete", handleRouteChange);
      };
    }
  }, [loading, error, router.events]);

  // הוסרה הפניה מ-‎/product-category/מבצעים ל-‎/offers.
  //
  // היא מעולם לא רצה: router.pathname במסלול דינמי הוא התבנית
  // ‎"/product-category/[categoryName]" ולא הנתיב בפועל, ולכן ההשוואה תמיד
  // נכשלה. גם לו הייתה רצה היא הייתה מזיקה — ‎pages/offers.js מחזיר
  // ‎notFound: true במכוון, כך שההפניה הייתה מובילה ל-404 במקום לקטגוריה.

  // Hotjar + GTM הוסרו מכאן והועברו לסניפטים הסטנדרטיים ב-_document.js (ב-<head>/<body>).
  const isProductPage = router.pathname.startsWith("/product/");

  const envGoogleId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
  const resolvedGoogleClientId =
    storeSetting?.google_client_id ||
    (envGoogleId && envGoogleId !== "your_google_api_client"
      ? envGoogleId
      : "");

  const appTree = (
    <ErrorBoundary>
      <UserProvider>
        <Provider store={store}>
          <PersistGate loading={null} persistor={persistor}>
            <SidebarProvider>
              <CartProvider>
                {!isProductPage && <DefaultSeo />}
                <Component {...pageProps} />
              </CartProvider>
            </SidebarProvider>
          </PersistGate>
        </Provider>
      </UserProvider>
    </ErrorBoundary>
  );

  return (
    <div>
      {/* Flashy Pixel — נטען רק אם קיים account ID, אחרת flashy('init','') זורק שגיאה */}
      {process.env.NEXT_PUBLIC_FLASHY_ACCOUNT_ID && (
        <Script
          id="flashy-init"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
            (function (a, b, c) {
              if (!a.flashy) {
                a.flashy = function () {
                  a.flashy.event && a.flashy.event(arguments),
                  a.flashy.queue.push(arguments);
                };
                a.flashy.queue = [];
                var d = document.getElementsByTagName('script')[0],
                    e = document.createElement(b);
                e.src = c; e.async = true;
                d.parentNode.insertBefore(e, d);
              }
            })(window, 'script', 'https://js.flashyapp.com/thunder.js');
            flashy('init', '${process.env.NEXT_PUBLIC_FLASHY_ACCOUNT_ID}');
          `,
          }}
        />
      )}

      {/* GTM עבר לסניפט הסטנדרטי ב-<head> של _document.js (כולל noscript ב-body). */}

      {/* Meta Pixel — רק בפרודקשן עם ID, מפחית כפילויות ואזהרות דומיין ב-localhost */}
      {process.env.NODE_ENV === "production" &&
        process.env.NEXT_PUBLIC_FACEBOOK_PIXEL_ID && (
          <Script id="fb-pixel" strategy="lazyOnload">
            {`
          !function(f,b,e,v,n,t,s)
          {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
          n.callMethod.apply(n,arguments):n.queue.push(arguments)};
          if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
          n.queue=[];t=b.createElement(e);t.async=!0;
          t.src=v;s=b.getElementsByTagName(e)[0];
          s.parentNode.insertBefore(t,s)}(window, document,'script',
          'https://connect.facebook.net/en_US/fbevents.js');
          fbq('init', '${process.env.NEXT_PUBLIC_FACEBOOK_PIXEL_ID}');
          fbq('track', 'PageView');
        `}
          </Script>
        )}

      {/* Tawk.to Chat */}
      {!loading && !error && storeSetting?.tawk_chat_status && (
        <TawkMessengerReact
          propertyId={storeSetting?.tawk_chat_property_id || ""}
          widgetId={storeSetting?.tawk_chat_widget_id || ""}
        />
      )}

      {/* clientId יציב (שרת או .env תקין) — לא מעבירים מחרוזת ריקה ל-GSI */}
      {resolvedGoogleClientId ? (
        <GoogleOAuthProvider clientId={resolvedGoogleClientId}>
          {appTree}
        </GoogleOAuthProvider>
      ) : (
        appTree
      )}
    </div>
  );
}

export default MyApp;