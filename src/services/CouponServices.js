import requests from "./httpServices";

const CouponServices = {
  getAllCoupons: async () => {
    return requests.get("/coupon");
  },
  getShowingCoupons: async () => {
    return requests.get("/coupon/show");
  },
  useCoupon: async ({ couponCode, cartTotal }) => {
    return requests.put(`/coupon/use/${couponCode}`, { cartTotal });
  },
};

export default CouponServices;
