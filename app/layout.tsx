import type React from "react";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/lib/auth-context"; // Add AuthProvider import

const inter = Inter({ subsets: ["latin"], weight: ["300", "400", "500", "600", "700"] });

export const metadata: Metadata = {
  title: "vendai - AI-Powered Shopping",
  description: "Shop at wholesale prices with AI assistance. Simple, fast, and intuitive ecommerce.",
  generator: "v0.dev",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} bg-black text-white antialiased`}>
        <AuthProvider>{children}</AuthProvider> {/* Wrap children with AuthProvider */}
      </body>
    </html>
  );
}