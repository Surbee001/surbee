import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
} from "remotion";
import { SURBEE_COLORS } from "../HeroVideo";

export const ChatResponseScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const aiResponse = `I'll create a customer feedback survey for your coffee shop with these sections:

**1. Overall Experience**
Rate your visit from 1-5 stars

**2. Product Quality**
How would you rate our coffee and food?

**3. Service**
Was our staff friendly and helpful?

**4. Atmosphere**
Did you enjoy the ambiance?

**5. Value**
Did you feel you got good value?

Building your survey now...`;

  // Entry animation
  const entryOpacity = interpolate(frame, [0, 20], [0, 1], {
    extrapolateRight: "clamp",
  });

  const entryScale = spring({
    frame,
    fps,
    config: { damping: 15, stiffness: 80 },
    from: 0.95,
    to: 1,
  });

  // Text streaming
  const charsToShow = Math.min(
    Math.floor(interpolate(frame, [15, 110], [0, aiResponse.length], {
      extrapolateRight: "clamp",
    })),
    aiResponse.length
  );

  const displayedText = aiResponse.slice(0, charsToShow);
  const isTyping = charsToShow < aiResponse.length;

  // Exit animation
  const exitOpacity = interpolate(frame, [125, 145], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Simple markdown-like rendering
  const renderText = (text: string) => {
    const lines = text.split("\n");
    return lines.map((line, i) => {
      // Bold headers
      if (line.startsWith("**") && line.includes("**")) {
        const content = line.replace(/\*\*/g, "");
        return (
          <p
            key={i}
            style={{
              fontSize: 14,
              fontWeight: 600,
              color: SURBEE_COLORS.fgPrimary,
              margin: "12px 0 4px 0",
            }}
          >
            {content}
          </p>
        );
      }
      // Regular text
      if (line.trim()) {
        return (
          <p
            key={i}
            style={{
              fontSize: 14,
              color: SURBEE_COLORS.fgSecondary,
              margin: "4px 0",
              lineHeight: 1.6,
            }}
          >
            {line}
          </p>
        );
      }
      return null;
    });
  };

  return (
    <AbsoluteFill
      style={{
        justifyContent: "center",
        alignItems: "center",
        opacity: entryOpacity * exitOpacity,
        transform: `scale(${entryScale})`,
      }}
    >
      {/* Dashboard mockup */}
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

        {/* Main Content - Chat area */}
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            padding: "24px 40px",
            overflow: "hidden",
          }}
        >
          {/* User message */}
          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              marginBottom: 20,
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

          {/* AI Response */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              maxWidth: "85%",
            }}
          >
            {/* Response content */}
            <div style={{ marginBottom: 8 }}>
              {renderText(displayedText)}
              {isTyping && (
                <span
                  style={{
                    display: "inline-block",
                    width: 8,
                    height: 16,
                    backgroundColor: SURBEE_COLORS.fgPrimary,
                    marginLeft: 2,
                    opacity: frame % 20 < 10 ? 1 : 0.3,
                    verticalAlign: "middle",
                  }}
                />
              )}
            </div>

            {/* Typing indicator label */}
            {isTyping && (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  marginTop: 8,
                }}
              >
                <div style={{ display: "flex", gap: 3 }}>
                  {[0, 1, 2].map((i) => (
                    <div
                      key={i}
                      style={{
                        width: 4,
                        height: 4,
                        borderRadius: "50%",
                        backgroundColor: SURBEE_COLORS.fgMuted,
                        opacity: 0.5 + Math.sin((frame + i * 10) * 0.2) * 0.5,
                      }}
                    />
                  ))}
                </div>
                <span
                  style={{
                    fontSize: 12,
                    color: SURBEE_COLORS.fgMuted,
                  }}
                >
                  Generating...
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};
