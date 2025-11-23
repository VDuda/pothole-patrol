import type { Metadata } from "next";
import { Inter, Roboto_Mono } from "next/font/google";
import { MiniKitProvider } from "@worldcoin/minikit-js/minikit-provider";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const robotoMono = Roboto_Mono({
  variable: "--font-roboto-mono",
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
          className={`${inter.variable} ${robotoMono.variable} antialiased`}
        >
          {children}
        </body>
      </MiniKitProvider>
    </html>
  );
}
