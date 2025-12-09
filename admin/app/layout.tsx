import type { Metadata } from "next";
import "./globals.css";
import Sidebar from "@/components/Sidebar";

export const metadata: Metadata = {
  title: "Portfolio Admin",
  description: "Admin Dashboard for Portfolio API",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="de">
      <body className="bg-[#f5f5f7]">
        <div className="flex min-h-screen">
          <Sidebar />
          <main className="flex-1 ml-64 p-10">
            <div className="max-w-6xl mx-auto">
              {children}
            </div>
          </main>
        </div>
      </body>
    </html>
  );
}
