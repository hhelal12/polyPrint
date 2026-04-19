import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "PolyPrint | Copy Centre System",
  description: "Digital Transformation for Bahrain Polytechnic Copy Centre",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} antialiased`}
    >
      {/* We apply your background color F4F7F9 here */}
      <body className="min-h-screen bg-[#F4F7F9] text-[#0D284A]">
        {children}
      </body>
    </html>
  );
}