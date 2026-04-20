export default function robots() {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
      },
    ],
    sitemap: "https://policyengine-us-improvements-2026.vercel.app/sitemap.xml",
  };
}
