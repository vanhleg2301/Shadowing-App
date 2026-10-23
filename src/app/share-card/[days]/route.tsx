import { ImageResponse } from "next/og";

const SIZE = 1080;

// Square image of a streak, shared from the home screen with the Web Share API.
export async function GET(_request: Request, { params }: RouteContext<"/share-card/[days]">) {
  const days = Number((await params).days);
  if (!Number.isInteger(days) || days < 1 || days > 9999) return new Response("Not found", { status: 404 });

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
          background: "linear-gradient(160deg, #1b1f3b 0%, #0d0f1e 100%)",
          color: "white",
          fontFamily: "sans-serif",
        }}
      >
        <svg width={220} height={220} viewBox="0 0 24 24" fill="#e85d43">
          <path d="M12 2c1 3.5-1.5 5.5-1.5 8a2.5 2.5 0 0 0 5 0c0-1-.3-1.8-.8-2.6C17.8 9 20 12 20 15a8 8 0 1 1-16 0c0-4.6 4.4-7.4 8-13z" />
        </svg>
        <div style={{ fontSize: 260, fontWeight: 800, lineHeight: 1, marginTop: 20 }}>{String(days)}</div>
        <div style={{ fontSize: 64, fontWeight: 700, color: "#c7d2fe" }}>{`${days === 1 ? "day" : "days"} of English in a row`}</div>
        <div style={{ fontSize: 40, color: "#818cf8", marginTop: 80 }}>Shadowing · learn English from real videos</div>
      </div>
    ),
    { width: SIZE, height: SIZE, headers: { "Cache-Control": "public, max-age=31536000, immutable" } },
  );
}
