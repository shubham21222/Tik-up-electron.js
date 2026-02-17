import { useTheme } from "next-themes";
import { Sun, Moon } from "lucide-react";

const ThemeToggle = () => {
  const { theme, setTheme } = useTheme();

  return (
    <button
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className="p-2 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
      title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
    >
      {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
    </button>
  );
};

export default ThemeToggle;
