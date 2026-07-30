import requests from "./httpServices";

/** מפתח יציב לטאב — מונע מרוץ בין שתי קריאות מקבילות שיוצרות שני מפתחות שונים */
let guestSessionKeyCache = "";

function getGuestDeliverySessionKey() {
    if (typeof window === "undefined") return "";
    if (guestSessionKeyCache) return guestSessionKeyCache;
    try {
        const existing = sessionStorage.getItem("guestDeliveryLogKey");
        if (existing) {
            guestSessionKeyCache = existing;
            return guestSessionKeyCache;
        }
        guestSessionKeyCache = `gk_${Date.now()}_${Math.random().toString(36).slice(2, 12)}`;
        sessionStorage.setItem("guestDeliveryLogKey", guestSessionKeyCache);
        return guestSessionKeyCache;
    } catch {
        if (!guestSessionKeyCache) {
            guestSessionKeyCache = `mem_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
        }
        return guestSessionKeyCache;
    }
}

const DeliveryServices = {
    getByCityName: async (city, { customerName, customerPhone } = {}) => {
        const encoded = encodeURIComponent(city);
        const params = new URLSearchParams();
        params.set("source", "tomer-store");
        if (customerName && String(customerName).trim()) {
            params.set("customerName", String(customerName).trim());
        }
        if (customerPhone && String(customerPhone).trim()) {
            params.set("customerPhone", String(customerPhone).trim());
        }
        const sess = getGuestDeliverySessionKey();
        if (sess) {
            params.set("guestSessionKey", sess);
        }
        const res = await requests.get(
            `/deliveries/getbycity/${encoded}?${params.toString()}`
        );
        return res;
    },
    getAllDeliveries: async () => {
        const res = await requests.get("/deliveries");
        return res;
    }
}

export default DeliveryServices