import React from "react";
import { useRouter } from "next/navigation";
import {
  Eye,
  BarChart3,
  TrendingUp,
  Share2,
  ChevronDown,
  Settings,
  Play
} from "lucide-react";
import { themeColors } from '@/lib/theme/colors';
import { SurbeeLogo } from '../../../components/icons';

interface EditorNavbarProps {
  projectId: string;
  projectName?: string;
  onPublish?: () => void;
}

export function EditorNavbar({ projectId, projectName = "Untitled Survey", onPublish }: EditorNavbarProps) {
  const router = useRouter();

  return (
    <>
      <div
        style={{
          WebkitFontSmoothing: "antialiased",
          userSelect: "none",
          outline: "none",
          position: "fixed",
          zIndex: 15,
          top: "10px",
          right: "10px",
          left: "10px",
          display: "flex",
          height: "60px",
          boxSizing: "border-box",
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: themeColors.dark.background.secondary,
          borderRadius: "12px",
          border: "none",
        }}
      >
        {/* Left Side - Surbee Logo Dropdown */}
        <div
          style={{
            boxSizing: "border-box",
            WebkitFontSmoothing: "antialiased",
            userSelect: "none",
            outline: "none",
            display: "flex",
            flexShrink: 0,
            flexDirection: "row",
            flexWrap: "nowrap",
            alignItems: "center",
            justifyContent: "flex-start",
            gap: "10px",
            paddingLeft: "15px",
          }}
        >
          <button
            type="button"
            title="Surbee Menu"
            onClick={() => router.push('/dashboard/projects')}
            style={{
              WebkitFontSmoothing: "antialiased",
              fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
              border: "none",
              margin: "0px",
              outline: "none",
              textDecoration: "none",
              position: "relative",
              height: "30px",
              appearance: "none",
              userSelect: "none",
              overflow: "hidden",
              padding: "0px 10px",
              borderRadius: "8px",
              transition: "background-color 0.15s",
              zIndex: 0,
              boxSizing: "border-box",
              backgroundColor: themeColors.dark.sidebar.hover,
              color: themeColors.dark.foreground.primary,
              fontSize: "13px",
              fontWeight: 600,
              width: "46px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "4px",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: "16px",
                height: "16px",
                color: themeColors.dark.foreground.primary,
              }}
            >
              <SurbeeLogo className="w-4 h-4" />
            </div>
            <span style={{ paddingBottom: "2px", color: themeColors.dark.foreground.muted }}>
              <ChevronDown style={{ width: "8px", height: "8px" }} />
            </span>
          </button>
        </div>

        {/* Center - Toolbar */}
        <div
          style={{
            boxSizing: "border-box",
            WebkitFontSmoothing: "antialiased",
            userSelect: "none",
            outline: "none",
            display: "flex",
            flexShrink: 0,
            flexDirection: "row",
            flexWrap: "nowrap",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "0px 15px",
            background: themeColors.dark.background.secondary,
            height: "60px",
            gap: "0px",
          }}
        >
          <div
            style={{
              boxSizing: "border-box",
              WebkitFontSmoothing: "antialiased",
              userSelect: "none",
              outline: "none",
              display: "flex",
              flexShrink: 0,
              flexDirection: "row",
              flexWrap: "nowrap",
              alignItems: "center",
              justifyContent: "flex-start",
              gap: "5px",
            }}
          >
            {/* Preview Button */}
            <button
              title="Preview"
              style={{
                boxSizing: "border-box",
                WebkitFontSmoothing: "antialiased",
                padding: "0px 10px 0px 7px",
                border: "none",
                borderRadius: "8px",
                margin: "0px",
                outline: "none",
                textDecoration: "none",
                transition: "background-color 0.15s, color 0.15s",
                position: "relative",
                display: "inline-flex",
                height: "30px",
                appearance: "none",
                backgroundColor: "transparent",
                color: themeColors.dark.foreground.muted,
                fontSize: "12px",
                fontWeight: 600,
                userSelect: "none",
                cursor: "pointer",
                alignItems: "center",
                gap: "8px",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = themeColors.dark.sidebar.hover;
                e.currentTarget.style.color = themeColors.dark.foreground.primary;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "transparent";
                e.currentTarget.style.color = themeColors.dark.foreground.muted;
              }}
            >
              <Eye style={{ width: "18px", height: "18px" }} />
              <span style={{ paddingBottom: "1px" }}>Preview</span>
            </button>

            {/* Results Button */}
            <button
              title="Results"
              style={{
                boxSizing: "border-box",
                WebkitFontSmoothing: "antialiased",
                padding: "0px 10px 0px 7px",
                border: "none",
                borderRadius: "8px",
                margin: "0px",
                outline: "none",
                textDecoration: "none",
                transition: "background-color 0.15s, color 0.15s",
                position: "relative",
                display: "inline-flex",
                height: "30px",
                appearance: "none",
                backgroundColor: "transparent",
                color: themeColors.dark.foreground.muted,
                fontSize: "12px",
                fontWeight: 600,
                userSelect: "none",
                cursor: "pointer",
                alignItems: "center",
                gap: "8px",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = themeColors.dark.sidebar.hover;
                e.currentTarget.style.color = themeColors.dark.foreground.primary;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "transparent";
                e.currentTarget.style.color = themeColors.dark.foreground.muted;
              }}
            >
              <BarChart3 style={{ width: "18px", height: "18px" }} />
              <span style={{ paddingBottom: "1px" }}>Results</span>
            </button>

            {/* Analytics Button */}
            <button
              title="Analytics"
              style={{
                boxSizing: "border-box",
                WebkitFontSmoothing: "antialiased",
                padding: "0px 10px 0px 7px",
                border: "none",
                borderRadius: "8px",
                margin: "0px",
                outline: "none",
                textDecoration: "none",
                transition: "background-color 0.15s, color 0.15s",
                position: "relative",
                display: "inline-flex",
                height: "30px",
                appearance: "none",
                backgroundColor: "transparent",
                color: themeColors.dark.foreground.muted,
                fontSize: "12px",
                fontWeight: 600,
                userSelect: "none",
                cursor: "pointer",
                alignItems: "center",
                gap: "8px",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = themeColors.dark.sidebar.hover;
                e.currentTarget.style.color = themeColors.dark.foreground.primary;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "transparent";
                e.currentTarget.style.color = themeColors.dark.foreground.muted;
              }}
            >
              <TrendingUp style={{ width: "18px", height: "18px" }} />
              <span style={{ paddingBottom: "1px" }}>Analytics</span>
            </button>

            {/* Share Button */}
            <button
              title="Share"
              style={{
                boxSizing: "border-box",
                WebkitFontSmoothing: "antialiased",
                padding: "0px 10px 0px 7px",
                border: "none",
                borderRadius: "8px",
                margin: "0px",
                outline: "none",
                textDecoration: "none",
                transition: "background-color 0.15s, color 0.15s",
                position: "relative",
                display: "inline-flex",
                height: "30px",
                appearance: "none",
                backgroundColor: "transparent",
                color: themeColors.dark.foreground.muted,
                fontSize: "12px",
                fontWeight: 600,
                userSelect: "none",
                cursor: "pointer",
                alignItems: "center",
                gap: "8px",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = themeColors.dark.sidebar.hover;
                e.currentTarget.style.color = themeColors.dark.foreground.primary;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "transparent";
                e.currentTarget.style.color = themeColors.dark.foreground.muted;
              }}
            >
              <Share2 style={{ width: "18px", height: "18px" }} />
              <span style={{ paddingBottom: "1px" }}>Share</span>
            </button>
          </div>
        </div>

        {/* Center - Project Title */}
        <div
          style={{
            boxSizing: "border-box",
            WebkitFontSmoothing: "antialiased",
            userSelect: "none",
            outline: "none",
            display: "flex",
            flexShrink: 0,
            flexDirection: "row",
            flexWrap: "nowrap",
            alignItems: "center",
            justifyContent: "center",
            position: "absolute",
            top: "0px",
            right: "0px",
            left: "0px",
            height: "60px",
            pointerEvents: "none",
            gap: "10px",
          }}
        >
          <div
            style={{
              WebkitFontSmoothing: "antialiased",
              overflow: "hidden",
              flexFlow: "wrap",
              display: "flex",
              height: "30px",
              alignItems: "center",
              justifyContent: "center",
              padding: "0px",
              border: "none",
              outline: "none",
              textDecoration: "none",
              position: "relative",
              maxWidth: "25%",
              boxSizing: "border-box",
              backgroundColor: "unset",
              color: themeColors.dark.foreground.primary,
              fontSize: "12px",
              fontWeight: 600,
              pointerEvents: "auto",
              userSelect: "none",
            }}
          >
            <span
              style={{
                boxSizing: "border-box",
                WebkitFontSmoothing: "antialiased",
                userSelect: "none",
                overflow: "clip",
                whiteSpace: "nowrap",
                minWidth: "0px",
                textOverflow: "ellipsis",
                cursor: "pointer",
                height: "30px",
                lineHeight: "30px",
              }}
            >
              {projectName}
            </span>
          </div>
        </div>

        {/* Right Side - Actions */}
        <div
          style={{
            boxSizing: "border-box",
            WebkitFontSmoothing: "antialiased",
            userSelect: "none",
            outline: "none",
            display: "flex",
            flexShrink: 0,
            flexDirection: "row",
            flexWrap: "nowrap",
            alignItems: "stretch",
            justifyContent: "flex-end",
            height: "30px",
            flexGrow: 1,
            paddingRight: "15px",
            gap: "10px",
          }}
        >
          {/* Settings Button */}
          <button
            type="button"
            title="Settings"
            style={{
              boxSizing: "border-box",
              WebkitFontSmoothing: "antialiased",
              fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
              border: "none",
              margin: "0px",
              outline: "none",
              textDecoration: "none",
              position: "relative",
              appearance: "none",
              userSelect: "none",
              flex: "0 0 auto",
              borderRadius: "8px",
              transition: "border-color 0.15s, background-color 0.15s",
              display: "flex",
              minWidth: "30px",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: 600,
              padding: "0px",
              width: "30px",
              height: "30px",
              fontSize: "12px",
              backgroundColor: themeColors.dark.background.tertiary,
              color: themeColors.dark.foreground.primary,
              cursor: "pointer",
            }}
          >
            <Settings style={{ width: "16px", height: "16px" }} />
          </button>

          {/* Preview Button */}
          <button
            type="button"
            title="Preview"
            style={{
              boxSizing: "border-box",
              WebkitFontSmoothing: "antialiased",
              fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
              border: "none",
              margin: "0px",
              outline: "none",
              textDecoration: "none",
              position: "relative",
              appearance: "none",
              userSelect: "none",
              flex: "0 0 auto",
              borderRadius: "8px",
              transition: "border-color 0.15s, background-color 0.15s",
              display: "flex",
              minWidth: "30px",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: 600,
              padding: "0px",
              backgroundColor: themeColors.dark.background.tertiary,
              color: themeColors.dark.foreground.primary,
              width: "30px",
              height: "30px",
              fontSize: "12px",
              cursor: "pointer",
            }}
          >
            <Play style={{ width: "16px", height: "16px" }} />
          </button>

          {/* Upgrade Now Button */}
          <button
            id="toolbar-upgrade-button"
            type="button"
            title="Upgrade Now"
            style={{
              boxSizing: "border-box",
              WebkitFontSmoothing: "antialiased",
              fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
              border: "none",
              margin: "0px",
              outline: "none",
              textDecoration: "none",
              position: "relative",
              height: "30px",
              appearance: "none",
              userSelect: "none",
              flex: "0 0 auto",
              padding: "0px 10px",
              borderRadius: "8px",
              transition: "border-color 0.15s, background-color 0.15s",
              display: "flex",
              minWidth: "30px",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "12px",
              fontWeight: 600,
              backgroundColor: themeColors.dark.background.tertiary,
              color: themeColors.dark.foreground.primary,
              cursor: "pointer",
            }}
          >
            <span style={{ userSelect: "none" }}>Upgrade Now</span>
          </button>

          {/* Publish Button */}
          <button
            id="toolbar-publish-button"
            type="button"
            aria-label="Publish"
            onClick={onPublish}
            style={{
              WebkitFontSmoothing: "antialiased",
              fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
              border: "none",
              margin: "0px",
              outline: "none",
              textDecoration: "none",
              position: "relative",
              appearance: "none",
              userSelect: "none",
              padding: "0px 10px",
              borderRadius: "8px",
              zIndex: 0,
              boxSizing: "border-box",
              fontWeight: 600,
              overflow: "hidden",
              transition: "background-color 0.15s, box-shadow 0.15s, color 0.15s",
              backgroundColor: themeColors.dark.accent.primary,
              boxShadow: "0px 1px 2px 0px rgba(59, 130, 246, .15), 0px 2px 4px 0px rgba(59, 130, 246, .2)",
              color: "#ffffff",
              height: "30px",
              fontSize: "12px",
              minWidth: "62px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = themeColors.dark.accent.hover;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = themeColors.dark.accent.primary;
            }}
          >
            <span style={{ userSelect: "none" }}>Publish</span>
          </button>
        </div>
      </div>
    </>
  );
}
