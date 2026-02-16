import { useEffect, useState, useRef, useCallback } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import useOverlayBody from "@/hooks/use-overlay-body";

/* ═══════════════════════════════════════════════════════════
   PAC-MAN LIVE v3 — AI RUNAWAY MODE
   Pac-Man is AI-controlled with ~95% base escape chance.
   Gifts = debuffs that reduce escape probability.
   Round-based: escape or get caught → drama loop.
   ═══════════════════════════════════════════════════════════ */

// ── Types ──────────────────────────────────────────────────
interface Vec2 { x: number; y: number; }
type Dir = "left" | "right" | "up" | "down";
type EffectType = "freeze" | "slow_pac" | "reverse" | "ai_confusion" | "ghost_swarm" | "ghost_speed" | "shield" | "power" | "speed" | "slow_ghosts";

interface ActiveEffect {
  type: EffectType;
  end: number;
  username: string;
  escapeReduction: number; // how much this reduces escape %
}

interface Ghost {
  pos: Vec2;
  target: Vec2;
  dir: Dir;
  color: string;
  scared: boolean;
  baseSpeed: number;
  mode: "chase" | "scatter" | "frightened";
  isExtra: boolean;
  trailPositions: Vec2[];
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

interface GifterEntry {
  username: string;
  totalCoins: number;
  effectsTriggered: number;
}

// ── Maze (21×22) ────────────────────────────────────────────
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

const GHOST_COLORS = ["0 85% 55%", "300 80% 55%", "180 90% 50%", "30 95% 55%"];
const SCATTER_TARGETS: Vec2[] = [
  { x: COLS - 2, y: 0 }, { x: 1, y: 0 },
  { x: COLS - 2, y: ROWS - 1 }, { x: 1, y: ROWS - 1 },
];

const THEMES = {
  classic:   { wall: "230 70% 30%", wallGlow: "230 70% 45%", pellet: "50 100% 70%", pacman: "50 100% 55%", glow: "50 100% 55%", bg: "230 30% 8%" },
  cyberpunk: { wall: "280 80% 25%", wallGlow: "280 100% 55%", pellet: "160 100% 55%", pacman: "160 100% 50%", glow: "160 100% 50%", bg: "260 40% 5%" },
  tikup:     { wall: "160 40% 16%", wallGlow: "160 100% 40%", pellet: "160 100% 55%", pacman: "160 100% 45%", glow: "160 100% 45%", bg: "0 0% 3%" },
} as Record<string, any>;

const DIR_VEC: Record<Dir, Vec2> = { left: { x: -1, y: 0 }, right: { x: 1, y: 0 }, up: { x: 0, y: -1 }, down: { x: 0, y: 1 } };
const OPPOSITE: Record<Dir, Dir> = { left: "right", right: "left", up: "down", down: "up" };
const ALL_DIRS: Dir[] = ["up", "left", "down", "right"];

// ── Effect escape reductions ─────────────────────────────
const EFFECT_ESCAPE_REDUCTION: Record<EffectType, number> = {
  slow_pac: 10,
  freeze: 20,
  reverse: 15,
  ai_confusion: 25,
  ghost_swarm: 30,
  ghost_speed: 12,
  shield: 0,
  power: 0,
  speed: 0,
  slow_ghosts: 0,
};

// ═══════════════════════════════════════════════════════════
// BFS pathfinding for AI Pac-Man
// ═══════════════════════════════════════════════════════════
function canMoveToTile(x: number, y: number): boolean {
  if (y === 10 && (x < 0 || x >= COLS)) return true;
  if (x < 0 || x >= COLS || y < 0 || y >= ROWS) return false;
  return MAZE[y][x] !== 1;
}

function bfsPath(from: Vec2, to: Vec2, dangerMap?: Set<string>): Dir | null {
  const queue: { x: number; y: number; firstDir: Dir }[] = [];
  const visited = new Set<string>();
  visited.add(`${from.x},${from.y}`);

  for (const d of ALL_DIRS) {
    const nx = from.x + DIR_VEC[d].x;
    const ny = from.y + DIR_VEC[d].y;
    if (canMoveToTile(nx, ny) && !(dangerMap?.has(`${nx},${ny}`))) {
      if (nx === to.x && ny === to.y) return d;
      queue.push({ x: nx, y: ny, firstDir: d });
      visited.add(`${nx},${ny}`);
    }
  }

  while (queue.length > 0) {
    const cur = queue.shift()!;
    if (cur.x === to.x && cur.y === to.y) return cur.firstDir;
    for (const d of ALL_DIRS) {
      const nx = cur.x + DIR_VEC[d].x;
      const ny = cur.y + DIR_VEC[d].y;
      const key = `${nx},${ny}`;
      if (!visited.has(key) && canMoveToTile(nx, ny) && !(dangerMap?.has(key))) {
        visited.add(key);
        queue.push({ x: nx, y: ny, firstDir: cur.firstDir });
      }
    }
  }
  return null;
}

// Find safest direction away from all ghosts
function aiPickSafeDir(pacPos: Vec2, ghosts: Ghost[], confused: boolean): Dir {
  if (confused) {
    // Random movement under AI confusion
    const valid = ALL_DIRS.filter(d => canMoveToTile(pacPos.x + DIR_VEC[d].x, pacPos.y + DIR_VEC[d].y));
    return valid[Math.floor(Math.random() * valid.length)] || "right";
  }

  // Build danger zone: tiles within 3 of any ghost
  const dangerMap = new Set<string>();
  for (const g of ghosts) {
    if (g.scared) continue;
    const gx = Math.round(g.pos.x);
    const gy = Math.round(g.pos.y);
    for (let dx = -2; dx <= 2; dx++) {
      for (let dy = -2; dy <= 2; dy++) {
        dangerMap.add(`${gx + dx},${gy + dy}`);
      }
    }
  }

  // Score each direction: prefer paths away from ghosts + toward pellets
  let bestDir: Dir = "right";
  let bestScore = -Infinity;

  for (const d of ALL_DIRS) {
    const nx = pacPos.x + DIR_VEC[d].x;
    const ny = pacPos.y + DIR_VEC[d].y;
    if (!canMoveToTile(nx, ny)) continue;

    let score = 0;

    // Distance from nearest ghost (higher = safer)
    for (const g of ghosts) {
      if (g.scared) continue;
      const dist = Math.abs(nx - Math.round(g.pos.x)) + Math.abs(ny - Math.round(g.pos.y));
      score += dist * 3;
    }

    // Avoid being in danger zone
    if (dangerMap.has(`${nx},${ny}`)) score -= 50;

    // Prefer pellets
    if (nx >= 0 && nx < COLS && ny >= 0 && ny < ROWS) {
      if (MAZE[ny][nx] === 2) score += 5;
      if (MAZE[ny][nx] === 3) score += 20;
    }

    // Prefer open paths (more exits = more escape routes)
    let exits = 0;
    for (const d2 of ALL_DIRS) {
      if (canMoveToTile(nx + DIR_VEC[d2].x, ny + DIR_VEC[d2].y)) exits++;
    }
    score += exits * 4;

    if (score > bestScore) {
      bestScore = score;
      bestDir = d;
    }
  }

  return bestDir;
}

// ═══════════════════════════════════════════════════════════
// RENDERER
// ═══════════════════════════════════════════════════════════
const PacManRenderer = () => {
  useOverlayBody();
  const { publicToken } = useParams();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [settings, setSettings] = useState<any>({
    theme: "tikup",
    ghost_count: 4,
    chaos_mode: true,
    ai_mode: true,
    base_escape_chance: 95,
    vote_interval: 1.5,
    speed_boost_duration: 3,
    shield_duration: 5,
    power_duration: 7,
    slow_pac_duration: 3,
    freeze_duration: 1.5,
    reverse_duration: 4,
    ghost_speed_duration: 5,
    swarm_duration: 8,
    slow_ghost_duration: 4,
    confusion_duration: 5,
    transparent_bg: true,
    custom_css: "",
  });

  const gameRef = useRef({
    maze: MAZE.map(r => [...r]),
    pacman: { x: 10, y: 16 } as Vec2,
    pacSubX: 10, pacSubY: 16,
    pacDir: "right" as Dir,
    pacNextDir: null as Dir | null,
    pacMouth: 0,
    pacSpeed: 0.08,
    ghosts: [] as Ghost[],
    score: 0,
    lives: 3,
    round: 1,
    roundStartTime: Date.now(),
    pelletsEaten: 0,
    startTime: Date.now(),
    particles: [] as Particle[],
    alerts: [] as Alert[],
    effects: [] as ActiveEffect[],
    escapeChance: 95,
    gameOver: false,
    roundOver: false,
    roundResult: "" as "" | "escaped" | "caught",
    roundCooldown: 0,
    connected: false,
    cellSize: 0,
    totalW: 0, totalH: 0,
    offsetX: 0, offsetY: 0,
    giftCooldown: 0,
    frameCount: 0,
    modeTimer: 0,
    ghostModePhase: 0,
    aiDecisionTimer: 0,
    gifters: {} as Record<string, GifterEntry>,
    catchCheckTimer: 0,
    pelletsLeft: 0,
    votes: { left: 0, right: 0, up: 0, down: 0 } as Record<Dir, number>,
    lastVoteProcess: Date.now(),
  });

  // ── Helpers ──────────────────────────────────────────────
  const hasEffect = useCallback((type: EffectType): boolean => {
    return gameRef.current.effects.some(e => e.type === type && Date.now() < e.end);
  }, []);

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

  // ── Init / Reset Round ──────────────────────────────────
  const initGame = useCallback(() => {
    const g = gameRef.current;
    g.maze = MAZE.map(r => [...r]);
    g.pacman = { x: 10, y: 16 };
    g.pacSubX = 10; g.pacSubY = 16;
    g.pacDir = "right"; g.pacNextDir = null;
    g.score = 0; g.lives = 3; g.round = 1;
    g.startTime = Date.now(); g.roundStartTime = Date.now();
    g.particles = []; g.alerts = []; g.effects = [];
    g.gameOver = false; g.roundOver = false; g.roundResult = "";
    g.frameCount = 0; g.ghostModePhase = 0; g.modeTimer = Date.now();
    g.escapeChance = settings.base_escape_chance || 95;
    g.gifters = {};
    g.pelletsEaten = 0;
    g.catchCheckTimer = Date.now() + 8000; // first catch check after 8s

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
        color: GHOST_COLORS[i],
        scared: false,
        baseSpeed: 0.045 + i * 0.003,
        mode: "scatter",
        isExtra: false,
        trailPositions: [],
      });
    }
  }, [settings.ghost_count, settings.base_escape_chance]);

  const resetRound = useCallback(() => {
    const g = gameRef.current;
    g.round++;
    g.roundOver = false;
    g.roundResult = "";
    g.pacSubX = 10; g.pacSubY = 16;
    g.pacman = { x: 10, y: 16 }; g.pacDir = "right";
    g.effects = [];
    g.escapeChance = settings.base_escape_chance || 95;
    g.roundStartTime = Date.now();
    g.catchCheckTimer = Date.now() + 8000;
    g.pelletsEaten = 0;
    // Reset maze pellets
    g.maze = MAZE.map(r => [...r]);
    let pellets = 0;
    for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) {
      if (g.maze[r][c] === 2 || g.maze[r][c] === 3) pellets++;
    }
    g.pelletsLeft = pellets;
    // Reset ghost positions
    const spawns: Vec2[] = [{ x: 9, y: 10 }, { x: 10, y: 10 }, { x: 11, y: 10 }, { x: 10, y: 9 }];
    g.ghosts = g.ghosts.filter(gh => !gh.isExtra);
    g.ghosts.forEach((gh, i) => {
      gh.pos = { ...spawns[i % spawns.length] };
      gh.scared = false; gh.mode = "scatter";
    });
    g.alerts.push({ text: `Round ${g.round} — ESCAPE!`, color: "160 100% 55%", time: Date.now(), icon: "🏃" });
  }, [settings.base_escape_chance]);

  // ── Calculate escape chance ─────────────────────────────
  const calcEscapeChance = useCallback((): number => {
    const g = gameRef.current;
    const base = settings.base_escape_chance || 95;
    let reduction = 0;
    const now = Date.now();
    for (const eff of g.effects) {
      if (now < eff.end) {
        reduction += eff.escapeReduction;
      }
    }
    return Math.max(5, Math.min(base, base - reduction));
  }, [settings.base_escape_chance]);

  // ── Realtime ─────────────────────────────────────────────
  useEffect(() => {
    if (!publicToken) return;
    const g = gameRef.current;

    supabase.from("overlay_widgets" as any).select("settings").eq("public_token", publicToken).maybeSingle()
      .then(({ data }) => { if (data) setSettings((p: any) => ({ ...p, ...(data as any).settings })); });

    const addEffect = (type: EffectType, durationMs: number, username: string) => {
      g.effects = g.effects.filter(e => e.type !== type);
      g.effects.push({ type, end: Date.now() + durationMs, username, escapeReduction: EFFECT_ESCAPE_REDUCTION[type] });
      g.escapeChance = calcEscapeChance();
    };

    const ch = supabase.channel(`pacman-${publicToken}`)
      .on("broadcast", { event: "chat" }, (msg) => {
        const p = msg.payload;
        if (!p) return;
        const text = (p.comment || p.text || "").toLowerCase().trim();
        // Chat can still influence direction as "chaos votes"
        if (text === "left" || text === "a") g.votes.left++;
        else if (text === "right" || text === "d") g.votes.right++;
        else if (text === "up" || text === "w") g.votes.up++;
        else if (text === "down" || text === "s") g.votes.down++;
      })
      .on("broadcast", { event: "gift" }, (msg) => {
        const p = msg.payload;
        if (!p) return;
        const coins = Number(p.coins || p.diamond_count || p.coinValue || p.coin_value || 1);
        const username = p.username || "Gifter";
        const now = Date.now();
        const cell = g.cellSize;
        const px = g.pacSubX * cell + cell / 2 + g.offsetX;
        const py = g.pacSubY * cell + cell / 2 + g.offsetY;

        if (now < g.giftCooldown) return;
        g.giftCooldown = now + 300;

        // Track gifter
        if (!g.gifters[username]) g.gifters[username] = { username, totalCoins: 0, effectsTriggered: 0 };
        g.gifters[username].totalCoins += coins;
        g.gifters[username].effectsTriggered++;

        if (g.roundOver || g.gameOver) { resetRound(); return; }

        const chaos = settings.chaos_mode !== false;

        // Gift tier → effect mapping (sabotage Pac-Man)
        if (coins <= 1 && chaos) {
          addEffect("slow_pac", (settings.slow_pac_duration || 3) * 1000, username);
          g.alerts.push({ text: `${username} slowed Pac-Man! (-10%)`, color: "200 80% 55%", time: now, icon: "🐌" });
          spawnBurst(px, py, "200 80% 55%", 8, "trail");
        } else if (coins <= 5 && chaos) {
          addEffect("freeze", (settings.freeze_duration || 1.5) * 1000, username);
          g.alerts.push({ text: `${username} froze Pac-Man! (-20%)`, color: "200 100% 75%", time: now, icon: "🧊" });
          spawnBurst(px, py, "200 100% 80%", 15, "ice");
        } else if (coins <= 20 && chaos) {
          addEffect("ghost_speed", (settings.ghost_speed_duration || 5) * 1000, username);
          g.alerts.push({ text: `${username} boosted ghosts! (-12%)`, color: "0 85% 55%", time: now, icon: "💨" });
        } else if (coins <= 50 && chaos) {
          addEffect("reverse", (settings.reverse_duration || 4) * 1000, username);
          g.alerts.push({ text: `${username} reversed controls! (-15%)`, color: "280 100% 65%", time: now, icon: "🔄" });
          spawnBurst(px, py, "280 100% 65%", 12, "star");
        } else if (coins <= 100 && chaos) {
          addEffect("ai_confusion", (settings.confusion_duration || 5) * 1000, username);
          g.alerts.push({ text: `${username} confused the AI! (-25%)`, color: "45 100% 55%", time: now, icon: "🤪" });
          spawnBurst(px, py, "45 100% 55%", 15, "star");
        } else if (coins <= 500 && chaos) {
          addEffect("ghost_swarm", (settings.swarm_duration || 8) * 1000, username);
          for (let i = 0; i < 3; i++) {
            g.ghosts.push({
              pos: { x: 9 + i, y: 10 },
              target: { ...g.pacman },
              dir: ALL_DIRS[Math.floor(Math.random() * 4)],
              color: `${Math.random() * 360} 80% 55%`,
              scared: false, baseSpeed: 0.05 + Math.random() * 0.02,
              mode: "chase", isExtra: true, trailPositions: [],
            });
          }
          g.alerts.push({ text: `${username} spawned GHOST SWARM! (-30%)`, color: "0 90% 55%", time: now, icon: "👻👻👻" });
          spawnBurst(px, py, "0 90% 55%", 25, "spark");
        } else if (coins > 500) {
          // Big supporter → help Pac-Man
          addEffect("shield", (settings.shield_duration || 5) * 1000, username);
          addEffect("speed", (settings.speed_boost_duration || 3) * 1000, username);
          g.alerts.push({ text: `${username} SAVED Pac-Man! 🛡️⚡`, color: "160 100% 55%", time: now, icon: "🌟" });
          spawnBurst(px, py, "160 100% 55%", 30, "star");
        }

        g.escapeChance = calcEscapeChance();
      })
      .on("broadcast", { event: "test_alert" }, () => {
        addEffect("freeze", 3000, "TestUser");
        g.alerts.push({ text: "Test freeze! (-20%)", color: "200 100% 75%", time: Date.now(), icon: "🧪" });
      })
      .subscribe(s => { g.connected = s === "SUBSCRIBED"; });

    const db = supabase.channel(`pacman-db-${publicToken}`)
      .on("postgres_changes" as any, { event: "UPDATE", schema: "public", table: "overlay_widgets", filter: `public_token=eq.${publicToken}` },
        (p: any) => { if (p.new?.settings) setSettings((prev: any) => ({ ...prev, ...p.new.settings })); })
      .subscribe();

    return () => { supabase.removeChannel(ch); supabase.removeChannel(db); };
  }, [publicToken, initGame, spawnBurst, resetRound, calcEscapeChance, settings]);

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

    const ghostPickDir = (ghost: Ghost): Dir => {
      const gx = Math.round(ghost.pos.x);
      const gy = Math.round(ghost.pos.y);
      const valid = ALL_DIRS.filter(d => {
        if (d === OPPOSITE[ghost.dir]) return false;
        const nx = gx + DIR_VEC[d].x;
        const ny = gy + DIR_VEC[d].y;
        return canMoveToTile(nx, ny);
      });
      if (valid.length === 0) return ghost.dir;
      if (ghost.mode === "frightened") return valid[Math.floor(Math.random() * valid.length)];
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
      if (dt < 16) return;
      lastFrame = time;

      const g = gameRef.current;
      const cell = g.cellSize;
      if (cell === 0) return;
      const theme = THEMES[settings.theme] || THEMES.tikup;
      const now = Date.now();
      g.frameCount++;

      // Clean expired effects
      g.effects = g.effects.filter(e => now < e.end);
      if (!g.effects.some(e => e.type === "ghost_swarm")) {
        g.ghosts = g.ghosts.filter(gh => !gh.isExtra);
      }
      if (!g.effects.some(e => e.type === "power")) {
        g.ghosts.forEach(gh => { if (gh.scared) { gh.scared = false; gh.mode = "chase"; } });
      }

      g.escapeChance = Math.max(5, (settings.base_escape_chance || 95) - g.effects.reduce((sum, e) => sum + (now < e.end ? e.escapeReduction : 0), 0));

      const isFrozen = g.effects.some(e => e.type === "freeze");
      const isSlowed = g.effects.some(e => e.type === "slow_pac");
      const isSpeedy = g.effects.some(e => e.type === "speed");
      const isShielded = g.effects.some(e => e.type === "shield");
      const isConfused = g.effects.some(e => e.type === "ai_confusion");
      const ghostSpeedUp = g.effects.some(e => e.type === "ghost_speed");
      const ghostSlowed = g.effects.some(e => e.type === "slow_ghosts");
      const isReversed = g.effects.some(e => e.type === "reverse");

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

      // ══════════════════════════════════════════════════════
      // AI PAC-MAN MOVEMENT
      // ══════════════════════════════════════════════════════
      if (!g.gameOver && !g.roundOver && !isFrozen) {
        let speed = g.pacSpeed;
        if (isSlowed) speed *= 0.4;
        if (isSpeedy) speed *= 1.8;

        // AI decision every 6 frames (~100ms)
        const atGridX = Math.abs(g.pacSubX - Math.round(g.pacSubX)) < 0.05;
        const atGridY = Math.abs(g.pacSubY - Math.round(g.pacSubY)) < 0.05;

        if (atGridX && atGridY) {
          g.pacSubX = Math.round(g.pacSubX);
          g.pacSubY = Math.round(g.pacSubY);

          if (settings.ai_mode !== false) {
            // AI picks safest direction
            let aiDir = aiPickSafeDir(g.pacman, g.ghosts, isConfused);

            // Apply reverse if active
            if (isReversed) aiDir = OPPOSITE[aiDir];

            // Chat chaos override: if votes exist, 30% chance to override AI
            const totalVotes = g.votes.left + g.votes.right + g.votes.up + g.votes.down;
            if (totalVotes > 3 && Math.random() < 0.3) {
              let maxVote = 0;
              let voteDir: Dir = aiDir;
              (["left", "right", "up", "down"] as Dir[]).forEach(d => {
                if (g.votes[d] > maxVote) { maxVote = g.votes[d]; voteDir = d; }
              });
              if (canMoveToTile(g.pacman.x + DIR_VEC[voteDir].x, g.pacman.y + DIR_VEC[voteDir].y)) {
                aiDir = voteDir;
              }
            }

            if (canMoveToTile(g.pacman.x + DIR_VEC[aiDir].x, g.pacman.y + DIR_VEC[aiDir].y)) {
              g.pacDir = aiDir;
            }
          }

          // Reset votes periodically
          if (now - g.lastVoteProcess > (settings.vote_interval || 1.5) * 1000) {
            g.votes = { left: 0, right: 0, up: 0, down: 0 };
            g.lastVoteProcess = now;
          }
        }

        // Move Pac-Man
        const vx = DIR_VEC[g.pacDir].x * speed;
        const vy = DIR_VEC[g.pacDir].y * speed;
        let newX = g.pacSubX + vx;
        let newY = g.pacSubY + vy;

        if (Math.round(newY) === 10) {
          if (newX < -0.5) newX = COLS - 0.5;
          if (newX > COLS - 0.5) newX = -0.5;
        }

        const checkX = vx > 0 ? Math.ceil(newX) : Math.floor(newX);
        const checkY = vy > 0 ? Math.ceil(newY) : Math.floor(newY);

        if (canMoveToTile(checkX, checkY) || (Math.round(newY) === 10 && (newX < 0 || newX >= COLS))) {
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
            g.pelletsEaten++;
            g.pelletsLeft--;
          }
          if (g.maze[my][mx] === 3) {
            g.maze[my][mx] = 0;
            g.score += 50;
            g.pelletsEaten++;
            g.pelletsLeft--;
            g.effects = g.effects.filter(e => e.type !== "power");
            g.effects.push({ type: "power", end: now + 7000, username: "pellet", escapeReduction: 0 });
            g.ghosts.forEach(gh => { gh.scared = true; gh.mode = "frightened"; });
            const px = g.pacSubX * cell + cell / 2 + g.offsetX;
            const py = g.pacSubY * cell + cell / 2 + g.offsetY;
            spawnBurst(px, py, "280 100% 65%", 15, "star");
          }
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

      // ══════════════════════════════════════════════════════
      // PROBABILITY CATCH CHECK (every 3s after initial 8s)
      // ══════════════════════════════════════════════════════
      if (!g.gameOver && !g.roundOver && now > g.catchCheckTimer) {
        g.catchCheckTimer = now + 3000;

        // Check proximity to any ghost
        let nearestGhostDist = Infinity;
        for (const ghost of g.ghosts) {
          if (ghost.scared) continue;
          const dist = Math.hypot(ghost.pos.x - g.pacSubX, ghost.pos.y - g.pacSubY);
          if (dist < nearestGhostDist) nearestGhostDist = dist;
        }

        // Only roll probability if a ghost is reasonably close
        if (nearestGhostDist < 6) {
          const roll = Math.random() * 100;
          const escaped = roll < g.escapeChance;

          if (!escaped && !isShielded) {
            // CAUGHT! Dramatic moment
            g.roundOver = true;
            g.roundResult = "caught";
            g.lives--;
            g.roundCooldown = now + 5000;

            // Top gifter (sabotager)
            const topGifter = Object.values(g.gifters).sort((a, b) => b.totalCoins - a.totalCoins)[0];
            const topName = topGifter ? topGifter.username : "the ghosts";

            g.alerts.push({
              text: `CAUGHT! ${topName} wins! 💀`,
              color: "350 90% 55%", time: now, icon: "💀"
            });

            const px = g.pacSubX * cell + cell / 2 + g.offsetX;
            const py = g.pacSubY * cell + cell / 2 + g.offsetY;
            spawnBurst(px, py, "350 90% 55%", 30, "spark");

            if (g.lives <= 0) {
              g.gameOver = true;
            }
          }
        }

        // Escape after surviving 30+ seconds with pellets eaten
        const roundTime = (now - g.roundStartTime) / 1000;
        if (roundTime > 30 && g.pelletsEaten > 20 && !g.roundOver) {
          const roll = Math.random() * 100;
          if (roll < g.escapeChance) {
            g.roundOver = true;
            g.roundResult = "escaped";
            g.roundCooldown = now + 4000;
            g.score += 500;
            g.alerts.push({ text: `PAC-MAN ESCAPED! +500 🏃`, color: "160 100% 55%", time: now, icon: "🎉" });
            const px = g.pacSubX * cell + cell / 2 + g.offsetX;
            const py = g.pacSubY * cell + cell / 2 + g.offsetY;
            spawnBurst(px, py, "160 100% 55%", 30, "star");
          }
        }
      }

      // Auto-restart round after cooldown
      if (g.roundOver && !g.gameOver && now > g.roundCooldown) {
        resetRound();
      }

      // ── Move Ghosts ────────────────
      if (!g.gameOver && !g.roundOver) {
        for (const ghost of g.ghosts) {
          if (ghost.mode === "chase" && !ghost.scared) {
            const idx = g.ghosts.indexOf(ghost) % 4;
            if (idx === 0) ghost.target = { ...g.pacman };
            else if (idx === 1) ghost.target = { x: g.pacman.x + DIR_VEC[g.pacDir].x * 4, y: g.pacman.y + DIR_VEC[g.pacDir].y * 4 };
            else if (idx === 2) {
              const blinky = g.ghosts[0];
              const ahead = { x: g.pacman.x + DIR_VEC[g.pacDir].x * 2, y: g.pacman.y + DIR_VEC[g.pacDir].y * 2 };
              ghost.target = { x: ahead.x + (ahead.x - blinky.pos.x), y: ahead.y + (ahead.y - blinky.pos.y) };
            } else {
              const dist = Math.abs(ghost.pos.x - g.pacman.x) + Math.abs(ghost.pos.y - g.pacman.y);
              ghost.target = dist > 8 ? { ...g.pacman } : { ...SCATTER_TARGETS[3] };
            }
          }

          let ghostSpeed = ghost.baseSpeed;
          if (ghost.scared) ghostSpeed *= 0.5;
          if (ghostSpeedUp) ghostSpeed *= 1.6;
          if (ghostSlowed) ghostSpeed *= 0.35;

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

          if (Math.round(gny) === 10) {
            if (gnx < -1) gnx = COLS;
            if (gnx > COLS) gnx = -1;
          }

          const gcx = nvx > 0 ? Math.ceil(gnx) : Math.floor(gnx);
          const gcy = nvy > 0 ? Math.ceil(gny) : Math.floor(gny);
          if (canMoveToTile(gcx, gcy) || (Math.round(gny) === 10 && (gnx < 0 || gnx >= COLS))) {
            ghost.pos.x = gnx;
            ghost.pos.y = gny;
          } else {
            ghost.dir = ghostPickDir(ghost);
          }

          ghost.trailPositions.push({ ...ghost.pos });
          if (ghost.trailPositions.length > 6) ghost.trailPositions.shift();

          // Direct collision (eat scared ghosts, or shield absorb)
          const dist = Math.hypot(ghost.pos.x - g.pacSubX, ghost.pos.y - g.pacSubY);
          if (dist < 0.7) {
            if (ghost.scared) {
              ghost.pos = { x: 10, y: 10 };
              ghost.scared = false; ghost.mode = "chase";
              g.score += 200;
              g.alerts.push({ text: "Ghost eaten! +200", color: "280 100% 65%", time: now, icon: "👻" });
            } else if (isShielded) {
              ghost.pos = { x: 10, y: 10 };
              g.alerts.push({ text: "Shield absorbed hit!", color: "200 100% 60%", time: now, icon: "🛡️" });
            }
          }
        }
      }

      // ── Update particles ───────────
      g.particles = g.particles.filter(p => {
        p.x += p.vx; p.y += p.vy;
        if (p.type === "ice") p.vy -= 0.01;
        p.life -= 0.015;
        return p.life > 0;
      });
      g.alerts = g.alerts.filter(a => now - a.time < 4000);

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

      // ── Maze ───────────────────────
      for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS; c++) {
          const tile = MAZE[r][c];
          const px = c * cell;
          const py = r * cell;
          if (tile === 1) {
            ctx.fillStyle = `hsl(${theme.wall} / 0.25)`;
            ctx.fillRect(px, py, cell, cell);
            ctx.strokeStyle = `hsl(${theme.wallGlow} / 0.6)`;
            ctx.lineWidth = 1.5;
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
        const gc = ghost.scared ? "230 80% 60%" : ghost.color;
        ghost.trailPositions.forEach((tp, ti) => {
          const alpha = (ti / ghost.trailPositions.length) * 0.15;
          ctx.fillStyle = `hsl(${gc} / ${alpha})`;
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

      // Slow trail
      if (isSlowed && g.frameCount % 2 === 0) {
        ctx.globalAlpha = 0.15;
        ctx.fillStyle = "hsl(200 80% 55%)";
        ctx.beginPath();
        ctx.arc(ppx - DIR_VEC[g.pacDir].x * cell * 0.2, ppy - DIR_VEC[g.pacDir].y * cell * 0.2, pRadius * 0.9, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
      }

      // Freeze visual
      if (isFrozen) {
        ctx.strokeStyle = "hsl(200 100% 85% / 0.6)";
        ctx.lineWidth = 3;
        ctx.shadowColor = "hsl(200 100% 80%)";
        ctx.shadowBlur = 15;
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

      // Confusion visual (glitch effect)
      if (isConfused) {
        ctx.strokeStyle = "hsl(45 100% 55% / 0.4)";
        ctx.lineWidth = 2;
        for (let i = 0; i < 3; i++) {
          const ox = (Math.random() - 0.5) * cell * 0.4;
          const oy = (Math.random() - 0.5) * cell * 0.4;
          ctx.beginPath();
          ctx.arc(ppx + ox, ppy + oy, pRadius * 0.5, 0, Math.PI * 2);
          ctx.stroke();
        }
        ctx.font = `bold ${cell * 0.3}px system-ui`;
        ctx.fillStyle = "hsl(45 100% 55%)";
        ctx.textAlign = "center";
        ctx.fillText("?!", ppx, ppy - pRadius - 8);
        ctx.textAlign = "start";
      }

      // Pac-Man body
      const isPowered = g.effects.some(e => e.type === "power");
      const pacColor = isFrozen ? "200 100% 75%"
        : isPowered ? "280 100% 65%"
        : isShielded ? "200 100% 60%"
        : isConfused ? "45 100% 55%"
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
      ctx.fillStyle = isFrozen ? "hsl(200 100% 95%)" : "hsl(0 0% 10%)";
      ctx.beginPath();
      ctx.arc(ppx + Math.cos(eyeAngle) * pRadius * 0.45, ppy + Math.sin(eyeAngle) * pRadius * 0.45, pRadius * 0.12, 0, Math.PI * 2);
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
        ctx.shadowBlur = 0;
      }

      // Reverse indicator
      if (isReversed) {
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

        if (ghostSpeedUp && !ghost.scared) {
          ctx.shadowColor = "hsl(0 100% 50%)";
          ctx.shadowBlur = 18;
        } else {
          ctx.shadowColor = `hsl(${ghostColor})`;
          ctx.shadowBlur = ghost.scared ? 6 : 12;
        }

        ctx.fillStyle = `hsl(${ghostColor})`;
        ctx.beginPath();
        ctx.arc(gx, gy - gr * 0.15, gr, Math.PI, 0);
        ctx.lineTo(gx + gr, gy + gr * 0.55);
        for (let w = 0; w < 4; w++) {
          const wx = gx + gr - (w + 1) * (gr * 2 / 4);
          const waveY = gy + gr * (0.3 + Math.sin(time / 120 + w * 1.5) * 0.15);
          ctx.quadraticCurveTo(wx + gr / 4, waveY, wx, gy + gr * 0.55);
        }
        ctx.closePath();
        ctx.fill();
        ctx.shadowBlur = 0;

        if (!ghost.scared) {
          ctx.fillStyle = "white";
          ctx.beginPath();
          ctx.ellipse(gx - gr * 0.25, gy - gr * 0.2, gr * 0.18, gr * 0.22, 0, 0, Math.PI * 2);
          ctx.ellipse(gx + gr * 0.25, gy - gr * 0.2, gr * 0.18, gr * 0.22, 0, 0, Math.PI * 2);
          ctx.fill();
          const lookX = Math.sign(ghost.target.x - ghost.pos.x) * gr * 0.06;
          const lookY = Math.sign(ghost.target.y - ghost.pos.y) * gr * 0.06;
          ctx.fillStyle = "hsl(230 90% 15%)";
          ctx.beginPath();
          ctx.arc(gx - gr * 0.25 + lookX, gy - gr * 0.2 + lookY, gr * 0.1, 0, Math.PI * 2);
          ctx.arc(gx + gr * 0.25 + lookX, gy - gr * 0.2 + lookY, gr * 0.1, 0, Math.PI * 2);
          ctx.fill();
        } else {
          ctx.fillStyle = "white";
          ctx.beginPath();
          ctx.arc(gx - gr * 0.2, gy - gr * 0.15, gr * 0.08, 0, Math.PI * 2);
          ctx.arc(gx + gr * 0.2, gy - gr * 0.15, gr * 0.08, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = "white";
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.moveTo(gx - gr * 0.25, gy + gr * 0.15);
          for (let w = 0; w < 4; w++) ctx.lineTo(gx - gr * 0.25 + (w + 0.5) * gr * 0.125, gy + gr * (0.1 + (w % 2) * 0.1));
          ctx.stroke();
        }

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
            ctx.lineTo((p.x - g.offsetX) + Math.cos(a) * sz, (p.y - g.offsetY) + Math.sin(a) * sz);
            ctx.lineTo((p.x - g.offsetX) + Math.cos(a + Math.PI / 5) * sz * 0.4, (p.y - g.offsetY) + Math.sin(a + Math.PI / 5) * sz * 0.4);
          }
          ctx.closePath();
          ctx.fill();
          ctx.shadowBlur = 0;
        } else if (p.type === "ice") {
          ctx.fillStyle = `hsl(${p.color} / ${alpha * 0.8})`;
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
      ctx.restore();

      // ═══════════════════════════════════════════════════════
      // HUD
      // ═══════════════════════════════════════════════════════
      const hudH = Math.max(cell * 2.2, 50);
      const grad = ctx.createLinearGradient(0, 0, 0, hudH);
      grad.addColorStop(0, "rgba(0,0,0,0.8)");
      grad.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, W, hudH);

      const fontSize = Math.max(cell * 0.4, 12);
      ctx.textBaseline = "middle";

      // Score
      ctx.fillStyle = "hsl(0 0% 55%)";
      ctx.font = `bold ${fontSize * 0.8}px system-ui`;
      ctx.fillText("SCORE", g.offsetX + 8, hudH * 0.25);
      ctx.fillStyle = `hsl(${theme.glow})`;
      ctx.font = `bold ${fontSize * 1.2}px "SF Mono", monospace, system-ui`;
      ctx.fillText(`${g.score.toLocaleString()}`, g.offsetX + 8, hudH * 0.52);

      // Round
      ctx.fillStyle = "hsl(0 0% 55%)";
      ctx.font = `bold ${fontSize * 0.8}px system-ui`;
      ctx.fillText(`ROUND ${g.round}`, g.offsetX + cell * 5, hudH * 0.25);

      // Lives
      ctx.fillStyle = "hsl(350 90% 55%)";
      const livesX = W / 2;
      ctx.textAlign = "center";
      for (let i = 0; i < g.lives; i++) {
        ctx.beginPath();
        const lx = livesX + (i - g.lives / 2) * (fontSize * 1.2);
        ctx.arc(lx - fontSize * 0.15, hudH * 0.4 - fontSize * 0.1, fontSize * 0.2, Math.PI, 0);
        ctx.arc(lx + fontSize * 0.15, hudH * 0.4 - fontSize * 0.1, fontSize * 0.2, Math.PI, 0);
        ctx.lineTo(lx, hudH * 0.4 + fontSize * 0.25);
        ctx.closePath();
        ctx.fill();
      }
      ctx.textAlign = "start";

      // ── ESCAPE CHANCE (the key visual) ─────
      const ecX = W - g.offsetX - 8;
      const ecW = Math.max(cell * 5, 100);
      const barX = ecX - ecW;
      const barY = hudH * 0.15;
      const barH = hudH * 0.3;

      ctx.fillStyle = "hsl(0 0% 55%)";
      ctx.font = `bold ${fontSize * 0.7}px system-ui`;
      ctx.textAlign = "right";
      ctx.fillText("ESCAPE CHANCE", ecX, barY - 2);

      // Bar background
      ctx.fillStyle = "hsl(0 0% 10% / 0.6)";
      ctx.beginPath();
      ctx.roundRect(barX, barY + 2, ecW, barH, 4);
      ctx.fill();

      // Bar fill — color shifts from green to red
      const escPct = g.escapeChance / 100;
      const escHue = escPct > 0.5 ? 120 + (escPct - 0.5) * 80 : escPct * 240;
      ctx.fillStyle = `hsl(${escHue} 80% 50%)`;
      ctx.shadowColor = `hsl(${escHue} 80% 50%)`;
      ctx.shadowBlur = 8;
      ctx.beginPath();
      ctx.roundRect(barX, barY + 2, ecW * escPct, barH, 4);
      ctx.fill();
      ctx.shadowBlur = 0;

      // Percentage text
      ctx.fillStyle = "white";
      ctx.font = `bold ${barH * 0.75}px "SF Mono", monospace, system-ui`;
      ctx.fillText(`${Math.round(g.escapeChance)}%`, ecX - 4, barY + barH * 0.6 + 2);
      ctx.textAlign = "start";

      // Active effects
      const activeEffects = g.effects.filter(e => now < e.end && e.escapeReduction > 0);
      if (activeEffects.length > 0) {
        ctx.textAlign = "right";
        ctx.font = `bold ${fontSize * 0.65}px system-ui`;
        activeEffects.forEach((eff, i) => {
          const remaining = Math.ceil((eff.end - now) / 1000);
          const labels: Record<string, { icon: string; color: string; label: string }> = {
            freeze: { icon: "🧊", color: "200 100% 80%", label: "FROZEN" },
            slow_pac: { icon: "🐌", color: "200 80% 55%", label: "SLOWED" },
            reverse: { icon: "🔄", color: "280 100% 65%", label: "REVERSED" },
            ai_confusion: { icon: "🤪", color: "45 100% 55%", label: "CONFUSED" },
            ghost_swarm: { icon: "👻", color: "0 90% 55%", label: "SWARM" },
            ghost_speed: { icon: "💨", color: "0 85% 55%", label: "FAST GHOSTS" },
          };
          const info = labels[eff.type];
          if (!info) return;
          const ey = hudH * 0.65 + i * (fontSize * 1);
          ctx.fillStyle = `hsl(${info.color} / 0.8)`;
          ctx.fillText(`${info.icon} ${info.label} -${eff.escapeReduction}% (${remaining}s)`, ecX, ey);
        });
      }

      // Positive effects
      const positiveEffects = g.effects.filter(e => now < e.end && e.escapeReduction === 0);
      if (positiveEffects.length > 0) {
        ctx.textAlign = "left";
        ctx.font = `bold ${fontSize * 0.65}px system-ui`;
        positiveEffects.forEach((eff, i) => {
          const remaining = Math.ceil((eff.end - now) / 1000);
          const labels: Record<string, { icon: string; color: string; label: string }> = {
            shield: { icon: "🛡️", color: "200 100% 60%", label: "SHIELD" },
            power: { icon: "👻", color: "280 100% 65%", label: "POWER" },
            speed: { icon: "⚡", color: "45 100% 55%", label: "SPEED" },
            slow_ghosts: { icon: "🐌", color: "160 100% 55%", label: "SLOW GHOSTS" },
          };
          const info = labels[eff.type];
          if (!info) return;
          const ey = hudH * 0.65 + i * (fontSize * 1);
          ctx.fillStyle = `hsl(${info.color} / 0.8)`;
          ctx.fillText(`${info.icon} ${info.label} (${remaining}s)`, g.offsetX + 8, ey);
        });
      }
      ctx.textAlign = "start";

      // ── Top Gifters (bottom-left) ──
      const gifterList = Object.values(g.gifters).sort((a, b) => b.totalCoins - a.totalCoins).slice(0, 3);
      if (gifterList.length > 0) {
        const gY = H - cell * 3;
        ctx.fillStyle = "hsl(0 0% 40%)";
        ctx.font = `bold ${fontSize * 0.65}px system-ui`;
        ctx.fillText("TOP SABOTAGERS", g.offsetX + 8, gY);
        gifterList.forEach((gf, i) => {
          const yy = gY + (i + 1) * (fontSize * 1.1);
          const medal = i === 0 ? "🥇" : i === 1 ? "🥈" : "🥉";
          ctx.fillStyle = i === 0 ? "hsl(45 100% 55%)" : "hsl(0 0% 60%)";
          ctx.fillText(`${medal} ${gf.username} (${gf.totalCoins} coins)`, g.offsetX + 8, yy);
        });
      }

      // ── Alerts ─────────────────────
      ctx.textAlign = "center";
      g.alerts.forEach((a, i) => {
        const age = (now - a.time) / 4000;
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

      // ── Round Over screen ──────────
      if (g.roundOver && !g.gameOver) {
        ctx.fillStyle = "rgba(0,0,0,0.6)";
        ctx.fillRect(0, 0, W, H);
        ctx.textAlign = "center";
        const isEscaped = g.roundResult === "escaped";

        ctx.font = `bold ${Math.max(cell * 1.3, 36)}px system-ui`;
        ctx.fillStyle = isEscaped ? "hsl(160 100% 55%)" : "hsl(350 90% 60%)";
        ctx.shadowColor = ctx.fillStyle;
        ctx.shadowBlur = 30;
        ctx.fillText(isEscaped ? "ESCAPED! 🏃" : "CAUGHT! 💀", W / 2, H * 0.4);
        ctx.shadowBlur = 0;

        ctx.font = `bold ${Math.max(cell * 0.5, 14)}px system-ui`;
        ctx.fillStyle = "white";
        ctx.fillText(`Escape chance was ${Math.round(g.escapeChance)}%`, W / 2, H * 0.5);

        if (!isEscaped) {
          const topGifter = Object.values(g.gifters).sort((a, b) => b.totalCoins - a.totalCoins)[0];
          if (topGifter) {
            ctx.fillStyle = "hsl(45 100% 55%)";
            ctx.font = `bold ${Math.max(cell * 0.6, 16)}px system-ui`;
            ctx.fillText(`👑 ${topGifter.username} — Top Sabotager!`, W / 2, H * 0.58);
          }
        }

        ctx.fillStyle = "hsl(0 0% 45%)";
        ctx.font = `${Math.max(cell * 0.35, 11)}px system-ui`;
        ctx.fillText("Next round starting...", W / 2, H * 0.67);
        ctx.textAlign = "start";
      }

      // ── Game Over ──────────────────
      if (g.gameOver) {
        ctx.fillStyle = "rgba(0,0,0,0.8)";
        ctx.fillRect(0, 0, W, H);
        ctx.textAlign = "center";
        const glitch = Math.sin(time / 50) * 2;

        ctx.font = `bold ${Math.max(cell * 1.5, 40)}px system-ui`;
        ctx.fillStyle = "hsl(350 90% 60%)";
        ctx.shadowColor = "hsl(350 90% 60%)";
        ctx.shadowBlur = 30;
        ctx.fillText("GAME OVER", W / 2 + glitch, H * 0.33);
        ctx.fillStyle = "hsl(180 100% 50% / 0.3)";
        ctx.fillText("GAME OVER", W / 2 - glitch, H * 0.33 + 2);
        ctx.shadowBlur = 0;

        ctx.font = `bold ${Math.max(cell * 0.7, 18)}px system-ui`;
        ctx.fillStyle = "white";
        ctx.fillText(`Final Score: ${g.score.toLocaleString()} • Round ${g.round}`, W / 2, H * 0.45);

        // Leaderboard
        const topGifters = Object.values(g.gifters).sort((a, b) => b.totalCoins - a.totalCoins).slice(0, 5);
        if (topGifters.length > 0) {
          ctx.fillStyle = "hsl(45 100% 55%)";
          ctx.font = `bold ${Math.max(cell * 0.5, 14)}px system-ui`;
          ctx.fillText("🏆 TOP SABOTAGERS", W / 2, H * 0.54);
          topGifters.forEach((gf, i) => {
            ctx.fillStyle = i === 0 ? "hsl(45 100% 60%)" : "hsl(0 0% 60%)";
            ctx.font = `${Math.max(cell * 0.4, 12)}px system-ui`;
            const medal = i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `#${i + 1}`;
            ctx.fillText(`${medal} ${gf.username} — ${gf.totalCoins} coins (${gf.effectsTriggered} effects)`, W / 2, H * 0.60 + i * (cell * 0.6));
          });
        }

        ctx.fillStyle = `hsl(${theme.glow} / ${0.4 + Math.sin(time / 300) * 0.2})`;
        ctx.font = `bold ${Math.max(cell * 0.35, 11)}px system-ui`;
        ctx.fillText("Send a gift to restart!", W / 2, H * 0.82);
        ctx.textAlign = "start";
      }

      // Connection dot
      ctx.fillStyle = g.connected ? "hsl(160 100% 45%)" : "hsl(0 80% 55%)";
      ctx.beginPath();
      ctx.arc(W - 12, 12, 4, 0, Math.PI * 2);
      ctx.fill();
    };

    animId = requestAnimationFrame(loop);
    return () => { cancelAnimationFrame(animId); window.removeEventListener("resize", resize); };
  }, [settings, spawnBurst, resetRound]);

  return (
    <div className="w-screen h-screen bg-transparent overflow-hidden">
      <canvas ref={canvasRef} className="block" />
      
    </div>
  );
};

export default PacManRenderer;
