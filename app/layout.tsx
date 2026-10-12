import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AI毒舌大叔 · 聊志愿",
  description:
    "不废话，说真话。把分数、省份和家里的资源说清楚，再听一个明确判断。",
};

export const viewport: Viewport = {
  themeColor: "#0c0a10",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="zh-CN" className="h-full antialiased">
      <body className="h-dvh overflow-hidden bg-ink text-paper">{children}</body>
    </html>
  );
}
