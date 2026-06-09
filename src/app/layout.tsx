import type { Metadata } from "next";
import { Geist, Noto_Serif_KR } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/organisms/Header";
import { BottomNav } from "@/components/organisms/BottomNav";

const geist = Geist({
  variable: "--font-sans",
  subsets: ["latin"],
});

const notoSerifKR = Noto_Serif_KR({
  variable: "--font-serif",
  subsets: ["latin"],
  weight: ["400", "600", "700"],
});

export const metadata: Metadata = {
  title: "어제의 머미",
  description: "머더 미스터리 플레이 기록, 평가, 장소 탐색 플랫폼",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className={`${geist.variable} ${notoSerifKR.variable} h-full antialiased`}>
      <body className="min-h-full flex justify-center" style={{ backgroundColor: 'oklch(0.12 0.04 245)' }}>
        <div className="w-full max-w-2xl min-h-screen flex flex-col bg-[var(--background)] relative">
          <Header />
          <main className="flex-1 flex flex-col px-4 py-6 pb-24">
            {children}
          </main>
          <BottomNav />
        </div>
      </body>
    </html>
  );
}
