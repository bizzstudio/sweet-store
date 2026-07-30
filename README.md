README.md
# תמרים בתומר - חנות תמרים מקוונת 🌴

## תיאור הפרויקט

**תמרים בתומר** הוא אתר מסחר אלקטרוני מתקדם המתמחה במכירת תמרים ומוצרי טבע איכותיים. האתר נבנה בטכנולוגיות מודרניות ומציע חוויית קנייה מלאה ונוחה עם תמיכה בשפה העברית ופיצ'רים מתקדמים.

## 🚀 תכונות עיקריות

### 🛒 מערכת עגלת קניות מתקדמת
- **עגלה צמודה**: עגלת קניות צפה שמציגה את המוצרים שנבחרו בזמן אמת
- **חיפוש קולי**: זיהוי קולי מתקדם להוספת מוצרים לעגלה
- **חישוב מחירים דינמי**: חישוב מחירים בזמן אמת כולל הנחות ועלויות משלוח
- **שמירת עגלה**: שמירת תוכן העגלה בין ביקורים

### 🎯 חיפוש ותצוגת מוצרים
- **חיפוש מתקדם**: חיפוש מוצרים לפי שם, קטגוריה או מילות מפתח
- **סינון וסידור**: סינון מוצרים לפי מחיר, קטגוריה ופופולריות
- **זיהוי קולי**: חיפוש מוצרים באמצעות פקודות קוליות
- **תצוגה רספונסיבית**: תצוגה מותאמת למחשב, טאבלט וסלולר

### 💳 מערכת תשלומים מאובטחת
- **הפניה לתשלום חיצוני**: הפניה לעמוד תשלום מאובטח של החברה
- **תמיכה בכרטיסי אשראי**: תשלום באמצעות כרטיסי אשראי מאובטחים
- **הגנה על פרטיות**: הצפנת נתונים ואבטחה מתקדמת

### 🚚 מערכת משלוחים וזמינות
- **בדיקת זמינות משלוח**: בדיקה האם ניתן לבצע משלוח לכתובת הלקוח
- **חישוב עלויות משלוח**: חישוב עלויות משלוח לפי מיקום
- **בחירת תאריכי משלוח**: אפשרות לבחור תאריך משלוח מועדף
- **איסוף עצמי**: אפשרות איסוף עצמי מהחנות

### 👤 ניהול משתמשים
- **רישום והתחברות**: מערכת רישום מלאה עם אימות אימייל
- **פרופיל אישי**: עדכון פרטי משתמש וכתובות משלוח
- **היסטוריית הזמנות**: צפייה בהזמנות קודמות ומעקב אחר סטטוס
- **חשבון אישי**: ניהול העדפות ופרטי התשלום

### 🌍 תמיכה רב-לשונית
- **עברית**: תמיכה מלאה בשפה העברית כשפת ברירת מחדל
- **אנגלית**: תמיכה בשפות נוספות (בהגדרות)
- **RTL Support**: תמיכה מלאה בכתיבה מימין לשמאל

### 📱 Progressive Web App (PWA)
- **אפליקציה מתקדמת**: האתר פועל כאפליקציה בסלולר
- **עבודה אופליין**: חלקים מהאתר פועלים גם ללא חיבור לאינטרנט
- **התקנה במכשיר**: ניתן להתקין את האתר כאפליקציה

### 🎨 עיצוב מותאם אישית
- **ערכת נושא מותאמת**: עיצוב בצבעי החברה הייחודיים
- **אנימציות ומעברים**: חוויית משתמש חלקה ומענגת
- **תמונות מותאמות**: תמונות איכותיות של המוצרים

## 🛠️ טכנולוגיות

### Frontend
- **Next.js 14.2.5**: פריימוורק React מתקדם
- **React 18.2.0**: ספריית JavaScript למבנה ממשק המשתמש
- **Tailwind CSS 3.0.24**: CSS Framework לעיצוב מהיר ויעיל
- **Redux Toolkit**: ניהול state מתקדם
- **React Hook Form**: ניהול טפסים מתקדם

### Payment & Commerce
- **הפניה לתשלום חיצוני**: אינטגרציה עם מערכת תשלומים חיצונית
- **React Use Cart**: ניהול עגלת קניות

