import type { Metadata } from "next";
import "./admin.css";

export const metadata: Metadata = {
  title: "Website Admin · Embassy of Lebanon Islamabad",
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="adm" dir="ltr">
      {children}
    </div>
  );
}
