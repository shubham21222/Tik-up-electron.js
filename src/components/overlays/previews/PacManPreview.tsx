import { useEffect, useRef } from "react";
import { motion } from "framer-motion";

/* Animated preview: AI Pac-Man escaping ghosts with escape chance HUD */
const PacManPreview = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const dpr = 2;
    canvas.width = 420 * dpr;
    canvas.height = 280 * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    let t = 0;
    let animId: number;

    const maze = [
      [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
      [1,2,2,2,2,1,2,2,2,2,2,1,2,2,2,2,1],
      [1,2,1,1,2,1,2,1,1,2,1,1,2,1,1,2,1],
      [1,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,1],
      [1,2,1,2,1,1,1,2,1,1,1,2,1,1,2,1,1],
      [1,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,1],
      [1,2,1,1,2,1,0,0,0,0,1,2,1,1,2,1,1],
      [1,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,1],
      [1,2,1,1,2,1,1,2,1,1,1,2,1,1,2,1,1],
      [1,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,1],
      [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
    ];
    const cols = maze[0].length;
    const rows = maze.length;
    const cell = 14;
    const ox = (420 - cols * cell) / 2;
    const oy = (280 - rows * cell) / 2 + 12;

    const drawGhost = (x: number, y: number, color: string, scared: boolean) => {
      const gr = cell * 0.38;
      const col = scared ? "230 80% 60%" : color;
      ctx.fillStyle = `hsl(${col})`;
      ctx.shadowColor = `hsl(${col})`;
      ctx.shadowBlur = scared ? 4 : 8;
      ctx.beginPath();
      ctx.arc(x, y - gr * 0.15, gr, Math.PI, 0);
      ctx.lineTo(x + gr, y + gr * 0.5);
      for (let w = 0; w < 3; w++) {
        const wx = x + gr - (w + 1) * (gr * 2 / 3);
        ctx.quadraticCurveTo(wx + gr / 3, y + gr * (0.2 + Math.sin(t * 4 + w) * 0.12), wx, y + gr * 0.5);
      }
      ctx.closePath();
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.fillStyle = "white";
      ctx.beginPath();
      ctx.arc(x - gr * 0.2, y - gr * 0.2, gr * 0.14, 0, Math.PI * 2);
      ctx.arc(x + gr * 0.2, y - gr * 0.2, gr * 0.14, 0, Math.PI * 2);
      ctx.fill();
      if (!scared) {
        ctx.fillStyle = "hsl(230 90% 15%)";
        ctx.beginPath();
        ctx.arc(x - gr * 0.15, y - gr * 0.2, gr * 0.07, 0, Math.PI * 2);
        ctx.arc(x + gr * 0.25, y - gr * 0.2, gr * 0.07, 0, Math.PI * 2);
        ctx.fill();
      }
    };

    // Simulate escape chance dropping
    const getEscapeChance = (): number => {
      const phase = (t % 10) / 10;
      if (phase < 0.3) return 95;
      if (phase < 0.5) return 75;
      if (phase < 0.7) return 45;
      if (phase < 0.85) return 35;
      return 95; // reset
    };

    const getEffectLabel = (): { icon: string; label: string; color: string } | null => {
      const phase = (t % 10) / 10;
      if (phase < 0.3) return null;
      if (phase < 0.5) return { icon: "🧊", label: "FROZEN -20%", color: "200 100% 75%" };
      if (phase < 0.7) return { icon: "👻", label: "SWARM -30%", color: "0 90% 55%" };
      if (phase < 0.85) return { icon: "🤪", label: "CONFUSED -25%", color: "45 100% 55%" };
      return null;
    };

    const loop = () => {
      animId = requestAnimationFrame(loop);
      t += 0.016;
      ctx.clearRect(0, 0, 420, 280);

      const escChance = getEscapeChance();
      const eff = getEffectLabel();
      const isFrozen = eff?.icon === "🧊";

      // Maze
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const px = ox + c * cell;
          const py = oy + r * cell;
          if (maze[r][c] === 1) {
            ctx.fillStyle = "hsl(160 40% 12%)";
            ctx.fillRect(px, py, cell, cell);
            const top = r > 0 && maze[r-1][c] !== 1;
            const bot = r < rows-1 && maze[r+1][c] !== 1;
            const lft = c > 0 && maze[r][c-1] !== 1;
            const rgt = c < cols-1 && maze[r][c+1] !== 1;
            ctx.strokeStyle = "hsl(160 100% 35% / 0.5)";
            ctx.lineWidth = 1;
            ctx.beginPath();
            if (top) { ctx.moveTo(px, py + 0.5); ctx.lineTo(px + cell, py + 0.5); }
            if (bot) { ctx.moveTo(px, py + cell - 0.5); ctx.lineTo(px + cell, py + cell - 0.5); }
            if (lft) { ctx.moveTo(px + 0.5, py); ctx.lineTo(px + 0.5, py + cell); }
            if (rgt) { ctx.moveTo(px + cell - 0.5, py); ctx.lineTo(px + cell - 0.5, py + cell); }
            ctx.stroke();
          } else if (maze[r][c] === 2) {
            ctx.fillStyle = "hsl(160 100% 55%)";
            ctx.beginPath();
            ctx.arc(px + cell / 2, py + cell / 2, 1.3, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      }

      // Pac-Man (AI movement)
      const pacPath = isFrozen ? 0 : Math.sin(t * 1.5) * 3;
      const pacX = ox + (4 + pacPath) * cell;
      const pacY = oy + 5.5 * cell;
      const mouth = isFrozen ? 0.15 : Math.abs(Math.sin(t * 5)) * 0.5;

      if (isFrozen) {
        ctx.strokeStyle = "hsl(200 100% 85% / 0.5)";
        ctx.lineWidth = 2;
        ctx.beginPath();
        for (let i = 0; i < 6; i++) {
          const a = (Math.PI * 2 / 6) * i;
          const r = cell * 0.55 + Math.sin(t * 2 + i) * 1.5;
          const x = pacX + Math.cos(a) * r;
          const y = pacY + Math.sin(a) * r;
          if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
        }
        ctx.closePath();
        ctx.stroke();
      }

      const pacColor = isFrozen ? "200 100% 75%" : "160 100% 45%";
      ctx.fillStyle = `hsl(${pacColor})`;
      ctx.shadowColor = `hsl(${pacColor})`;
      ctx.shadowBlur = 8;
      ctx.beginPath();
      ctx.arc(pacX, pacY, cell * 0.4, mouth, Math.PI * 2 - mouth);
      ctx.lineTo(pacX, pacY);
      ctx.fill();
      ctx.shadowBlur = 0;

      ctx.fillStyle = "hsl(0 0% 10%)";
      ctx.beginPath();
      ctx.arc(pacX + cell * 0.12, pacY - cell * 0.15, cell * 0.05, 0, Math.PI * 2);
      ctx.fill();

      // "AI" label above pac-man
      ctx.font = "bold 6px system-ui";
      ctx.fillStyle = "hsl(160 100% 55% / 0.7)";
      ctx.textAlign = "center";
      ctx.fillText("🤖 AI", pacX, pacY - cell * 0.6);
      ctx.textAlign = "start";

      // Ghosts
      drawGhost(ox + (10 + Math.cos(t * 0.8) * 2) * cell, oy + 3 * cell, "0 85% 55%", false);
      drawGhost(ox + (13 + Math.sin(t * 0.6) * 1.5) * cell, oy + 7 * cell, "180 90% 50%", false);
      drawGhost(ox + (8 + Math.cos(t * 0.9 + 1) * 1) * cell, oy + 9 * cell, "300 80% 55%", false);

      // HUD top bar
      const hudGrad = ctx.createLinearGradient(0, 0, 0, 22);
      hudGrad.addColorStop(0, "rgba(0,0,0,0.7)");
      hudGrad.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = hudGrad;
      ctx.fillRect(0, 0, 420, 22);

      ctx.font = "bold 7px system-ui";
      ctx.fillStyle = "hsl(0 0% 55%)";
      ctx.fillText("SCORE", ox + 4, 7);
      ctx.fillStyle = "hsl(160 100% 55%)";
      ctx.font = "bold 9px 'SF Mono', monospace, system-ui";
      ctx.fillText("2,450", ox + 4, 16);

      // Round
      ctx.fillStyle = "hsl(0 0% 50%)";
      ctx.font = "bold 7px system-ui";
      ctx.fillText("ROUND 3", ox + 55, 7);

      // Lives
      ctx.fillStyle = "hsl(350 90% 55%)";
      for (let i = 0; i < 3; i++) {
        ctx.beginPath();
        const lx = 200 + i * 12;
        ctx.arc(lx - 2, 10, 3, Math.PI, 0);
        ctx.arc(lx + 2, 10, 3, Math.PI, 0);
        ctx.lineTo(lx, 16);
        ctx.closePath();
        ctx.fill();
      }

      // ═ ESCAPE CHANCE BAR (key visual) ═
      const barW = 90;
      const barX = 420 - ox - barW - 4;
      const barY = 3;
      const barH = 8;

      ctx.fillStyle = "hsl(0 0% 50%)";
      ctx.font = "bold 6px system-ui";
      ctx.textAlign = "right";
      ctx.fillText("ESCAPE CHANCE", 420 - ox - 4, barY);
      ctx.textAlign = "start";

      ctx.fillStyle = "hsl(0 0% 10% / 0.5)";
      ctx.fillRect(barX, barY + 2, barW, barH);

      const pct = escChance / 100;
      const hue = pct > 0.5 ? 120 + (pct - 0.5) * 80 : pct * 240;
      ctx.fillStyle = `hsl(${hue} 80% 50%)`;
      ctx.shadowColor = `hsl(${hue} 80% 50%)`;
      ctx.shadowBlur = 6;
      ctx.fillRect(barX, barY + 2, barW * pct, barH);
      ctx.shadowBlur = 0;

      ctx.fillStyle = "white";
      ctx.font = "bold 7px 'SF Mono', monospace, system-ui";
      ctx.textAlign = "right";
      ctx.fillText(`${escChance}%`, 420 - ox - 4, barY + barH + 1);
      ctx.textAlign = "start";

      // Active effect
      if (eff) {
        ctx.textAlign = "right";
        ctx.font = "bold 7px system-ui";
        ctx.fillStyle = `hsl(${eff.color})`;
        ctx.fillText(`${eff.icon} ${eff.label}`, 420 - ox - 4, barY + barH + 10);
        ctx.textAlign = "start";
      }
    };

    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, []);

  return (
    <div className="relative w-full h-full flex items-center justify-center overflow-hidden" style={{ background: "hsl(0 0% 3%)" }}>
      <canvas ref={canvasRef} className="block" style={{ width: 420, height: 280 }} />
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: [0, 1, 1, 0], y: [10, 0, 0, -10] }}
        transition={{ duration: 3, repeat: Infinity, repeatDelay: 3 }}
        className="absolute bottom-4 left-1/2 -translate-x-1/2 px-3 py-1.5 rounded-lg text-[10px] font-bold"
        style={{ background: "hsl(0 90% 55% / 0.15)", border: "1px solid hsl(0 90% 55% / 0.3)", color: "hsl(0 90% 55%)" }}
      >
        👻 @viewer42 spawned ghost swarm! (-30%)
      </motion.div>
    </div>
  );
};

export default PacManPreview;
