import { ImageResponse } from "next/og";
import { getPortfolio } from "@/lib/content/portfolio";

export const alt = "Portfolio preview";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Share card for the home page (links in messages, LinkedIn, etc.).
export default async function OpengraphImage() {
  const { profile, featured, projects } = await getPortfolio();
  const techs = [...new Set(projects.flatMap((p) => p.technologies))].slice(0, 6);
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 72,
          color: "#1D1D1F",
          background:
            "radial-gradient(circle at 85% 0%, rgba(205,178,255,0.95), transparent 55%), radial-gradient(circle at 10% 0%, rgba(159,188,255,0.9), transparent 50%), radial-gradient(circle at 100% 100%, rgba(255,191,217,0.8), transparent 50%), #FBFBFD",
        }}
      >
        <div style={{ display: "flex", fontSize: 26, letterSpacing: 6, color: "#2B5FE0" }}>PORTFOLIO</div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 84, fontWeight: 700, lineHeight: 1.05 }}>{profile.name}</div>
          <div style={{ fontSize: 36, color: "#6E6E73", marginTop: 18, maxWidth: 1000 }}>{profile.positioning}</div>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
          <div style={{ display: "flex", gap: 12 }}>
            {techs.map((t) => (
              <div
                key={t}
                style={{ display: "flex", fontSize: 22, padding: "6px 18px", borderRadius: 999, border: "1px solid rgba(0,0,0,0.12)" }}
              >
                {t}
              </div>
            ))}
          </div>
          <div style={{ display: "flex", fontSize: 22, color: "#6E6E73" }}>
            {featured.map((p) => p.title).join(" · ")}
          </div>
        </div>
      </div>
    ),
    size,
  );
}
