import { useEffect, useRef, useMemo } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import useOverlayBody from "@/hooks/use-overlay-body";

/* ─── Image map for photorealistic rooms ─── */
const roomImages: Record<string, string> = {
  "neon-cyberroom": "/backgrounds/neon-cyberroom.jpg",
  "gaming-lair": "/backgrounds/gaming-lair.jpg",
  "arcade-retro": "/backgrounds/arcade-retro.jpg",
  "space-command": "/backgrounds/space-command.jpg",
  "mystic-chill": "/backgrounds/mystic-chill.jpg",
  "luxury-lounge": "/backgrounds/luxury-lounge.jpg",
  "pastel-creator": "/backgrounds/pastel-creator.jpg",
  "nightclub-vibe": "/backgrounds/nightclub-vibe.jpg",
  "podcast-chill": "/backgrounds/podcast-chill.jpg",
  "cinematic-studio": "/backgrounds/cinematic-studio.jpg",
};

/* ─── Font map ─── */
const fontMap: Record<string, string> = {
  neon: "'Courier New', monospace",
  cyber: "'Courier New', monospace",
  arcade: "'Courier New', monospace",
  futuristic: "system-ui, sans-serif",
  digital: "'Courier New', monospace",
  script: "Georgia, serif",
  minimal: "system-ui, sans-serif",
};

/* ─── Theme hues for LED default colors ─── */
const themeHues: Record<string, number> = {
  "neon-cyberroom": 280,
  "gaming-lair": 160,
  "arcade-retro": 340,
  "space-command": 220,
  "mystic-chill": 30,
  "luxury-lounge": 40,
  "pastel-creator": 330,
  "nightclub-vibe": 320,
  "podcast-chill": 25,
  "cinematic-studio": 180,
};

/* ─── Main Renderer ─── */
const BackgroundRenderer = () => {
  useOverlayBody();
  const { theme: themeParam } = useParams();
  const [searchParams] = useSearchParams();
  const ledRef = useRef<HTMLDivElement>(null);

  // Parse URL params
  const ledText = searchParams.get("led") || "LIVE NOW";
  const mode = searchParams.get("mode") || "full";
  const ledColorParam = searchParams.get("color");
  const ledAnimParam = searchParams.get("anim") || "pulse";
  const ledFontParam = searchParams.get("font") || "neon";
  const speedParam = parseFloat(searchParams.get("speed") || "1");
  const glowParam = parseFloat(searchParams.get("glow") || "60");
  const brightnessParam = parseFloat(searchParams.get("brightness") || "100");
  const vignetteParam = searchParams.get("vignette") === "1";
  const ledOpacityParam = parseFloat(searchParams.get("ledopacity") || "100");

  const themeId = themeParam || "neon-cyberroom";
  const defaultHue = themeHues[themeId] || 280;

  // Decode HSL color from URL
  const ledColor = useMemo(() => {
    if (ledColorParam && /^\d+_\d+_\d+$/.test(ledColorParam)) {
      const [h, s, l] = ledColorParam.split("_");
      return `${h} ${s}% ${l}%`;
    }
    return ledColorParam || `${defaultHue} 100% 65%`;
  }, [ledColorParam, defaultHue]);

  const glowPx = 4 + (glowParam / 100) * 24;
  const fontFamily = fontMap[ledFontParam] || fontMap.neon;
  const bgImage = roomImages[themeId] || roomImages["neon-cyberroom"];

  // LED sign animation
  useEffect(() => {
    if (mode === "preview") return;
    const led = ledRef.current;
    if (!led) return;
    let frame: number;
    let t = 0;

    const animate = () => {
      t += 0.02 * speedParam;

      if (ledAnimParam === "pulse") {
        const pulse = Math.sin(t * 2) * 0.4 + 0.6;
        led.style.textShadow = `0 0 ${glowPx * pulse}px hsl(${ledColor} / 0.6), 0 0 ${glowPx * pulse * 2}px hsl(${ledColor} / 0.3)`;
        led.style.opacity = `${(0.8 + pulse * 0.2) * (ledOpacityParam / 100)}`;
      } else if (ledAnimParam === "flicker") {
        const flicker = Math.random() > 0.92 ? 0.5 : 1;
        led.style.opacity = `${flicker * (ledOpacityParam / 100)}`;
      } else if (ledAnimParam === "rainbow") {
        const hue = (t * 60) % 360;
        led.style.color = `hsl(${hue} 100% 65%)`;
        led.style.textShadow = `0 0 ${glowPx}px hsl(${hue} 100% 65% / 0.6)`;
      } else if (ledAnimParam === "sparkle") {
        const sparkle = Math.sin(t * 5) * 0.5 + 0.5;
        led.style.textShadow = `0 0 ${glowPx + sparkle * glowPx * 2}px hsl(${ledColor} / ${0.4 + sparkle * 0.5})`;
      } else {
        led.style.opacity = `${ledOpacityParam / 100}`;
      }

      frame = requestAnimationFrame(animate);
    };

    animate();
    return () => cancelAnimationFrame(frame);
  }, [ledAnimParam, ledColor, speedParam, glowPx, mode, ledOpacityParam]);

  return (
    <div style={{
      width: "100vw", height: "100vh", overflow: "hidden", background: "#000", position: "relative",
      filter: brightnessParam !== 100 ? `brightness(${brightnessParam / 100})` : undefined,
    }}>
      {/* Photorealistic room background */}
      {mode !== "led" && (
        <img
          src={bgImage}
          alt=""
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
          }}
        />
      )}

      {/* Vignette */}
      {vignetteParam && mode !== "led" && (
        <div style={{
          position: "absolute", inset: 0, pointerEvents: "none",
          background: "radial-gradient(ellipse at center, transparent 30%, rgba(0,0,0,0.55) 100%)",
        }} />
      )}

      {/* LED Sign */}
      {mode !== "preview" && (
        <div
          style={{
            position: "absolute",
            top: mode === "led" ? "50%" : "8%",
            left: 0, right: 0,
            textAlign: "center",
            transform: mode === "led" ? "translateY(-50%)" : undefined,
            zIndex: 10,
          }}
        >
          <div
            style={{
              display: "inline-block",
              padding: "12px 32px",
            }}
          >
            <div
              ref={ledRef}
              style={{
                fontFamily,
                fontSize: "clamp(24px, 4vw, 72px)",
                fontWeight: 700,
                letterSpacing: "0.15em",
                color: `hsl(${ledColor})`,
                textShadow: `0 0 ${glowPx}px hsl(${ledColor} / 0.6), 0 0 ${glowPx * 2}px hsl(${ledColor} / 0.3), 0 0 ${glowPx * 3}px hsl(${ledColor} / 0.15)`,
                whiteSpace: "nowrap",
                opacity: ledOpacityParam / 100,
              }}
            >
              {ledText}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BackgroundRenderer;
