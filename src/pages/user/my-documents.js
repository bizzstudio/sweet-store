import { useContext, useEffect, useState } from "react";
import { useRouter } from "next/router";
import dayjs from "dayjs";
import { FiExternalLink, FiFileText } from "react-icons/fi";
import useTranslation from "next-translate/useTranslation";

// Internal import
import Dashboard from "@pages/user/dashboard";
import DocumentServices from "@services/DocumentServices";
import Loading from "@component/preloader/Loading";
import { UserContext } from "@context/UserContext";
import { SidebarContext } from "@context/SidebarContext";
import { HIDE_PRICES } from "@utils/priceVisibility";
import { notifyError } from "@utils/toast";

// כל המסמכים שהופקו ללקוח, בטאבים לפי סוג מסמך. מי שמחפש חשבונית לא
// צריך לגלול מעל רשימת תעודות המשלוח, והמונה על כל טאב נותן את התמונה
// המלאה בלי להיכנס אליו.
//
// חשבוניות, קבלות וזיכויים נפתחים ב-iCount (שם המסמך המחייב). תעודות
// משלוח והצעות מחיר נשמרות אצלנו, ונפתחות כ-PDF שהשרת מפיק.

const date = (d) => (d ? dayjs(d).format("D/MM/YYYY") : "—");

const money = (n) =>
  `${Number(n || 0).toLocaleString("he-IL", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })} ₪`;

const QUOTE_STATUS = {
  open: { key: "docsQuoteOpen", className: "text-orange-700" },
  accepted: { key: "docsQuoteAccepted", className: "text-green-700" },
  rejected: { key: "docsQuoteRejected", className: "text-red-600" },
  expired: { key: "docsQuoteExpired", className: "text-gray-600" },
};

const th =
  "text-center text-xs font-serif font-semibold md:px-6 px-2 py-2 text-gray-700 tracking-wider";
const td = "px-1 md:px-5 py-3 leading-6 text-center text-sm";
// עמודות משניות יורדות במסך צר, כמו בטבלת ההזמנות
const wide = "hidden md:table-cell";

