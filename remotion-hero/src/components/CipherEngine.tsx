import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
  Easing,
} from "remotion";

export const CipherEngine: React.FC = () => {
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
    from: 0.8,
    to: 1,
  });

  // Exit animation
  const exitOpacity = interpolate(frame, [90, 110], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Rotating rings
  const ringRotation1 = frame * 2;
  const ringRotation2 = -frame * 1.5;
  const ringRotation3 = frame * 1;

  // Pulsing core
  const coreScale = 1 + Math.sin(frame * 0.15) * 0.1;
  const coreGlow = 20 + Math.sin(frame * 0.2) * 10;

  // Processing dots
  const numDots = 8;
  const dots = Array.from({ length: numDots }, (_, i) => {
    const angle = (i / numDots) * Math.PI * 2 + frame * 0.05;
    const radius = 120 + Math.sin(frame * 0.1 + i) * 20;
    return {
      x: Math.cos(angle) * radius,
      y: Math.sin(angle) * radius,
      scale: 0.5 + Math.sin(frame * 0.2 + i * 0.5) * 0.3,
      opacity: 0.5 + Math.sin(frame * 0.15 + i * 0.3) * 0.3,
    };
  });

  // Status text animation
  const statusTexts = [
    "Analyzing prompt...",
    "Understanding context...",
    "Generating questions...",
    "Building survey structure...",
  ];
  const statusIndex = Math.min(
    Math.floor(frame / 25),
    statusTexts.length - 1
  );

  return (
    <AbsoluteFill
      style={{
        justifyContent: "center",
        alignItems: "center",
        opacity: entryOpacity * exitOpacity,
        transform: `scale(${entryScale})`,
      }}
    >
      {/* Processing visualization */}
      <div
        style={{
          position: "relative",
          width: 400,
          height: 400,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {/* Outer ring */}
        <div
          style={{
            position: "absolute",
            width: 350,
            height: 350,
            borderRadius: "50%",
            border: "2px solid rgba(99, 102, 241, 0.3)",
            transform: `rotate(${ringRotation1}deg)`,
          }}
        >
          {[0, 90, 180, 270].map((deg) => (
            <div
              key={deg}
              style={{
                position: "absolute",
                width: 12,
                height: 12,
                borderRadius: "50%",
                background: "#6366f1",
                top: "50%",
                left: "50%",
                transform: `rotate(${deg}deg) translateX(175px) translateY(-50%)`,
                boxShadow: "0 0 15px rgba(99, 102, 241, 0.8)",
              }}
            />
          ))}
        </div>

        {/* Middle ring */}
        <div
          style={{
            position: "absolute",
            width: 260,
            height: 260,
            borderRadius: "50%",
            border: "2px solid rgba(139, 92, 246, 0.3)",
            transform: `rotate(${ringRotation2}deg)`,
          }}
        >
          {[45, 135, 225, 315].map((deg) => (
            <div
              key={deg}
              style={{
                position: "absolute",
                width: 10,
                height: 10,
                borderRadius: "50%",
                background: "#8b5cf6",
                top: "50%",
                left: "50%",
                transform: `rotate(${deg}deg) translateX(130px) translateY(-50%)`,
                boxShadow: "0 0 12px rgba(139, 92, 246, 0.8)",
              }}
            />
          ))}
        </div>

        {/* Inner ring */}
        <div
          style={{
            position: "absolute",
            width: 170,
            height: 170,
            borderRadius: "50%",
            border: "2px solid rgba(168, 85, 247, 0.3)",
            transform: `rotate(${ringRotation3}deg)`,
          }}
        >
          {[0, 120, 240].map((deg) => (
            <div
              key={deg}
              style={{
                position: "absolute",
                width: 8,
                height: 8,
                borderRadius: "50%",
                background: "#a855f7",
                top: "50%",
                left: "50%",
                transform: `rotate(${deg}deg) translateX(85px) translateY(-50%)`,
                boxShadow: "0 0 10px rgba(168, 85, 247, 0.8)",
              }}
            />
          ))}
        </div>

        {/* Core */}
        <div
          style={{
            width: 80,
            height: 80,
            borderRadius: "50%",
            background: "linear-gradient(135deg, #6366f1 0%, #a855f7 100%)",
            transform: `scale(${coreScale})`,
            boxShadow: `0 0 ${coreGlow}px rgba(99, 102, 241, 0.6), 0 0 ${coreGlow * 2}px rgba(99, 102, 241, 0.3)`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {/* AI icon */}
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none">
            <path
              d="M12 2L2 7L12 12L22 7L12 2Z"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M2 17L12 22L22 17"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M2 12L12 17L22 12"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>

        {/* Floating processing dots */}
        {dots.map((dot, i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              width: 6,
              height: 6,
              borderRadius: "50%",
              background: "#6366f1",
              transform: `translate(${dot.x}px, ${dot.y}px) scale(${dot.scale})`,
              opacity: dot.opacity,
              boxShadow: "0 0 8px rgba(99, 102, 241, 0.8)",
            }}
          />
        ))}
      </div>

      {/* Status text */}
      <div
        style={{
          position: "absolute",
          bottom: 220,
          textAlign: "center",
        }}
      >
        <p
          style={{
            fontSize: 24,
            color: "rgba(255, 255, 255, 0.9)",
            margin: 0,
            fontWeight: 500,
          }}
        >
          {statusTexts[statusIndex]}
        </p>
        <p
          style={{
            fontSize: 16,
            color: "rgba(255, 255, 255, 0.5)",
            margin: "12px 0 0 0",
          }}
        >
          Cipher Engine Processing
        </p>
      </div>
    </AbsoluteFill>
  );
};
