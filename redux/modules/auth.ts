import { createAction, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { call, fork, put, take } from "redux-saga/effects";
import { login, registerUser, getProfile, logout } from "@/utils/api/auth";
import Cookies from "js-cookie";
import { REFRESH_TOKEN } from "@/utils/server";
import { setAccessToken } from "@/utils/axiosConfig";
import { persistToken, CurrentUser } from "@/utils/axiosConfig";
import { LoginRequest, RegisterRequest } from "@/utils/api/auth";

export type AuthState = {
  readonly currentUser: CurrentUser | null;
  readonly isPending: boolean;
};

const initialState: AuthState = {
  currentUser: null,
  isPending: false,
};

const SLICE_NAME = "auth";

const authSlice = createSlice({
  name: SLICE_NAME,
  initialState,
  reducers: {
    updatePendingForLoginOrSignUpSuccess: (state) => ({
      ...state,
      isPending: true,
    }),
    loginSuccess: (state) => ({
      ...state,
      isPending: false,
    }),
    loginFailure: (state) => ({
      ...state,
      isPending: false,
    }),
    updateCurrentUserSuccess: (
      state,
      action: PayloadAction<AuthState["currentUser"]>,
    ) => ({
      ...state,
      currentUser: action.payload,
    }),
    registerUserSuccess: (state) => ({
      ...state,
      isPending: false,
    }),
    registerUserFailure: (state) => ({
      ...state,
      isPending: false,
    }),
    logoutSuccess: (state) => ({
      ...state,
      currentUser: null,
      isPending: false,
    }),
  },
});

export const {
  updatePendingForLoginOrSignUpSuccess,
  loginSuccess,
  loginFailure,
  updateCurrentUserSuccess,
  registerUserSuccess,
  registerUserFailure,
  logoutSuccess,
} = authSlice.actions;

export default authSlice.reducer;

export const registerAction = createAction<{
  values: RegisterRequest;
  clearForm: () => void;
}>(`${SLICE_NAME}/registerRequest`);

export const loginAction = createAction<{
  values: LoginRequest;
}>(`${SLICE_NAME}/loginRequest`);

export const fetchProfileAction = createAction(`${SLICE_NAME}/fetchProfileRequest`);

export const logoutAction = createAction<{ refreshToken: string }>(`${SLICE_NAME}/logoutRequest`);

function* handleLogin(): Generator<any, void, any> {
  while (true) {
    const {
      payload: { values },
    }: ReturnType<typeof loginAction> = yield take(loginAction);
    try {
      yield put(updatePendingForLoginOrSignUpSuccess());
      const res: any = yield call(login, values);
      
      if (!res || !res.accessToken) {
        throw new Error("Invalid response from server: missing accessToken");
      }
      
      const user = persistToken(res);
      yield put(updateCurrentUserSuccess(user));
      yield put(loginSuccess());
    } catch (e: any) {
      yield put(loginFailure());
      console.error("Login error:", e);
      if (typeof window !== "undefined") {
        alert(e?.message || "Đăng nhập thất bại. Vui lòng thử lại.");
      }
    }
  }
}

function* handleRegister(): Generator<any, void, any> {
  while (true) {
    const {
      payload: { values, clearForm },
    }: ReturnType<typeof registerAction> = yield take(registerAction.type);

    try {
      yield put(updatePendingForLoginOrSignUpSuccess());
      yield call(registerUser, values);
      yield put(registerUserSuccess());
      if (clearForm) clearForm();
      if (typeof window !== "undefined") {
        window.location.href = "/login";
      }
    } catch (e: any) {
      yield put(registerUserFailure());
      throw e;
    }
  }
}

function* handleFetchProfile(): Generator<any, void, any> {
  while (true) {
    yield take(fetchProfileAction);
    try {
      const user = yield call(getProfile);
      yield put(updateCurrentUserSuccess(user));
    } catch (e: any) {
      console.error("Failed to fetch profile:", e);
      if (e?.response?.status === 401) {
        Cookies.remove(REFRESH_TOKEN);
        if (typeof window !== "undefined") {
          window.location.href = "/login";
        }
      }
    }
  }
}

function* handleLogout(): Generator<any, void, any> {
  while (true) {
    const {
      payload: { refreshToken },
    }: ReturnType<typeof logoutAction> = yield take(logoutAction);
    try {
      yield call(logout, refreshToken);
      Cookies.remove(REFRESH_TOKEN);
      setAccessToken(null);
      yield put(logoutSuccess());
      if (typeof window !== "undefined") {
        window.location.href = "/login";
      }
    } catch (e: any) {
      Cookies.remove(REFRESH_TOKEN);
      setAccessToken(null);
      yield put(logoutSuccess());
      if (typeof window !== "undefined") {
        window.location.href = "/login";
      }
    }
  }
}

export const authSagas = [
  fork(handleLogin),
  fork(handleRegister),
  fork(handleFetchProfile),
  fork(handleLogout),
];

