// src/services/httpServices.js
import axios from 'axios';
import Cookies from 'js-cookie';

// בדפדפן הקריאות עוברות בנתיב יחסי (NEXT_PUBLIC_API_BASE_URL=/api) דרך ה-proxy של Next.
// ב-SSR (קוד שרץ בתוך הקונטיינר) נדרשת כתובת מוחלטת אל ה-backend הפנימי —
// INTERNAL_API_BASE_URL. ללא המשתנה (למשל ב-Vercel) חוזרים לכתובת הציבורית כבעבר.
const baseURL =
  typeof window === "undefined"
    ? process.env.INTERNAL_API_BASE_URL || process.env.NEXT_PUBLIC_API_BASE_URL
    : process.env.NEXT_PUBLIC_API_BASE_URL;

const instance = axios.create({
  baseURL: `${baseURL}`,
  timeout: 500000,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
});

/** No Bearer token — stale JWT on these routes can make the API return 401 before login runs. */
function isPublicCustomerAuthPath(url) {
  if (!url) return false;
  const path = url.split('?')[0];
  return (
    path === '/customer/login' ||
    path === '/customer/send-otp' ||
    path === '/customer/verify-otp' ||
    path === '/customer/verify-email' ||
    path === '/customer/signup-with-google' ||
    path === '/customer/forget-password' ||
    path === '/customer/reset-password' ||
    path.startsWith('/customer/register/')
  );
}

// Add a request interceptor
instance.interceptors.request.use(function (config) {
  let userInfo;
  try {
    const raw = Cookies.get('userInfo');
    if (raw) userInfo = JSON.parse(raw);
  } catch {
    userInfo = null;
  }

  const path = config.url || '';
  const skipAuth = isPublicCustomerAuthPath(path);
  const headers = { ...config.headers };

  if (skipAuth) {
    delete headers.Authorization;
    delete headers.authorization;
  } else if (userInfo?.token) {
    headers.Authorization = `Bearer ${userInfo.token}`;
  } else {
    delete headers.Authorization;
    delete headers.authorization;
  }

  return { ...config, headers };
});

// console.log(process.env.API_BASE_URL);
const responseBody = (response) => response.data;

const requests = {
  get: (url, body) => instance.get(url, body).then(responseBody),

  post: (url, body, headers) =>
    instance.post(url, body, headers).then(responseBody),

  put: (url, body) => instance.put(url, body).then(responseBody),
};

export default requests;
