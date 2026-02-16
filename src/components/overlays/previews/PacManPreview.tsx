import { motion } from "framer-motion";
import { useEffect, useRef } from "react";

/* Animated preview showing maze, pac-man, ghosts, effects, HUD */
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
    const oy = (280 - rows * cell) / 2 + 4;

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
      // Eyes
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

    // Effect cycle
    const effectCycle = 12; // seconds per full cycle
    const effects = [
      { name: "NORMAL", icon: "🎮", color: "160 100% 45%", dur: 3 },
      { name: "FROZEN", icon: "🧊", color: "200 100% 75%", dur: 2 },
      { name: "POWER", icon: "👻", color: "280 100% 65%", dur: 3 },
      { name: "REVERSED", icon: "🔄", color: "280 100% 65%", dur: 2 },
      { name: "SHIELD", icon: "🛡️", color: "200 100% 60%", dur: 2 },
    ];
    let effectAcc = 0;
    effects.forEach(e => { e.dur = e.dur; }); // normalize

    const getEffect = () => {
      const phase = (t / effectCycle * effects.length) % effects.length;
      return effects[Math.floor(phase)];
    };

    const loop = () => {
      animId = requestAnimationFrame(loop);
      t += 0.016;
      ctx.clearRect(0, 0, 420, 280);

      const eff = getEffect();
      const isFrozen = eff.name === "FROZEN";
      const isPowered = eff.name === "POWER";
      const isShielded = eff.name === "SHIELD";

      // Maze
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const px = ox + c * cell;
          const py = oy + r * cell;
          if (maze[r][c] === 1) {
            ctx.fillStyle = "hsl(160 40% 12%)";
            ctx.fillRect(px, py, cell, cell);
            // Neon edges
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

      // Pac-Man
      const pacPath = isFrozen ? 0 : Math.sin(t * 1.5) * 3;
      const pacX = ox + (4 + pacPath) * cell;
      const pacY = oy + 5.5 * cell;
      const mouth = isFrozen ? 0.15 : Math.abs(Math.sin(t * 5)) * 0.5;

      // Freeze effect
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

      const pacColor = isFrozen ? "200 100% 75%" : isPowered ? "280 100% 65%" : isShielded ? "200 100% 60%" : "160 100% 45%";
      ctx.fillStyle = `hsl(${pacColor})`;
      ctx.shadowColor = `hsl(${pacColor})`;
      ctx.shadowBlur = isPowered ? 15 : 8;
      ctx.beginPath();
      ctx.arc(pacX, pacY, cell * 0.4, mouth, Math.PI * 2 - mouth);
      ctx.lineTo(pacX, pacY);
      ctx.fill();
      ctx.shadowBlur = 0;

      // Eye
      ctx.fillStyle = "hsl(0 0% 10%)";
      ctx.beginPath();
      ctx.arc(pacX + cell * 0.12, pacY - cell * 0.15, cell * 0.05, 0, Math.PI * 2);
      ctx.fill();

      // Shield
      if (isShielded) {
        ctx.strokeStyle = `hsl(200 100% 65% / ${0.3 + Math.sin(t * 3) * 0.15})`;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(pacX, pacY, cell * 0.52, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Ghosts
      const g1x = ox + (10 + Math.cos(t * 0.8) * 2) * cell;
      const g1y = oy + 3 * cell;
      drawGhost(g1x, g1y, "0 85% 55%", isPowered);

      const g2x = ox + (13 + Math.sin(t * 0.6) * 1.5) * cell;
      const g2y = oy + 7 * cell;
      drawGhost(g2x, g2y, "180 90% 50%", isPowered);

      const g3x = ox + (8 + Math.cos(t * 0.9 + 1) * 1) * cell;
      const g3y = oy + 9 * cell;
      drawGhost(g3x, g3y, "300 80% 55%", isPowered);

      // HUD
      const hudGrad = ctx.createLinearGradient(0, 0, 0, 18);
      hudGrad.addColorStop(0, "rgba(0,0,0,0.6)");
      hudGrad.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = hudGrad;
      ctx.fillRect(0, 0, 420, 18);

      ctx.font = "bold 8px 'SF Mono', monospace, system-ui";
      ctx.fillStyle = "hsl(0 0% 60%)";
      ctx.fillText("SCORE", ox + 4, 8);
      ctx.fillStyle = "hsl(160 100% 55%)";
      ctx.font = "bold 9px 'SF Mono', monospace, system-ui";
      ctx.fillText("2,450", ox + 4, 16);

      // Lives
      ctx.fillStyle = "hsl(350 90% 55%)";
      for (let i = 0; i < 3; i++) {
        ctx.beginPath();
        const lx = 210 + i * 12;
        ctx.arc(lx - 2, 10, 3, Math.PI, 0);
        ctx.arc(lx + 2, 10, 3, Math.PI, 0);
        ctx.lineTo(lx, 16);
        ctx.closePath();
        ctx.fill();
      }

      // Active effect indicator
      ctx.textAlign = "right";
      ctx.font = "bold 8px system-ui";
      ctx.fillStyle = `hsl(${eff.color})`;
      if (eff.name !== "NORMAL") {
        ctx.fillText(`${eff.icon} ${eff.name}`, 420 - ox - 4, 12);
      }
      ctx.textAlign = "start";

      // Vote bar
      const barY = oy + rows * cell + 5;
      const barH = 5;
      const barW = cols * cell;
      ctx.fillStyle = "hsl(200 80% 55% / 0.4)";
      ctx.fillRect(ox, barY, barW * 0.35, barH);
      ctx.fillStyle = "hsl(160 80% 50% / 0.4)";
      ctx.fillRect(ox + barW * 0.35, barY, barW * 0.25, barH);
      ctx.fillStyle = "hsl(45 90% 55% / 0.4)";
      ctx.fillRect(ox + barW * 0.6, barY, barW * 0.15, barH);
      ctx.fillStyle = "hsl(350 80% 55% / 0.4)";
      ctx.fillRect(ox + barW * 0.75, barY, barW * 0.25, barH);

      ctx.font = "bold 6px system-ui";
      ctx.fillStyle = "white";
      ctx.fillText("⬅35%", ox + 3, barY + 4);
      ctx.fillText("⬆25%", ox + barW * 0.37, barY + 4);
      ctx.fillText("⬇15%", ox + barW * 0.62, barY + 4);
      ctx.fillText("➡25%", ox + barW * 0.77, barY + 4);
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
        className="absolute bottom-6 left-1/2 -translate-x-1/2 px-3 py-1.5 rounded-lg text-[10px] font-bold"
        style={{ background: "hsl(200 100% 75% / 0.1)", border: "1px solid hsl(200 100% 75% / 0.25)", color: "hsl(200 100% 80%)" }}
      >
        🧊 @viewer42 froze Pac-Man!
      </motion.div>
    </div>
  );
};

export default PacManPreview;
