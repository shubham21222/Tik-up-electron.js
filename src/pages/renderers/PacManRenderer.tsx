import { useEffect, useState, useRef, useCallback } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import useOverlayBody from "@/hooks/use-overlay-body";

/* ═══════════════════════════════════════════════════════════
   PAC-MAN LIVE — Interactive overlay game engine
   Chat → movement votes, Gifts → power-ups
   Canvas-based 60 FPS renderer
   ═══════════════════════════════════════════════════════════ */

// ── Types ──────────────────────────────────────────────────
interface Vec2 { x: number; y: number; }
type Dir = "left" | "right" | "up" | "down";
type PowerUp = "speed" | "shield" | "power" | "slow_ghosts";
interface Ghost { pos: Vec2; dir: Dir; color: string; scared: boolean; speed: number; }
interface Particle { x: number; y: number; vx: number; vy: number; life: number; color: string; size: number; }
interface Alert { text: string; color: string; time: number; }
interface VoteState { left: number; right: number; up: number; down: number; }

// ── Maze (21×21) ───────────────────────────────────────────
// 0=path, 1=wall, 2=pellet, 3=power-pellet
const MAZE_TEMPLATE: number[][] = [
  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
  [1,2,2,2,2,2,2,2,2,2,1,2,2,2,2,2,2,2,2,2,1],
  [1,2,1,1,2,1,1,1,2,1,1,1,2,1,1,1,2,1,1,2,1],
  [1,3,1,1,2,1,1,1,2,1,1,1,2,1,1,1,2,1,1,3,1],
  [1,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,1],
  [1,2,1,1,2,1,2,1,1,1,1,1,1,1,2,1,2,1,1,2,1],
  [1,2,2,2,2,1,2,2,2,2,1,2,2,2,2,1,2,2,2,2,1],
  [1,1,1,1,2,1,1,1,0,1,1,1,0,1,1,1,2,1,1,1,1],
  [1,1,1,1,2,1,0,0,0,0,0,0,0,0,0,1,2,1,1,1,1],
  [1,1,1,1,2,1,0,1,1,0,0,0,1,1,0,1,2,1,1,1,1],
  [0,0,0,0,2,0,0,1,0,0,0,0,0,1,0,0,2,0,0,0,0],
  [1,1,1,1,2,1,0,1,1,1,1,1,1,1,0,1,2,1,1,1,1],
  [1,1,1,1,2,1,0,0,0,0,0,0,0,0,0,1,2,1,1,1,1],
  [1,1,1,1,2,1,0,1,1,1,1,1,1,1,0,1,2,1,1,1,1],
  [1,2,2,2,2,2,2,2,2,2,1,2,2,2,2,2,2,2,2,2,1],
  [1,2,1,1,2,1,1,1,2,1,1,1,2,1,1,1,2,1,1,2,1],
  [1,3,2,1,2,2,2,2,2,2,0,2,2,2,2,2,2,1,2,3,1],
  [1,1,2,1,2,1,2,1,1,1,1,1,1,1,2,1,2,1,2,1,1],
  [1,2,2,2,2,1,2,2,2,2,1,2,2,2,2,1,2,2,2,2,1],
  [1,2,1,1,1,1,1,1,2,1,1,1,2,1,1,1,1,1,1,2,1],
  [1,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,1],
  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
];

const COLS = MAZE_TEMPLATE[0].length;
const ROWS = MAZE_TEMPLATE.length;

const GHOST_COLORS = [
  "0 85% 55%",    // red
  "300 80% 55%",  // pink
  "180 90% 50%",  // cyan
  "30 95% 55%",   // orange
];

const THEMES: Record<string, { wall: string; bg: string; pellet: string; pacman: string; glow: string }> = {
  classic:   { wall: "230 70% 30%", bg: "230 30% 8%", pellet: "50 100% 70%", pacman: "50 100% 55%", glow: "50 100% 55%" },
  cyberpunk: { wall: "280 80% 35%", bg: "260 40% 5%", pellet: "160 100% 55%", pacman: "160 100% 50%", glow: "160 100% 50%" },
  tikup:     { wall: "160 60% 20%", bg: "0 0% 3%", pellet: "160 100% 55%", pacman: "160 100% 45%", glow: "160 100% 45%" },
};

