import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Embassy of Lebanon Islamabad",
  description: "Official website of the Embassy of Lebanon in Islamabad, Pakistan.",
  keywords: ["Embassy of Lebanon Islamabad", "Embassy of Lebanon in Islamabad", "Lebanon Embassy Islamabad"],
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
