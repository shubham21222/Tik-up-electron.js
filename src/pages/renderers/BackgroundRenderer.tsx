import { useEffect, useRef, useMemo } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import useOverlayBody from "@/hooks/use-overlay-body";

/* ─── Theme definitions ─── */
interface ThemeDef {
  gradients: string[];
  particleHues: number[];
  envStyle: "neon" | "rgb" | "retro" | "stars" | "runes";
}

const themes: Record<string, ThemeDef> = {
  "neon-cyberroom": {
    gradients: ["#1a0033", "#001a33", "#33001a"],
    particleHues: [280, 200, 320],
    envStyle: "neon",
  },
  "gaming-lair": {
    gradients: ["#002b1a", "#001a2b", "#1a002b"],
    particleHues: [160, 200, 280],
    envStyle: "rgb",
  },
  "arcade-retro": {
    gradients: ["#2b0011", "#2b1a00", "#001a2b"],
    particleHues: [340, 45, 200],
    envStyle: "retro",
  },
  "space-command": {
    gradients: ["#0a0f1e", "#0f1030", "#0a1a2b"],
    particleHues: [220, 240, 200],
    envStyle: "stars",
  },
  "mystic-chill": {
    gradients: ["#1a1008", "#120e1a", "#0e1a15"],
    particleHues: [30, 260, 180],
    envStyle: "runes",
  },
};

/* ─── Font map ─── */
const fontMap: Record<string, string> = {
  neon: "'Courier New', monospace",
  cyber: "'Courier New', monospace",
  arcade: "'Courier New', monospace",
  futuristic: "system-ui, sans-serif",
  digital: "'Courier New', monospace",
  script: "Georgia, serif",
};

