import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Out the Group Chat",
  description: "Plan trips with your friends — no chaos required.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-full flex flex-col bg-[#fafafa]">{children}</body>
    </html>
  );
}
