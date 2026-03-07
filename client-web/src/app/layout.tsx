import type { Metadata, Viewport } from "next";
import Script from "next/script";
import { AuthProvider } from "@/components/providers/AuthProvider";
import { ServiceWorkerRegister } from "@/components/pwa/ServiceWorkerRegister";
import "./globals.css";

export const metadata: Metadata = {
  title: "Motion — Knowledge Editor",
  description: "Agent-friendly knowledge base editor powered by GitHub",
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
