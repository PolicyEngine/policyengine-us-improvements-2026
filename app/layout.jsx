import Script from "next/script";
import "./globals.css";

const GA_ID = "G-91M4529HE7";
const TOOL_NAME = "policyengine-us-improvements-2026";

export const metadata = {
  title: "PolicyEngine US Improvements Since 2026-01-01 | PolicyEngine",
  description:
    "Interactive dashboard summarizing improvements to policyengine-us and policyengine-us-data since January 1, 2026.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          rel="stylesheet"
          href="https://unpkg.com/@policyengine/design-system/dist/tokens.css"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
          strategy="afterInteractive"
        />
        <Script id="gtag-init" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${GA_ID}', { tool_name: '${TOOL_NAME}' });
          `}
        </Script>
      </head>
      <body>{children}</body>
    </html>
  );
}
