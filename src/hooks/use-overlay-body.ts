import { useEffect } from "react";

/**
 * Sets html + body background to transparent, removes margins/padding,
 * hides scrollbars, and disables pointer events on idle text.
 * Required for OBS / TikTok Live Studio browser source overlays.
 */
const useOverlayBody = () => {
  useEffect(() => {
    const html = document.documentElement;
    const body = document.body;

    // Save originals
    const origHtmlBg = html.style.background;
    const origBodyBg = body.style.background;
    const origBodyOverflow = body.style.overflow;
    const origBodyMargin = body.style.margin;
    const origBodyPadding = body.style.padding;

    // Apply overlay-safe styles
    html.style.background = "transparent";
    body.style.background = "transparent";
    body.style.overflow = "hidden";
    body.style.margin = "0";
    body.style.padding = "0";

    // Hide scrollbar for all browsers
    const style = document.createElement("style");
    style.id = "overlay-body-reset";
    style.textContent = `
      html, body { background: transparent !important; overflow: hidden !important; }
      ::-webkit-scrollbar { display: none !important; }
      * { scrollbar-width: none !important; }
    `;
    document.head.appendChild(style);

    return () => {
      html.style.background = origHtmlBg;
      body.style.background = origBodyBg;
      body.style.overflow = origBodyOverflow;
      body.style.margin = origBodyMargin;
      body.style.padding = origBodyPadding;
      style.remove();
    };
  }, []);
};

export default useOverlayBody;
