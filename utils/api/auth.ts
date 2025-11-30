import { AxiosResponse } from "axios";
import { api, apiWithToken, AuthResponse, CurrentUser } from "../axiosConfig";

export interface LoginRequest {
  phoneOrEmail: string;
  password: string;
}

export interface RegisterRequest {
  phone: string;
  email?: string;
  password: string;
  fullName: string;
  dateOfBirth?: string;
  gender?: string;
  address?: string;
  role?: string;
}

export const login = (values: LoginRequest): Promise<AuthResponse> => {
  return api
    .post("/auth/login", values)
    .then((res: AxiosResponse<{ success: boolean; data: AuthResponse }>) => res.data.data);
};

export const refreshToken = (values: { refreshToken: string }): Promise<{ accessToken: string }> => {
  return api
    .post("/auth/refresh", values)
    .then((res: AxiosResponse<{ success: boolean; data: { accessToken: string } }>) => res.data.data);
};

export const registerUser = (values: RegisterRequest): Promise<CurrentUser> => {
  return api
    .post("/auth/register", values)
    .then((res: AxiosResponse<{ success: boolean; data: CurrentUser }>) => res.data.data);
};

export const getProfile = (): Promise<CurrentUser> => {
  return apiWithToken()
    .get("/auth/profile")
    .then((res: AxiosResponse<{ success: boolean; data: CurrentUser }>) => res.data.data);
};

export const logout = (refreshTokenValue: string): Promise<void> => {
  return apiWithToken()
    .post("/auth/logout", { refreshToken: refreshTokenValue })
    .then(() => {});
};

