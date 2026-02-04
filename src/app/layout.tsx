import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "AgroProp",
  description: "Marketplace de campos en Paraguay"
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className="min-h-screen bg-white text-slate-900">
        {children}
      </body>
    </html>
  );
}
