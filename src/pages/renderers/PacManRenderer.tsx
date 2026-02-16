import { useEffect, useState, useRef, useCallback } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import useOverlayBody from "@/hooks/use-overlay-body";

/* ═══════════════════════════════════════════════════════════
   PAC-MAN LIVE v2 — Full chaos game engine
   Sub-pixel movement, stacking effects, ghost AI,
   freeze/slow/reverse/swarm/shield/power mechanics
   ═══════════════════════════════════════════════════════════ */

// ── Types ──────────────────────────────────────────────────
interface Vec2 { x: number; y: number; }
type Dir = "left" | "right" | "up" | "down";
type EffectType = "speed" | "shield" | "power" | "slow_ghosts" | "freeze" | "slow_pac" | "reverse" | "ghost_swarm" | "ghost_speed";

interface ActiveEffect {
  type: EffectType;
  end: number;
  username: string;
}

interface Ghost {
  pos: Vec2;
  target: Vec2;
  dir: Dir;
  nextDir: Dir | null;
  color: string;
  scared: boolean;
  baseSpeed: number;
  mode: "chase" | "scatter" | "frightened";
  isExtra: boolean; // spawned by swarm effect
  trailPositions: Vec2[]; // for glow trail
}

interface Particle {
  x: number; y: number;
  vx: number; vy: number;
  life: number; maxLife: number;
  color: string; size: number;
  type: "spark" | "ring" | "trail" | "ice" | "star";
}

interface Alert {
  text: string; color: string; time: number;
  icon: string;
}

interface VoteState { left: number; right: number; up: number; down: number; }

