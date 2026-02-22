import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
} from "remotion";
import { SURBEE_COLORS } from "../HeroVideo";

export const GeneratingScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Entry animation
  const entryOpacity = interpolate(frame, [0, 20], [0, 1], {
    extrapolateRight: "clamp",
  });

  const entryScale = spring({
    frame,
    fps,
    config: { damping: 12, stiffness: 80 },
    from: 0.95,
    to: 1,
  });

  // Exit animation
  const exitOpacity = interpolate(frame, [85, 105], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Thinking dots animation
  const dotOpacity = (index: number) => {
    const cycle = (frame + index * 8) % 24;
    return interpolate(cycle, [0, 12, 24], [0.3, 1, 0.3]);
  };

  // Progress bar animation
  const progressWidth = interpolate(frame, [10, 80], [0, 100], {
    extrapolateRight: "clamp",
  });

  // Status text changes
  const statusTexts = [
    "Analyzing your request...",
    "Understanding context...",
    "Generating questions...",
    "Building survey structure...",
  ];
  const statusIndex = Math.min(Math.floor(frame / 22), statusTexts.length - 1);

  return (
    <AbsoluteFill
      style={{
        justifyContent: "center",
        alignItems: "center",
        opacity: entryOpacity * exitOpacity,
        transform: `scale(${entryScale})`,
      }}
    >
      {/* Dashboard mockup with generating state */}
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
        {/* Sidebar (same as typing scene) */}
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

        {/* Main Content - Chat area */}
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            padding: "24px 40px",
          }}
        >
          {/* User message */}
          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              marginBottom: 24,
            }}
          >
            <div
              style={{
                backgroundColor: SURBEE_COLORS.bgSecondary,
                borderRadius: 18,
                padding: "12px 18px",
                maxWidth: "70%",
              }}
            >
              <p
                style={{
                  fontSize: 14,
                  color: SURBEE_COLORS.fgPrimary,
                  margin: 0,
                  lineHeight: 1.5,
                }}
              >
                Create a customer feedback survey for my coffee shop
              </p>
            </div>
          </div>

          {/* AI Generating indicator */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-start",
              gap: 16,
            }}
          >
            {/* Thinking animation */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
              }}
            >
              {/* Thinking dots */}
              <div style={{ display: "flex", gap: 4 }}>
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: "50%",
                      backgroundColor: SURBEE_COLORS.fgPrimary,
                      opacity: dotOpacity(i),
                    }}
                  />
                ))}
              </div>
              <span
                style={{
                  fontSize: 14,
                  color: SURBEE_COLORS.fgSecondary,
                }}
              >
                {statusTexts[statusIndex]}
              </span>
            </div>

            {/* Progress indicator */}
            <div
              style={{
                width: 300,
                height: 4,
                backgroundColor: "rgba(255, 255, 255, 0.1)",
                borderRadius: 2,
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  width: `${progressWidth}%`,
                  height: "100%",
                  backgroundColor: SURBEE_COLORS.fgPrimary,
                  borderRadius: 2,
                  transition: "width 0.1s ease-out",
                }}
              />
            </div>

            {/* Cipher Engine label */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                marginTop: 8,
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={SURBEE_COLORS.fgMuted} strokeWidth="1.5">
                <circle cx="12" cy="12" r="3" />
                <path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83" />
              </svg>
              <span
                style={{
                  fontSize: 12,
                  color: SURBEE_COLORS.fgMuted,
                  letterSpacing: "0.05em",
                  textTransform: "uppercase",
                }}
              >
                Cipher Engine
              </span>
            </div>
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};
