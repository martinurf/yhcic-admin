export default function manifest() {
  return {
    name: "YHCIC Panel",
    short_name: "YHCIC",
    description: "Young Harris College Investment Club — officer admin panel.",
    start_url: "/",
    display: "standalone",
    background_color: "#fbfafc",
    theme_color: "#3f286e",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
  };
}
