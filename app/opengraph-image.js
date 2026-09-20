import { ImageResponse } from "next/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #3f286e 0%, #3d266a 54%, #372360 100%)",
          color: "#fff",
        }}
      >
        <div
          style={{
            fontSize: 26,
            letterSpacing: 10,
            textTransform: "uppercase",
            color: "#c7b5db",
            marginBottom: 28,
          }}
        >
          Young Harris College
        </div>
        <div style={{ fontSize: 150, fontWeight: 700, letterSpacing: -2 }}>YHCIC</div>
        <div style={{ fontSize: 30, color: "#d7c8e8", marginTop: 30 }}>Investment Club &middot; Officer Panel</div>
      </div>
    ),
    { ...size }
  );
}
