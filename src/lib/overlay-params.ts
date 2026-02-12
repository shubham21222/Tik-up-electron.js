/**
 * Parse URL query params and merge them into overlay settings.
 * Supports: theme, speed, glow, color_1, color_2, thickness, radius, sound, text_color
 */
export function applyUrlOverrides(settings: Record<string, any>): Record<string, any> {
  if (typeof window === "undefined") return settings;

  const params = new URLSearchParams(window.location.search);
  const overrides: Record<string, any> = {};

  // Map URL params to settings keys
  const mapping: Record<string, { key: string; type: "number" | "string" | "boolean" }> = {
    theme: { key: "frame_style", type: "string" },
    style: { key: "frame_style", type: "string" },
    speed: { key: "animation_speed", type: "number" },
    glow: { key: "glow_intensity", type: "number" },
    color1: { key: "color_1", type: "string" },
    color2: { key: "color_2", type: "string" },
    thickness: { key: "frame_thickness", type: "number" },
    border_thickness: { key: "frame_thickness", type: "number" },
    radius: { key: "corner_radius", type: "number" },
    sound: { key: "sound_enabled", type: "boolean" },
    text_color: { key: "text_color", type: "string" },
    bg_color: { key: "bg_color", type: "string" },
    font_size: { key: "font_size", type: "number" },
    animation: { key: "animation", type: "string" },
    position: { key: "position", type: "string" },
    duration: { key: "duration", type: "number" },
    volume: { key: "volume", type: "number" },
    size: { key: "frame_size", type: "number" },
    fps: { key: "fps_limit", type: "number" },
  };

  params.forEach((value, key) => {
    const m = mapping[key];
    if (m) {
      if (m.type === "number") {
        const n = parseFloat(value);
        if (!isNaN(n)) overrides[m.key] = n;
      } else if (m.type === "boolean") {
        overrides[m.key] = value === "true" || value === "1";
      } else {
        // Decode URL-safe HSL: "180_100_50" → "180 100% 50%"
        if (value.match(/^\d+_\d+_\d+$/)) {
          const [h, s, l] = value.split("_");
          overrides[m.key] = `${h} ${s}% ${l}%`;
        } else {
          overrides[m.key] = value;
        }
      }
    }
  });

  return { ...settings, ...overrides };
}
