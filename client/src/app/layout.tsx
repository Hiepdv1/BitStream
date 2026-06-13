import type { Metadata } from "next";
import { Noto_Sans, Roboto } from "next/font/google";
import { Providers } from "@/providers";
import { Toaster } from "@/components/ui/toaster";
import "../styles/globals.css";

const headingFont = Roboto({
  weight: ["500", "700"],
  subsets: ["latin", "vietnamese"],
  variable: "--font-heading",
  display: "swap",
});

const notoSans = Noto_Sans({
  weight: ["300", "400", "500", "700"],
  subsets: ["latin", "vietnamese"],
  variable: "--font-body",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "BitStream — Live Streaming Platform",
    template: "%s | BitStream",
  },
  description:
    "BitStream is a live streaming platform for gamers, creators, and communities. Watch and stream live content, clips, and more.",
  keywords: ["live streaming", "gaming", "watch streams", "bitstream"],
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "BitStream",
    title: "BitStream — Live Streaming Platform",
    description: "Watch and stream live content with BitStream.",
  },
  twitter: {
    card: "summary_large_image",
    title: "BitStream — Live Streaming Platform",
    description: "Watch and stream live content with BitStream.",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${headingFont.variable} ${notoSans.variable}`}
      suppressHydrationWarning
    >
      <body className="font-sans">
        <Providers>{children}</Providers>
        <Toaster position="top-right" expand={true} />
      </body>
    </html>
  );
}
