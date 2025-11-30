"use client";

import { Provider } from "react-redux";
import { store } from "@/redux/store";
import { AntdRegistry } from "@ant-design/nextjs-registry";
import AuthProvider from "@/components/providers/AuthProvider";
import "./globals.css";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi">
      <body>
        <Provider store={store}>
          <AntdRegistry>
            <AuthProvider>
              {children}
            </AuthProvider>
          </AntdRegistry>
        </Provider>
      </body>
    </html>
  );
}
