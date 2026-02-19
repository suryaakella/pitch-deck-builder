import { McpUseProvider, useWidget, type WidgetMetadata } from "mcp-use/react";
import { z } from "zod";
import React, { useState, useEffect, useCallback } from "react";

// ─── Widget metadata (auto-discovered by mcp-use) ──────────

const slideSchema = z.object({
  id: z.string(),
  type: z.string(),
  title: z.string(),
  subtitle: z.string().optional(),
  content: z.string().optional(),
  bullets: z.array(z.string()).optional(),
  metrics: z
    .array(
      z.object({
        label: z.string(),
        value: z.string(),
        description: z.string().optional(),
      }),
    )
    .optional(),
  icon: z.string().optional(),
});

export const widgetMetadata: WidgetMetadata = {
  description: "Interactive pitch deck slide viewer with themes, navigation, and animations",
  props: z.object({
    companyName: z.string(),
    tagline: z.string(),
    theme: z.string(),
    slides: z.array(slideSchema),
  }),
};

// ─── Theme definitions ──────────────────────────────────────

interface Theme {
  bg: string;
  bgSecondary: string;
  text: string;
  textSecondary: string;
  accent: string;
  accentGlow: string;
  cardBg: string;
  cardBorder: string;
  navBg: string;
  navHover: string;
  dotInactive: string;
  gradient: string;
}

const THEMES: Record<string, Theme> = {
  midnight: {
    bg: "#0f172a",
    bgSecondary: "rgba(255,255,255,0.05)",
    text: "#ffffff",
    textSecondary: "rgba(255,255,255,0.7)",
    accent: "#3b82f6",
    accentGlow: "rgba(59,130,246,0.3)",
    cardBg: "rgba(255,255,255,0.06)",
    cardBorder: "rgba(255,255,255,0.1)",
    navBg: "rgba(255,255,255,0.08)",
    navHover: "rgba(255,255,255,0.15)",
    dotInactive: "rgba(255,255,255,0.25)",
    gradient: "none",
  },
  clean: {
    bg: "#ffffff",
    bgSecondary: "rgba(0,0,0,0.03)",
    text: "#1e293b",
    textSecondary: "rgba(30,41,59,0.6)",
    accent: "#6366f1",
    accentGlow: "rgba(99,102,241,0.25)",
    cardBg: "rgba(0,0,0,0.03)",
    cardBorder: "rgba(0,0,0,0.08)",
    navBg: "rgba(0,0,0,0.05)",
    navHover: "rgba(0,0,0,0.1)",
    dotInactive: "rgba(0,0,0,0.15)",
    gradient: "none",
  },
  sunset: {
    bg: "#1a0a2e",
    bgSecondary: "rgba(255,255,255,0.06)",
    text: "#ffffff",
    textSecondary: "rgba(255,255,255,0.75)",
    accent: "#f97316",
    accentGlow: "rgba(249,115,22,0.3)",
    cardBg: "rgba(255,255,255,0.08)",
    cardBorder: "rgba(255,255,255,0.12)",
    navBg: "rgba(255,255,255,0.1)",
    navHover: "rgba(255,255,255,0.18)",
    dotInactive: "rgba(255,255,255,0.25)",
    gradient: "linear-gradient(135deg, #f97316 0%, #ec4899 50%, #8b5cf6 100%)",
  },
  forest: {
    bg: "#064e3b",
    bgSecondary: "rgba(255,255,255,0.06)",
    text: "#ecfdf5",
    textSecondary: "rgba(236,253,245,0.7)",
    accent: "#fbbf24",
    accentGlow: "rgba(251,191,36,0.3)",
    cardBg: "rgba(255,255,255,0.07)",
    cardBorder: "rgba(255,255,255,0.1)",
    navBg: "rgba(255,255,255,0.08)",
    navHover: "rgba(255,255,255,0.15)",
    dotInactive: "rgba(255,255,255,0.25)",
    gradient: "none",
  },
  electric: {
    bg: "#0a0a0a",
    bgSecondary: "rgba(255,255,255,0.04)",
    text: "#e0e0e0",
    textSecondary: "rgba(224,224,224,0.6)",
    accent: "#00ff88",
    accentGlow: "rgba(0,255,136,0.25)",
    cardBg: "rgba(0,255,136,0.05)",
    cardBorder: "rgba(0,255,136,0.15)",
    navBg: "rgba(255,255,255,0.06)",
    navHover: "rgba(0,255,136,0.12)",
    dotInactive: "rgba(255,255,255,0.2)",
    gradient: "none",
  },
};

