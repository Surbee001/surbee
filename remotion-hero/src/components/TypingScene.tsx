import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
  Easing,
} from "remotion";
import { SURBEE_COLORS } from "../HeroVideo";

export const TypingScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const prompt = "Create a customer feedback survey for my coffee shop";

  // Calculate how many characters to show based on frame
  const charsToShow = Math.min(
    Math.floor(interpolate(frame, [20, 100], [0, prompt.length], {
      extrapolateRight: "clamp",
    })),
    prompt.length
  );

  const displayedText = prompt.slice(0, charsToShow);
  const showCursor = frame % 30 < 15 || charsToShow < prompt.length;

  // Container animation
  const containerOpacity = interpolate(frame, [0, 20], [0, 1], {
    extrapolateRight: "clamp",
  });

  const containerScale = spring({
    frame,
    fps,
    config: { damping: 15, stiffness: 80 },
    from: 0.95,
    to: 1,
  });

  // Exit animation
  const exitOpacity = interpolate(frame, [115, 135], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        justifyContent: "center",
        alignItems: "center",
        opacity: containerOpacity * exitOpacity,
        transform: `scale(${containerScale})`,
      }}
    >
      {/* Surbee Dashboard Mockup */}
      <div
        style={{
          width: 1000,
          height: 650,
          backgroundColor: SURBEE_COLORS.bgPrimary,
          borderRadius: 16,
          overflow: "hidden",
          boxShadow: "0 25px 80px rgba(0, 0, 0, 0.25)",
          display: "flex",
        }}
      >
        {/* Sidebar */}
        <div
          style={{
            width: 240,
            backgroundColor: "rgba(255, 255, 255, 0.02)",
            borderRight: "1px solid rgba(255, 255, 255, 0.06)",
            padding: "20px 16px",
            display: "flex",
            flexDirection: "column",
          }}
        >
          {/* Logo */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              marginBottom: 32,
              paddingLeft: 8,
            }}
          >
            <div
              style={{
                width: 28,
                height: 28,
                borderRadius: 8,
                background: SURBEE_COLORS.fgPrimary,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path
                  d="M12 2L2 7L12 12L22 7L12 2Z"
                  stroke={SURBEE_COLORS.bgPrimary}
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <span
              style={{
                fontSize: 18,
                fontWeight: 600,
                color: SURBEE_COLORS.fgPrimary,
                letterSpacing: "-0.02em",
              }}
            >
              Surbee
            </span>
          </div>

          {/* Nav Items */}
          {["New Chat", "My Surveys", "Templates", "Settings"].map((item, i) => (
            <div
              key={item}
              style={{
                padding: "10px 12px",
                borderRadius: 8,
                marginBottom: 4,
                backgroundColor: i === 0 ? "rgba(255, 255, 255, 0.06)" : "transparent",
                color: i === 0 ? SURBEE_COLORS.fgPrimary : SURBEE_COLORS.fgMuted,
                fontSize: 14,
                fontWeight: i === 0 ? 500 : 400,
              }}
            >
              {item}
            </div>
          ))}
        </div>

        {/* Main Content */}
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            padding: 40,
          }}
        >
          {/* Welcome text */}
          <h1
            style={{
              fontSize: 32,
              fontWeight: 500,
              color: SURBEE_COLORS.fgPrimary,
              marginBottom: 8,
              letterSpacing: "-0.02em",
            }}
          >
            What would you like to create?
          </h1>
          <p
            style={{
              fontSize: 16,
              color: SURBEE_COLORS.fgMuted,
              marginBottom: 40,
            }}
          >
            Describe your survey and I'll build it for you
          </p>

          {/* Chat Input - Surbee style */}
          <div
            style={{
              width: "100%",
              maxWidth: 600,
              backgroundColor: SURBEE_COLORS.bgSecondary,
              borderRadius: 19,
              padding: "16px 20px",
              border: "1px solid rgba(255, 255, 255, 0.08)",
            }}
          >
            <div
              style={{
                minHeight: 24,
                display: "flex",
                alignItems: "center",
              }}
            >
              <span
                style={{
                  fontSize: 15,
                  color: displayedText ? SURBEE_COLORS.fgPrimary : SURBEE_COLORS.fgMuted,
                  lineHeight: 1.5,
                }}
              >
                {displayedText || "Type your message..."}
              </span>
              {showCursor && charsToShow > 0 && (
                <span
                  style={{
                    display: "inline-block",
                    width: 2,
                    height: 20,
                    backgroundColor: SURBEE_COLORS.fgPrimary,
                    marginLeft: 1,
                  }}
                />
              )}
            </div>

            {/* Input actions */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginTop: 12,
                paddingTop: 12,
                borderTop: "1px solid rgba(255, 255, 255, 0.06)",
              }}
            >
              <div style={{ display: "flex", gap: 8 }}>
                {/* Attach button */}
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 8,
                    backgroundColor: "rgba(255, 255, 255, 0.05)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={SURBEE_COLORS.fgMuted} strokeWidth="2">
                    <path d="M12 5v14M5 12h14" />
                  </svg>
                </div>
              </div>

              {/* Send button */}
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 8,
                  backgroundColor: charsToShow > 0 ? SURBEE_COLORS.fgPrimary : "rgba(255, 255, 255, 0.1)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={charsToShow > 0 ? SURBEE_COLORS.bgPrimary : SURBEE_COLORS.fgMuted} strokeWidth="2">
                  <path d="M12 19V5M5 12l7-7 7 7" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};
