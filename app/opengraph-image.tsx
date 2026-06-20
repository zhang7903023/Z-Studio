import { ImageResponse } from "next/og";

export const runtime = "edge";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          width: "100%",
          height: "100%",
          padding: 72,
          color: "white",
          background:
            "radial-gradient(circle at top left, rgba(124,92,255,0.35), transparent 32%), linear-gradient(180deg, #050816, #090e19)"
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ fontSize: 28, letterSpacing: 6, opacity: 0.8 }}>Z-STUDIO</div>
          <div style={{ fontSize: 78, fontWeight: 700, lineHeight: 1.05 }}>全球数字资源服务平台</div>
          <div style={{ fontSize: 28, opacity: 0.85 }}>
            TikTok · Facebook · Instagram · YouTube · Gmail · 跨境电商
          </div>
        </div>
        <div style={{ display: "flex", gap: 20, fontSize: 24, opacity: 0.8 }}>
          <span>科技极简</span>
          <span>Supabase</span>
          <span>Vercel</span>
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}
