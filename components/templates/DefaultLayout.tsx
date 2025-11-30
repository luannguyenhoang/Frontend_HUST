"use client";

import { ReactNode } from "react";
import HeaderMain from "../organisms/HeaderMain";
import Footer from "../organisms/Footer";

interface DefaultLayoutProps {
  children: ReactNode;
}

export default function DefaultLayout({ children }: DefaultLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col">
      <HeaderMain />
      <main className="flex-grow">{children}</main>
      <Footer />
    </div>
  );
}

