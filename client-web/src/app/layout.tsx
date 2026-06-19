import type { Metadata, Viewport } from "next";
import Script from "next/script";
import { AuthProvider } from "@/components/providers/AuthProvider";
import { ServiceWorkerRegister } from "@/components/pwa/ServiceWorkerRegister";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://motion.wencai.app"),
  title: {
    default: "Motion — Agent-Friendly Knowledge Base, Backed by GitHub",
    template: "%s | Motion",
  },
  description:
    "Agent-friendly, pure-frontend knowledge editor. Your notes live in a GitHub repo you own — Markdown-native, MIT-licensed, no server, no vendor lock-in.",
  applicationName: "Motion",
  authors: [{ name: "Zoe", url: "https://zoe.im" }],
  creator: "Zoe",
  manifest: "/manifest.json",
  icons: {
    icon: "/icon.svg",
    apple: "/apple-touch-icon.png",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Motion",
  },
  openGraph: {
    type: "website",
    siteName: "Motion",
    locale: "en_US",
    images: [
      {
        url: "/logo-512.png",
        width: 512,
        height: 512,
        alt: "Motion — Agent-Friendly Knowledge Base",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    creator: "@jiusanzhou",
    images: ["/logo-512.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export const viewport: Viewport = {
  themeColor: "#0a0a0a",
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
  const plausibleDomain = process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN;

  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased">
        <AuthProvider>{children}</AuthProvider>
        <ServiceWorkerRegister />
        {plausibleDomain && (
          <>
            <Script
              id="plausible-queue"
              strategy="beforeInteractive"
              dangerouslySetInnerHTML={{
                __html:
                  "window.plausible=window.plausible||function(){(window.plausible.q=window.plausible.q||[]).push(arguments)}",
              }}
            />
            <Script
              defer
              data-domain={plausibleDomain}
              src="https://plausible.io/js/script.js"
              strategy="afterInteractive"
            />
          </>
        )}
      </body>
    </html>
  );
}