// ── Game engine ────────────────────────────────────────────
const PacManRenderer = () => {
  useOverlayBody();
  const { publicToken } = useParams();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Settings
  const [settings, setSettings] = useState<any>({
    theme: "tikup",
    vote_interval: 1.5,
    ghost_count: 4,
    speed_boost_duration: 2,
    shield_duration: 5,
    power_duration: 7,
    slow_duration: 4,
    transparent_bg: true,
    custom_css: "",
  });

  // Game state refs (using refs for 60fps game loop)
  const gameRef = useRef({
    maze: MAZE_TEMPLATE.map(r => [...r]),
    pacman: { x: 10, y: 16 } as Vec2,
    pacDir: "right" as Dir,
    pacMouth: 0,
    ghosts: [] as Ghost[],
    score: 0,
    lives: 3,
    startTime: Date.now(),
    particles: [] as Particle[],
    alerts: [] as Alert[],
    votes: { left: 0, right: 0, up: 0, down: 0 } as VoteState,
    lastVoteProcess: Date.now(),
    powerUp: null as PowerUp | null,
    powerUpEnd: 0,
    gameOver: false,
    connected: false,
    cellSize: 0,
    userCooldowns: {} as Record<string, number>,
  });

  // Initialize ghosts
  const initGame = useCallback(() => {
    const g = gameRef.current;
    g.maze = MAZE_TEMPLATE.map(r => [...r]);
    g.pacman = { x: 10, y: 16 };
    g.pacDir = "right";
    g.score = 0;
    g.lives = 3;
    g.startTime = Date.now();
    g.particles = [];
    g.alerts = [];
    g.powerUp = null;
    g.gameOver = false;
    g.ghosts = [];
    const ghostCount = Math.min(settings.ghost_count || 4, 4);
    const spawns: Vec2[] = [{ x: 9, y: 10 }, { x: 10, y: 10 }, { x: 11, y: 10 }, { x: 10, y: 9 }];
    for (let i = 0; i < ghostCount; i++) {
      g.ghosts.push({
        pos: { ...spawns[i % spawns.length] },
        dir: ["left", "right", "up", "down"][i % 4] as Dir,
        color: GHOST_COLORS[i % GHOST_COLORS.length],
        scared: false,
        speed: 0.04 + i * 0.005,
      });
    }
  }, [settings.ghost_count]);

  // Realtime connection
  useEffect(() => {
    if (!publicToken) return;
    const g = gameRef.current;

    // Load settings from DB
    supabase.from("overlay_widgets" as any).select("settings").eq("public_token", publicToken).maybeSingle()
      .then(({ data }) => { if (data) setSettings((prev: any) => ({ ...prev, ...(data as any).settings })); });

    // Subscribe to events
    const ch = supabase.channel(`pacman-${publicToken}`)
      .on("broadcast", { event: "chat" }, (msg) => {
        const p = msg.payload;
        if (!p) return;
        const text = (p.comment || p.text || "").toLowerCase().trim();
        const username = p.username || "anon";

        // Cooldown check (2s per user)
        const now = Date.now();
        if (g.userCooldowns[username] && now - g.userCooldowns[username] < 2000) return;
        g.userCooldowns[username] = now;

        if (text === "left" || text === "⬅️" || text === "l") g.votes.left++;
        else if (text === "right" || text === "➡️" || text === "r") g.votes.right++;
        else if (text === "up" || text === "⬆️" || text === "u") g.votes.up++;
        else if (text === "down" || text === "⬇️" || text === "d") g.votes.down++;

        // Moderator commands
        if (text === "!resetgame") { initGame(); }
        if (text === "!freeze") { g.ghosts.forEach(gh => { gh.speed = 0; }); setTimeout(() => { g.ghosts.forEach(gh => { gh.speed = 0.04; }); }, 5000); }
      })
      .on("broadcast", { event: "gift" }, (msg) => {
        const p = msg.payload;
        if (!p) return;
        const coins = p.coins || p.diamond_count || 0;
        const username = p.username || "Gifter";

        if (coins <= 5) {
          // Small gift → speed boost
          g.powerUp = "speed";
          g.powerUpEnd = Date.now() + (settings.speed_boost_duration || 2) * 1000;
          g.alerts.push({ text: `⚡ ${username} gave speed boost!`, color: "45 100% 55%", time: Date.now() });
        } else if (coins <= 50) {
          // Medium → shield
          g.powerUp = "shield";
          g.powerUpEnd = Date.now() + (settings.shield_duration || 5) * 1000;
          g.alerts.push({ text: `🛡️ ${username} activated shield!`, color: "200 100% 55%", time: Date.now() });
        } else if (coins <= 500) {
          // Big → power pellet
          g.powerUp = "power";
          g.powerUpEnd = Date.now() + (settings.power_duration || 7) * 1000;
          g.ghosts.forEach(gh => { gh.scared = true; });
          g.alerts.push({ text: `👻 ${username} powered up Pac-Man!`, color: "280 100% 65%", time: Date.now() });
        } else {
          // Mega → slow ghosts + teleport
          g.powerUp = "slow_ghosts";
          g.powerUpEnd = Date.now() + (settings.slow_duration || 4) * 1000;
          g.ghosts.forEach(gh => { gh.speed *= 0.3; });
          // Teleport pacman to safe spot
          g.pacman = { x: 10, y: 16 };
          g.alerts.push({ text: `🌟 ${username} saved Pac-Man!`, color: "160 100% 45%", time: Date.now() });
        }

        // Spawn particles
        for (let i = 0; i < 12; i++) {
          g.particles.push({
            x: g.pacman.x * g.cellSize + g.cellSize / 2,
            y: g.pacman.y * g.cellSize + g.cellSize / 2,
            vx: (Math.random() - 0.5) * 4,
            vy: (Math.random() - 0.5) * 4,
            life: 1,
            color: coins > 500 ? "160 100% 55%" : coins > 50 ? "280 100% 65%" : "45 100% 55%",
            size: 3 + Math.random() * 3,
          });
        }
      })
      .on("broadcast", { event: "test_alert" }, () => {
        // Simulate a gift for testing
        g.powerUp = "power";
        g.powerUpEnd = Date.now() + 5000;
        g.ghosts.forEach(gh => { gh.scared = true; });
        g.alerts.push({ text: "🧪 Test power-up!", color: "160 100% 45%", time: Date.now() });
      })
      .subscribe(s => { g.connected = s === "SUBSCRIBED"; });

    // Settings updates
    const db = supabase.channel(`pacman-db-${publicToken}`)
      .on("postgres_changes" as any, { event: "UPDATE", schema: "public", table: "overlay_widgets", filter: `public_token=eq.${publicToken}` },
        (p: any) => { if (p.new?.settings) setSettings((prev: any) => ({ ...prev, ...p.new.settings })); })
      .subscribe();

    return () => { supabase.removeChannel(ch); supabase.removeChannel(db); };
  }, [publicToken, initGame, settings.speed_boost_duration, settings.shield_duration, settings.power_duration, settings.slow_duration]);

  // Init game on mount
  useEffect(() => { initGame(); }, [initGame]);

  // ── Canvas game loop ─────────────────────────────────────
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    let animId: number;
    let lastFrame = 0;
    const FPS = 60;
    const frameDuration = 1000 / FPS;

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      const maxW = window.innerWidth;
      const maxH = window.innerHeight;
      const cellW = Math.floor(maxW / COLS);
      const cellH = Math.floor(maxH / ROWS);
      const cell = Math.min(cellW, cellH);
      gameRef.current.cellSize = cell;
      canvas.width = COLS * cell * dpr;
      canvas.height = ROWS * cell * dpr;
      canvas.style.width = `${COLS * cell}px`;
      canvas.style.height = `${ROWS * cell}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener("resize", resize);

    const canMove = (x: number, y: number): boolean => {
      if (x < 0 || x >= COLS || y < 0 || y >= ROWS) return y === 10; // tunnel
      return gameRef.current.maze[y][x] !== 1;
    };

    const dirVec: Record<Dir, Vec2> = { left: { x: -1, y: 0 }, right: { x: 1, y: 0 }, up: { x: 0, y: -1 }, down: { x: 0, y: 1 } };

    const loop = (time: number) => {
      animId = requestAnimationFrame(loop);
      if (time - lastFrame < frameDuration) return;
      lastFrame = time;

      const g = gameRef.current;
      const cell = g.cellSize;
      if (cell === 0) return;
      const theme = THEMES[settings.theme] || THEMES.tikup;
      const now = Date.now();

      // ── Process votes ──────────────
      const voteInterval = (settings.vote_interval || 1.5) * 1000;
      if (now - g.lastVoteProcess > voteInterval && !g.gameOver) {
        const { left, right, up, down } = g.votes;
        const max = Math.max(left, right, up, down);
        if (max > 0) {
          let newDir: Dir = g.pacDir;
          if (left === max) newDir = "left";
          else if (right === max) newDir = "right";
          else if (up === max) newDir = "up";
          else if (down === max) newDir = "down";

          const next = { x: g.pacman.x + dirVec[newDir].x, y: g.pacman.y + dirVec[newDir].y };
          if (canMove(next.x, next.y)) g.pacDir = newDir;
        }
        g.votes = { left: 0, right: 0, up: 0, down: 0 };
        g.lastVoteProcess = now;
      }

      // ── Move Pac-Man ───────────────
      if (!g.gameOver) {
        const speed = g.powerUp === "speed" && now < g.powerUpEnd ? 2 : 1;
        for (let step = 0; step < speed; step++) {
          const next = { x: g.pacman.x + dirVec[g.pacDir].x, y: g.pacman.y + dirVec[g.pacDir].y };
          // Tunnel wrap
          if (next.x < 0) next.x = COLS - 1;
          if (next.x >= COLS) next.x = 0;
          if (canMove(next.x, next.y)) g.pacman = next;
        }
        g.pacMouth = (g.pacMouth + 0.15) % (Math.PI * 2);

        // Eat pellets
        const mx = g.pacman.x, my = g.pacman.y;
        if (g.maze[my]?.[mx] === 2) {
          g.maze[my][mx] = 0;
          g.score += 10;
          g.particles.push({ x: mx * cell + cell / 2, y: my * cell + cell / 2, vx: 0, vy: -1, life: 0.5, color: theme.pellet, size: 2 });
        }
        if (g.maze[my]?.[mx] === 3) {
          g.maze[my][mx] = 0;
          g.score += 50;
          g.powerUp = "power";
          g.powerUpEnd = now + 7000;
          g.ghosts.forEach(gh => { gh.scared = true; });
          for (let i = 0; i < 8; i++) {
            g.particles.push({ x: mx * cell + cell / 2, y: my * cell + cell / 2, vx: (Math.random() - 0.5) * 3, vy: (Math.random() - 0.5) * 3, life: 1, color: "280 100% 65%", size: 4 });
          }
        }

        // Check power-up expiry
        if (g.powerUp && now > g.powerUpEnd) {
          if (g.powerUp === "power") g.ghosts.forEach(gh => { gh.scared = false; });
          if (g.powerUp === "slow_ghosts") g.ghosts.forEach(gh => { gh.speed = 0.04; });
          g.powerUp = null;
        }
      }

      // ── Move Ghosts ────────────────
      if (!g.gameOver) {
        for (const ghost of g.ghosts) {
          if (ghost.speed === 0) continue;
          // Simple random chase AI
          const dirs: Dir[] = ["left", "right", "up", "down"];
          const validDirs = dirs.filter(d => {
            const n = { x: Math.round(ghost.pos.x) + dirVec[d].x, y: Math.round(ghost.pos.y) + dirVec[d].y };
            return canMove(n.x, n.y);
          });
          // Prefer chasing pacman
          if (Math.random() < 0.6 && !ghost.scared) {
            const toPlayer = validDirs.sort((a, b) => {
              const na = { x: Math.round(ghost.pos.x) + dirVec[a].x, y: Math.round(ghost.pos.y) + dirVec[a].y };
              const nb = { x: Math.round(ghost.pos.x) + dirVec[b].x, y: Math.round(ghost.pos.y) + dirVec[b].y };
              const da = Math.abs(na.x - g.pacman.x) + Math.abs(na.y - g.pacman.y);
              const db = Math.abs(nb.x - g.pacman.x) + Math.abs(nb.y - g.pacman.y);
              return ghost.scared ? db - da : da - db;
            });
            if (toPlayer.length > 0) ghost.dir = toPlayer[0];
          } else if (validDirs.length > 0) {
            ghost.dir = validDirs[Math.floor(Math.random() * validDirs.length)];
          }
          const spd = g.powerUp === "slow_ghosts" && now < g.powerUpEnd ? ghost.speed * 0.3 : ghost.speed;
          const nx = ghost.pos.x + dirVec[ghost.dir].x * spd;
          const ny = ghost.pos.y + dirVec[ghost.dir].y * spd;
          if (canMove(Math.round(nx), Math.round(ny))) {
            ghost.pos.x = nx;
            ghost.pos.y = ny;
          }
          // Tunnel
          if (ghost.pos.x < -1) ghost.pos.x = COLS;
          if (ghost.pos.x > COLS) ghost.pos.x = -1;

          // Collision with Pac-Man
          const dist = Math.abs(ghost.pos.x - g.pacman.x) + Math.abs(ghost.pos.y - g.pacman.y);
          if (dist < 0.8) {
            if (ghost.scared) {
              // Eat ghost
              ghost.pos = { x: 10, y: 10 };
              ghost.scared = false;
              g.score += 200;
              g.alerts.push({ text: "👻 Ghost eaten! +200", color: "280 100% 65%", time: now });
              for (let i = 0; i < 6; i++) {
                g.particles.push({ x: ghost.pos.x * cell + cell / 2, y: ghost.pos.y * cell + cell / 2, vx: (Math.random() - 0.5) * 3, vy: (Math.random() - 0.5) * 3, life: 0.8, color: ghost.color, size: 3 });
              }
            } else if (g.powerUp !== "shield") {
              // Hit!
              g.lives--;
              g.pacman = { x: 10, y: 16 };
              if (g.lives <= 0) {
                g.gameOver = true;
                g.alerts.push({ text: "💀 GAME OVER", color: "350 90% 55%", time: now });
              } else {
                g.alerts.push({ text: `💔 Hit! ${g.lives} lives left`, color: "350 90% 55%", time: now });
              }
            }
          }
        }
      }

      // ── Update particles ───────────
      g.particles = g.particles.filter(p => {
        p.x += p.vx;
        p.y += p.vy;
        p.life -= 0.02;
        return p.life > 0;
      });

      // ── Clean old alerts ───────────
      g.alerts = g.alerts.filter(a => now - a.time < 3000);

      // ── RENDER ─────────────────────
      ctx.clearRect(0, 0, COLS * cell, ROWS * cell);

      // Background (transparent for OBS)
      if (!settings.transparent_bg) {
        ctx.fillStyle = `hsl(${theme.bg})`;
        ctx.fillRect(0, 0, COLS * cell, ROWS * cell);
      }

      // Maze
      for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS; c++) {
          const tile = g.maze[r][c];
          const px = c * cell;
          const py = r * cell;
          if (tile === 1) {
            ctx.fillStyle = `hsl(${theme.wall} / 0.7)`;
            ctx.fillRect(px + 1, py + 1, cell - 2, cell - 2);
            ctx.strokeStyle = `hsl(${theme.wall})`;
            ctx.lineWidth = 1;
            ctx.strokeRect(px + 1, py + 1, cell - 2, cell - 2);
          } else if (tile === 2) {
            ctx.fillStyle = `hsl(${theme.pellet})`;
            ctx.beginPath();
            ctx.arc(px + cell / 2, py + cell / 2, cell * 0.12, 0, Math.PI * 2);
            ctx.fill();
          } else if (tile === 3) {
            ctx.fillStyle = `hsl(${theme.pellet})`;
            ctx.shadowColor = `hsl(${theme.pellet})`;
            ctx.shadowBlur = 8;
            ctx.beginPath();
            ctx.arc(px + cell / 2, py + cell / 2, cell * 0.25, 0, Math.PI * 2);
            ctx.fill();
            ctx.shadowBlur = 0;
          }
        }
      }

      // Pac-Man
      const px = g.pacman.x * cell + cell / 2;
      const py = g.pacman.y * cell + cell / 2;
      const mouth = Math.abs(Math.sin(g.pacMouth)) * 0.4;
      const angles: Record<Dir, number> = { right: 0, down: Math.PI / 2, left: Math.PI, up: -Math.PI / 2 };
      const angle = angles[g.pacDir];
      const radius = cell * 0.4;

      // Pac-Man glow
      ctx.shadowColor = `hsl(${theme.glow})`;
      ctx.shadowBlur = g.powerUp ? 20 : 10;

      ctx.fillStyle = g.powerUp === "power" && now < g.powerUpEnd
        ? `hsl(280 100% 65%)` // powered up color
        : g.powerUp === "shield" && now < g.powerUpEnd
        ? `hsl(200 100% 60%)`
        : `hsl(${theme.pacman})`;
      ctx.beginPath();
      ctx.arc(px, py, radius, angle + mouth, angle + Math.PI * 2 - mouth);
      ctx.lineTo(px, py);
      ctx.fill();
      ctx.shadowBlur = 0;

      // Shield indicator
      if (g.powerUp === "shield" && now < g.powerUpEnd) {
        ctx.strokeStyle = `hsl(200 100% 60% / 0.5)`;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(px, py, radius + 4, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Ghosts
      for (const ghost of g.ghosts) {
        const gx = ghost.pos.x * cell + cell / 2;
        const gy = ghost.pos.y * cell + cell / 2;
        const gr = cell * 0.38;
        const ghostColor = ghost.scared ? "230 80% 60%" : ghost.color;

        // Glow trail
        ctx.shadowColor = `hsl(${ghostColor})`;
        ctx.shadowBlur = 12;

        // Body
        ctx.fillStyle = `hsl(${ghostColor})`;
        ctx.beginPath();
        ctx.arc(gx, gy - gr * 0.2, gr, Math.PI, 0);
        ctx.lineTo(gx + gr, gy + gr * 0.6);
        // Wavy bottom
        const waves = 3;
        for (let w = 0; w < waves; w++) {
          const wx = gx + gr - (w + 1) * (gr * 2 / waves);
          ctx.quadraticCurveTo(wx + gr / waves, gy + gr * (0.3 + Math.sin(time / 200 + w) * 0.2), wx, gy + gr * 0.6);
        }
        ctx.closePath();
        ctx.fill();
        ctx.shadowBlur = 0;

        // Eyes
        ctx.fillStyle = "white";
        ctx.beginPath();
        ctx.arc(gx - gr * 0.25, gy - gr * 0.3, gr * 0.2, 0, Math.PI * 2);
        ctx.arc(gx + gr * 0.25, gy - gr * 0.3, gr * 0.2, 0, Math.PI * 2);
        ctx.fill();
        if (!ghost.scared) {
          ctx.fillStyle = `hsl(230 80% 20%)`;
          ctx.beginPath();
          ctx.arc(gx - gr * 0.2, gy - gr * 0.3, gr * 0.1, 0, Math.PI * 2);
          ctx.arc(gx + gr * 0.3, gy - gr * 0.3, gr * 0.1, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // Particles
      for (const p of g.particles) {
        ctx.globalAlpha = p.life;
        ctx.fillStyle = `hsl(${p.color})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;

      // ── HUD ────────────────────────
      const hudH = cell * 1.4;
      ctx.fillStyle = "rgba(0,0,0,0.6)";
      ctx.fillRect(0, 0, COLS * cell, hudH);

      ctx.font = `bold ${cell * 0.5}px system-ui, sans-serif`;
      ctx.fillStyle = "white";
      ctx.textBaseline = "middle";

      // Score
      ctx.fillText(`Score: ${g.score}`, cell * 0.5, hudH / 2);

      // Lives
      const livesText = "❤️".repeat(g.lives);
      ctx.fillText(livesText, cell * 7, hudH / 2);

      // Time survived
      const elapsed = Math.floor((now - g.startTime) / 1000);
      const mins = Math.floor(elapsed / 60);
      const secs = elapsed % 60;
      ctx.fillText(`${mins}:${secs.toString().padStart(2, "0")}`, cell * 14, hudH / 2);

      // Vote bar
      const voteBarY = hudH + 2;
      const totalVotes = g.votes.left + g.votes.right + g.votes.up + g.votes.down;
      if (totalVotes > 0) {
        const barW = COLS * cell;
        const barH = cell * 0.3;
        const dirs: Dir[] = ["left", "up", "down", "right"];
        const dColors = ["200 80% 55%", "160 80% 50%", "45 90% 55%", "350 80% 55%"];
        let offset = 0;
        dirs.forEach((d, i) => {
          const pct = g.votes[d] / totalVotes;
          ctx.fillStyle = `hsl(${dColors[i]} / 0.6)`;
          ctx.fillRect(offset, voteBarY, pct * barW, barH);
          if (pct > 0.1) {
            ctx.fillStyle = "white";
            ctx.font = `bold ${cell * 0.2}px system-ui`;
            ctx.fillText(`${d[0].toUpperCase()} ${Math.round(pct * 100)}%`, offset + 4, voteBarY + barH / 2);
          }
          offset += pct * barW;
        });
      }

      // Alerts
      ctx.textAlign = "center";
      g.alerts.forEach((a, i) => {
        const age = (now - a.time) / 3000;
        ctx.globalAlpha = 1 - age;
        ctx.font = `bold ${cell * 0.55}px system-ui`;
        ctx.fillStyle = `hsl(${a.color})`;
        ctx.shadowColor = `hsl(${a.color})`;
        ctx.shadowBlur = 10;
        ctx.fillText(a.text, COLS * cell / 2, ROWS * cell * 0.4 + i * cell * 0.8);
        ctx.shadowBlur = 0;
      });
      ctx.globalAlpha = 1;
      ctx.textAlign = "start";

      // Game Over
      if (g.gameOver) {
        ctx.fillStyle = "rgba(0,0,0,0.7)";
        ctx.fillRect(0, 0, COLS * cell, ROWS * cell);
        ctx.textAlign = "center";
        ctx.font = `bold ${cell * 1.2}px system-ui`;
        ctx.fillStyle = "hsl(350 90% 60%)";
        ctx.shadowColor = "hsl(350 90% 60%)";
        ctx.shadowBlur = 20;
        ctx.fillText("GAME OVER", COLS * cell / 2, ROWS * cell * 0.4);
        ctx.shadowBlur = 0;
        ctx.font = `bold ${cell * 0.6}px system-ui`;
        ctx.fillStyle = "white";
        ctx.fillText(`Final Score: ${g.score}`, COLS * cell / 2, ROWS * cell * 0.55);
        ctx.font = `${cell * 0.35}px system-ui`;
        ctx.fillStyle = "rgba(255,255,255,0.5)";
        ctx.fillText("Send a gift to restart!", COLS * cell / 2, ROWS * cell * 0.65);
        ctx.textAlign = "start";

        // Auto-restart after 10s
        if (now - g.startTime > 10000 && g.gameOver) {
          // Check if someone interacts to restart
        }
      }

      // Power-up indicator
      if (g.powerUp && now < g.powerUpEnd) {
        const remaining = Math.ceil((g.powerUpEnd - now) / 1000);
        const labels: Record<PowerUp, string> = {
          speed: "⚡ SPEED",
          shield: "🛡️ SHIELD",
          power: "👻 POWER",
          slow_ghosts: "🐌 SLOW",
        };
        ctx.textAlign = "right";
        ctx.font = `bold ${cell * 0.4}px system-ui`;
        ctx.fillStyle = `hsl(${theme.glow})`;
        ctx.fillText(`${labels[g.powerUp]} ${remaining}s`, COLS * cell - cell * 0.5, hudH / 2);
        ctx.textAlign = "start";
      }

      // Connection dot
      ctx.fillStyle = g.connected ? "hsl(160 100% 45%)" : "hsl(0 80% 55%)";
      ctx.beginPath();
      ctx.arc(COLS * cell - cell * 0.3, cell * 0.3, 3, 0, Math.PI * 2);
      ctx.fill();
    };

    animId = requestAnimationFrame(loop);
    return () => { cancelAnimationFrame(animId); window.removeEventListener("resize", resize); };
  }, [settings]);

  return (
    <div className="w-screen h-screen bg-transparent flex items-center justify-center overflow-hidden">
      <canvas ref={canvasRef} className="block" />
      {settings.custom_css && <style dangerouslySetInnerHTML={{ __html: settings.custom_css }} />}
    </div>
  );
};

export default PacManRenderer;
