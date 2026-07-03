import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Design Data Guide & Management",
  description: "Manage design terminology, stitches, and seams data",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} h-screen bg-gray-50 flex flex-col text-gray-900 overflow-hidden`}>
        <Header />
        <main className="flex-1 overflow-hidden flex flex-col">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
