import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  Easing,
} from "remotion";
import { SURBEE } from "../HeroVideo";

const surbeeEase = Easing.bezier(0.22, 1, 0.36, 1);

export const SurbeeUI: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Content phases
  const typingPhase = frame < 140;
  const generatingPhase = frame >= 120 && frame < 220;
  const responsePhase = frame >= 200 && frame < 360;
  const completePhase = frame >= 340;

  // User prompt text
  const prompt = "Create a customer feedback survey for my coffee shop";
  const promptChars = Math.min(
    Math.floor(interpolate(frame, [20, 110], [0, prompt.length], {
      extrapolateRight: "clamp",
      easing: Easing.linear,
    })),
    prompt.length
  );
  const displayedPrompt = prompt.slice(0, promptChars);
  const showCursor = (frame % 30 < 15 || promptChars < prompt.length) && typingPhase;

  // AI Response text
  const aiResponse = `I'll create a customer feedback survey for your coffee shop with these sections:

**Survey Structure:**
• Overall Experience Rating (1-5 stars)
• Coffee & Food Quality
• Staff Friendliness & Service Speed
• Atmosphere & Cleanliness
• Value for Money
• Open Feedback Section

Generating your survey now...`;

  const responseChars = Math.min(
    Math.floor(interpolate(frame, [220, 340], [0, aiResponse.length], {
      extrapolateRight: "clamp",
      easing: Easing.linear,
    })),
    aiResponse.length
  );
  const displayedResponse = aiResponse.slice(0, responseChars);
  const responseTyping = responseChars < aiResponse.length && responsePhase;

  // Generating indicator
  const genDotOpacity = (i: number) => {
    const cycle = (frame + i * 8) % 24;
    return interpolate(cycle, [0, 12, 24], [0.3, 1, 0.3]);
  };
  const genProgress = interpolate(frame, [130, 200], [0, 100], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const genStatusTexts = ["Analyzing request...", "Understanding context...", "Generating questions...", "Building structure..."];
  const genStatusIdx = Math.min(Math.floor((frame - 130) / 18), genStatusTexts.length - 1);

  // Success state
  const successOpacity = interpolate(frame, [350, 370], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: surbeeEase,
  });

  // Preview panel animation
  const previewOpacity = interpolate(frame, [280, 310], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: surbeeEase,
  });
  const previewScale = interpolate(frame, [280, 310], [0.95, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: surbeeEase,
  });

  // Render markdown-like text
  const renderResponse = (text: string) => {
    return text.split("\n").map((line, i) => {
      if (line.startsWith("**") && line.includes("**")) {
        return (
          <p key={i} style={{ fontSize: 13, fontWeight: 600, color: SURBEE.fgPrimary, margin: "10px 0 4px 0" }}>
            {line.replace(/\*\*/g, "")}
          </p>
        );
      }
      if (line.startsWith("•")) {
        return (
          <p key={i} style={{ fontSize: 13, color: SURBEE.fgSecondary, margin: "3px 0", paddingLeft: 8 }}>
            {line}
          </p>
        );
      }
      if (line.trim()) {
        return (
          <p key={i} style={{ fontSize: 13, color: SURBEE.fgSecondary, margin: "6px 0", lineHeight: 1.5 }}>
            {line}
          </p>
        );
      }
      return null;
    });
  };

  return (
    <div
      style={{
        width: 1100,
        height: 700,
        backgroundColor: SURBEE.bgPrimary,
        borderRadius: 16,
        overflow: "hidden",
        boxShadow: "0 30px 100px rgba(0, 0, 0, 0.35)",
        display: "flex",
      }}
    >
      {/* Left Sidebar - Chat Area */}
      <div
        style={{
          width: 420,
          backgroundColor: SURBEE.bgSidebar,
          borderRight: `1px solid ${SURBEE.borderSubtle}`,
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Header with title */}
        <div
          style={{
            padding: "16px 20px",
            borderBottom: `1px solid ${SURBEE.borderSubtle}`,
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          <span
            style={{
              fontSize: 14,
              fontWeight: 600,
              color: SURBEE.fgPrimary,
            }}
          >
            {completePhase ? "Coffee Shop Survey" : "Untitled Survey"}
          </span>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={SURBEE.fgMuted} strokeWidth="2">
            <path d="M6 9l6 6 6-6" />
          </svg>
        </div>

        {/* Chat Messages */}
        <div
          style={{
            flex: 1,
            padding: "20px 16px",
            display: "flex",
            flexDirection: "column",
            gap: 16,
            overflowY: "auto",
          }}
        >
          {/* User Message */}
          {promptChars > 0 && (
            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <div
                style={{
                  backgroundColor: "rgba(255, 255, 255, 0.1)",
                  borderRadius: 18,
                  padding: "12px 16px",
                  maxWidth: "85%",
                }}
              >
                <p style={{ fontSize: 14, color: SURBEE.fgPrimary, margin: 0, lineHeight: 1.5 }}>
                  {displayedPrompt}
                  {showCursor && (
                    <span
                      style={{
                        display: "inline-block",
                        width: 2,
                        height: 16,
                        backgroundColor: SURBEE.fgPrimary,
                        marginLeft: 1,
                        verticalAlign: "middle",
                      }}
                    />
                  )}
                </p>
              </div>
            </div>
          )}

          {/* Generating State */}
          {generatingPhase && !responsePhase && (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ display: "flex", gap: 4 }}>
                  {[0, 1, 2].map((i) => (
                    <div
                      key={i}
                      style={{
                        width: 6,
                        height: 6,
                        borderRadius: "50%",
                        backgroundColor: SURBEE.fgPrimary,
                        opacity: genDotOpacity(i),
                      }}
                    />
                  ))}
                </div>
                <span style={{ fontSize: 13, color: SURBEE.fgSecondary }}>
                  {genStatusTexts[Math.max(0, genStatusIdx)]}
                </span>
              </div>
              <div
                style={{
                  width: 200,
                  height: 3,
                  backgroundColor: "rgba(255, 255, 255, 0.1)",
                  borderRadius: 2,
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    width: `${genProgress}%`,
                    height: "100%",
                    backgroundColor: SURBEE.fgPrimary,
                    borderRadius: 2,
                  }}
                />
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={SURBEE.fgMuted} strokeWidth="1.5">
                  <circle cx="12" cy="12" r="3" />
                  <path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83" />
                </svg>
                <span style={{ fontSize: 11, color: SURBEE.fgMuted, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  Cipher Engine
                </span>
              </div>
            </div>
          )}

          {/* AI Response */}
          {responsePhase && (
            <div style={{ display: "flex", flexDirection: "column" }}>
              {renderResponse(displayedResponse)}
              {responseTyping && (
                <span
                  style={{
                    display: "inline-block",
                    width: 6,
                    height: 14,
                    backgroundColor: SURBEE.fgPrimary,
                    opacity: frame % 20 < 10 ? 1 : 0.3,
                    marginTop: 4,
                  }}
                />
              )}
            </div>
          )}

          {/* Success indicator */}
          {completePhase && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                padding: "10px 14px",
                backgroundColor: SURBEE.successBg,
                borderRadius: 10,
                border: `1px solid ${SURBEE.successBorder}`,
                opacity: successOpacity,
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={SURBEE.success} strokeWidth="2.5">
                <path d="M20 6L9 17l-5-5" />
              </svg>
              <span style={{ fontSize: 13, color: SURBEE.success, fontWeight: 500 }}>
                Survey created successfully
              </span>
            </div>
          )}
        </div>

        {/* Chat Input */}
        <div style={{ padding: "12px 16px", borderTop: `1px solid ${SURBEE.borderSubtle}` }}>
          <div
            style={{
              backgroundColor: SURBEE.bgInput,
              borderRadius: 19,
              padding: "14px 18px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <span style={{ fontSize: 14, color: SURBEE.fgMuted }}>
              Ask Surbee to draft a survey...
            </span>
            <div
              style={{
                width: 28,
                height: 28,
                borderRadius: 7,
                backgroundColor: "rgba(255, 255, 255, 0.1)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={SURBEE.fgMuted} strokeWidth="2">
                <path d="M12 19V5M5 12l7-7 7 7" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel - Preview */}
      <div
        style={{
          flex: 1,
          backgroundColor: SURBEE.bgPrimary,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: 32,
        }}
      >
        {/* Survey Preview Card */}
        {completePhase && (
          <div
            style={{
              width: "100%",
              maxWidth: 400,
              backgroundColor: "#ffffff",
              borderRadius: 16,
              overflow: "hidden",
              boxShadow: "0 20px 60px rgba(0, 0, 0, 0.3)",
              opacity: previewOpacity,
              transform: `scale(${previewScale})`,
            }}
          >
            {/* Survey Header */}
            <div
              style={{
                backgroundColor: SURBEE.bgPrimary,
                padding: "24px 28px",
              }}
            >
              <h2 style={{ fontSize: 18, fontWeight: 600, color: SURBEE.fgPrimary, margin: 0 }}>
                ☕ Coffee Shop Feedback
              </h2>
              <p style={{ fontSize: 12, color: SURBEE.fgMuted, margin: "6px 0 0 0" }}>
                Help us serve you better
              </p>
            </div>

            {/* Survey Questions */}
            <div style={{ padding: "24px 28px" }}>
              {/* Rating Question */}
              <div style={{ marginBottom: 20 }}>
                <p style={{ fontSize: 13, fontWeight: 600, color: "#1e293b", margin: "0 0 10px 0" }}>
                  How would you rate your experience?
                </p>
                <div style={{ display: "flex", gap: 6 }}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <svg
                      key={star}
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill={star <= 4 ? "#f59e0b" : "none"}
                      stroke={star <= 4 ? "#f59e0b" : "#cbd5e1"}
                      strokeWidth="2"
                    >
                      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                    </svg>
                  ))}
                </div>
              </div>

              {/* Multiple Choice */}
              <div style={{ marginBottom: 20 }}>
                <p style={{ fontSize: 13, fontWeight: 600, color: "#1e293b", margin: "0 0 10px 0" }}>
                  What did you enjoy most?
                </p>
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  {["Coffee quality", "Friendly staff", "Cozy atmosphere"].map((opt, i) => (
                    <div
                      key={opt}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        padding: "8px 12px",
                        background: i === 0 ? "rgba(99, 102, 241, 0.08)" : "#f8fafc",
                        borderRadius: 8,
                        border: i === 0 ? "1.5px solid #6366f1" : "1.5px solid transparent",
                      }}
                    >
                      <div
                        style={{
                          width: 16,
                          height: 16,
                          borderRadius: "50%",
                          border: `2px solid ${i === 0 ? "#6366f1" : "#cbd5e1"}`,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        {i === 0 && (
                          <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#6366f1" }} />
                        )}
                      </div>
                      <span style={{ fontSize: 12, color: "#334155" }}>{opt}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Text Input */}
              <div>
                <p style={{ fontSize: 13, fontWeight: 600, color: "#1e293b", margin: "0 0 10px 0" }}>
                  Any suggestions?
                </p>
                <div
                  style={{
                    background: "#f8fafc",
                    borderRadius: 8,
                    padding: "10px 14px",
                    border: "1.5px solid #e2e8f0",
                  }}
                >
                  <p style={{ fontSize: 12, color: "#94a3b8", margin: 0 }}>
                    Type your feedback...
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Placeholder when no preview */}
        {!completePhase && (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              opacity: 0.5,
            }}
          >
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke={SURBEE.fgMuted} strokeWidth="1">
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <path d="M3 9h18M9 21V9" />
            </svg>
            <p style={{ fontSize: 14, color: SURBEE.fgMuted, marginTop: 16 }}>
              Survey preview will appear here
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
