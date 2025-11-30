import axios, { AxiosError, AxiosResponse, InternalAxiosRequestConfig } from "axios";
import { REFRESH_TOKEN, server } from "./server";
import Cookies from "js-cookie";
import { refreshToken } from "./api/auth";
import jwtDecode from "jwt-decode";

export interface CurrentUser {
  id: number;
  phone: string;
  email: string;
  role: string;
  fullName?: string;
}

export interface AuthResponse {
  user: any;
  accessToken: string;
  refreshToken: string;
}

const ACCESS_TOKEN_KEY = "accessToken";

export let accessToken: string | null = null;

const getStoredAccessToken = (): string | null => {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(ACCESS_TOKEN_KEY);
};

const setStoredAccessToken = (token: string | null) => {
  if (typeof window === "undefined") return;
  if (token) {
    localStorage.setItem(ACCESS_TOKEN_KEY, token);
  } else {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
  }
};

export const persistToken = (tokens: AuthResponse) => {
  if (!tokens || !tokens.accessToken) {
    throw new Error("Invalid token: accessToken is missing");
  }
  
  accessToken = tokens.accessToken;
  setStoredAccessToken(tokens.accessToken);
  if (typeof window !== "undefined") {
    Cookies.set(REFRESH_TOKEN, tokens.refreshToken, { expires: 7 });
  }
  
  try {
    return jwtDecode(tokens.accessToken) as CurrentUser;
  } catch (error) {
    throw new Error(`Invalid token specified: ${error}`);
  }
};

export const setAccessToken = (token: string | null) => {
  accessToken = token;
  setStoredAccessToken(token);
};

export const initializeAccessToken = () => {
  const stored = getStoredAccessToken();
  if (stored) {
    accessToken = stored;
  }
};

export const api = axios.create({
  baseURL: server + "/api",
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: any) => void;
  reject: (error?: any) => void;
}> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    if (!accessToken) {
      accessToken = getStoredAccessToken();
    }
    if (accessToken && config.headers) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    if (error.response && error.response.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            if (originalRequest.headers && token) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
            }
            return api(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshTokenValue = Cookies.get(REFRESH_TOKEN);
        if (!refreshTokenValue) {
          throw new Error("No refresh token");
        }

        const response = await refreshToken({ refreshToken: refreshTokenValue });
        const { accessToken: newAccessToken } = response;
        accessToken = newAccessToken;
        setStoredAccessToken(newAccessToken);

        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        }

        processQueue(null, newAccessToken);
        isRefreshing = false;

        return api(originalRequest);
      } catch (err) {
        processQueue(err, null);
        isRefreshing = false;
        if (typeof window !== "undefined") {
          Cookies.remove(REFRESH_TOKEN);
          accessToken = null;
          setStoredAccessToken(null);
          if (!window.location.pathname.includes("/login")) {
            window.location.href = "/login";
          }
        }
        return Promise.reject(err);
      }
    }

    return Promise.reject(error);
  }
);

export const apiWithToken = () => {
  return api;
};