### Voice Recognition
- **Web Speech API**: זיהוי קולי מתקדם לחיפוש והוספת מוצרים
- **ממשק קולי מותאם**: פיתוח עצמי לזיהוי קולי בעברית

### Styling & UI
- **HeadlessUI**: רכיבי UI נגישים
- **Heroicons**: אייקונים מעוצבים
- **React Icons**: מאגר אייקונים גדול
- **Swiper**: קרוסלה מתקדמת

### Development Tools
- **ESLint**: כלי לבדיקת איכות קוד
- **PostCSS**: עיבוד CSS מתקדם
- **Sharp**: עיבוד תמונות אופטימלי

## 📋 דרישות מערכת

- Node.js 16.0 ומעלה
- npm או yarn
- גישה לאינטרנט (לשירותי API)

## ⚙️ התקנה והפעלה

### 1. שיבוט הפרויקט
```bash
git clone <repository-url>
cd tomer-store
```

### 2. התקנת תלויות
```bash
npm install
# או
yarn install
```

### 3. הגדרת משתני סביבה
צרו קובץ `.env.local` בשורש הפרויקט והוסיפו:

```env
NEXT_PUBLIC_API_BASE_URL=your_api_base_url
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id
# הוסיפו משתני סביבה נוספים לפי הצורך
```

### 4. הפעלת שרת הפיתוח
```bash
npm run dev
# או
yarn dev
```

האתר יהיה זמין בכתובת: `http://localhost:3000`

### 5. בניית גרסת ייצור
```bash
npm run build
npm start
# או
yarn build
yarn start
```

## 📁 מבנה הפרויקט

