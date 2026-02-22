import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
  Easing,
} from "remotion";

export const SurveyPreview: React.FC = () => {
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
    from: 0.9,
    to: 1,
  });

  // Staggered card animations
  const cardDelay = 8;
  const getCardAnimation = (index: number) => {
    const cardFrame = Math.max(0, frame - 20 - index * cardDelay);
    return {
      opacity: interpolate(cardFrame, [0, 15], [0, 1], {
        extrapolateRight: "clamp",
      }),
      y: spring({
        frame: cardFrame,
        fps,
        config: { damping: 15, stiffness: 100 },
        from: 30,
        to: 0,
      }),
    };
  };

  // Rating animation
  const ratingFrame = Math.max(0, frame - 60);
  const filledStars = Math.min(
    Math.floor(interpolate(ratingFrame, [0, 30], [0, 5], {
      extrapolateRight: "clamp",
    })),
    5
  );

  // Final CTA animation
  const ctaOpacity = interpolate(frame, [100, 120], [0, 1], {
    extrapolateRight: "clamp",
  });

  const ctaY = spring({
    frame: Math.max(0, frame - 100),
    fps,
    config: { damping: 12, stiffness: 80 },
    from: 20,
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
      {/* Survey preview card */}
      <div
        style={{
          width: 500,
          background: "linear-gradient(145deg, rgba(255,255,255,0.98) 0%, rgba(248,250,252,0.98) 100%)",
          borderRadius: 24,
          overflow: "hidden",
          boxShadow: "0 50px 120px rgba(0, 0, 0, 0.4), 0 20px 40px rgba(99, 102, 241, 0.15)",
        }}
      >
        {/* Survey header */}
        <div
          style={{
            background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
            padding: "32px 36px",
          }}
        >
          <h2
            style={{
              fontSize: 24,
              fontWeight: 700,
              color: "white",
              margin: 0,
            }}
          >
            ☕ Coffee Shop Feedback
          </h2>
          <p
            style={{
              fontSize: 14,
              color: "rgba(255, 255, 255, 0.8)",
              margin: "8px 0 0 0",
            }}
          >
            Help us serve you better
          </p>
        </div>

        {/* Survey content */}
        <div style={{ padding: "28px 36px" }}>
          {/* Question 1 - Rating */}
          <div
            style={{
              marginBottom: 24,
              opacity: getCardAnimation(0).opacity,
              transform: `translateY(${getCardAnimation(0).y}px)`,
            }}
          >
            <p
              style={{
                fontSize: 15,
                fontWeight: 600,
                color: "#1e293b",
                margin: "0 0 12px 0",
              }}
            >
              How would you rate your overall experience?
            </p>
            <div style={{ display: "flex", gap: 8 }}>
              {[1, 2, 3, 4, 5].map((star) => (
                <div
                  key={star}
                  style={{
                    width: 36,
                    height: 36,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <svg
                    width="28"
                    height="28"
                    viewBox="0 0 24 24"
                    fill={star <= filledStars ? "#f59e0b" : "none"}
                    stroke={star <= filledStars ? "#f59e0b" : "#cbd5e1"}
                    strokeWidth="2"
                  >
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                  </svg>
                </div>
              ))}
            </div>
          </div>

          {/* Question 2 - Multiple choice */}
          <div
            style={{
              marginBottom: 24,
              opacity: getCardAnimation(1).opacity,
              transform: `translateY(${getCardAnimation(1).y}px)`,
            }}
          >
            <p
              style={{
                fontSize: 15,
                fontWeight: 600,
                color: "#1e293b",
                margin: "0 0 12px 0",
              }}
            >
              What did you enjoy most?
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {["Coffee quality", "Friendly staff", "Cozy atmosphere", "Fast service"].map(
                (option, i) => (
                  <div
                    key={option}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      padding: "10px 14px",
                      background: i === 0 ? "rgba(99, 102, 241, 0.1)" : "#f8fafc",
                      borderRadius: 10,
                      border: i === 0 ? "2px solid #6366f1" : "2px solid transparent",
                    }}
                  >
                    <div
                      style={{
                        width: 18,
                        height: 18,
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
                            width: 10,
                            height: 10,
                            borderRadius: "50%",
                            background: "#6366f1",
                          }}
                        />
                      )}
                    </div>
                    <span style={{ fontSize: 14, color: "#334155" }}>{option}</span>
                  </div>
                )
              )}
            </div>
          </div>

          {/* Question 3 - Text input */}
          <div
            style={{
              opacity: getCardAnimation(2).opacity,
              transform: `translateY(${getCardAnimation(2).y}px)`,
            }}
          >
            <p
              style={{
                fontSize: 15,
                fontWeight: 600,
                color: "#1e293b",
                margin: "0 0 12px 0",
              }}
            >
              Any suggestions for us?
            </p>
            <div
              style={{
                background: "#f8fafc",
                borderRadius: 12,
                padding: "14px 16px",
                border: "2px solid #e2e8f0",
              }}
            >
              <p
                style={{
                  fontSize: 14,
                  color: "#94a3b8",
                  margin: 0,
                }}
              >
                Type your feedback here...
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div
        style={{
          position: "absolute",
          bottom: 120,
          opacity: ctaOpacity,
          transform: `translateY(${ctaY}px)`,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 16,
        }}
      >
        <p
          style={{
            fontSize: 28,
            fontWeight: 600,
            color: "white",
            margin: 0,
          }}
        >
          Create your survey in seconds
        </p>
        <div
          style={{
            background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
            padding: "14px 32px",
            borderRadius: 14,
            boxShadow: "0 10px 40px rgba(99, 102, 241, 0.4)",
          }}
        >
          <p
            style={{
              fontSize: 18,
              fontWeight: 600,
              color: "white",
              margin: 0,
            }}
          >
            Get Started Free →
          </p>
        </div>
      </div>
    </AbsoluteFill>
  );
};