/* ─── Main Renderer ─── */
const BackgroundRenderer = () => {
  useOverlayBody();
  const { theme: themeParam } = useParams();
  const [searchParams] = useSearchParams();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const ledRef = useRef<HTMLDivElement>(null);

  // Parse URL params
  const ledText = searchParams.get("led") || "LIVE NOW";
  const mode = searchParams.get("mode") || "full"; // full | preview | led
  const ledColorParam = searchParams.get("color");
  const ledAnimParam = searchParams.get("anim") || "pulse";
  const ledFontParam = searchParams.get("font") || "neon";
  const speedParam = parseFloat(searchParams.get("speed") || "1");
  const glowParam = parseFloat(searchParams.get("glow") || "60");

  const themeId = themeParam || "neon-cyberroom";
  const theme = themes[themeId] || themes["neon-cyberroom"];

  // Decode HSL color from URL (format: 280_100_65)
  const ledColor = useMemo(() => {
    if (ledColorParam && /^\d+_\d+_\d+$/.test(ledColorParam)) {
      const [h, s, l] = ledColorParam.split("_");
      return `${h} ${s}% ${l}%`;
    }
    return ledColorParam || `${theme.particleHues[0]} 100% 65%`;
  }, [ledColorParam, theme]);

  const glowPx = 4 + (glowParam / 100) * 24;
  const fontFamily = fontMap[ledFontParam] || fontMap.neon;

  // Particles for canvas
  const particles = useMemo(() =>
    Array.from({ length: 60 }, () => ({
      x: Math.random(),
      y: Math.random(),
      size: 0.5 + Math.random() * 2.5,
      speed: 0.1 + Math.random() * 0.4,
      hue: theme.particleHues[Math.floor(Math.random() * theme.particleHues.length)],
      phase: Math.random() * Math.PI * 2,
      drift: (Math.random() - 0.5) * 0.3,
    })), [themeId]
  );

  // Canvas animation for background + particles
  useEffect(() => {
    if (mode === "led") return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    let t = 0;
    let frame: number;

    const draw = () => {
      const W = canvas.width;
      const H = canvas.height;
      t += 0.008 * speedParam;

      // Animated gradient background
      const grd = ctx.createLinearGradient(
        W * 0.5 + Math.cos(t) * W * 0.3,
        0,
        W * 0.5 + Math.sin(t * 0.7) * W * 0.3,
        H
      );
      theme.gradients.forEach((c, i) => {
        const offset = (i / (theme.gradients.length - 1) + Math.sin(t + i) * 0.1);
        grd.addColorStop(Math.max(0, Math.min(1, offset)), c);
      });
      ctx.fillStyle = grd;
      ctx.fillRect(0, 0, W, H);

      // Environment-specific effects
      if (theme.envStyle === "neon") {
        // Neon tube flickers
        for (let i = 0; i < 3; i++) {
          const flicker = Math.sin(t * 8 + i * 2) * 0.3 + 0.7;
          ctx.strokeStyle = `hsla(${theme.particleHues[i]}, 100%, 60%, ${0.05 * flicker})`;
          ctx.lineWidth = 2;
          ctx.beginPath();
          const y = H * (0.2 + i * 0.25);
          ctx.moveTo(0, y);
          for (let x = 0; x < W; x += 4) {
            ctx.lineTo(x, y + Math.sin(x * 0.01 + t * 3) * 3);
          }
          ctx.stroke();
        }
      } else if (theme.envStyle === "stars") {
        // Starfield
        for (let i = 0; i < 80; i++) {
          const sx = ((i * 137.5 + t * 20 * (1 + (i % 3) * 0.5)) % W);
          const sy = ((i * 97.3) % H);
          const twinkle = Math.sin(t * 3 + i) * 0.5 + 0.5;
          ctx.fillStyle = `rgba(200, 220, 255, ${0.2 + twinkle * 0.4})`;
          ctx.beginPath();
          ctx.arc(sx, sy, 0.5 + twinkle, 0, Math.PI * 2);
          ctx.fill();
        }
      } else if (theme.envStyle === "retro") {
        // Scanlines
        ctx.fillStyle = "rgba(0,0,0,0.03)";
        for (let y = 0; y < H; y += 3) {
          ctx.fillRect(0, y, W, 1);
        }
        // CRT vignette
        const vgrd = ctx.createRadialGradient(W / 2, H / 2, H * 0.3, W / 2, H / 2, H * 0.8);
        vgrd.addColorStop(0, "transparent");
        vgrd.addColorStop(1, "rgba(0,0,0,0.4)");
        ctx.fillStyle = vgrd;
        ctx.fillRect(0, 0, W, H);
      } else if (theme.envStyle === "runes") {
        // Floating rune circles
        for (let i = 0; i < 5; i++) {
          const rx = W * (0.2 + (i * 0.15));
          const ry = H * 0.5 + Math.sin(t * 0.5 + i * 1.2) * H * 0.15;
          const alpha = Math.sin(t + i) * 0.15 + 0.15;
          ctx.strokeStyle = `hsla(${theme.particleHues[i % 3]}, 60%, 50%, ${alpha})`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.arc(rx, ry, 20 + i * 8, 0, Math.PI * 2);
          ctx.stroke();
          // Inner ring
          ctx.beginPath();
          ctx.arc(rx, ry, 10 + i * 4, t + i, t + i + Math.PI * 1.5);
          ctx.stroke();
        }
      } else if (theme.envStyle === "rgb") {
        // RGB light sweep
        for (let i = 0; i < 3; i++) {
          const sweep = (t * 0.5 + i * 2.1) % (Math.PI * 2);
          const sx = W * 0.5 + Math.cos(sweep) * W * 0.4;
          const rgrd = ctx.createRadialGradient(sx, H, 0, sx, H, H * 0.6);
          rgrd.addColorStop(0, `hsla(${theme.particleHues[i]}, 100%, 50%, 0.06)`);
          rgrd.addColorStop(1, "transparent");
          ctx.fillStyle = rgrd;
          ctx.fillRect(0, 0, W, H);
        }
      }

      // Particles
      particles.forEach(p => {
        const px = ((p.x + Math.sin(t * p.drift + p.phase) * 0.02 + t * p.drift * 0.01) % 1) * W;
        const py = ((p.y - t * p.speed * 0.005) % 1 + 1) % 1 * H;
        const pulse = Math.sin(t * 2 + p.phase) * 0.4 + 0.6;
        
        ctx.fillStyle = `hsla(${p.hue}, 80%, 60%, ${0.15 + pulse * 0.25})`;
        ctx.shadowColor = `hsla(${p.hue}, 100%, 60%, ${pulse * 0.3})`;
        ctx.shadowBlur = p.size * 4;
        ctx.beginPath();
        ctx.arc(px, py, p.size * pulse, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      });

      frame = requestAnimationFrame(draw);
    };

    draw();
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", resize);
    };
  }, [themeId, speedParam, mode]);

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
        led.style.opacity = `${0.8 + pulse * 0.2}`;
      } else if (ledAnimParam === "flicker") {
        const flicker = Math.random() > 0.92 ? 0.5 : 1;
        led.style.opacity = `${flicker}`;
      } else if (ledAnimParam === "rainbow") {
        const hue = (t * 60) % 360;
        led.style.color = `hsl(${hue} 100% 65%)`;
        led.style.textShadow = `0 0 ${glowPx}px hsl(${hue} 100% 65% / 0.6)`;
      } else if (ledAnimParam === "sparkle") {
        const sparkle = Math.sin(t * 5) * 0.5 + 0.5;
        led.style.textShadow = `0 0 ${glowPx + sparkle * glowPx * 2}px hsl(${ledColor} / ${0.4 + sparkle * 0.5})`;
      }

      frame = requestAnimationFrame(animate);
    };

    animate();
    return () => cancelAnimationFrame(frame);
  }, [ledAnimParam, ledColor, speedParam, glowPx, mode]);

  return (
    <div style={{ width: "100vw", height: "100vh", overflow: "hidden", background: "#000", position: "relative" }}>
      {/* Background canvas */}
      {mode !== "led" && (
        <canvas
          ref={canvasRef}
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
        />
      )}

      {/* LED Sign */}
      {mode !== "preview" && (
        <div
          style={{
            position: "absolute",
            bottom: mode === "led" ? "50%" : "10%",
            left: 0,
            right: 0,
            textAlign: "center",
            transform: mode === "led" ? "translateY(50%)" : undefined,
            zIndex: 10,
          }}
        >
          <div
            style={{
              display: "inline-block",
              padding: "12px 32px",
              borderRadius: 12,
              background: mode === "led" ? "transparent" : `hsl(${ledColor} / 0.06)`,
              border: mode === "led" ? "none" : `2px solid hsl(${ledColor} / 0.2)`,
              boxShadow: mode === "led" ? "none" : `0 0 ${glowPx}px hsl(${ledColor} / 0.2)`,
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
                textShadow: `0 0 ${glowPx}px hsl(${ledColor} / 0.6), 0 0 ${glowPx * 2}px hsl(${ledColor} / 0.3)`,
                whiteSpace: "nowrap",
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
