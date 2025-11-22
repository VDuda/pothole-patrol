import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { MiniKitProvider } from "@worldcoin/minikit-js/minikit-provider";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Pothole Patrol - DePIN for Road Quality",
  description: "AI-powered dashcam for crowdsourcing verified road damage reports. Verified by World ID, anchored on Filecoin.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <MiniKitProvider>
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        >
          {children}
        </body>
      </MiniKitProvider>
    </html>
  );
}
