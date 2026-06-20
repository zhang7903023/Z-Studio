import type { Metadata } from "next";
import "./globals.css";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { SupportFloat } from "@/components/support-float";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"),
  title: {
    default: "Z-Studio | 全球数字资源服务平台",
    template: "%s | Z-Studio"
  },
  description:
    "Z-Studio 专注 TikTok、Facebook、Instagram、YouTube、Gmail、跨境电商与网络资源的全球数字资源服务平台。",
  openGraph: {
    title: "Z-Studio | 全球数字资源服务平台",
    description:
      "科技极简风数字资源商城，支持分类浏览、下单、订单查询与后台管理。",
    type: "website"
  },
  twitter: {
    card: "summary_large_image"
  }
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-CN">
      <body className="font-body bg-bg text-text antialiased">
        <div className="pointer-events-none fixed inset-0 grid-overlay opacity-40" />
        <SiteHeader />
        <main className="relative">{children}</main>
        <SiteFooter />
        <SupportFloat />
      </body>
    </html>
  );
}
