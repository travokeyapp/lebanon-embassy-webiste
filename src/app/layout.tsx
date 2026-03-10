import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Lebanon Embassy Islamabad",
  description: "Official website of the Lebanon Embassy Islamabad, Pakistan.",
  keywords: ["Lebanon Embassy Islamabad", "Embassy of Lebanon in Islamabad", "Lebanon Embassy Pakistan"],
  icons: {
    icon: "/cedar-logo.png",
    shortcut: "/cedar-logo.png",
    apple: "/cedar-logo.png",
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
