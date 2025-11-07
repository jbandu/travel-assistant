import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Travel Assistant - AI-Powered Travel Planning",
  description: "Unified Multi-Agent Travel Assistant powered by AI",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
