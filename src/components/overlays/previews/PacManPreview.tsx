import { motion } from "framer-motion";
import { useEffect, useRef } from "react";

const PacManPreview = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const dpr = 2;
    canvas.width = 400 * dpr;
    canvas.height = 260 * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    let t = 0;
    let animId: number;

    // Mini maze
    const maze = [
      [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
      [1,2,2,2,2,1,2,2,2,2,2,2,2,2,2,1],
      [1,2,1,1,2,1,2,1,1,2,1,1,1,1,2,1],
      [1,2,2,2,2,2,2,2,2,2,2,2,2,2,2,1],
      [1,2,1,2,1,1,1,2,1,1,1,2,1,2,1,1],
      [1,2,2,2,2,2,2,2,2,2,2,2,2,2,2,1],
      [1,2,1,1,2,1,0,0,0,1,2,1,1,2,1,1],
      [1,2,2,2,2,2,2,2,2,2,2,2,2,2,2,1],
      [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
    ];
    const cols = maze[0].length;
    const rows = maze.length;
    const cell = 16;
    const ox = (400 - cols * cell) / 2;
    const oy = (260 - rows * cell) / 2;

    const loop = () => {
      animId = requestAnimationFrame(loop);
      t += 0.02;
      ctx.clearRect(0, 0, 400, 260);

      // Draw maze
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const px = ox + c * cell;
          const py = oy + r * cell;
          if (maze[r][c] === 1) {
            ctx.fillStyle = "hsl(160 60% 18%)";
            ctx.fillRect(px + 1, py + 1, cell - 2, cell - 2);
            ctx.strokeStyle = "hsl(160 80% 30%)";
            ctx.lineWidth = 0.5;
            ctx.strokeRect(px + 1, py + 1, cell - 2, cell - 2);
          } else if (maze[r][c] === 2) {
            ctx.fillStyle = "hsl(160 100% 55%)";
            ctx.beginPath();
            ctx.arc(px + cell / 2, py + cell / 2, 1.5, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      }

      // Pac-Man moving right
      const pacX = ox + (3 + Math.sin(t) * 2 + 2) * cell;
      const pacY = oy + 3.5 * cell;
      const mouth = Math.abs(Math.sin(t * 4)) * 0.4;
      ctx.fillStyle = "hsl(160 100% 45%)";
      ctx.shadowColor = "hsl(160 100% 45%)";
      ctx.shadowBlur = 8;
      ctx.beginPath();
      ctx.arc(pacX, pacY, cell * 0.38, mouth, Math.PI * 2 - mouth);
      ctx.lineTo(pacX, pacY);
      ctx.fill();
      ctx.shadowBlur = 0;

      // Ghost
      const gx = ox + (10 + Math.cos(t * 0.7) * 1.5) * cell;
      const gy = oy + 5 * cell;
      const gr = cell * 0.35;
      ctx.fillStyle = "hsl(0 85% 55%)";
      ctx.shadowColor = "hsl(0 85% 55%)";
      ctx.shadowBlur = 8;
      ctx.beginPath();
      ctx.arc(gx, gy - gr * 0.2, gr, Math.PI, 0);
      ctx.lineTo(gx + gr, gy + gr * 0.5);
      for (let w = 0; w < 3; w++) {
        const wx = gx + gr - (w + 1) * (gr * 2 / 3);
        ctx.quadraticCurveTo(wx + gr / 3, gy + gr * (0.2 + Math.sin(t * 3 + w) * 0.15), wx, gy + gr * 0.5);
      }
      ctx.closePath();
      ctx.fill();
      ctx.shadowBlur = 0;
      // Eyes
      ctx.fillStyle = "white";
      ctx.beginPath();
      ctx.arc(gx - gr * 0.2, gy - gr * 0.3, gr * 0.18, 0, Math.PI * 2);
      ctx.arc(gx + gr * 0.2, gy - gr * 0.3, gr * 0.18, 0, Math.PI * 2);
      ctx.fill();

      // Second ghost
      const g2x = ox + (12 + Math.sin(t * 0.5) * 1) * cell;
      const g2y = oy + 3 * cell;
      ctx.fillStyle = "hsl(180 90% 50%)";
      ctx.shadowColor = "hsl(180 90% 50%)";
      ctx.shadowBlur = 6;
      ctx.beginPath();
      ctx.arc(g2x, g2y - gr * 0.2, gr, Math.PI, 0);
      ctx.lineTo(g2x + gr, g2y + gr * 0.5);
      for (let w = 0; w < 3; w++) {
        const wx = g2x + gr - (w + 1) * (gr * 2 / 3);
        ctx.quadraticCurveTo(wx + gr / 3, g2y + gr * (0.2 + Math.sin(t * 3 + w + 1) * 0.15), wx, g2y + gr * 0.5);
      }
      ctx.closePath();
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.fillStyle = "white";
      ctx.beginPath();
      ctx.arc(g2x - gr * 0.2, g2y - gr * 0.3, gr * 0.18, 0, Math.PI * 2);
      ctx.arc(g2x + gr * 0.2, g2y - gr * 0.3, gr * 0.18, 0, Math.PI * 2);
      ctx.fill();

      // HUD
      ctx.fillStyle = "rgba(0,0,0,0.5)";
      ctx.fillRect(ox, oy - 18, cols * cell, 16);
      ctx.font = "bold 9px system-ui";
      ctx.fillStyle = "white";
      ctx.fillText("Score: 1280", ox + 4, oy - 8);
      ctx.fillText("❤️❤️❤️", ox + cols * cell - 40, oy - 8);

      // Vote bar
      ctx.fillStyle = "hsl(200 80% 55% / 0.4)";
      ctx.fillRect(ox, oy + rows * cell + 4, cols * cell * 0.3, 6);
      ctx.fillStyle = "hsl(160 80% 50% / 0.4)";
      ctx.fillRect(ox + cols * cell * 0.3, oy + rows * cell + 4, cols * cell * 0.25, 6);
      ctx.fillStyle = "hsl(45 90% 55% / 0.4)";
      ctx.fillRect(ox + cols * cell * 0.55, oy + rows * cell + 4, cols * cell * 0.2, 6);
      ctx.fillStyle = "hsl(350 80% 55% / 0.4)";
      ctx.fillRect(ox + cols * cell * 0.75, oy + rows * cell + 4, cols * cell * 0.25, 6);

      // Labels
      ctx.font = "bold 7px system-ui";
      ctx.fillStyle = "white";
      ctx.fillText("⬅30%", ox + 4, oy + rows * cell + 11);
      ctx.fillText("⬆25%", ox + cols * cell * 0.32, oy + rows * cell + 11);
      ctx.fillText("⬇20%", ox + cols * cell * 0.57, oy + rows * cell + 11);
      ctx.fillText("➡25%", ox + cols * cell * 0.77, oy + rows * cell + 11);
    };

    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, []);

  return (
    <div className="relative w-full h-full flex items-center justify-center overflow-hidden" style={{ background: "hsl(0 0% 3%)" }}>
      <canvas ref={canvasRef} className="block" style={{ width: 400, height: 260 }} />
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: [0, 1, 1, 0], y: [10, 0, 0, -10] }}
        transition={{ duration: 3, repeat: Infinity, repeatDelay: 2 }}
        className="absolute bottom-10 left-1/2 -translate-x-1/2 px-3 py-1.5 rounded-lg text-[10px] font-bold"
        style={{ background: "hsl(160 100% 45% / 0.15)", border: "1px solid hsl(160 100% 45% / 0.3)", color: "hsl(160 100% 55%)" }}
      >
        🛡️ @viewer99 activated shield!
      </motion.div>
    </div>
  );
};

export default PacManPreview;