```
tomer-store/
├── README.md
├── package.json
├── package-lock.json
├── next.config.js
├── tailwind.config.js
├── postcss.config.js
├── jsconfig.json
├── i18n.json
│
├── public/                          # קבצים סטטיים
│   ├── logo/                        # לוגואים של החברה
│   ├── slider/                      # תמונות לסליידר הראשי
│   ├── categories icons/            # אייקוני קטגוריות
│   │   └── tomer/                   # אייקונים מיוחדים לתומר
│   ├── app/                         # אייקוני אפליקציות ותשלומים
│   ├── payment-method/              # לוגואי אמצעי תשלום
│   ├── cta/                         # תמונות רקע לקריאות לפעולה
│   ├── team/                        # תמונות צוות
│   ├── flags/                       # דגלי שפות
│   ├── fonts/                       # גופני טקסט
│   ├── loader/                      # אנימציות טעינה
│   └── line icons/                  # אייקוני קו
│
├── locales/                         # קבצי תרגום
│   ├── he/common.json              # עברית
│   ├── en/common.json              # אנגלית
│   └── de/common.json              # גרמנית
│
└── src/
    ├── component/                   # רכיבי React
    │   ├── banner/                  # באנרים
    │   │   └── Banner.js
    │   ├── blog/                    # בלוג
    │   │   └── BlogCard.jsx
    │   ├── button/                  # כפתורים
    │   │   ├── MainBT.jsx
    │   │   └── Navbar.js
    │   ├── carousel/                # קרוסלות
    │   │   ├── CategoryCarousel.js
    │   │   ├── ImageCarousel.js
    │   │   └── MainCarousel.js
    │   ├── cart/                    # עגלת קניות
    │   │   ├── Calculating.jsx
    │   │   ├── Cart.js
    │   │   ├── CartItem.js
    │   │   ├── CartItemPreview.jsx
    │   │   └── StickyCart.js
    │   ├── category/                # קטגוריות
    │   │   ├── Category.js
    │   │   ├── CategoryCard.js
    │   │   └── FeatureCategory.js
    │   ├── checkout/                # תשלום
    │   │   └── CheckoutCard.js
    │   ├── common/                  # רכיבים כלליים
    │   │   ├── DefaultSeo.js
    │   │   ├── Discount.js
    │   │   ├── FloatingWhatsApp.jsx
    │   │   ├── ImageWithFallBack.js
    │   │   ├── MinimalTitle.jsx
    │   │   ├── Price.js
    │   │   ├── SortDropdown.jsx
    │   │   ├── SpecialDiscount.js
    │   │   ├── Stock.js
    │   │   ├── TagInput.js
    │   │   └── Tags.js
    │   ├── coupon/                  # קופונים
    │   │   ├── Coupon.js
    │   │   ├── CouponDetails.js
    │   │   └── OfferTimer.js
    │   ├── cta-card/                # כרטיסי קריאה לפעולה
    │   │   ├── Card.js
    │   │   └── CardTwo.js
    │   ├── deliveriesPopup/         # חלונות קופצים למשלוחים
    │   │   └── DeliveriesPopup.jsx
    │   ├── drawer/                  # מגירות צדדיות
    │   │   ├── CartDrawer.js
    │   │   └── CategoryDrawer.js
    │   ├── feature-card/            # כרטיסי פיצ'רים
    │   │   └── FeatureCard.js
    │   ├── form/                    # טפסים
    │   │   ├── Error.js
    │   │   ├── InputArea.js
    │   │   ├── InputPayment.js
    │   │   ├── InputShipping.js
    │   │   └── Label.js
    │   ├── header/                  # כותרות עמודים
    │   │   └── PageHeader.js
    │   ├── image-uploader/          # העלאת תמונות
    │   │   └── Uploader.js
    │   ├── invoice/                 # חשבוניות
    │   │   ├── Invoice.js
    │   │   └── InvoiceForDownload.js
    │   ├── login/                   # התחברות ורישום
    │   │   ├── Common.jsx
    │   │   ├── Login.js
    │   │   ├── Register.js
    │   │   ├── RegisterSuccess.jsx
    │   │   └── ResetPassword.js
    │   ├── menu/                    # תפריטים
    │   │   ├── DropdownMenu.jsx
    │   │   └── DropdownMenu.module.css
    │   ├── modal/                   # חלונות מודליים
    │   │   ├── BeforeStartPopup.jsx
    │   │   ├── DeliveryMsgModal.jsx
    │   │   ├── DynamicPopup.jsx
    │   │   ├── LoginModal.js
    │   │   ├── MainModal.js
    │   │   ├── MissingProductsModal.jsx
    │   │   ├── PickupMsgModal.jsx
    │   │   ├── PriceUpdatedModal.jsx
    │   │   ├── ProductModal.js
    │   │   └── SubModal.js
    │   ├── offer/                   # הצעות ומבצעים
    │   │   ├── getOfferNames.jsx
    │   │   └── OfferCard.js
    │   ├── order/                   # הזמנות
    │   │   ├── OrderHistory.js
    │   │   └── OrderTable.js
    │   ├── order-card/              # כרטיסי הזמנות
    │   │   └── Card.js
    │   ├── preloader/               # מסכי טעינה
    │   │   ├── CMSkeleton.js
    │   │   └── Loading.js
    │   ├── product/                 # מוצרים
    │   │   ├── ProductCard.js
    │   │   ├── ProductDescription.jsx
    │   │   └── ScrollOfferCard.jsx
    │   ├── resultWindow/            # חלון תוצאות חיפוש
    │   │   └── resultWindow.jsx
    │   ├── select/                  # רכיבי בחירה
    │   │   └── City.jsx
    │   ├── slug-card/               # כרטיסי slug
    │   │   └── Card.js
    │   ├── tomerTitle/              # כותרת תומר מיוחדת
    │   │   └── tomerTitle.jsx
    │   ├── userAddressInitialize/   # אתחול כתובת משתמש
    │   │   └── UserAddressInitialize.jsx
    │   ├── userAddressUpdate/       # עדכון כתובת משתמש
    │   │   └── UserAddressUpdate.jsx
    │   ├── variants/                # וריאנטים של מוצרים
    │   │   └── VariantList.js
    │   └── voice-search/            # חיפוש קולי
    │       ├── CashierVoicePanel.jsx
    │       ├── CustomerNameVoiceInput.jsx
    │       ├── index.js
    │       ├── RecognizedProducts.jsx
    │       ├── VoiceRecognition.jsx
    │       ├── VoiceSearchButton.jsx
    │       ├── VoiceSearchItem.jsx
    │       └── VoiceSearchModal.jsx
    │
    ├── context/                     # Context providers
    │   ├── SidebarContext.js        # מצב סרגל צדדי
    │   └── UserContext.js           # מצב משתמש
    │
    ├── functions/                   # פונקציות עזר
    │   ├── scrollUp.js              # גלילה למעלה
    │   └── sortProducts.js          # מיון מוצרים
    │
    ├── hooks/                       # Custom React hooks
    │   ├── useAddToCart.js          # הוספה לעגלה
    │   ├── useAsync.js              # פעולות אסינכרוניות
    │   ├── useCart.jsx              # ניהול עגלת קניות
    │   ├── useCheckoutSubmit.js     # שליחת תשלום
    │   ├── useFilter.js             # סינון מוצרים
    │   ├── useGetSetting.js         # קבלת הגדרות
    │   ├── useInView.js             # זיהוי אלמנטים בתצוגה
    │   ├── useLoginSubmit.js        # שליחת התחברות
    │   ├── useNotification.js       # התראות
    │   └── useUtilsFunction.js      # פונקציות שימושיות
    │
    ├── layout/                      # רכיבי layout
    │   ├── footer/                  # כותרת תחתונה
    │   │   ├── Footer.js
    │   │   ├── FooterTop.js
    │   │   ├── FooterTopOld.js
    │   │   └── MobileFooter.js
    │   ├── navbar/                  # סרגל ניווט
    │   │   ├── Navbar.jsx
    │   │   ├── NavbarPromo.jsx
    │   │   └── NavBarTop.js
    │   └── Layout.js                # Layout ראשי
    │
    ├── pages/                       # דפי האתר (Next.js routing)
    │   ├── _app.js                  # הגדרות אפליקציה
    │   ├── _document.js             # מבנה HTML
    │   ├── _offline.js              # עמוד אופליין
    │   ├── 404.js                   # עמוד שגיאה 404
    │   ├── index.js                 # עמוד הבית
    │   ├── about-us.js              # אודותינו
    │   ├── accessibility-statement.jsx  # הצהרת נגישות
    │   ├── cashier-desk.jsx         # עמודת קופה
    │   ├── checkout.jsx             # תשלום
    │   ├── contact-us.js            # צור קשר
    │   ├── faqs.js                  # שאלות נפוצות
    │   ├── loading.jsx              # עמוד טעינה
    │   ├── offer.js                 # הצעה יחידה
    │   ├── offers.js                # כל ההצעות
    │   ├── privacy-policy.js        # מדיניות פרטיות
    │   ├── search.jsx               # חיפוש
    │   ├── terms-and-conditions.js  # תנאים והגבלות
    │   ├── blogs/                   # בלוג
    │   │   ├── index.jsx
    │   │   └── [slug].jsx
    │   ├── failed/                  # כשל בתשלום
    │   │   └── index.jsx
    │   ├── order/                   # הזמנה ספציפית
    │   │   └── [id].js
    │   ├── product/                 # מוצר ספציפי
    │   │   └── [slug].jsx
    │   ├── product-category/        # קטגוריות מוצרים
    │   │   ├── [categoryName].jsx
    │   │   └── [categoryName]/
    │   │       └── [subCategoryName].jsx
    │   ├── success/                 # הצלחה בתשלום
    │   │   └── index.jsx
    │   └── user/                    # אזור אישי
    │       ├── dashboard.js
    │       ├── my-orders.js
    │       ├── recent-order.js
    │       ├── update-profile.js
    │       ├── change-password.js
    │       ├── email-verification/
    │       │   └── [token].js
    │       └── forget-password/
    │           └── [token].js
    │
    ├── redux/                       # ניהול state
    │   ├── store.js                 # הגדרת store
    │   └── slice/                   # Redux slices
    │       ├── dynamicDataSlice.js
    │       └── settingSlice.js
    │
    ├── services/                    # שירותי API
    │   ├── httpServices.js          # הגדרות HTTP
    │   ├── AttributeServices.js     # תכונות מוצרים
    │   ├── BlogServices.js          # בלוג
    │   ├── CategoryServices.js      # קטגוריות
    │   ├── CouponServices.js        # קופונים
    │   ├── CustomerServices.js      # לקוחות
    │   ├── DeliveryServices.js      # משלוחים
    │   ├── NotificaitonServices.js  # התראות
    │   ├── OfferServices.js         # הצעות
    │   ├── OrderServices.js         # הזמנות
    │   ├── PopupServices.js         # חלונות קופצים
    │   ├── ProductServices.js       # מוצרים
    │   └── SettingServices.js       # הגדרות
    │
    ├── styles/                      # קבצי CSS
    │   ├── color-variables.css      # משתני צבעים
    │   └── custom.css               # עיצוב מותאם
    │
    └── utils/                       # פונקציות עזר
        ├── analytics.js             # ניתוח נתונים
        ├── data.js                  # נתונים סטטיים
        ├── fb-pixel.js              # Facebook Pixel
        ├── getNextDeliveryMessage.js # הודעת משלוח הבא
        ├── notifyApiResponse.js     # התראות API
        ├── storeCustomizationSetting.js # הגדרות התאמה אישית
        ├── stripe.js                # הגדרות Stripe (לא בשימוש)
        └── toast.js                 # הודעות Toast
```

