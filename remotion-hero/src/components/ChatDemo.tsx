import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
} from "remotion";

export const ChatDemo: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const aiResponse = `I'll create a customer satisfaction survey for your coffee shop. Here's what I'm including:

**Survey Structure:**
1. Overall Experience Rating
2. Product Quality Questions
3. Service Speed & Friendliness
4. Atmosphere & Cleanliness
5. Value for Money
6. Open Feedback Section

Generating your survey now...`;

  // Entry animation
  const entryOpacity = interpolate(frame, [0, 20], [0, 1], {
    extrapolateRight: "clamp",
  });

  const containerY = spring({
    frame,
    fps,
    config: { damping: 15, stiffness: 80 },
    from: 40,
    to: 0,
  });

  // Text streaming effect
  const charsToShow = Math.min(
    Math.floor(interpolate(frame, [20, 110], [0, aiResponse.length], {
      extrapolateRight: "clamp",
    })),
    aiResponse.length
  );

  const displayedText = aiResponse.slice(0, charsToShow);
  const isTyping = charsToShow < aiResponse.length;

  // Exit animation
  const exitOpacity = interpolate(frame, [130, 150], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Parse markdown-like formatting
  const formatText = (text: string) => {
    const parts: JSX.Element[] = [];
    const lines = text.split("\n");

    lines.forEach((line, lineIndex) => {
      if (line.startsWith("**") && line.endsWith("**")) {
        // Bold text
        parts.push(
          <p
            key={lineIndex}
            style={{
              fontWeight: 600,
              color: "white",
              margin: "16px 0 8px 0",
              fontSize: 18,
            }}
          >
            {line.replace(/\*\*/g, "")}
          </p>
        );
      } else if (line.match(/^\d+\./)) {
        // List item
        parts.push(
          <p
            key={lineIndex}
            style={{
              color: "rgba(255, 255, 255, 0.8)",
              margin: "6px 0 6px 20px",
              fontSize: 16,
            }}
          >
            {line}
          </p>
        );
      } else if (line.trim()) {
        // Regular text
        parts.push(
          <p
            key={lineIndex}
            style={{
              color: "rgba(255, 255, 255, 0.85)",
              margin: "8px 0",
              fontSize: 16,
              lineHeight: 1.6,
            }}
          >
            {line}
          </p>
        );
      }
    });

    return parts;
  };

  return (
    <AbsoluteFill
      style={{
        justifyContent: "center",
        alignItems: "center",
        opacity: entryOpacity * exitOpacity,
      }}
    >
      {/* Chat window */}
      <div
        style={{
          width: 800,
          background: "rgba(26, 26, 26, 0.95)",
          borderRadius: 20,
          border: "1px solid rgba(255, 255, 255, 0.1)",
          overflow: "hidden",
          boxShadow: "0 40px 100px rgba(0, 0, 0, 0.5)",
          transform: `translateY(${containerY}px)`,
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            padding: "16px 24px",
            borderBottom: "1px solid rgba(255, 255, 255, 0.06)",
          }}
        >
          {/* AI avatar */}
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              background: "linear-gradient(135deg, #6366f1 0%, #a855f7 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path
                d="M12 2L2 7L12 12L22 7L12 2Z"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <div>
            <p
              style={{
                fontSize: 15,
                fontWeight: 600,
                color: "white",
                margin: 0,
              }}
            >
              Surbee AI
            </p>
            <p
              style={{
                fontSize: 12,
                color: "rgba(255, 255, 255, 0.5)",
                margin: 0,
              }}
            >
              {isTyping ? "Generating..." : "Ready"}
            </p>
          </div>

          {/* Typing indicator */}
          {isTyping && (
            <div
              style={{
                marginLeft: "auto",
                display: "flex",
                gap: 4,
              }}
            >
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: "50%",
                    background: "#6366f1",
                    opacity: 0.5 + Math.sin((frame + i * 10) * 0.2) * 0.5,
                  }}
                />
              ))}
            </div>
          )}
        </div>

        {/* Chat content */}
        <div style={{ padding: "24px 28px", minHeight: 280 }}>
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
                background: "rgba(99, 102, 241, 0.2)",
                borderRadius: 16,
                padding: "12px 18px",
                maxWidth: "70%",
              }}
            >
              <p
                style={{
                  fontSize: 15,
                  color: "white",
                  margin: 0,
                }}
              >
                Create a customer satisfaction survey for my coffee shop
              </p>
            </div>
          </div>

          {/* AI response */}
          <div
            style={{
              background: "rgba(255, 255, 255, 0.03)",
              borderRadius: 16,
              padding: "16px 20px",
              borderLeft: "3px solid #6366f1",
            }}
          >
            {formatText(displayedText)}
            {isTyping && (
              <span
                style={{
                  display: "inline-block",
                  width: 8,
                  height: 18,
                  background: "#6366f1",
                  marginLeft: 2,
                  opacity: frame % 20 < 10 ? 1 : 0.3,
                  verticalAlign: "middle",
                }}
              />
            )}
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};
