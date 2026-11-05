import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Taian · 2027申请计划",
  description: "申请时间线、每日安排、项目资料与云端待办。",
  robots: { index: false, follow: false },
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body className="antialiased">{children}</body>
    </html>
  );
}
