export const OG_SIZE = { width: 1200, height: 630 };

export function BrandOgImage() {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        padding: "80px 96px",
        background: "linear-gradient(135deg, #c1552c 0%, #8f3d1e 100%)",
        color: "white",
        fontFamily: "sans-serif",
      }}
    >
      <div style={{ display: "flex", fontSize: 30, fontWeight: 600, opacity: 0.85, letterSpacing: 2 }}>
        24/7 · KRAKÓW · KATOWICE
      </div>
      <div style={{ display: "flex", fontSize: 96, fontWeight: 700, marginTop: 18, lineHeight: 1 }}>
        transfer247.pl
      </div>
      <div style={{ display: "flex", fontSize: 34, marginTop: 26, opacity: 0.92 }}>
        Prywatny transfer lotniskowy i wycieczki z kierowcą
      </div>

      <div style={{ display: "flex", alignItems: "center", marginTop: 64 }}>
        <div
          style={{
            width: 0,
            height: 0,
            borderTop: "16px solid transparent",
            borderBottom: "16px solid transparent",
            borderLeft: "26px solid white",
          }}
        />
        <div
          style={{
            display: "flex",
            width: 560,
            height: 4,
            marginLeft: 18,
            background:
              "repeating-linear-gradient(90deg, white 0px, white 22px, transparent 22px, transparent 40px)",
            opacity: 0.8,
          }}
        />
        <div
          style={{
            display: "flex",
            width: 28,
            height: 28,
            marginLeft: 18,
            borderRadius: 6,
            background: "white",
          }}
        />
      </div>
    </div>
  );
}