// ── Maze (21×23) ────────────────────────────────────────────
// 0=path, 1=wall, 2=pellet, 3=power-pellet, 4=ghost-house
const MAZE: number[][] = [
  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
  [1,2,2,2,2,2,2,2,2,2,1,2,2,2,2,2,2,2,2,2,1],
  [1,3,1,1,2,1,1,1,2,1,1,1,2,1,1,1,2,1,1,3,1],
  [1,2,1,1,2,1,1,1,2,1,1,1,2,1,1,1,2,1,1,2,1],
  [1,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,1],
  [1,2,1,1,2,1,2,1,1,1,1,1,1,1,2,1,2,1,1,2,1],
  [1,2,2,2,2,1,2,2,2,2,1,2,2,2,2,1,2,2,2,2,1],
  [1,1,1,1,2,1,1,1,0,1,1,1,0,1,1,1,2,1,1,1,1],
  [0,0,0,1,2,1,0,0,0,0,0,0,0,0,0,1,2,1,0,0,0],
  [1,1,1,1,2,1,0,1,1,4,4,4,1,1,0,1,2,1,1,1,1],
  [0,0,0,0,2,0,0,1,4,4,4,4,4,1,0,0,2,0,0,0,0],
  [1,1,1,1,2,1,0,1,1,1,1,1,1,1,0,1,2,1,1,1,1],
  [0,0,0,1,2,1,0,0,0,0,0,0,0,0,0,1,2,1,0,0,0],
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

const COLS = MAZE[0].length;
const ROWS = MAZE.length;

const GHOST_COLORS = [
  "0 85% 55%",    // Blinky (red) — chase
  "300 80% 55%",  // Pinky — ambush
  "180 90% 50%",  // Inky — patrol
  "30 95% 55%",   // Clyde — random
];

const GHOST_NAMES = ["Blinky", "Pinky", "Inky", "Clyde"];

const SCATTER_TARGETS: Vec2[] = [
  { x: COLS - 2, y: 0 },  // top-right
  { x: 1, y: 0 },          // top-left
  { x: COLS - 2, y: ROWS - 1 }, // bottom-right
  { x: 1, y: ROWS - 1 },        // bottom-left
];

const THEMES = {
  classic:   { wall: "230 70% 30%", wallGlow: "230 70% 45%", bg: "230 30% 8%", pellet: "50 100% 70%", pacman: "50 100% 55%", glow: "50 100% 55%", maze_line: true },
  cyberpunk: { wall: "280 80% 25%", wallGlow: "280 100% 55%", bg: "260 40% 5%", pellet: "160 100% 55%", pacman: "160 100% 50%", glow: "160 100% 50%", maze_line: true },
  tikup:     { wall: "160 40% 16%", wallGlow: "160 100% 40%", bg: "0 0% 3%", pellet: "160 100% 55%", pacman: "160 100% 45%", glow: "160 100% 45%", maze_line: true },
} as Record<string, any>;

const DIR_VEC: Record<Dir, Vec2> = {
  left: { x: -1, y: 0 }, right: { x: 1, y: 0 },
  up: { x: 0, y: -1 }, down: { x: 0, y: 1 },
};
const OPPOSITE: Record<Dir, Dir> = { left: "right", right: "left", up: "down", down: "up" };
const ALL_DIRS: Dir[] = ["up", "left", "down", "right"];

// ═══════════════════════════════════════════════════════════
// RENDERER
// ═══════════════════════════════════════════════════════════
const PacManRenderer = () => {
  useOverlayBody();
  const { publicToken } = useParams();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [settings, setSettings] = useState<any>({
    theme: "tikup",
    vote_interval: 1.5,
    ghost_count: 4,
    chaos_mode: true,
    speed_boost_duration: 3,
    shield_duration: 5,
    power_duration: 7,
    slow_pac_duration: 3,
    freeze_duration: 1.5,
    reverse_duration: 4,
    ghost_speed_duration: 5,
    swarm_duration: 8,
    slow_ghost_duration: 4,
    transparent_bg: true,
    custom_css: "",
  });

  const gameRef = useRef({
    maze: MAZE.map(r => [...r]),
    pacman: { x: 10, y: 16 } as Vec2,
    pacSubX: 10,
    pacSubY: 16,
    pacDir: "right" as Dir,
    pacNextDir: null as Dir | null,
    pacMouth: 0,
    pacSpeed: 0.08,  // sub-pixel speed
    ghosts: [] as Ghost[],
    score: 0,
    lives: 3,
    level: 1,
    pelletsLeft: 0,
    startTime: Date.now(),
    particles: [] as Particle[],
    alerts: [] as Alert[],
    votes: { left: 0, right: 0, up: 0, down: 0 } as VoteState,
    lastVoteProcess: Date.now(),
    effects: [] as ActiveEffect[],
    gameOver: false,
    connected: false,
    cellSize: 0,
    userCooldowns: {} as Record<string, number>,
    giftCooldown: 0,
    modeTimer: 0,
    ghostModePhase: 0, // scatter/chase cycle
    frameCount: 0,
    totalW: 0,
    totalH: 0,
    offsetX: 0,
    offsetY: 0,
  });

  // ── Helpers ──────────────────────────────────────────────
  const canMove = (x: number, y: number): boolean => {
    if (y === 10 && (x < 0 || x >= COLS)) return true; // tunnel
    if (x < 0 || x >= COLS || y < 0 || y >= ROWS) return false;
    const t = MAZE[y][x];
    return t !== 1;
  };

  const hasEffect = useCallback((type: EffectType): boolean => {
    return gameRef.current.effects.some(e => e.type === type && Date.now() < e.end);
  }, []);

  // ── Init ─────────────────────────────────────────────────
  const initGame = useCallback(() => {
    const g = gameRef.current;
    g.maze = MAZE.map(r => [...r]);
    g.pacman = { x: 10, y: 16 };
    g.pacSubX = 10; g.pacSubY = 16;
    g.pacDir = "right";
    g.pacNextDir = null;
    g.score = 0; g.lives = 3; g.level = 1;
    g.startTime = Date.now();
    g.particles = []; g.alerts = []; g.effects = [];
    g.gameOver = false; g.frameCount = 0;
    g.ghostModePhase = 0; g.modeTimer = Date.now();

    // Count pellets
    let pellets = 0;
    for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) {
      if (g.maze[r][c] === 2 || g.maze[r][c] === 3) pellets++;
    }
    g.pelletsLeft = pellets;

    // Spawn ghosts
    g.ghosts = [];
    const count = Math.min(settings.ghost_count || 4, 4);
    const spawns: Vec2[] = [{ x: 9, y: 10 }, { x: 10, y: 10 }, { x: 11, y: 10 }, { x: 10, y: 9 }];
    for (let i = 0; i < count; i++) {
      g.ghosts.push({
        pos: { ...spawns[i] },
        target: { ...SCATTER_TARGETS[i] },
        dir: ALL_DIRS[i % 4],
        nextDir: null,
        color: GHOST_COLORS[i],
        scared: false,
        baseSpeed: 0.045 + i * 0.003,
        mode: "scatter",
        isExtra: false,
        trailPositions: [],
      });
    }
  }, [settings.ghost_count]);

  // ── Spawn particles ──────────────────────────────────────
  const spawnBurst = useCallback((x: number, y: number, color: string, count: number, type: Particle["type"] = "spark") => {
    const g = gameRef.current;
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 / count) * i + Math.random() * 0.3;
      const speed = 1.5 + Math.random() * 3;
      g.particles.push({
        x, y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 1, maxLife: 1,
        color, size: 2 + Math.random() * 3,
        type,
      });
    }
  }, []);

  // ── Realtime ─────────────────────────────────────────────
  useEffect(() => {
    if (!publicToken) return;
    const g = gameRef.current;

    supabase.from("overlay_widgets" as any).select("settings").eq("public_token", publicToken).maybeSingle()
      .then(({ data }) => { if (data) setSettings((p: any) => ({ ...p, ...(data as any).settings })); });

    const addEffect = (type: EffectType, durationMs: number, username: string) => {
      // Remove existing of same type, then add
      g.effects = g.effects.filter(e => e.type !== type);
      g.effects.push({ type, end: Date.now() + durationMs, username });
    };

    const ch = supabase.channel(`pacman-${publicToken}`)
      .on("broadcast", { event: "chat" }, (msg) => {
        const p = msg.payload;
        if (!p) return;
        const text = (p.comment || p.text || "").toLowerCase().trim();
        const username = p.username || "anon";
        const now = Date.now();

        // Per-user cooldown
        if (g.userCooldowns[username] && now - g.userCooldowns[username] < 2000) return;
        g.userCooldowns[username] = now;

        // Movement
        const reversed = g.effects.some(e => e.type === "reverse" && now < e.end);
        const mapDir = (d: Dir): Dir => reversed ? OPPOSITE[d] : d;

        if (text === "left" || text === "⬅️" || text === "l" || text === "a") g.votes[mapDir("left")]++;
        else if (text === "right" || text === "➡️" || text === "r" || text === "d") g.votes[mapDir("right")]++;
        else if (text === "up" || text === "⬆️" || text === "u" || text === "w") g.votes[mapDir("up")]++;
        else if (text === "down" || text === "⬇️" || text === "e" || text === "s") g.votes[mapDir("down")]++;

        // Mod commands
        if (text === "!resetgame") initGame();
        if (text === "!freeze") {
          g.effects = g.effects.filter(e => e.type !== "freeze");
          addEffect("freeze", 0, "mod"); // cancel freeze
        }
        if (text === "!endgame") { g.gameOver = true; }
      })
      .on("broadcast", { event: "gift" }, (msg) => {
        const p = msg.payload;
        if (!p) return;
        const coins = p.coins || p.diamond_count || 0;
        const username = p.username || "Gifter";
        const now = Date.now();
        const cell = g.cellSize;
        const px = g.pacSubX * cell + cell / 2 + g.offsetX;
        const py = g.pacSubY * cell + cell / 2 + g.offsetY;

        // Gift cooldown (0.5s global)
        if (now < g.giftCooldown) return;
        g.giftCooldown = now + 500;

        // Game over → restart
        if (g.gameOver) { initGame(); return; }

        const chaos = settings.chaos_mode !== false;

        if (coins <= 1) {
          // Rose → Slow Pac-Man
          if (chaos) {
            addEffect("slow_pac", (settings.slow_pac_duration || 3) * 1000, username);
            g.alerts.push({ text: `${username} slowed Pac-Man!`, color: "200 80% 55%", time: now, icon: "🐌" });
            spawnBurst(px, py, "200 80% 55%", 8, "trail");
          }
        } else if (coins <= 5) {
          // Small gift → Freeze Pac-Man
          if (chaos) {
            addEffect("freeze", (settings.freeze_duration || 1.5) * 1000, username);
            g.alerts.push({ text: `${username} froze Pac-Man!`, color: "200 100% 75%", time: now, icon: "🧊" });
            spawnBurst(px, py, "200 100% 80%", 15, "ice");
          }
        } else if (coins <= 20) {
          // Medium → Speed boost ghosts
          if (chaos) {
            addEffect("ghost_speed", (settings.ghost_speed_duration || 5) * 1000, username);
            g.alerts.push({ text: `${username} boosted ghosts!`, color: "0 85% 55%", time: now, icon: "💨" });
            g.ghosts.forEach(gh => {
              spawnBurst(gh.pos.x * cell + cell / 2 + g.offsetX, gh.pos.y * cell + cell / 2 + g.offsetY, gh.color, 6);
            });
          }
        } else if (coins <= 50) {
          // Premium → Reverse controls
          if (chaos) {
            addEffect("reverse", (settings.reverse_duration || 4) * 1000, username);
            g.alerts.push({ text: `${username} reversed controls!`, color: "280 100% 65%", time: now, icon: "🔄" });
            spawnBurst(px, py, "280 100% 65%", 12, "star");
          }
        } else if (coins <= 100) {
          // Shield Pac-Man
          addEffect("shield", (settings.shield_duration || 5) * 1000, username);
          g.alerts.push({ text: `${username} shielded Pac-Man!`, color: "200 100% 60%", time: now, icon: "🛡️" });
          spawnBurst(px, py, "200 100% 60%", 10, "ring");
        } else if (coins <= 500) {
          // Power pellet mode
          addEffect("power", (settings.power_duration || 7) * 1000, username);
          g.ghosts.forEach(gh => { gh.scared = true; gh.mode = "frightened"; });
          g.alerts.push({ text: `${username} powered up Pac-Man!`, color: "280 100% 65%", time: now, icon: "👻" });
          spawnBurst(px, py, "280 100% 65%", 20, "star");
        } else if (coins <= 2000) {
          // Ghost swarm
          if (chaos) {
            addEffect("ghost_swarm", (settings.swarm_duration || 8) * 1000, username);
            // Spawn 3 extra ghosts
            for (let i = 0; i < 3; i++) {
              g.ghosts.push({
                pos: { x: 9 + i, y: 10 },
                target: { x: Math.floor(Math.random() * COLS), y: Math.floor(Math.random() * ROWS) },
                dir: ALL_DIRS[Math.floor(Math.random() * 4)],
                nextDir: null,
                color: `${Math.random() * 360} 80% 55%`,
                scared: false,
                baseSpeed: 0.05 + Math.random() * 0.02,
                mode: "chase",
                isExtra: true,
                trailPositions: [],
              });
            }
            g.alerts.push({ text: `${username} spawned ghost swarm!`, color: "0 90% 55%", time: now, icon: "👻👻👻" });
            spawnBurst(px, py, "0 90% 55%", 25, "spark");
          }
        } else {
          // Legendary → Teleport + Slow ghosts + Speed boost
          addEffect("speed", (settings.speed_boost_duration || 3) * 1000, username);
          addEffect("slow_ghosts", (settings.slow_ghost_duration || 4) * 1000, username);
          // Find safe tile
          const safeTiles: Vec2[] = [];
          for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) {
            if (g.maze[r][c] === 0 || g.maze[r][c] === 2) {
              const ghostNear = g.ghosts.some(gh => Math.abs(gh.pos.x - c) + Math.abs(gh.pos.y - r) < 5);
              if (!ghostNear) safeTiles.push({ x: c, y: r });
            }
          }
          if (safeTiles.length > 0) {
            const t = safeTiles[Math.floor(Math.random() * safeTiles.length)];
            g.pacSubX = t.x; g.pacSubY = t.y;
            g.pacman = { ...t };
          }
          g.alerts.push({ text: `${username} SAVED Pac-Man!`, color: "160 100% 55%", time: now, icon: "🌟" });
          spawnBurst(px, py, "160 100% 55%", 30, "star");
        }
      })
      .on("broadcast", { event: "test_alert" }, () => {
        const now = Date.now();
        addEffect("power", 5000, "TestUser");
        g.ghosts.forEach(gh => { gh.scared = true; gh.mode = "frightened"; });
        g.alerts.push({ text: "Test power-up!", color: "160 100% 45%", time: now, icon: "🧪" });
      })
      .subscribe(s => { g.connected = s === "SUBSCRIBED"; });

    const db = supabase.channel(`pacman-db-${publicToken}`)
      .on("postgres_changes" as any, { event: "UPDATE", schema: "public", table: "overlay_widgets", filter: `public_token=eq.${publicToken}` },
        (p: any) => { if (p.new?.settings) setSettings((prev: any) => ({ ...prev, ...p.new.settings })); })
      .subscribe();

    return () => { supabase.removeChannel(ch); supabase.removeChannel(db); };
  }, [publicToken, initGame, spawnBurst, settings]);

  useEffect(() => { initGame(); }, [initGame]);

  // ═══════════════════════════════════════════════════════════
  // GAME LOOP
  // ═══════════════════════════════════════════════════════════
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    let animId: number;
    let lastFrame = 0;

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      const maxW = window.innerWidth;
      const maxH = window.innerHeight;
      const cellW = Math.floor(maxW / COLS);
      const cellH = Math.floor(maxH / ROWS);
      const cell = Math.min(cellW, cellH);
      const g = gameRef.current;
      g.cellSize = cell;
      g.totalW = COLS * cell;
      g.totalH = ROWS * cell;
      g.offsetX = Math.floor((maxW - g.totalW) / 2);
      g.offsetY = Math.floor((maxH - g.totalH) / 2);
      canvas.width = maxW * dpr;
      canvas.height = maxH * dpr;
      canvas.style.width = `${maxW}px`;
      canvas.style.height = `${maxH}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener("resize", resize);

    // Ghost AI: pick best direction toward target
    const ghostPickDir = (ghost: Ghost): Dir => {
      const gx = Math.round(ghost.pos.x);
      const gy = Math.round(ghost.pos.y);
      const valid = ALL_DIRS.filter(d => {
        if (d === OPPOSITE[ghost.dir]) return false; // can't reverse
        const nx = gx + DIR_VEC[d].x;
        const ny = gy + DIR_VEC[d].y;
        if (ny === 10 && (nx < 0 || nx >= COLS)) return true;
        if (nx < 0 || nx >= COLS || ny < 0 || ny >= ROWS) return false;
        const tile = MAZE[ny][nx];
        return tile !== 1;
      });
      if (valid.length === 0) return ghost.dir;

      if (ghost.mode === "frightened") {
        return valid[Math.floor(Math.random() * valid.length)];
      }

      // Pick direction closest to target
      let best = valid[0];
      let bestDist = Infinity;
      for (const d of valid) {
        const nx = gx + DIR_VEC[d].x;
        const ny = gy + DIR_VEC[d].y;
        const dx = nx - ghost.target.x;
        const dy = ny - ghost.target.y;
        const dist = dx * dx + dy * dy;
        if (dist < bestDist) { bestDist = dist; best = d; }
      }
      return best;
    };

    const loop = (time: number) => {
      animId = requestAnimationFrame(loop);
      const dt = time - lastFrame;
      if (dt < 16) return; // ~60fps cap
      lastFrame = time;

      const g = gameRef.current;
      const cell = g.cellSize;
      if (cell === 0) return;
      const theme = THEMES[settings.theme] || THEMES.tikup;
      const now = Date.now();
      g.frameCount++;

      // Clean expired effects
      g.effects = g.effects.filter(e => now < e.end);

      // Remove extra swarm ghosts if swarm expired
      if (!g.effects.some(e => e.type === "ghost_swarm")) {
        g.ghosts = g.ghosts.filter(gh => !gh.isExtra);
      }

      // Un-scare ghosts if power expired
      if (!g.effects.some(e => e.type === "power")) {
        g.ghosts.forEach(gh => {
          if (gh.scared) { gh.scared = false; gh.mode = "chase"; }
        });
      }

      const isFrozen = g.effects.some(e => e.type === "freeze");
      const isSlowed = g.effects.some(e => e.type === "slow_pac");
      const isSpeedy = g.effects.some(e => e.type === "speed");
      const isShielded = g.effects.some(e => e.type === "shield");
      const ghostSpeedUp = g.effects.some(e => e.type === "ghost_speed");
      const ghostSlowed = g.effects.some(e => e.type === "slow_ghosts");

      // ── Ghost mode cycles ──────────
      const phaseDurations = [7000, 20000, 7000, 20000, 5000, 20000, 5000, Infinity];
      if (now - g.modeTimer > phaseDurations[g.ghostModePhase]) {
        g.ghostModePhase = Math.min(g.ghostModePhase + 1, phaseDurations.length - 1);
        g.modeTimer = now;
        const isScatter = g.ghostModePhase % 2 === 0;
        g.ghosts.forEach((gh, i) => {
          if (!gh.scared) {
            gh.mode = isScatter ? "scatter" : "chase";
            if (isScatter) gh.target = { ...SCATTER_TARGETS[i % 4] };
          }
        });
      }

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
          g.pacNextDir = newDir;
        }
        g.votes = { left: 0, right: 0, up: 0, down: 0 };
        g.lastVoteProcess = now;
      }

      // ── Move Pac-Man (sub-pixel) ───
      if (!g.gameOver && !isFrozen) {
        let speed = g.pacSpeed;
        if (isSlowed) speed *= 0.4;
        if (isSpeedy) speed *= 1.8;

        // Try next dir at grid intersections
        const atGridX = Math.abs(g.pacSubX - Math.round(g.pacSubX)) < 0.05;
        const atGridY = Math.abs(g.pacSubY - Math.round(g.pacSubY)) < 0.05;
        if (atGridX && atGridY && g.pacNextDir) {
          const nx = Math.round(g.pacSubX) + DIR_VEC[g.pacNextDir].x;
          const ny = Math.round(g.pacSubY) + DIR_VEC[g.pacNextDir].y;
          if (canMove(nx, ny)) {
            g.pacDir = g.pacNextDir;
            g.pacSubX = Math.round(g.pacSubX);
            g.pacSubY = Math.round(g.pacSubY);
            g.pacNextDir = null;
          }
        }

        // Move in current dir
        const vx = DIR_VEC[g.pacDir].x * speed;
        const vy = DIR_VEC[g.pacDir].y * speed;
        let newX = g.pacSubX + vx;
        let newY = g.pacSubY + vy;

        // Tunnel wrap
        if (Math.round(newY) === 10) {
          if (newX < -0.5) newX = COLS - 0.5;
          if (newX > COLS - 0.5) newX = -0.5;
        }

        const checkX = vx > 0 ? Math.ceil(newX) : Math.floor(newX);
        const checkY = vy > 0 ? Math.ceil(newY) : Math.floor(newY);

        if (canMove(checkX, checkY) || (Math.round(newY) === 10 && (newX < 0 || newX >= COLS))) {
          g.pacSubX = newX;
          g.pacSubY = newY;
        }

        g.pacman = { x: Math.round(g.pacSubX), y: Math.round(g.pacSubY) };
        g.pacMouth = (g.pacMouth + 0.18) % (Math.PI * 2);

        // Eat pellets
        const mx = g.pacman.x, my = g.pacman.y;
        if (mx >= 0 && mx < COLS && my >= 0 && my < ROWS) {
          if (g.maze[my][mx] === 2) {
            g.maze[my][mx] = 0;
            g.score += 10;
            g.pelletsLeft--;
            spawnBurst(
              g.pacSubX * cell + cell / 2 + g.offsetX,
              g.pacSubY * cell + cell / 2 + g.offsetY,
              theme.pellet, 3, "spark"
            );
          }
          if (g.maze[my][mx] === 3) {
            g.maze[my][mx] = 0;
            g.score += 50;
            g.pelletsLeft--;
            g.effects = g.effects.filter(e => e.type !== "power");
            g.effects.push({ type: "power", end: now + 7000, username: "pellet" });
            g.ghosts.forEach(gh => { gh.scared = true; gh.mode = "frightened"; });
            spawnBurst(
              g.pacSubX * cell + cell / 2 + g.offsetX,
              g.pacSubY * cell + cell / 2 + g.offsetY,
              "280 100% 65%", 15, "star"
            );
          }
        }

        // Level complete
        if (g.pelletsLeft <= 0) {
          g.level++;
          g.alerts.push({ text: `Level ${g.level}!`, color: "160 100% 55%", time: now, icon: "🎉" });
          // Reset maze
          g.maze = MAZE.map(r => [...r]);
          let pellets = 0;
          for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) {
            if (g.maze[r][c] === 2 || g.maze[r][c] === 3) pellets++;
          }
          g.pelletsLeft = pellets;
          g.pacSubX = 10; g.pacSubY = 16;
          g.pacman = { x: 10, y: 16 };
          // Reset ghosts
          const spawns: Vec2[] = [{ x: 9, y: 10 }, { x: 10, y: 10 }, { x: 11, y: 10 }, { x: 10, y: 9 }];
          g.ghosts = g.ghosts.filter(gh => !gh.isExtra);
          g.ghosts.forEach((gh, i) => { gh.pos = { ...spawns[i % spawns.length] }; gh.scared = false; gh.mode = "scatter"; });
        }
      }

      // Freeze particle emission
      if (isFrozen && g.frameCount % 4 === 0) {
        const px = g.pacSubX * cell + cell / 2 + g.offsetX;
        const py = g.pacSubY * cell + cell / 2 + g.offsetY;
        g.particles.push({
          x: px + (Math.random() - 0.5) * cell,
          y: py + (Math.random() - 0.5) * cell,
          vx: (Math.random() - 0.5) * 0.5,
          vy: -0.5 - Math.random(),
          life: 1, maxLife: 1,
          color: "200 100% 85%", size: 2 + Math.random() * 2,
          type: "ice",
        });
      }

      // ── Move Ghosts ────────────────
      if (!g.gameOver) {
        for (const ghost of g.ghosts) {
          // Update target based on mode
          if (ghost.mode === "chase" && !ghost.scared) {
            // Each ghost has different targeting
            const idx = g.ghosts.indexOf(ghost) % 4;
            if (idx === 0) {
              // Blinky: direct chase
              ghost.target = { ...g.pacman };
            } else if (idx === 1) {
              // Pinky: 4 tiles ahead
              ghost.target = {
                x: g.pacman.x + DIR_VEC[g.pacDir].x * 4,
                y: g.pacman.y + DIR_VEC[g.pacDir].y * 4,
              };
            } else if (idx === 2) {
              // Inky: complex targeting using Blinky
              const blinky = g.ghosts[0];
              const ahead = { x: g.pacman.x + DIR_VEC[g.pacDir].x * 2, y: g.pacman.y + DIR_VEC[g.pacDir].y * 2 };
              ghost.target = {
                x: ahead.x + (ahead.x - blinky.pos.x),
                y: ahead.y + (ahead.y - blinky.pos.y),
              };
            } else {
              // Clyde: chase if far, scatter if close
              const dist = Math.abs(ghost.pos.x - g.pacman.x) + Math.abs(ghost.pos.y - g.pacman.y);
              ghost.target = dist > 8 ? { ...g.pacman } : { ...SCATTER_TARGETS[3] };
            }
          }

          // Sub-pixel ghost movement
          let ghostSpeed = ghost.baseSpeed;
          if (ghost.scared) ghostSpeed *= 0.5;
          if (ghostSpeedUp) ghostSpeed *= 1.6;
          if (ghostSlowed) ghostSpeed *= 0.35;

          // At grid cell, pick new direction
          const gAtX = Math.abs(ghost.pos.x - Math.round(ghost.pos.x)) < ghostSpeed + 0.01;
          const gAtY = Math.abs(ghost.pos.y - Math.round(ghost.pos.y)) < ghostSpeed + 0.01;
          if (gAtX && gAtY) {
            ghost.pos.x = Math.round(ghost.pos.x);
            ghost.pos.y = Math.round(ghost.pos.y);
            ghost.dir = ghostPickDir(ghost);
          }

          const nvx = DIR_VEC[ghost.dir].x * ghostSpeed;
          const nvy = DIR_VEC[ghost.dir].y * ghostSpeed;
          let gnx = ghost.pos.x + nvx;
          let gny = ghost.pos.y + nvy;

          // Tunnel
          if (Math.round(gny) === 10) {
            if (gnx < -1) gnx = COLS;
            if (gnx > COLS) gnx = -1;
          }

          const gcx = nvx > 0 ? Math.ceil(gnx) : Math.floor(gnx);
          const gcy = nvy > 0 ? Math.ceil(gny) : Math.floor(gny);
          if (canMove(gcx, gcy) || (Math.round(gny) === 10 && (gnx < 0 || gnx >= COLS))) {
            ghost.pos.x = gnx;
            ghost.pos.y = gny;
          } else {
            // Stuck, pick new dir
            ghost.dir = ghostPickDir(ghost);
          }

          // Trail
          ghost.trailPositions.push({ ...ghost.pos });
          if (ghost.trailPositions.length > 6) ghost.trailPositions.shift();

          // ── Collision ──────────────
          const dist = Math.hypot(ghost.pos.x - g.pacSubX, ghost.pos.y - g.pacSubY);
          if (dist < 0.7) {
            if (ghost.scared) {
              ghost.pos = { x: 10, y: 10 };
              ghost.scared = false;
              ghost.mode = "chase";
              g.score += 200;
              g.alerts.push({ text: `Ghost eaten! +200`, color: "280 100% 65%", time: now, icon: "👻" });
              spawnBurst(
                ghost.pos.x * cell + cell / 2 + g.offsetX,
                ghost.pos.y * cell + cell / 2 + g.offsetY,
                ghost.color, 10
              );
            } else if (!isShielded) {
              g.lives--;
              if (g.lives <= 0) {
                g.gameOver = true;
                g.alerts.push({ text: "GAME OVER", color: "350 90% 55%", time: now, icon: "💀" });
                spawnBurst(
                  g.pacSubX * cell + cell / 2 + g.offsetX,
                  g.pacSubY * cell + cell / 2 + g.offsetY,
                  "350 90% 55%", 25, "spark"
                );
              } else {
                g.alerts.push({ text: `${g.lives} lives left`, color: "350 90% 55%", time: now, icon: "💔" });
                g.pacSubX = 10; g.pacSubY = 16;
                g.pacman = { x: 10, y: 16 };
                // Reset ghost positions
                const spawns: Vec2[] = [{ x: 9, y: 10 }, { x: 10, y: 10 }, { x: 11, y: 10 }, { x: 10, y: 9 }];
                g.ghosts.forEach((gh, i) => {
                  if (!gh.isExtra) gh.pos = { ...spawns[i % spawns.length] };
                });
              }
            } else {
              // Shield absorbed hit
              g.alerts.push({ text: "Shield absorbed hit!", color: "200 100% 60%", time: now, icon: "🛡️" });
              spawnBurst(
                g.pacSubX * cell + cell / 2 + g.offsetX,
                g.pacSubY * cell + cell / 2 + g.offsetY,
                "200 100% 60%", 8, "ring"
              );
              ghost.pos = { x: 10, y: 10 };
            }
          }
        }
      }

      // ── Update particles ───────────
      g.particles = g.particles.filter(p => {
        p.x += p.vx;
        p.y += p.vy;
        if (p.type === "ice") p.vy -= 0.01;
        p.life -= 0.015;
        return p.life > 0;
      });

      g.alerts = g.alerts.filter(a => now - a.time < 3500);

      // ═══════════════════════════════════════════════════════
      // RENDER
      // ═══════════════════════════════════════════════════════
      const W = canvas.width / (window.devicePixelRatio || 1);
      const H = canvas.height / (window.devicePixelRatio || 1);
      ctx.clearRect(0, 0, W, H);

      if (!settings.transparent_bg) {
        ctx.fillStyle = `hsl(${theme.bg})`;
        ctx.fillRect(0, 0, W, H);
      }

      ctx.save();
      ctx.translate(g.offsetX, g.offsetY);

      // ── Maze rendering (neon lines) ─
      for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS; c++) {
          const tile = MAZE[r][c]; // use template for walls
          const px = c * cell;
          const py = r * cell;

          if (tile === 1) {
            // Check which sides have non-wall neighbors for border drawing
            ctx.fillStyle = `hsl(${theme.wall} / 0.25)`;
            ctx.fillRect(px, py, cell, cell);

            // Neon edge lines
            ctx.strokeStyle = `hsl(${theme.wallGlow} / 0.6)`;
            ctx.lineWidth = 1.5;
            // Only draw edges facing paths
            const top = r > 0 && MAZE[r-1][c] !== 1;
            const bot = r < ROWS-1 && MAZE[r+1][c] !== 1;
            const lft = c > 0 && MAZE[r][c-1] !== 1;
            const rgt = c < COLS-1 && MAZE[r][c+1] !== 1;

            ctx.beginPath();
            if (top) { ctx.moveTo(px, py + 0.5); ctx.lineTo(px + cell, py + 0.5); }
            if (bot) { ctx.moveTo(px, py + cell - 0.5); ctx.lineTo(px + cell, py + cell - 0.5); }
            if (lft) { ctx.moveTo(px + 0.5, py); ctx.lineTo(px + 0.5, py + cell); }
            if (rgt) { ctx.moveTo(px + cell - 0.5, py); ctx.lineTo(px + cell - 0.5, py + cell); }
            ctx.stroke();
          } else if (g.maze[r][c] === 2) {
            ctx.fillStyle = `hsl(${theme.pellet})`;
            ctx.beginPath();
            ctx.arc(px + cell / 2, py + cell / 2, cell * 0.1, 0, Math.PI * 2);
            ctx.fill();
          } else if (g.maze[r][c] === 3) {
            // Pulsing power pellet
            const pulse = 0.2 + Math.sin(time / 200) * 0.08;
            ctx.fillStyle = `hsl(${theme.pellet})`;
            ctx.shadowColor = `hsl(${theme.pellet})`;
            ctx.shadowBlur = 10 + Math.sin(time / 150) * 5;
            ctx.beginPath();
            ctx.arc(px + cell / 2, py + cell / 2, cell * pulse, 0, Math.PI * 2);
            ctx.fill();
            ctx.shadowBlur = 0;
          }
        }
      }

      // ── Ghost trails ───────────────
      for (const ghost of g.ghosts) {
        const ghostColor = ghost.scared ? "230 80% 60%" : ghost.color;
        ghost.trailPositions.forEach((tp, ti) => {
          const alpha = (ti / ghost.trailPositions.length) * 0.15;
          ctx.fillStyle = `hsl(${ghostColor} / ${alpha})`;
          ctx.beginPath();
          ctx.arc(tp.x * cell + cell / 2, tp.y * cell + cell / 2, cell * 0.3, 0, Math.PI * 2);
          ctx.fill();
        });
      }

      // ── Pac-Man ────────────────────
      const ppx = g.pacSubX * cell + cell / 2;
      const ppy = g.pacSubY * cell + cell / 2;
      const mouth = Math.abs(Math.sin(g.pacMouth)) * 0.5;
      const angles: Record<Dir, number> = { right: 0, down: Math.PI / 2, left: Math.PI, up: -Math.PI / 2 };
      const pAngle = angles[g.pacDir];
      const pRadius = cell * 0.42;

      // Slow-mo trail
      if (isSlowed && g.frameCount % 2 === 0) {
        ctx.globalAlpha = 0.15;
        ctx.fillStyle = `hsl(200 80% 55%)`;
        ctx.beginPath();
        ctx.arc(ppx - DIR_VEC[g.pacDir].x * cell * 0.2, ppy - DIR_VEC[g.pacDir].y * cell * 0.2, pRadius * 0.9, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
      }

      // Freeze visual: ice encasing
      if (isFrozen) {
        ctx.strokeStyle = "hsl(200 100% 85% / 0.6)";
        ctx.lineWidth = 3;
        ctx.shadowColor = "hsl(200 100% 80%)";
        ctx.shadowBlur = 15;
        // Ice crystal shape
        ctx.beginPath();
        for (let i = 0; i < 6; i++) {
          const a = (Math.PI * 2 / 6) * i - Math.PI / 2;
          const r = pRadius + 6 + Math.sin(time / 300 + i) * 2;
          const x = ppx + Math.cos(a) * r;
          const y = ppy + Math.sin(a) * r;
          if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
        }
        ctx.closePath();
        ctx.stroke();
        ctx.shadowBlur = 0;
      }

      // Pac-Man body
      const isPowered = g.effects.some(e => e.type === "power");
      const pacColor = isFrozen ? "200 100% 75%"
        : isPowered ? "280 100% 65%"
        : isShielded ? "200 100% 60%"
        : theme.pacman;

      ctx.shadowColor = `hsl(${pacColor})`;
      ctx.shadowBlur = isPowered ? 25 : isShielded ? 18 : 10;
      ctx.fillStyle = `hsl(${pacColor})`;
      ctx.beginPath();
      ctx.arc(ppx, ppy, pRadius, pAngle + mouth, pAngle + Math.PI * 2 - mouth);
      ctx.lineTo(ppx, ppy);
      ctx.fill();
      ctx.shadowBlur = 0;

      // Eye
      const eyeAngle = pAngle + Math.PI * 0.35;
      const eyeX = ppx + Math.cos(eyeAngle) * pRadius * 0.45;
      const eyeY = ppy + Math.sin(eyeAngle) * pRadius * 0.45;
      ctx.fillStyle = isFrozen ? "hsl(200 100% 95%)" : "hsl(0 0% 10%)";
      ctx.beginPath();
      ctx.arc(eyeX, eyeY, pRadius * 0.12, 0, Math.PI * 2);
      ctx.fill();

      // Shield bubble
      if (isShielded) {
        const shimmer = Math.sin(time / 100) * 0.1 + 0.3;
        ctx.strokeStyle = `hsl(200 100% 65% / ${shimmer})`;
        ctx.lineWidth = 2.5;
        ctx.shadowColor = "hsl(200 100% 60%)";
        ctx.shadowBlur = 12;
        ctx.beginPath();
        ctx.arc(ppx, ppy, pRadius + 6, 0, Math.PI * 2);
        ctx.stroke();
        // Shield pattern
        ctx.strokeStyle = `hsl(200 100% 80% / ${shimmer * 0.5})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(ppx, ppy, pRadius + 3, time / 500, time / 500 + Math.PI * 1.2);
        ctx.stroke();
        ctx.shadowBlur = 0;
      }

      // Reverse indicator
      if (g.effects.some(e => e.type === "reverse")) {
        ctx.font = `bold ${cell * 0.35}px system-ui`;
        ctx.fillStyle = "hsl(280 100% 65%)";
        ctx.textAlign = "center";
        ctx.fillText("🔄", ppx, ppy - pRadius - 6);
        ctx.textAlign = "start";
      }

      // ── Ghosts ─────────────────────
      for (const ghost of g.ghosts) {
        const gx = ghost.pos.x * cell + cell / 2;
        const gy = ghost.pos.y * cell + cell / 2;
        const gr = cell * 0.4;
        const ghostColor = ghost.scared
          ? (now % 400 < 200 && g.effects.some(e => e.type === "power" && e.end - now < 2000)
            ? "0 0% 90%" : "230 80% 60%")
          : ghost.color;

        // Ghost speed glow
        if (ghostSpeedUp && !ghost.scared) {
          ctx.shadowColor = "hsl(0 100% 50%)";
          ctx.shadowBlur = 18;
        } else {
          ctx.shadowColor = `hsl(${ghostColor})`;
          ctx.shadowBlur = ghost.scared ? 6 : 12;
        }

        // Body
        ctx.fillStyle = `hsl(${ghostColor})`;
        ctx.beginPath();
        ctx.arc(gx, gy - gr * 0.15, gr, Math.PI, 0);
        ctx.lineTo(gx + gr, gy + gr * 0.55);
        const waves = 4;
        for (let w = 0; w < waves; w++) {
          const wx = gx + gr - (w + 1) * (gr * 2 / waves);
          const waveY = gy + gr * (0.3 + Math.sin(time / 120 + w * 1.5) * 0.15);
          ctx.quadraticCurveTo(wx + gr / waves, waveY, wx, gy + gr * 0.55);
        }
        ctx.closePath();
        ctx.fill();
        ctx.shadowBlur = 0;

        // Eyes
        if (!ghost.scared) {
          // Eye whites
          ctx.fillStyle = "white";
          ctx.beginPath();
          ctx.ellipse(gx - gr * 0.25, gy - gr * 0.2, gr * 0.18, gr * 0.22, 0, 0, Math.PI * 2);
          ctx.ellipse(gx + gr * 0.25, gy - gr * 0.2, gr * 0.18, gr * 0.22, 0, 0, Math.PI * 2);
          ctx.fill();
          // Pupils (look toward target)
          const lookX = Math.sign(ghost.target.x - ghost.pos.x) * gr * 0.06;
          const lookY = Math.sign(ghost.target.y - ghost.pos.y) * gr * 0.06;
          ctx.fillStyle = "hsl(230 90% 15%)";
          ctx.beginPath();
          ctx.arc(gx - gr * 0.25 + lookX, gy - gr * 0.2 + lookY, gr * 0.1, 0, Math.PI * 2);
          ctx.arc(gx + gr * 0.25 + lookX, gy - gr * 0.2 + lookY, gr * 0.1, 0, Math.PI * 2);
          ctx.fill();
        } else {
          // Scared face
          ctx.fillStyle = "white";
          ctx.beginPath();
          ctx.arc(gx - gr * 0.2, gy - gr * 0.15, gr * 0.08, 0, Math.PI * 2);
          ctx.arc(gx + gr * 0.2, gy - gr * 0.15, gr * 0.08, 0, Math.PI * 2);
          ctx.fill();
          // Wobbly mouth
          ctx.strokeStyle = "white";
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.moveTo(gx - gr * 0.25, gy + gr * 0.15);
          for (let w = 0; w < 4; w++) {
            ctx.lineTo(gx - gr * 0.25 + (w + 0.5) * gr * 0.125, gy + gr * (0.1 + (w % 2) * 0.1));
          }
          ctx.stroke();
        }

        // Speed-buffed indicator
        if (ghostSpeedUp && !ghost.scared) {
          ctx.fillStyle = "hsl(0 100% 55% / 0.4)";
          ctx.beginPath();
          ctx.arc(gx, gy, gr + 3, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // ── Particles ──────────────────
      for (const p of g.particles) {
        const alpha = p.life / p.maxLife;
        ctx.globalAlpha = alpha;
        if (p.type === "ring") {
          ctx.strokeStyle = `hsl(${p.color})`;
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.arc(p.x - g.offsetX, p.y - g.offsetY, p.size * (1 - alpha) * 3 + 2, 0, Math.PI * 2);
          ctx.stroke();
        } else if (p.type === "star") {
          ctx.fillStyle = `hsl(${p.color})`;
          ctx.shadowColor = `hsl(${p.color})`;
          ctx.shadowBlur = 6;
          const sz = p.size * alpha;
          ctx.beginPath();
          for (let s = 0; s < 5; s++) {
            const a = (Math.PI * 2 / 5) * s - Math.PI / 2;
            const r1 = sz;
            const r2 = sz * 0.4;
            ctx.lineTo((p.x - g.offsetX) + Math.cos(a) * r1, (p.y - g.offsetY) + Math.sin(a) * r1);
            ctx.lineTo((p.x - g.offsetX) + Math.cos(a + Math.PI / 5) * r2, (p.y - g.offsetY) + Math.sin(a + Math.PI / 5) * r2);
          }
          ctx.closePath();
          ctx.fill();
          ctx.shadowBlur = 0;
        } else if (p.type === "ice") {
          ctx.fillStyle = `hsl(${p.color} / ${alpha * 0.8})`;
          // Diamond shape
          const sz = p.size * alpha;
          ctx.beginPath();
          ctx.moveTo(p.x - g.offsetX, (p.y - g.offsetY) - sz);
          ctx.lineTo((p.x - g.offsetX) + sz * 0.6, p.y - g.offsetY);
          ctx.lineTo(p.x - g.offsetX, (p.y - g.offsetY) + sz);
          ctx.lineTo((p.x - g.offsetX) - sz * 0.6, p.y - g.offsetY);
          ctx.closePath();
          ctx.fill();
        } else {
          ctx.fillStyle = `hsl(${p.color})`;
          ctx.beginPath();
          ctx.arc(p.x - g.offsetX, p.y - g.offsetY, p.size * alpha, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      ctx.globalAlpha = 1;

      ctx.restore(); // remove offset translation

      // ═══════════════════════════════════════════════════════
      // HUD (overlaid on top, not offset)
      // ═══════════════════════════════════════════════════════
      const hudH = Math.max(cell * 1.5, 36);
      const hudY = 0;

      // Semi-transparent HUD bar
      const grad = ctx.createLinearGradient(0, 0, 0, hudH);
      grad.addColorStop(0, "rgba(0,0,0,0.7)");
      grad.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, W, hudH);

      const fontSize = Math.max(cell * 0.45, 13);
      ctx.font = `bold ${fontSize}px "SF Mono", "JetBrains Mono", monospace, system-ui`;
      ctx.textBaseline = "middle";
      ctx.fillStyle = "white";

      // Score
      ctx.fillText(`SCORE`, g.offsetX + 8, hudH * 0.33);
      ctx.fillStyle = `hsl(${theme.glow})`;
      ctx.font = `bold ${fontSize * 1.3}px "SF Mono", monospace, system-ui`;
      ctx.fillText(`${g.score.toLocaleString()}`, g.offsetX + 8, hudH * 0.68);

      // Level
      ctx.fillStyle = "hsl(0 0% 60%)";
      ctx.font = `bold ${fontSize * 0.8}px system-ui`;
      ctx.fillText(`LVL ${g.level}`, g.offsetX + cell * 5, hudH * 0.33);

      // Lives
      ctx.fillStyle = "white";
      ctx.font = `${fontSize}px system-ui`;
      const livesX = W / 2;
      ctx.textAlign = "center";
      for (let i = 0; i < g.lives; i++) {
        ctx.fillStyle = "hsl(350 90% 55%)";
        ctx.beginPath();
        const lx = livesX + (i - g.lives / 2) * (fontSize * 1.2);
        // Heart shape
        ctx.arc(lx - fontSize * 0.15, hudH * 0.5 - fontSize * 0.1, fontSize * 0.2, Math.PI, 0);
        ctx.arc(lx + fontSize * 0.15, hudH * 0.5 - fontSize * 0.1, fontSize * 0.2, Math.PI, 0);
        ctx.lineTo(lx, hudH * 0.5 + fontSize * 0.25);
        ctx.closePath();
        ctx.fill();
      }
      ctx.textAlign = "start";

      // Timer
      const elapsed = Math.floor((now - g.startTime) / 1000);
      const mins = Math.floor(elapsed / 60);
      const secs = elapsed % 60;
      ctx.fillStyle = "hsl(0 0% 50%)";
      ctx.font = `${fontSize * 0.9}px "SF Mono", monospace, system-ui`;
      ctx.textAlign = "right";
      ctx.fillText(`${mins}:${secs.toString().padStart(2, "0")}`, W - g.offsetX - 8, hudH * 0.33);

      // Active effects
      const activeEffects = g.effects.filter(e => now < e.end);
      if (activeEffects.length > 0) {
        ctx.textAlign = "right";
        ctx.font = `bold ${fontSize * 0.75}px system-ui`;
        activeEffects.forEach((eff, i) => {
          const remaining = Math.ceil((eff.end - now) / 1000);
          const labels: Record<EffectType, { icon: string; color: string; label: string }> = {
            speed: { icon: "⚡", color: "45 100% 55%", label: "SPEED" },
            shield: { icon: "🛡️", color: "200 100% 60%", label: "SHIELD" },
            power: { icon: "👻", color: "280 100% 65%", label: "POWER" },
            slow_ghosts: { icon: "🐌", color: "160 100% 55%", label: "SLOW GHOSTS" },
            freeze: { icon: "🧊", color: "200 100% 80%", label: "FROZEN" },
            slow_pac: { icon: "🐌", color: "200 80% 55%", label: "SLOWED" },
            reverse: { icon: "🔄", color: "280 100% 65%", label: "REVERSED" },
            ghost_swarm: { icon: "👻", color: "0 90% 55%", label: "SWARM" },
            ghost_speed: { icon: "💨", color: "0 85% 55%", label: "FAST GHOSTS" },
          };
          const info = labels[eff.type];
          const ey = hudH * 0.7 + i * (fontSize * 1.1);
          ctx.fillStyle = `hsl(${info.color} / 0.8)`;
          ctx.fillText(`${info.icon} ${info.label} ${remaining}s`, W - g.offsetX - 8, ey);
        });
      }
      ctx.textAlign = "start";

      // Vote bar (bottom)
      const totalVotes = g.votes.left + g.votes.right + g.votes.up + g.votes.down;
      if (totalVotes > 0) {
        const barH = Math.max(cell * 0.35, 10);
        const barY = H - barH;
        const barX = g.offsetX;
        const barW = g.totalW;
        const dirs: Dir[] = ["left", "up", "down", "right"];
        const dColors = ["200 80% 55%", "160 80% 50%", "45 90% 55%", "350 80% 55%"];
        const dLabels = ["⬅", "⬆", "⬇", "➡"];
        let offset = 0;
        dirs.forEach((d, i) => {
          const pct = g.votes[d] / totalVotes;
          if (pct > 0) {
            ctx.fillStyle = `hsl(${dColors[i]} / 0.5)`;
            ctx.fillRect(barX + offset, barY, pct * barW, barH);
            if (pct > 0.08) {
              ctx.fillStyle = "white";
              ctx.font = `bold ${barH * 0.65}px system-ui`;
              ctx.textAlign = "center";
              ctx.fillText(`${dLabels[i]} ${Math.round(pct * 100)}%`, barX + offset + pct * barW / 2, barY + barH / 2 + 1);
              ctx.textAlign = "start";
            }
            offset += pct * barW;
          }
        });
      }

      // ── Alerts ─────────────────────
      ctx.textAlign = "center";
      g.alerts.forEach((a, i) => {
        const age = (now - a.time) / 3500;
        if (age > 1) return;
        const yOffset = age * 30;
        ctx.globalAlpha = 1 - age;
        ctx.font = `bold ${Math.max(cell * 0.55, 16)}px system-ui`;
        ctx.fillStyle = `hsl(${a.color})`;
        ctx.shadowColor = `hsl(${a.color})`;
        ctx.shadowBlur = 15;
        ctx.fillText(`${a.icon} ${a.text}`, W / 2, H * 0.35 + i * (cell * 0.9) - yOffset);
        ctx.shadowBlur = 0;
      });
      ctx.globalAlpha = 1;
      ctx.textAlign = "start";

      // ── Game Over ──────────────────
      if (g.gameOver) {
        ctx.fillStyle = "rgba(0,0,0,0.75)";
        ctx.fillRect(0, 0, W, H);

        ctx.textAlign = "center";

        // Glitch effect
        const glitch = Math.sin(time / 50) * 2;

        ctx.font = `bold ${Math.max(cell * 1.5, 40)}px system-ui`;
        ctx.fillStyle = "hsl(350 90% 60%)";
        ctx.shadowColor = "hsl(350 90% 60%)";
        ctx.shadowBlur = 30;
        ctx.fillText("GAME OVER", W / 2 + glitch, H * 0.38);
        ctx.fillStyle = "hsl(180 100% 50% / 0.3)";
        ctx.fillText("GAME OVER", W / 2 - glitch, H * 0.38 + 2);
        ctx.shadowBlur = 0;

        ctx.font = `bold ${Math.max(cell * 0.7, 18)}px system-ui`;
        ctx.fillStyle = "white";
        ctx.fillText(`Final Score: ${g.score.toLocaleString()}`, W / 2, H * 0.5);

        ctx.font = `${Math.max(cell * 0.4, 12)}px system-ui`;
        ctx.fillStyle = "hsl(0 0% 50%)";
        ctx.fillText(`Level ${g.level} • ${mins}:${secs.toString().padStart(2, "0")} survived`, W / 2, H * 0.57);

        ctx.fillStyle = `hsl(${theme.glow} / ${0.4 + Math.sin(time / 300) * 0.2})`;
        ctx.font = `bold ${Math.max(cell * 0.35, 11)}px system-ui`;
        ctx.fillText("Send a gift to restart!", W / 2, H * 0.66);

        ctx.textAlign = "start";
      }

      // Connection indicator
      ctx.fillStyle = g.connected ? "hsl(160 100% 45%)" : "hsl(0 80% 55%)";
      ctx.beginPath();
      ctx.arc(W - 12, 12, 4, 0, Math.PI * 2);
      ctx.fill();
    };

    animId = requestAnimationFrame(loop);
    return () => { cancelAnimationFrame(animId); window.removeEventListener("resize", resize); };
  }, [settings, canMove, spawnBurst]);

  return (
    <div className="w-screen h-screen bg-transparent overflow-hidden">
      <canvas ref={canvasRef} className="block" />
      {settings.custom_css && <style dangerouslySetInnerHTML={{ __html: settings.custom_css }} />}
    </div>
  );
};

export default PacManRenderer;
