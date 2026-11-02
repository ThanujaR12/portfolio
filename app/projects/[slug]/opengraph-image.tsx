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
          color: "#1D1D1F",
          background:
            "radial-gradient(circle at 10% 0%, rgba(159,188,255,0.9), transparent 50%), radial-gradient(circle at 90% 100%, rgba(205,178,255,0.9), transparent 55%), #FBFBFD",
        }}
      >
        <div style={{ display: "flex", fontSize: 26, letterSpacing: 6, color: "#2B5FE0" }}>
          {profile.name.toUpperCase()} · PORTFOLIO
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 88, fontWeight: 700, lineHeight: 1.05 }}>
            {project?.title ?? "Project"}
          </div>
          <div style={{ fontSize: 34, color: "#6E6E73", marginTop: 20, maxWidth: 1000 }}>
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
                border: "1px solid rgba(0,0,0,0.12)",
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
