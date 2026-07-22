import { Inter } from "next/font/google";
import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Providers } from "@/components/providers";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Connect Chat Widget",
  description: "AI-Powered Customer Support Widget",
  icons: {
    icon: "/icon_connect.png",
    apple: "/icon_connect.png",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full w-full">
      <body
        className={
          inter.className +
          " bg-transparent h-full w-full m-0 p-0 overflow-hidden"
        }
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
