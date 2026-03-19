export const isElectron = (): boolean =>
  typeof window !== "undefined" && !!(window as any).electronAPI?.isElectron;

export const isWindows = (): boolean =>
  isElectron() && (window as any).electronAPI?.platform === "win32";

declare global {
  interface Window {
    electronAPI?: {
      isElectron?: boolean;
      platform?: string;
      auth?: {
        startGoogleOAuth: () => Promise<{ ok?: boolean; error?: string }>;
        onOAuthCallback: (
          cb: (tokens: { access_token: string; refresh_token: string }) => void
        ) => void;
      };
      store?: {
        get: (key: string) => Promise<unknown>;
        set: (key: string, value: unknown) => Promise<{ ok: boolean }>;
      };
      window?: {
        minimize: () => void;
        maximize: () => void;
        close: () => void;
        isMaximized: () => Promise<boolean>;
        onMaximizeChange: (cb: (isMaximized: boolean) => void) => void;
      };
      keystroke?: {
        fire: (opts: { key: string; modifiers?: string[] }) => Promise<{ ok?: boolean; error?: string }>;
      };
      tray?: {
        setTooltip: (text: string) => Promise<void>;
      };
      updater?: {
        install: () => void;
        onUpdateDownloaded: (cb: () => void) => void;
      };
    };
  }
}
