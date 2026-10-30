import { ImageResponse } from "next/og";
import { getPortfolio } from "@/lib/content/portfolio";

export const alt = "Project preview";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OpengraphImage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const { projects, profile } = await getPortfolio();
  const project = projects.find((p) => p.slug === slug);

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
            "radial-gradient(circle at 15% 10%, rgba(34,211,238,0.35), transparent 50%), radial-gradient(circle at 90% 90%, rgba(139,92,246,0.45), transparent 55%), #05070F",
        }}
      >
        <div style={{ display: "flex", fontSize: 26, letterSpacing: 6, color: "#22D3EE" }}>
          {profile.name.toUpperCase()} · PORTFOLIO
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 88, fontWeight: 700, lineHeight: 1.05 }}>
            {project?.title ?? "Project"}
          </div>
          <div style={{ fontSize: 34, color: "#A8B0C2", marginTop: 20, maxWidth: 1000 }}>
            {project?.summary ?? ""}
          </div>
        </div>
        <div style={{ display: "flex", gap: 14 }}>
          {(project?.technologies ?? []).slice(0, 5).map((t) => (
            <div
              key={t}
              style={{
                display: "flex",
                fontSize: 24,
                padding: "8px 20px",
                borderRadius: 999,
                border: "1px solid rgba(255,255,255,0.2)",
              }}
            >
              {t}
            </div>
          ))}
        </div>
      </div>
    ),
    size,
  );
}
