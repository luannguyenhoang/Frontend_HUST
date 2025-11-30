"use client";

import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { fetchProfileAction } from "@/redux/modules/auth";
import Cookies from "js-cookie";
import { REFRESH_TOKEN } from "@/utils/server";
import { initializeAccessToken } from "@/utils/axiosConfig";

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const dispatch = useAppDispatch();
  const { currentUser } = useAppSelector((state) => state.auth);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    if (!initialized) {
      initializeAccessToken();
      setInitialized(true);
    }

    const refreshToken = Cookies.get(REFRESH_TOKEN);
    if (refreshToken && !currentUser && initialized) {
      dispatch(fetchProfileAction());
    }
  }, [dispatch, currentUser, initialized]);

  return <>{children}</>;
}

