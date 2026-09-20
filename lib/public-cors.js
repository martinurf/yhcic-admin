export const PUBLIC_ORIGINS = ["https://yhcic.vercel.app", "https://martinurf.github.io"];

export function corsHeaders(origin) {
  const allowed = PUBLIC_ORIGINS.includes(origin) ? origin : PUBLIC_ORIGINS[0];
  return {
    "Access-Control-Allow-Origin": allowed,
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };
}

export function originAllowed(origin) {
  return !origin || PUBLIC_ORIGINS.includes(origin);
}
