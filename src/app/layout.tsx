import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Instrument_Serif } from "next/font/google";
import { Analytics } from "@vercel/analytics/react";
import { Toaster } from "sonner";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });
const display = Instrument_Serif({
  variable: "--font-display",
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
});

export const metadata: Metadata = {
  title: "Collabs Flow — Study in flow",
  description:
    "A beautiful focus space for students: Pomodoro timer, lofi music from YouTube, ambient soundscapes, a task board, streaks and achievements.",
  openGraph: {
    title: "Collabs Flow — Study in flow",
    description: "Pomodoro timer, lofi music, ambient sounds, tasks and streaks — all in one calm space.",
    siteName: "Collabs Flow",
    images: [{ url: "/og.png" }],
  },
  icons: { icon: "/logo.svg" },
};

export const viewport: Viewport = {
  themeColor: "#07070c",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="dark" data-scene="aurora" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} ${display.variable} antialiased`}>
        {children}
        <Toaster
          theme="dark"
          position="bottom-center"
          toastOptions={{
            classNames: {
              toast: "!rounded-2xl !border !border-white/10 !bg-[#12121c]/90 !backdrop-blur-xl !text-white !shadow-2xl",
              description: "!text-white/60",
            },
          }}
        />
        <Analytics />
      </body>
    </html>
  );
}
