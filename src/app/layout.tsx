import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { UserProvider } from "./contexts/UserContext";
import { ServerProvider } from "./contexts/ServerContext";
import { LayoutWrapper } from "./components/LayoutWrapper";
import { ToastProvider } from "@/components/providers/ToastProvider";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "Messenger",
  description: "A real-time messaging application",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <UserProvider>
          <ServerProvider>
            <LayoutWrapper>
              {children}
            </LayoutWrapper>
            <ToastProvider />
          </ServerProvider>
        </UserProvider>
      </body>
    </html>
  );
}