const THEME_DOT_COLORS: Record<string, { bg: string; border?: string }> = {
  midnight: { bg: "#0f172a" },
  clean: { bg: "#ffffff", border: "rgba(0,0,0,0.2)" },
  sunset: { bg: "linear-gradient(135deg, #f97316, #ec4899)" },
  forest: { bg: "#064e3b" },
  electric: { bg: "#0a0a0a", border: "#00ff88" },
};

// ─── Slide Components ───────────────────────────────────────

interface SlideData {
  id: string;
  type: string;
  title: string;
  subtitle?: string;
  content?: string;
  bullets?: string[];
  metrics?: { label: string; value: string; description?: string }[];
  icon?: string;
}

function TitleSlide({ slide, active, theme }: { slide: SlideData; active: boolean; theme: Theme }) {
  return (
    <div className={`slide slide-title ${active ? "active" : ""}`}>
      {slide.icon && <span className="slide-icon">{slide.icon}</span>}
      <h1
        style={{
          background: `linear-gradient(135deg, ${theme.text} 0%, ${theme.accent} 100%)`,
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          backgroundClip: "text",
        }}
      >
        {slide.title}
      </h1>
      {slide.subtitle && <p className="subtitle">{slide.subtitle}</p>}
    </div>
  );
}

function ContentSlide({ slide, active, theme }: { slide: SlideData; active: boolean; theme: Theme }) {
  return (
    <div className={`slide slide-content ${active ? "active" : ""}`}>
      {slide.icon && <span className="slide-icon">{slide.icon}</span>}
      <h2>{slide.title}</h2>
      {slide.content && <p className="body-text">{slide.content}</p>}
      {slide.bullets && (
        <ul className="bullet-list">
          {slide.bullets.map((b, i) => (
            <li key={i} style={{ "--accent": theme.accent, "--accent-glow": theme.accentGlow } as React.CSSProperties}>
              {b}
            </li>
          ))}
        </ul>
      )}
      {slide.metrics && (
        <div className="metrics-row">
          {slide.metrics.map((m, i) => (
            <div key={i} className="metric-card">
              <div className="metric-value" style={{ color: theme.accent }}>
                {m.value}
              </div>
              <div className="metric-label">{m.label}</div>
              {m.description && <div className="metric-desc">{m.description}</div>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Main Widget Component ──────────────────────────────────

const PitchDeckWidget: React.FC = () => {
  const { props, callTool } = useWidget();
  const { companyName, tagline, theme: themeName, slides } = props as {
    companyName: string;
    tagline: string;
    theme: string;
    slides: SlideData[];
  };

  const [currentSlide, setCurrentSlide] = useState(0);
  const [activeTheme, setActiveTheme] = useState(themeName || "midnight");

  const theme = THEMES[activeTheme] || THEMES.midnight;
  const total = slides.length;

  // Reset slide index when slides change
  useEffect(() => {
    setCurrentSlide(0);
    if (themeName && THEMES[themeName]) {
      setActiveTheme(themeName);
    }
  }, [slides, themeName]);

  const goToSlide = useCallback(
    (index: number) => {
      if (index >= 0 && index < total) {
        setCurrentSlide(index);
      }
    },
    [total],
  );

  // Keyboard navigation
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === "ArrowDown") {
        e.preventDefault();
        setCurrentSlide((prev) => Math.min(prev + 1, total - 1));
      } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
        e.preventDefault();
        setCurrentSlide((prev) => Math.max(prev - 1, 0));
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [total]);

  const handleThemeChange = async (name: string) => {
    setActiveTheme(name);
    try {
      await callTool("change_theme", { theme: name });
    } catch {
      // Theme changed locally even if server call fails
    }
  };

  const bgStyle = theme.gradient !== "none" ? theme.gradient : theme.bg;

  return (
    <McpUseProvider autoSize>
      <style>{getStyles(theme)}</style>
      <div
        id="app"
        style={{
          background: bgStyle,
          color: theme.text,
          fontFamily: "'DM Sans', sans-serif",
          height: "100vh",
          width: "100vw",
          overflow: "hidden",
          position: "relative",
          WebkitFontSmoothing: "antialiased",
        }}
      >
        {/* Theme switcher */}
        <div className="theme-switcher">
          {Object.keys(THEMES).map((name) => {
            const dotColor = THEME_DOT_COLORS[name];
            const isActive = name === activeTheme;
            const borderColor =
              activeTheme === "clean"
                ? isActive
                  ? "#1e293b"
                  : "rgba(0,0,0,0.2)"
                : isActive
                  ? "#fff"
                  : name === "clean"
                    ? "rgba(255,255,255,0.5)"
                    : "rgba(255,255,255,0.3)";
            return (
              <div
                key={name}
                className={`theme-dot ${isActive ? "active" : ""}`}
                data-theme={name}
                title={name}
                onClick={() => handleThemeChange(name)}
                style={{
                  background: dotColor.bg,
                  borderColor: dotColor.border || borderColor,
                  ...(isActive && { boxShadow: "0 0 8px rgba(255,255,255,0.4)", transform: "scale(1.15)" }),
                }}
              />
            );
          })}
        </div>

        {/* Slide counter */}
        <div className="slide-counter" style={{ color: theme.textSecondary }}>
          {currentSlide + 1} / {total}
        </div>

        {/* Navigation arrows */}
        <button
          className="nav-arrow prev"
          disabled={currentSlide === 0}
          onClick={() => goToSlide(currentSlide - 1)}
          aria-label="Previous slide"
          style={{ background: theme.navBg, color: theme.text }}
        >
          &#8249;
        </button>
        <button
          className="nav-arrow next"
          disabled={currentSlide === total - 1}
          onClick={() => goToSlide(currentSlide + 1)}
          aria-label="Next slide"
          style={{ background: theme.navBg, color: theme.text }}
        >
          &#8250;
        </button>

        {/* Slides */}
        <div className="slides-viewport">
          {slides.map((slide, i) =>
            slide.type === "title" ? (
              <TitleSlide key={slide.id} slide={slide} active={i === currentSlide} theme={theme} />
            ) : (
              <ContentSlide key={slide.id} slide={slide} active={i === currentSlide} theme={theme} />
            ),
          )}
        </div>

        {/* Dot indicators */}
        <div className="dots">
          {slides.map((_, i) => (
            <div
              key={i}
              className={`dot ${i === currentSlide ? "active" : ""}`}
              onClick={() => goToSlide(i)}
              style={{
                background: i === currentSlide ? theme.accent : theme.dotInactive,
                ...(i === currentSlide && { boxShadow: `0 0 10px ${theme.accentGlow}` }),
              }}
            />
          ))}
        </div>
      </div>
    </McpUseProvider>
  );
};

// ─── Dynamic CSS ────────────────────────────────────────────

function getStyles(t: Theme): string {
  return `
    @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600;700;800;900&family=DM+Sans:wght@400;500;600&display=swap');

    * { margin: 0; padding: 0; box-sizing: border-box; }

    .theme-switcher {
      position: absolute;
      top: 16px; left: 16px;
      display: flex; gap: 8px;
      z-index: 100;
    }
    .theme-dot {
      width: 18px; height: 18px;
      border-radius: 50%;
      border: 2px solid rgba(255,255,255,0.3);
      cursor: pointer;
      transition: transform 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease;
    }
    .theme-dot:hover { transform: scale(1.2); }

    .slide-counter {
      position: absolute;
      top: 18px; right: 20px;
      font-family: 'DM Sans', sans-serif;
      font-size: 13px; font-weight: 500;
      z-index: 100; letter-spacing: 0.5px;
    }

    .slides-viewport {
      position: relative;
      width: 100%; height: 100%;
    }
    .slide {
      position: absolute;
      top: 0; left: 0;
      width: 100%; height: 100%;
      display: flex; flex-direction: column;
      justify-content: center;
      padding: 60px 80px;
      opacity: 0;
      transform: translateX(60px);
      transition: opacity 0.4s ease, transform 0.4s ease;
      pointer-events: none;
    }
    .slide.active {
      opacity: 1;
      transform: translateX(0);
      pointer-events: auto;
    }

    .slide-title {
      text-align: center;
      justify-content: center;
      align-items: center;
    }
    .slide-title .slide-icon {
      font-size: 64px; margin-bottom: 20px; display: block;
    }
    .slide-title h1 {
      font-family: 'Montserrat', sans-serif;
      font-weight: 900;
      font-size: clamp(36px, 6vw, 64px);
      letter-spacing: -1.5px;
      line-height: 1.1;
      margin-bottom: 16px;
    }
    .slide-title .subtitle {
      font-size: clamp(16px, 2.2vw, 22px);
      color: ${t.textSecondary};
      font-weight: 400;
      max-width: 600px;
      line-height: 1.6;
    }

    .slide-content .slide-icon {
      font-size: 40px; margin-bottom: 12px; display: block;
    }
    .slide-content h2 {
      font-family: 'Montserrat', sans-serif;
      font-weight: 800;
      font-size: clamp(28px, 4vw, 44px);
      letter-spacing: -1px;
      line-height: 1.15;
      margin-bottom: 20px;
      color: ${t.text};
    }
    .slide-content .body-text {
      font-size: clamp(15px, 1.8vw, 18px);
      color: ${t.textSecondary};
      line-height: 1.7;
      max-width: 700px;
      margin-bottom: 28px;
    }

    .bullet-list {
      list-style: none; padding: 0; max-width: 650px;
    }
    .bullet-list li {
      position: relative;
      padding-left: 28px;
      margin-bottom: 14px;
      font-size: clamp(14px, 1.6vw, 17px);
      color: ${t.textSecondary};
      line-height: 1.6;
    }
    .bullet-list li::before {
      content: '';
      position: absolute;
      left: 0; top: 9px;
      width: 8px; height: 8px;
      border-radius: 50%;
      background: ${t.accent};
      box-shadow: 0 0 8px ${t.accentGlow};
    }

    .metrics-row {
      display: flex; gap: 20px;
      flex-wrap: wrap; margin-top: 8px;
    }
    .metric-card {
      flex: 1;
      min-width: 140px; max-width: 220px;
      background: ${t.cardBg};
      border: 1px solid ${t.cardBorder};
      border-radius: 16px;
      padding: 24px 20px;
      text-align: center;
      transition: transform 0.2s ease, box-shadow 0.2s ease;
    }
    .metric-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 24px rgba(0,0,0,0.3);
    }
    .metric-card .metric-value {
      font-family: 'Montserrat', sans-serif;
      font-weight: 800;
      font-size: clamp(24px, 3vw, 36px);
      letter-spacing: -0.5px;
      margin-bottom: 6px;
    }
    .metric-card .metric-label {
      font-weight: 600; font-size: 14px;
      color: ${t.text};
      margin-bottom: 4px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .metric-card .metric-desc {
      font-size: 12px;
      color: ${t.textSecondary};
    }

    .nav-arrow {
      position: absolute;
      top: 50%; transform: translateY(-50%);
      width: 44px; height: 44px;
      border-radius: 50%; border: none;
      font-size: 18px; cursor: pointer;
      z-index: 100;
      display: flex; align-items: center; justify-content: center;
      transition: background 0.2s ease, transform 0.2s ease;
      backdrop-filter: blur(8px);
    }
    .nav-arrow:hover {
      background: ${t.navHover} !important;
      transform: translateY(-50%) scale(1.08);
    }
    .nav-arrow.prev { left: 16px; }
    .nav-arrow.next { right: 16px; }
    .nav-arrow:disabled { opacity: 0.3; cursor: default; }
    .nav-arrow:disabled:hover {
      transform: translateY(-50%);
      background: ${t.navBg} !important;
    }

    .dots {
      position: absolute;
      bottom: 20px; left: 50%;
      transform: translateX(-50%);
      display: flex; gap: 8px;
      z-index: 100;
    }
    .dot {
      width: 8px; height: 8px;
      border-radius: 50%;
      cursor: pointer;
      transition: background 0.3s ease, transform 0.3s ease, width 0.3s ease;
    }
    .dot.active {
      width: 24px;
      border-radius: 4px;
    }

    @media (max-width: 640px) {
      .slide { padding: 50px 28px; }
      .metrics-row { gap: 12px; }
      .metric-card { min-width: 100px; padding: 16px 12px; }
      .nav-arrow { width: 36px; height: 36px; font-size: 14px; }
      .nav-arrow.prev { left: 8px; }
      .nav-arrow.next { right: 8px; }
    }
  `;
}

export default PitchDeckWidget;
