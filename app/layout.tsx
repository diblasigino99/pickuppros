import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Nexra OS | Boutique Hotel PMS",
  description: "A modern property management system prototype for luxury boutique hotels.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