## 🔧 תכונות מתקדמות

### זיהוי קולי
האתר כולל מערכת זיהוי קולי מתקדמת המאפשרת:
- חיפוש מוצרים בקול
- הוספת מוצרים לעגלה
- ניווט באתר

### מערכת קופאים
מסך מיוחד לקופאים עם:
- ממשק מותאם לעבודת קופאים
- הוספת מוצרים מהירה
- יצירת הזמנות

### התאמה אישית
- ערכת צבעים מותאמת לתמרים (צהוב, ירוק, חום)
- טיפוגרפיה בעברית
- אנימציות חלקות

## 🌐 API ושירותים

האתר מתחבר לשירותי backend הבאים:
- **מוצרים**: קבלת מידע על מוצרים וקטגוריות
- **הזמנות**: יצירת ומעקב אחר הזמנות
- **לקוחות**: ניהול פרטי לקוחות
- **תשלומים**: עיבוד תשלומים מאובטחים
- **משלוחים**: בדיקת זמינות ועלויות משלוח

## 🔐 אבטחה

- הצפנת נתונים רגישים
- אימות משתמשים מאובטח
- הגנה מפני CSRF
- תשלומים מאובטחים דרך הפניה חיצונית

## 📱 תמיכה במכשירים

האתר מותאם לכל המכשירים:
- **Desktop**: חוויה מלאה במחשבים אישיים
- **Tablet**: ממשק מותאם לטאבלטים
- **Mobile**: אפליקציה מלאה בסלולר
- **PWA**: התקנה כאפליקציה עצמאית

