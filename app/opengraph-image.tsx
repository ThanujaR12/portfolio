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
          color: "#E6EAF2",
          background:
            "radial-gradient(circle at 80% 0%, rgba(139,92,246,0.45), transparent 55%), radial-gradient(circle at 0% 100%, rgba(34,211,238,0.35), transparent 50%), #05070F",
        }}
      >
        <div style={{ display: "flex", fontSize: 26, letterSpacing: 6, color: "#22D3EE" }}>PORTFOLIO</div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 84, fontWeight: 700, lineHeight: 1.05 }}>{profile.name}</div>
          <div style={{ fontSize: 36, color: "#A8B0C2", marginTop: 18, maxWidth: 1000 }}>{profile.positioning}</div>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
          <div style={{ display: "flex", gap: 12 }}>
            {techs.map((t) => (
              <div
                key={t}
                style={{ display: "flex", fontSize: 22, padding: "6px 18px", borderRadius: 999, border: "1px solid rgba(255,255,255,0.2)" }}
              >
                {t}
              </div>
            ))}
          </div>
          <div style={{ display: "flex", fontSize: 22, color: "#8A93A6" }}>
            {featured.map((p) => p.title).join(" · ")}
          </div>
        </div>
      </div>
    ),
    size,
  );
}
