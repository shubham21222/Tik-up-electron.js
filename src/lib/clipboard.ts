import { toast } from "sonner";

/**
 * Copy text to clipboard with iframe fallback.
 * Shows a toast on success.
 */
export function copyToClipboard(text: string, message = "Copied!") {
  navigator.clipboard.writeText(text).then(() => {
    toast.success(message);
  }).catch(() => {
    // Fallback for iframe environments
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.style.position = "fixed";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.select();
    document.execCommand("copy");
    document.body.removeChild(ta);
    toast.success(message);
  });
}
