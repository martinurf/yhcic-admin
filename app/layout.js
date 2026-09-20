import "./globals.css";

export const metadata = {
  // Without this, Next.js resolves relative URLs (the OG image, most
  // notably) against http://localhost:3000 — fine in dev, broken for
  // real link previews once deployed.
  metadataBase: new URL("https://yhcic-admin.vercel.app"),
  title: "YHCIC — Sign in",
  description: "Young Harris College Investment Club — officer admin panel.",
  robots: { index: false, follow: false },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#3f286e",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Bodoni+Moda:opsz,wght@6..96,500;6..96,600&family=Inter:wght@400;500;600&display=swap"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
