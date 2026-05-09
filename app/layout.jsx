import Script from "next/script";
import "./globals.css";

const GA_ID = "G-2YHG89FY0N";
const TOOL_NAME = "policyengine-us-improvements-2026";
const SITE_URL = "https://policyengine-us-improvements-2026.vercel.app";

export const metadata = {
  metadataBase: new URL(SITE_URL),
  title: "PolicyEngine US Improvements Since 2026-01-01 | PolicyEngine",
  description:
    "Interactive dashboard summarizing improvements to policyengine-us and policyengine-us-data since January 1, 2026. Explore changes by domain, concept, milestone, and timeline.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "PolicyEngine US Improvements Since 2026-01-01",
    description:
      "Interactive dashboard summarizing improvements to policyengine-us and policyengine-us-data since January 1, 2026. Explore changes by domain, concept, milestone, and timeline.",
    url: SITE_URL,
    siteName: "PolicyEngine",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "PolicyEngine US Improvements Since 2026-01-01",
    description:
      "Interactive dashboard summarizing improvements to policyengine-us and policyengine-us-data since January 1, 2026.",
    creator: "@ThePolicyEngine",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({ children }) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "PolicyEngine US Improvements Dashboard",
    description:
      "Interactive dashboard summarizing improvements to policyengine-us and policyengine-us-data since January 1, 2026.",
    url: SITE_URL,
    applicationCategory: "Government",
    operatingSystem: "Any",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
    author: {
      "@type": "Organization",
      name: "PolicyEngine",
      url: "https://policyengine.org",
    },
  };

  return (
    <html lang="en">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://fonts.googleapis.com" />
        <link rel="dns-prefetch" href="https://fonts.gstatic.com" />
        <link
          rel="stylesheet"
          href="https://unpkg.com/@policyengine/ui-kit/dist/styles.css"
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
        <Script id="engagement-tracking" strategy="afterInteractive">
          {`
            (function() {
              var TOOL_NAME = '${TOOL_NAME}';
              if (typeof window === 'undefined' || !window.gtag) return;

              var scrollFired = {};
              window.addEventListener('scroll', function() {
                var docHeight = document.documentElement.scrollHeight - window.innerHeight;
                if (docHeight <= 0) return;
                var pct = Math.floor((window.scrollY / docHeight) * 100);
                [25, 50, 75, 100].forEach(function(m) {
                  if (pct >= m && !scrollFired[m]) {
                    scrollFired[m] = true;
                    window.gtag('event', 'scroll_depth', { percent: m, tool_name: TOOL_NAME });
                  }
                });
              }, { passive: true });

              [30, 60, 120, 300].forEach(function(sec) {
                setTimeout(function() {
                  if (document.visibilityState !== 'hidden') {
                    window.gtag('event', 'time_on_tool', { seconds: sec, tool_name: TOOL_NAME });
                  }
                }, sec * 1000);
              });

              document.addEventListener('click', function(e) {
                var link = e.target && e.target.closest ? e.target.closest('a') : null;
                if (!link || !link.href) return;
                try {
                  var url = new URL(link.href, window.location.origin);
                  if (url.hostname && url.hostname !== window.location.hostname) {
                    window.gtag('event', 'outbound_click', {
                      url: link.href,
                      target_hostname: url.hostname,
                      tool_name: TOOL_NAME
                    });
                  }
                } catch (err) {}
              });
            })();
          `}
        </Script>
      </head>
      <body>{children}</body>
    </html>
  );
}
