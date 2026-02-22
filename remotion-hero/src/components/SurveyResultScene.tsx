import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
} from "remotion";
import { SURBEE_COLORS } from "../HeroVideo";

export const SurveyResultScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Entry animation
  const entryOpacity = interpolate(frame, [0, 25], [0, 1], {
    extrapolateRight: "clamp",
  });

  const entryScale = spring({
    frame,
    fps,
    config: { damping: 12, stiffness: 60 },
    from: 0.92,
    to: 1,
  });

  // Staggered animations for survey elements
  const getElementAnimation = (index: number, delayFrames: number = 8) => {
    const elementFrame = Math.max(0, frame - 25 - index * delayFrames);
    return {
      opacity: interpolate(elementFrame, [0, 15], [0, 1], {
        extrapolateRight: "clamp",
      }),
      y: spring({
        frame: elementFrame,
        fps,
        config: { damping: 15, stiffness: 100 },
        from: 20,
        to: 0,
      }),
    };
  };

  // Rating stars animation
  const ratingFrame = Math.max(0, frame - 70);
  const filledStars = Math.min(
    Math.floor(interpolate(ratingFrame, [0, 20], [0, 5], {
      extrapolateRight: "clamp",
    })),
    5
  );

  // CTA animation
  const ctaOpacity = interpolate(frame, [120, 145], [0, 1], {
    extrapolateRight: "clamp",
  });

  const ctaY = spring({
    frame: Math.max(0, frame - 120),
    fps,
    config: { damping: 12, stiffness: 80 },
    from: 15,
    to: 0,
  });

  return (
    <AbsoluteFill
      style={{
        justifyContent: "center",
        alignItems: "center",
        opacity: entryOpacity,
        transform: `scale(${entryScale})`,
      }}
    >
      {/* Split view: Dashboard + Survey Preview */}
      <div
        style={{
          display: "flex",
          gap: 24,
          alignItems: "center",
        }}
      >
        {/* Dashboard mockup (smaller) */}
        <div
          style={{
            width: 500,
            height: 380,
            backgroundColor: SURBEE_COLORS.bgPrimary,
            borderRadius: 12,
            overflow: "hidden",
            boxShadow: "0 20px 60px rgba(0, 0, 0, 0.2)",
            display: "flex",
          }}
        >
          {/* Mini sidebar */}
          <div
            style={{
              width: 140,
              backgroundColor: "rgba(255, 255, 255, 0.02)",
              borderRight: "1px solid rgba(255, 255, 255, 0.06)",
              padding: "12px 10px",
            }}
          >
            {/* Logo */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                marginBottom: 16,
                paddingLeft: 4,
              }}
            >
              <div
                style={{
                  width: 20,
                  height: 20,
                  borderRadius: 5,
                  background: SURBEE_COLORS.fgPrimary,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M12 2L2 7L12 12L22 7L12 2Z"
                    stroke={SURBEE_COLORS.bgPrimary}
                    strokeWidth="3"
                  />
                </svg>
              </div>
              <span
                style={{
                  fontSize: 13,
                  fontWeight: 600,
                  color: SURBEE_COLORS.fgPrimary,
                }}
              >
                Surbee
              </span>
            </div>

            {/* Nav items */}
            {["Chat", "Surveys", "Settings"].map((item, i) => (
              <div
                key={item}
                style={{
                  padding: "6px 8px",
                  borderRadius: 6,
                  marginBottom: 2,
                  backgroundColor: i === 1 ? "rgba(255, 255, 255, 0.06)" : "transparent",
                  color: i === 1 ? SURBEE_COLORS.fgPrimary : SURBEE_COLORS.fgMuted,
                  fontSize: 11,
                }}
              >
                {item}
              </div>
            ))}
          </div>

          {/* Chat content */}
          <div
            style={{
              flex: 1,
              padding: "16px 20px",
              display: "flex",
              flexDirection: "column",
            }}
          >
            {/* User message */}
            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                marginBottom: 12,
              }}
            >
              <div
                style={{
                  backgroundColor: SURBEE_COLORS.bgSecondary,
                  borderRadius: 12,
                  padding: "8px 12px",
                  maxWidth: "80%",
                }}
              >
                <p
                  style={{
                    fontSize: 11,
                    color: SURBEE_COLORS.fgPrimary,
                    margin: 0,
                  }}
                >
                  Create a customer feedback survey for my coffee shop
                </p>
              </div>
            </div>

            {/* AI Response summary */}
            <div>
              <p
                style={{
                  fontSize: 11,
                  color: SURBEE_COLORS.fgSecondary,
                  margin: 0,
                  lineHeight: 1.5,
                }}
              >
                Done! I've created your Coffee Shop Feedback Survey with 5 questions covering experience, quality, service, atmosphere, and value.
              </p>

              {/* Success indicator */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  marginTop: 12,
                  padding: "8px 12px",
                  backgroundColor: "rgba(34, 197, 94, 0.1)",
                  borderRadius: 8,
                  border: "1px solid rgba(34, 197, 94, 0.2)",
                }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2">
                  <path d="M20 6L9 17l-5-5" />
                </svg>
                <span
                  style={{
                    fontSize: 11,
                    color: "#22c55e",
                    fontWeight: 500,
                  }}
                >
                  Survey created successfully
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Survey Preview Card */}
        <div
          style={{
            width: 380,
            backgroundColor: "#ffffff",
            borderRadius: 16,
            overflow: "hidden",
            boxShadow: "0 25px 80px rgba(0, 0, 0, 0.15)",
          }}
        >
          {/* Survey header */}
          <div
            style={{
              backgroundColor: SURBEE_COLORS.bgPrimary,
              padding: "24px 28px",
            }}
          >
            <h2
              style={{
                fontSize: 18,
                fontWeight: 600,
                color: SURBEE_COLORS.fgPrimary,
                margin: 0,
              }}
            >
              ☕ Coffee Shop Feedback
            </h2>
            <p
              style={{
                fontSize: 12,
                color: SURBEE_COLORS.fgMuted,
                margin: "6px 0 0 0",
              }}
            >
              Help us serve you better
            </p>
          </div>

          {/* Survey content */}
          <div style={{ padding: "20px 28px" }}>
            {/* Question 1 - Rating */}
            <div
              style={{
                marginBottom: 20,
                opacity: getElementAnimation(0).opacity,
                transform: `translateY(${getElementAnimation(0).y}px)`,
              }}
            >
              <p
                style={{
                  fontSize: 13,
                  fontWeight: 600,
                  color: "#1e293b",
                  margin: "0 0 10px 0",
                }}
              >
                How would you rate your experience?
              </p>
              <div style={{ display: "flex", gap: 6 }}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <svg
                    key={star}
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill={star <= filledStars ? "#f59e0b" : "none"}
                    stroke={star <= filledStars ? "#f59e0b" : "#cbd5e1"}
                    strokeWidth="2"
                  >
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                  </svg>
                ))}
              </div>
            </div>

            {/* Question 2 - Multiple choice */}
            <div
              style={{
                marginBottom: 20,
                opacity: getElementAnimation(1).opacity,
                transform: `translateY(${getElementAnimation(1).y}px)`,
              }}
            >
              <p
                style={{
                  fontSize: 13,
                  fontWeight: 600,
                  color: "#1e293b",
                  margin: "0 0 10px 0",
                }}
              >
                What did you enjoy most?
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {["Coffee quality", "Friendly staff", "Cozy atmosphere"].map(
                  (option, i) => (
                    <div
                      key={option}
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
                          <div
                            style={{
                              width: 8,
                              height: 8,
                              borderRadius: "50%",
                              background: "#6366f1",
                            }}
                          />
                        )}
                      </div>
                      <span style={{ fontSize: 12, color: "#334155" }}>{option}</span>
                    </div>
                  )
                )}
              </div>
            </div>

            {/* Question 3 - Text input preview */}
            <div
              style={{
                opacity: getElementAnimation(2).opacity,
                transform: `translateY(${getElementAnimation(2).y}px)`,
              }}
            >
              <p
                style={{
                  fontSize: 13,
                  fontWeight: 600,
                  color: "#1e293b",
                  margin: "0 0 10px 0",
                }}
              >
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
                <p
                  style={{
                    fontSize: 12,
                    color: "#94a3b8",
                    margin: 0,
                  }}
                >
                  Type your feedback...
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div
        style={{
          position: "absolute",
          bottom: 80,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 16,
          opacity: ctaOpacity,
          transform: `translateY(${ctaY}px)`,
        }}
      >
        <p
          style={{
            fontSize: 24,
            fontWeight: 500,
            color: SURBEE_COLORS.bgPrimary,
            margin: 0,
            letterSpacing: "-0.02em",
          }}
        >
          Create surveys in seconds with AI
        </p>
        <div
          style={{
            backgroundColor: SURBEE_COLORS.bgPrimary,
            padding: "12px 28px",
            borderRadius: 12,
          }}
        >
          <p
            style={{
              fontSize: 15,
              fontWeight: 500,
              color: SURBEE_COLORS.fgPrimary,
              margin: 0,
            }}
          >
            Try Surbee Free →
          </p>
        </div>
      </div>
    </AbsoluteFill>
  );
};
