// src/services/DocumentServices.js
//
// "המסמכים שלי". אין כאן מזהה לקוח בשום קריאה: השרת מחזיר את המסמכים של
// מי שמחובר, לפי הטוקן.
import requests from "./httpServices";

const DocumentServices = {
  getMyDocuments: async () => {
    return requests.get("/my-documents");
  },

  // ה-PDF נמשך כ-blob ולא נפתח ככתובת רגילה: הנתיב דורש את כותרת
  // ההזדהות, וקישור <a> רגיל אינו שולח אותה
  getDeliveryNotePdf: async (id) => {
    return requests.get(`/my-documents/delivery-note/${id}/pdf`, { responseType: "blob" });
  },

  getQuotePdf: async (id) => {
    return requests.get(`/my-documents/quote/${id}/pdf`, { responseType: "blob" });
  },
};

export default DocumentServices;
