import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/navbar";
import { getSession } from "./actions/auth";
import { getUserProfile } from "./actions/user-profile";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ElevateHealth - No Sugar Challenge",
  description: "2-week no sugar challenge to transform your health",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getSession();
  const userProfile = session ? await getUserProfile() : null;

  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased flex flex-col min-h-screen`}
      >
        <Navbar user={session?.user} userProfile={userProfile} />
        <main className="flex-1">{children}</main>
      </body>
    </html>
  );
}
