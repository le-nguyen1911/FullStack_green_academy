import axios from "axios";

export const baseURL =
  import.meta.env.VITE_API_URL || "http://localhost:3000/api";


let accessToken = null;
export const setAccessToken = (token) => {
  accessToken = token;
};

const api = axios.create({ baseURL, withCredentials: true });

api.interceptors.request.use((config) => {
  if (accessToken) config.headers.Authorization = `Bearer ${accessToken}`;
  return config;
});

let refreshing = null;

export const refreshAccessToken = () => {
  refreshing ??= axios
    .post(`${baseURL}/auth/refresh`, null, { withCredentials: true })
    .then(({ data }) => {
      setAccessToken(data.accessToken);
      return data.accessToken;
    })
    .finally(() => {
      refreshing = null;
    });
  return refreshing;
};

const SKIP_REFRESH = [
  "/auth/login",
  "/auth/register",
  "/auth/refresh",
  "/auth/forgot-password",
  "/auth/reset-password",
];

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;
    const skip = SKIP_REFRESH.some((p) => original?.url?.includes(p));

    if (
      error.response?.status === 401 &&
      original &&
      !original._retry &&
      !skip
    ) {
      original._retry = true; 
      try {
        const token = await refreshAccessToken();
        original.headers.Authorization = `Bearer ${token}`;
        return api(original); 
      } catch (e) {
        setAccessToken(null);
        localStorage.removeItem("hasSession");
        window.dispatchEvent(new Event("auth:logout")); 
        return Promise.reject(e);
      }
    }
    return Promise.reject(error);
  },
);

export const getError = (e, fallback = "Không kết nối được máy chủ") =>
  e.response?.data?.message || fallback;

export default api;
