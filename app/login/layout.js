// Static prerendering bakes a fixed CSP nonce into the HTML at build
// time, but the middleware issues a fresh nonce on every request —
// on a statically-generated page those two never match, so every
// script tag (React hydration included) gets silently blocked by the
// browser's CSP. Force this route to render per-request instead, the
// same fix the rest of (app) already uses for its own reasons.
export const dynamic = "force-dynamic";

export default function LoginLayout({ children }) {
  return children;
}
