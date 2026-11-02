import { ImageResponse } from "next/og";
import { getPortfolio } from "@/lib/content/portfolio";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default async function AppleIcon() {
  const { profile } = await getPortfolio();
  const initials = profile.name
    .split(/\s+/)
    .map((w) => w[0])
    .join("")
    .slice(0, 2);
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #2B5FE0, #7C4DDB)",
          color: "#FFFFFF",
          fontSize: 76,
          fontWeight: 700,
        }}
      >
        {initials}
      </div>
    ),
    size,
  );
}
