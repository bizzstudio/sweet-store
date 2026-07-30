// src/services/CustomerServices.js
import requests from "./httpServices";

const CustomerServices = {
  customerLogin: async (body) => {
    return requests.post("/customer/login", body);
  },

  // כניסה בטלפון: שליחת קוד אימות ב-SMS
  sendOtp: async (body) => {
    return requests.post("/customer/send-otp", body);
  },

  // כניסה בטלפון: אימות הקוד והתחברות
  verifyOtp: async (body) => {
    return requests.post("/customer/verify-otp", body);
  },

  verifyEmailAddress: async (body) => {
    return requests.post("/customer/verify-email", body);
  },

  registerCustomer: async (token, body) => {
    return requests.post(`/customer/register/${token}`, body);
  },

  signUpWithProvider: async (body) => {
    return requests.post(`/customer/signup-with-google`, body);
  },

  forgetPassword: async (body) => {
    return requests.put("/customer/forget-password", body);
  },

  resetPassword: async (body) => {
    return requests.put("/customer/reset-password", body);
  },

  // האם הלקוח המחובר עדיין זכאי לקופון "לקנייה הבאה" (הטבה חד-פעמית לכל לקוח)
  getShippingRewardEligibility: async () => {
    return requests.get("/customer/shipping-reward-eligible");
  },

  changePassword: async (body) => {
    return requests.post("/customer/change-password", body);
  },

  updateCustomer: async (id, body) => {
    return requests.put(`/customer/${id}`, body);
  },

  sendContactUsMessage: async (body) => {
    return requests.post("/customer/contact-us", body);
  },

  validateToken: async () => {
    return requests.get("/customer/validate-token");
  },
};

export default CustomerServices;
