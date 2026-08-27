import requests from "./httpServices";

const ProductServices = {

  getShowingProducts: async () => {
    return requests.get("/products/show");
  },

  getCartProducts: async () => {
    return requests.get("/products/cart-products");
  },

  getShowingStoreProducts: async ({
    category = "",
    title = "",
    slug = "",
    sku = "",
    // עימוד ומיון בצד השרת. שניהם opt-in: בלי page/limit ה-endpoint מתנהג
    // בדיוק כמו קודם (100 מוצרים, מיון אלפביתי), ולכן דף הבית לא מושפע.
    page = null,
    limit = null,
    sort = null,
  }) => {
    // resolve the issue with URLs that include non-English letters.
    const rawSlug = String(slug ?? "").trim();
    let newSlug = rawSlug
      .toLowerCase()
      .replace(/[()]+/g, "")
      .replace(/[\[\]\\]/g, "") // strip '[' ']' and '\' - they break the backend regex
      .replace(/\s+/g, "-");
    const encodedSlug = encodeURIComponent(newSlug);
    // Replace '[' and '\' with '' - משום מה זה גורם לקריסה, צריך לבדוק מה הלוז
    const cleanTitle = title.replace(/[\[\\]/g, "");
    const encodedTitle = encodeURIComponent(cleanTitle);
    const encodedCategory = encodeURIComponent(category);

    // console.log({ encodedSlug })

    const pagination =
      page || limit || sort
        ? `&page=${page || 1}&limit=${limit || 48}&sort=${encodeURIComponent(sort || "Popular")}`
        : "";

    return requests.get(
      `/products/store?category=${encodedCategory}&title=${encodedTitle}&slug=${encodedSlug}&sku=${sku}${pagination}`
    );
  },

  findProductByTranscript: async (transcript) => {
    return requests.get(`/products/voice-search?transcript=${transcript}`);
  },

  getDiscountedProducts: async () => {
    return requests.get("/products/discount");
  },

  getProductBySlug: async (slug) => {
    const raw = String(slug ?? "").trim();
    if (!raw) {
      return Promise.reject(new Error("Missing product slug"));
    }
    const encodedSlug = encodeURIComponent(raw);
    return requests.get(`/products/product/${encodedSlug}`);
  },
};

export default ProductServices;
