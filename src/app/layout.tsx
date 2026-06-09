import type { Metadata } from "next";
import { Geist, Noto_Serif_KR } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/organisms/Header";
import { BottomNav } from "@/components/organisms/BottomNav";
import { ThemeProvider } from "@/components/providers/ThemeProvider";

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
    <html lang="ko" className={`${geist.variable} ${notoSerifKR.variable} h-full antialiased dark`} suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('theme');if(t==='light'){document.documentElement.classList.remove('dark')}else if(t==='system'){if(!window.matchMedia('(prefers-color-scheme: dark)').matches){document.documentElement.classList.remove('dark')}}else{document.documentElement.classList.add('dark')}}catch(e){}})()`,
          }}
        />
      </head>
      <body className="min-h-full flex justify-center bg-background">
        <ThemeProvider>
          <div className="w-full max-w-2xl min-h-screen flex flex-col bg-[var(--background)] relative">
            <Header />
            <main className="flex-1 flex flex-col px-4 py-6 pb-24">
              {children}
            </main>
            <BottomNav />
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
