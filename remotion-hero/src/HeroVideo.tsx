import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  Easing,
} from "remotion";
import { SurbeeUI } from "./components/SurbeeUI";

// Surbee Design System - Exact colors from the codebase
export const SURBEE = {
  // Backgrounds
  bgPastel: "#ECECE7",
  bgPrimary: "rgb(19, 19, 20)",
  bgSecondary: "rgb(38, 38, 38)",
  bgSidebar: "rgb(19, 19, 20)",
  bgInput: "#1a1a1a",
  bgDropdown: "hsl(0, 0%, 16%)",

  // Foregrounds
  fgPrimary: "#E8E8E8",
  fgSecondary: "rgba(232, 232, 232, 0.6)",
  fgMuted: "rgba(232, 232, 232, 0.4)",

  // Borders
  borderSubtle: "rgba(255, 255, 255, 0.06)",
  borderInput: "rgba(255, 255, 255, 0.08)",

  // Accents
  success: "#22c55e",
  successBg: "rgba(34, 197, 94, 0.1)",
  successBorder: "rgba(34, 197, 94, 0.2)",
};

// Surbee's exact easing curve from their animations
const surbeeEase = Easing.bezier(0.22, 1, 0.36, 1);

export const HeroVideo: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  // Camera movement - smooth pan down while typing, then cut with zoom
  const cameraY = interpolate(
    frame,
    [0, 120, 121, 240, 241, 350],
    [0, -30, 0, -20, 0, -10],
    {
      easing: surbeeEase,
      extrapolateRight: "clamp",
    }
  );

  const cameraScale = interpolate(
    frame,
    [0, 60, 120, 121, 180, 240, 241, 300, 350, 400],
    [1, 1.02, 1.05, 1, 1.02, 1.04, 1, 1.02, 1.03, 1],
    {
      easing: surbeeEase,
      extrapolateRight: "clamp",
    }
  );

  // Overall opacity for smooth fades
  const sceneOpacity = interpolate(
    frame,
    [0, 15, durationInFrames - 20, durationInFrames],
    [0, 1, 1, 0],
    { extrapolateRight: "clamp" }
  );

  return (
    <AbsoluteFill
      style={{
        backgroundColor: SURBEE.bgPastel,
        fontFamily: "'FK Grotesk', 'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
      }}
    >
      {/* Camera container with smooth movements */}
      <AbsoluteFill
        style={{
          transform: `translateY(${cameraY}px) scale(${cameraScale})`,
          opacity: sceneOpacity,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <SurbeeUI />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