## 🎯 תכונות עסקיות

### ניתוח ומעקב
- Google Analytics 4
- מעקב אחר התנהגות משתמשים
- ניתוח מכירות ואמצעים שיווקיים

### שיווק דיגיטלי
- אופטימיזציה למנועי חיפוש (SEO)
- תמיכה ברשתות חברתיות
- מערכת קופונים והנחות

### שירות לקוחות
- צ'אט מובנה (Tawk.to)
- טפסי יצירת קשר
- מערכת FAQ

## 🚀 הטמעה ופריסה

### Vercel (מומלץ)
```bash
npm run build
# העלאה לVercel דרך Git
```

### שרת עצמאי
```bash
npm run build
npm start
```

## 📄 רישיון

הפרויקט הוא קנייני לחברת "תמרים בתומר".

## 📞 יצירת קשר ותמיכה

- **אתר החברה**: https://tmarim-betomer.com
- **תמיכה טכנית**: דרך מערכת הצ'אט באתר
- **דואר אלקטרוני**: דרך טופס יצירת הקשר באתר

## 🔄 עדכונים וגרסאות

לקבלת עדכונים על גרסאות חדשות ותכונות, עקבו אחר הפרויקט ב-Git.

---

**"תמרים בתומר"** - חנות התמרים המובילה בישראל 🇮🇱🌴