const MyDocuments = () => {
  const router = useRouter();
  const { t } = useTranslation();
  const { state: { userInfo } } = useContext(UserContext);
  const { isLoading, setIsLoading } = useContext(SidebarContext);

  const [docs, setDocs] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [active, setActive] = useState(null);
  // המסמך שה-PDF שלו בהפקה כרגע — הכפתור שלו ננעל עד שהוא נפתח
  const [opening, setOpening] = useState(null);

  useEffect(() => {
    DocumentServices.getMyDocuments()
      .then((res) => {
        setDocs(res);
        setLoading(false);
      })
      .catch((err) => {
        setLoading(false);
        setError(err?.response?.data?.message || err.message);
      });
  }, []);

  useEffect(() => {
    setIsLoading(false);
    if (!userInfo) {
      router.push("/");
    }
  }, [userInfo]);

  const openPdf = async (key, fetchPdf) => {
    // החלון נפתח לפני הבקשה ולא אחריה: דפדפנים (ספארי בעיקר) חוסמים
    // window.open שאינו תגובה ישירה ללחיצה, והפקת ה-PDF לוקחת שנייה
    const win = window.open("", "_blank");
    // שלא תישאר לשונית לבנה וריקה בזמן שהשרת מפיק את המסמך
    if (win) {
      win.document.title = t("common:docsOpening");
      win.document.body.textContent = t("common:docsOpening");
    }
    setOpening(key);
    try {
      const blob = await fetchPdf();
      const url = URL.createObjectURL(blob);
      if (!win) {
        // החלון נחסם בכל זאת — המסמך נפתח בלשונית הנוכחית
        window.location.assign(url);
      } else if (!win.closed) {
        win.location = url;
      }
      // לשונית שהלקוח סגר בזמן ההמתנה: הוא ויתר, ולא פותחים במקומה כלום
      // הכתובת משוחררת רק אחרי שהלשונית הספיקה לטעון אותה
      setTimeout(() => URL.revokeObjectURL(url), 60 * 1000);
    } catch (err) {
      if (win && !win.closed) win.close();
      // התשובה היא blob גם בשגיאה, ולכן ההודעה מהשרת אינה נקראת ישירות
      notifyError(
        err?.response?.status === 429 ? t("common:docsTooMany") : t("common:docsOpenFailed")
      );
    } finally {
      setOpening(null);
    }
  };

  const viewClass =
    "inline-flex gap-1 items-center px-3 py-1 bg-mainColor-light text-xs text-mainColor-superDark hover:bg-mainColor hover:text-white transition-all font-semibold rounded-full disabled:opacity-60 disabled:cursor-wait";

  /** קישור למסמך ב-iCount. מסמך שלא נשמרה לו כתובת מציג קו ולא כפתור מת. */
  const externalView = (url, label) =>
    url ? (
      <a href={url} target="_blank" rel="noopener noreferrer" className={viewClass} aria-label={label}>
        <FiExternalLink aria-hidden="true" />
        {t("common:docsView")}
      </a>
    ) : (
      <span className="text-gray-500">—</span>
    );

  const pdfView = (key, fetchPdf, label) => (
    <button
      type="button"
      disabled={opening !== null}
      onClick={() => openPdf(key, fetchPdf)}
      className={viewClass}
      aria-label={label}
    >
      <FiFileText aria-hidden="true" />
      {opening === key ? t("common:docsOpening") : t("common:docsView")}
    </button>
  );

  // עמודת הסכום יורדת כשהחנות מסתירה מחירים (src/utils/priceVisibility.js).
  // המסמך עצמו נפתח כפי שהופק, עם הסכומים שעליו
  const amountCol = HIDE_PRICES
    ? []
    : [{ title: t("common:total"), cell: (d) => <span className="font-bold">{money(d.amount)}</span> }];

  const TABS = !docs
    ? []
    : [
        {
          id: "invoices",
          title: t("common:docsInvoices"),
          empty: t("common:docsNoInvoices"),
          items: docs.invoices,
          rowKey: (d) => d.docNum,
          columns: [
            { title: t("common:docsNumber"), cell: (d) => <span className="font-medium">{d.docNum}</span> },
            { title: t("common:docsDate"), cell: (d) => date(d.date) },
            ...amountCol,
            {
              title: t("common:docsStatus"),
              cell: (d) =>
                d.isPaid ? (
                  <span className="text-green-700 font-medium">{t("common:docsPaid")}</span>
                ) : d.dueDate ? (
                  <span className="text-orange-700 font-medium">
                    {t("common:docsDueBy", { date: date(d.dueDate) })}
                  </span>
                ) : (
                  <span className="text-orange-700 font-medium">{t("common:docsUnpaid")}</span>
                ),
            },
            {
              title: t("common:action"),
              cell: (d) => externalView(d.url, `${t("common:docsInvoice")} ${d.docNum}`),
            },
          ],
        },
        {
          id: "receipts",
          title: t("common:docsReceipts"),
          empty: t("common:docsNoReceipts"),
          items: docs.receipts,
          rowKey: (d) => d.docNum,
          columns: [
            { title: t("common:docsNumber"), cell: (d) => <span className="font-medium">{d.docNum}</span> },
            { title: t("common:docsDate"), cell: (d) => date(d.date) },
            ...amountCol,
            {
              title: t("common:docsForInvoice"),
              className: wide,
              cell: (d) => (d.invoiceDocNums?.length ? d.invoiceDocNums.join(", ") : "—"),
            },
            {
              title: t("common:action"),
              cell: (d) => externalView(d.url, `${t("common:docsReceipt")} ${d.docNum}`),
            },
          ],
        },
        {
          id: "deliveryNotes",
          title: t("common:docsDeliveryNotes"),
          empty: t("common:docsNoDeliveryNotes"),
          items: docs.deliveryNotes,
          rowKey: (d) => d._id,
          columns: [
            { title: t("common:docsNumber"), cell: (d) => <span className="font-medium">{d.number}</span> },
            { title: t("common:docsDate"), cell: (d) => date(d.date) },
            {
              title: t("common:docsOrder"),
              className: wide,
              cell: (d) => d.orderNumber || "—",
            },
            { title: t("common:docsLines"), className: wide, cell: (d) => d.itemCount },
            ...amountCol,
            {
              title: t("common:docsInvoice"),
              className: wide,
              cell: (d) => d.invoiceDocNum || <span className="text-gray-600">{t("common:docsNotBilledYet")}</span>,
            },
            {
              title: t("common:action"),
              cell: (d) =>
                pdfView(
                  `note-${d._id}`,
                  () => DocumentServices.getDeliveryNotePdf(d._id),
                  `${t("common:docsDeliveryNote")} ${d.number}`
                ),
            },
          ],
        },
        {
          id: "quotes",
          title: t("common:docsQuotes"),
          empty: t("common:docsNoQuotes"),
          items: docs.quotes,
          rowKey: (d) => d._id,
          columns: [
            { title: t("common:docsNumber"), cell: (d) => <span className="font-medium">{d.number}</span> },
            { title: t("common:docsDate"), cell: (d) => date(d.date) },
            {
              title: t("common:docsValidUntil"),
              className: wide,
              cell: (d) => date(d.validUntil),
            },
            ...amountCol,
            {
              title: t("common:docsStatus"),
              cell: (d) => {
                const status = QUOTE_STATUS[d.status] || QUOTE_STATUS.open;
                return <span className={`font-medium ${status.className}`}>{t(`common:${status.key}`)}</span>;
              },
            },
            {
              title: t("common:action"),
              cell: (d) =>
                pdfView(
                  `quote-${d._id}`,
                  () => DocumentServices.getQuotePdf(d._id),
                  `${t("common:docsQuote")} ${d.number}`
                ),
            },
          ],
        },
        {
          id: "credits",
          title: t("common:docsCredits"),
          empty: "",
          items: docs.credits,
          rowKey: (d) => d.docNum,
          // זיכוי הוא חריג. טאב ריק קבוע היה רק מעורר שאלה אצל מי שמעולם
          // לא זוכה, ולכן הוא מופיע רק כשיש בו משהו
          hideWhenEmpty: true,
          columns: [
            { title: t("common:docsNumber"), cell: (d) => <span className="font-medium">{d.docNum}</span> },
            { title: t("common:docsDate"), cell: (d) => date(d.date) },
            { title: t("common:docsForInvoice"), cell: (d) => d.invoiceDocNum || "—" },
            {
              title: t("common:action"),
              cell: (d) => externalView(d.url, `${t("common:docsCredit")} ${d.docNum}`),
            },
          ],
        },
      ].filter((tab) => !(tab.hideWhenEmpty && tab.items.length === 0));

  // פתיחה על הטאב הראשון שיש בו משהו: לקוח שיש לו רק תעודות משלוח היה
  // נוחת אחרת על "טרם הופקו חשבוניות" וחושב שאין לו כלום
  const activeTab =
    TABS.find((tab) => tab.id === active) || TABS.find((tab) => tab.items.length > 0) || TABS[0];

  const hasAny = TABS.some((tab) => tab.items.length > 0);

  // ניווט מקלדת בין הטאבים, לפי תבנית ה-tabs של WAI-ARIA: רק הטאב הפעיל
  // נמצא בסדר ה-Tab, והחצים עוברים ביניהם. העמוד מימין לשמאל, ולכן חץ
  // שמאלה הוא "הבא"
  const onTabKeyDown = (e) => {
    const index = TABS.findIndex((tab) => tab.id === activeTab.id);
    const target = {
      ArrowLeft: (index + 1) % TABS.length,
      ArrowRight: (index - 1 + TABS.length) % TABS.length,
      Home: 0,
      End: TABS.length - 1,
    }[e.key];
    if (target === undefined) return;
    e.preventDefault();
    setActive(TABS[target].id);
    document.getElementById(`doc-tab-${TABS[target].id}`)?.focus();
  };

  return (
    <>
      {isLoading ? (
        <Loading loading={isLoading} />
      ) : (
        <Dashboard title={t("common:myDocuments")} description="This is user documents page">
          <div className="overflow-hidden rounded-md font-serif">
            {loading ? (
              <Loading loading={loading} />
            ) : error ? (
              <h2 className="text-xl text-center my-10 mx-auto w-11/12 text-red-600">{error}</h2>
            ) : !hasAny ? (
              <div className="text-center">
                <span className="flex justify-center pt-16 font-semibold text-6xl text-mainColor">
                  <FiFileText aria-hidden="true" />
                </span>
                <h2 className="font-medium text-md my-4 text-gray-600">{t("common:docsNone")}</h2>
              </div>
            ) : (
              <div className="flex flex-col">
                <h2 className="text-xl font-serif font-semibold mb-5">{t("common:myDocuments")}</h2>

                <div className="border-b border-gray-200 mb-5 overflow-x-auto">
                  <div role="tablist" aria-label={t("common:docsType")} className="flex min-w-max">
                    {TABS.map((tab) => {
                      const selected = tab.id === activeTab.id;
                      return (
                        <button
                          key={tab.id}
                          type="button"
                          role="tab"
                          id={`doc-tab-${tab.id}`}
                          aria-selected={selected}
                          aria-controls="doc-panel"
                          tabIndex={selected ? 0 : -1}
                          onClick={() => setActive(tab.id)}
                          onKeyDown={onTabKeyDown}
                          // הגבול התחתון קיים גם בטאב כבוי (שקוף) — אחרת
                          // הטקסט היה קופץ בכל החלפה
                          className={`-mb-px flex items-center gap-2 border-b-2 px-3 md:px-4 py-2 text-sm font-medium whitespace-nowrap transition-colors ${
                            selected
                              ? "border-mainColor text-mainColor-dark"
                              : "border-transparent text-gray-600 hover:text-gray-900"
                          }`}
                        >
                          {tab.title}
                          <span
                            className={`rounded-full px-2 py-0.5 text-xs font-normal ${
                              selected
                                ? "bg-mainColor-light text-mainColor-superDark"
                                : "bg-gray-100 text-gray-600"
                            }`}
                          >
                            {tab.items.length}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div role="tabpanel" id="doc-panel" aria-labelledby={`doc-tab-${activeTab.id}`}>
                  {activeTab.items.length === 0 ? (
                    <p className="py-10 text-center text-sm text-gray-600">{activeTab.empty}</p>
                  ) : (
                    <div className="overflow-x-auto border border-gray-100 rounded-md">
                      <table className="table-auto min-w-full divide-y divide-gray-200">
                        <thead>
                          <tr className="bg-gray-100">
                            {activeTab.columns.map((col) => (
                              <th key={col.title} scope="col" className={`${th} ${col.className || ""}`}>
                                {col.title}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {activeTab.items.map((doc) => (
                            <tr key={activeTab.rowKey(doc)}>
                              {activeTab.columns.map((col) => (
                                <td key={col.title} className={`${td} ${col.className || ""}`}>
                                  {col.cell(doc)}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </Dashboard>
      )}
    </>
  );
};

export default MyDocuments;
