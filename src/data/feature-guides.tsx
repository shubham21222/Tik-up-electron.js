import { ReactNode } from "react";
import {
  Sparkles, Eye, Palette, Volume2, Rocket, Target, Shield,
  MessageCircle, Gift, Heart, Users, BarChart3, Timer,
  Trophy, Terminal, Keyboard, Share2, Layers, Activity, Coins
} from "lucide-react";
import type { GuideStep } from "@/components/FeatureGuideModal";

interface FeatureGuide {
  title: string;
  steps: GuideStep[];
}

/* ─── Simple visual helpers ─── */
const EmojiVisual = ({ emoji, size = "text-5xl" }: { emoji: string; size?: string }) => (
  <div className="flex items-center justify-center h-full">
    <span className={size}>{emoji}</span>
  </div>
);

const IconGlowVisual = ({ icon: Icon, color }: { icon: typeof Gift; color: string }) => (
  <div className="flex items-center justify-center h-full">
    <div className="w-16 h-16 rounded-2xl flex items-center justify-center"
      style={{ background: `${color}20`, boxShadow: `0 0 30px ${color}30` }}>
      <Icon size={32} style={{ color }} />
    </div>
  </div>
);

export const featureGuides: Record<string, FeatureGuide> = {
  /* ─── Live Controls ─── */
  gift_alerts: {
    title: "Gift Alerts",
    steps: [
      {
        icon: <Gift size={20} />, title: "What are Gift Alerts?",
        subtitle: "Animated alerts that appear on your stream when viewers send gifts",
        bullets: ["Each gift triggers a unique animation", "Choose from 11+ animation styles", "Works in OBS & TikTok Live Studio"],
        visual: <EmojiVisual emoji="🎁" />,
      },
      {
        icon: <Eye size={20} />, title: "Enable Your Alerts",
        subtitle: "Toggle alerts ON to make them appear live on stream",
        bullets: ["Browse gifts by coin value", "Enable/disable individual gifts", "Set custom animations per gift"],
        visual: <IconGlowVisual icon={Gift} color="hsl(280 100% 65%)" />,
      },
      {
        icon: <Rocket size={20} />, title: "Copy & Go Live!",
        subtitle: "Paste the overlay URL into OBS as a Browser Source",
        bullets: ["Copy the URL at the bottom of the page", "Add as Browser Source in OBS", "Set size to 1920×1080", "Alerts will trigger automatically!"],
        visual: <EmojiVisual emoji="🚀" />,
      },
    ],
  },

  chat_overlay: {
    title: "Chat Overlay",
    steps: [
      {
        icon: <MessageCircle size={20} />, title: "Live Chat on Stream",
        subtitle: "Show your TikTok chat directly on your stream overlay",
        bullets: ["Real-time chat messages appear on screen", "Customize colors, font size & position", "Auto-filters spam and banned words"],
        visual: <EmojiVisual emoji="💬" />,
      },
      {
        icon: <Palette size={20} />, title: "Customize the Look",
        subtitle: "Make the chat match your stream's vibe",
        bullets: ["Change background opacity", "Adjust text size and colors", "Choose animation style for new messages"],
        visual: <IconGlowVisual icon={MessageCircle} color="hsl(200 100% 55%)" />,
      },
      {
        icon: <Rocket size={20} />, title: "Add to OBS",
        subtitle: "One link, and your chat is live on screen",
        bullets: ["Copy the overlay URL", "Add as Browser Source in OBS", "Recommended size: 400×600"],
        visual: <EmojiVisual emoji="🚀" />,
      },
    ],
  },

  viewer_count: {
    title: "Viewer Count",
    steps: [
      {
        icon: <Users size={20} />, title: "Show Your Viewer Count",
        subtitle: "Display real-time viewer numbers on your stream",
        bullets: ["Updates automatically every few seconds", "Multiple display styles available", "Minimal & clean design"],
        visual: <EmojiVisual emoji="👥" />,
      },
      {
        icon: <Rocket size={20} />, title: "Add to OBS",
        subtitle: "Paste the URL as a Browser Source",
        bullets: ["Copy the overlay URL", "Recommended size: 300×100", "Position anywhere on your stream"],
        visual: <EmojiVisual emoji="🚀" />,
      },
    ],
  },

  like_counter: {
    title: "Like / Follower Counter",
    steps: [
      {
        icon: <BarChart3 size={20} />, title: "Track Likes & Followers",
        subtitle: "Show live counts of likes and followers on stream",
        bullets: ["Real-time like counter", "Follower count display", "Multiple visual styles"],
        visual: <EmojiVisual emoji="❤️" />,
      },
      {
        icon: <Rocket size={20} />, title: "Add to OBS",
        subtitle: "Copy the URL and add as Browser Source",
        bullets: ["Works in OBS & TikTok Live Studio", "Recommended size: 400×150", "Updates in real-time"],
        visual: <EmojiVisual emoji="🚀" />,
      },
    ],
  },

  stream_timer: {
    title: "Stream Timer",
    steps: [
      {
        icon: <Timer size={20} />, title: "Stream Timer Overlay",
        subtitle: "Add a live countdown or elapsed timer to your stream",
        bullets: ["Countdown or count-up modes", "Digital or segmented display styles", "Customizable colors and size"],
        visual: <EmojiVisual emoji="⏱️" />,
      },
      {
        icon: <Rocket size={20} />, title: "Add to OBS",
        subtitle: "Copy the URL and add as Browser Source",
        bullets: ["Copy the overlay URL", "Recommended size: 300×100", "Timer syncs across all viewers"],
        visual: <EmojiVisual emoji="🚀" />,
      },
    ],
  },

  stream_presets: {
    title: "Stream Themes",
    steps: [
      {
        icon: <Sparkles size={20} />, title: "Pick Your Vibe",
        subtitle: "Ready-made stream themes with matching overlays and colors",
        bullets: ["One-click theme activation", "Matching alert styles included", "Customize any preset to your brand"],
        visual: <EmojiVisual emoji="🎨" />,
      },
      {
        icon: <Rocket size={20} />, title: "Apply & Go Live",
        subtitle: "Select a theme and all your overlays update instantly",
        bullets: ["Changes apply to all active overlays", "Preview before applying", "Switch themes any time"],
        visual: <EmojiVisual emoji="✨" />,
      },
    ],
  },

  /* ─── Engagement ─── */
  sounds: {
    title: "Spotify Connect",
    steps: [
      {
        icon: <Volume2 size={20} />, title: "Music on Stream",
        subtitle: "Show what song is currently playing on your stream",
        bullets: ["Display current track info", "Album art overlay", "Auto-updates when songs change"],
        visual: <EmojiVisual emoji="🎵" />,
      },
      {
        icon: <Rocket size={20} />, title: "Connect & Display",
        subtitle: "Link your Spotify and the overlay handles the rest",
        bullets: ["Copy the overlay URL", "Add as Browser Source in OBS", "Music info appears automatically"],
        visual: <EmojiVisual emoji="🚀" />,
      },
    ],
  },

  overlays: {
    title: "Effects Browser",
    steps: [
      {
        icon: <Layers size={20} />, title: "All Your Overlays",
        subtitle: "Browse every overlay and effect available for your stream",
        bullets: ["18+ overlay types", "Alerts, widgets, interactive elements", "Each gets a unique URL for OBS"],
        visual: <EmojiVisual emoji="🎭" />,
      },
      {
        icon: <Eye size={20} />, title: "Preview & Configure",
        subtitle: "See live previews and customize settings for each overlay",
        bullets: ["Animated preview cards", "One-click URL copy", "Detailed settings per overlay"],
        visual: <IconGlowVisual icon={Layers} color="hsl(160 100% 45%)" />,
      },
    ],
  },

  recent_activity: {
    title: "Live Feed",
    steps: [
      {
        icon: <Activity size={20} />, title: "Event Feed",
        subtitle: "Real-time feed of everything happening on your stream",
        bullets: ["See likes, gifts, follows & shares live", "Filter by event type", "Add as OBS overlay"],
        visual: <EmojiVisual emoji="📡" />,
      },
      {
        icon: <Rocket size={20} />, title: "Use as Overlay",
        subtitle: "Copy the feed URL and add to OBS as a Browser Source",
        bullets: ["Works in OBS & TikTok Live Studio", "Shows events in real-time", "Fully customizable filters"],
        visual: <EmojiVisual emoji="🚀" />,
      },
    ],
  },

  /* ─── Growth & Goals ─── */
  goal_overlays: {
    title: "Stream Goals",
    steps: [
      {
        icon: <Target size={20} />, title: "Set Stream Goals",
        subtitle: "Create live goals that update in real-time on your stream",
        bullets: ["Follower, like, gift & custom goals", "Animated progress bars", "Celebration effects on completion"],
        visual: <EmojiVisual emoji="🎯" />,
      },
      {
        icon: <Eye size={20} />, title: "Customize Your Goal",
        subtitle: "Pick a style and set your target",
        bullets: ["Multiple visual presets", "Session-based or persistent goals", "Edit target any time"],
        visual: <IconGlowVisual icon={Target} color="hsl(160 100% 45%)" />,
      },
      {
        icon: <Rocket size={20} />, title: "Add to Stream",
        subtitle: "Copy the goal URL and paste into OBS",
        bullets: ["Each goal gets a unique URL", "Add as Browser Source", "Recommended size: 800×100"],
        visual: <EmojiVisual emoji="🚀" />,
      },
    ],
  },

  leaderboard: {
    title: "Top Supporters",
    steps: [
      {
        icon: <Trophy size={20} />, title: "Top Supporters Leaderboard",
        subtitle: "Show your biggest fans on stream with a live leaderboard",
        bullets: ["Ranks viewers by gifts sent", "Animated rank changes", "Multiple display styles"],
        visual: <EmojiVisual emoji="🏆" />,
      },
      {
        icon: <Rocket size={20} />, title: "Add to OBS",
        subtitle: "Copy the URL and add as Browser Source",
        bullets: ["Updates in real-time", "Recommended size: 400×600", "Motivates viewers to gift more!"],
        visual: <EmojiVisual emoji="🚀" />,
      },
    ],
  },

  points: {
    title: "User & Points",
    steps: [
      {
        icon: <Coins size={20} />, title: "Points System",
        subtitle: "Track viewer engagement with points and levels",
        bullets: ["Viewers earn points from gifts, likes & chat", "Automatic level progression", "See your top supporters"],
        visual: <EmojiVisual emoji="🪙" />,
      },
      {
        icon: <Eye size={20} />, title: "View Your Leaderboard",
        subtitle: "See all viewers ranked by points and activity",
        bullets: ["Sort by points, level, or activity", "Search for specific users", "Reset points any time"],
        visual: <IconGlowVisual icon={Coins} color="hsl(45 100% 55%)" />,
      },
    ],
  },

  /* ─── Creator Tools ─── */
  chat_commands: {
    title: "Chat Commands",
    steps: [
      {
        icon: <Terminal size={20} />, title: "Custom Chat Commands",
        subtitle: "Create commands your viewers can use in chat",
        bullets: ["Set custom !commands", "Auto-reply with text or actions", "Cooldown & permission settings"],
        visual: <EmojiVisual emoji="⌨️" />,
      },
      {
        icon: <Rocket size={20} />, title: "Go Live with Commands",
        subtitle: "Commands work automatically when your stream is connected",
        bullets: ["No extra setup needed", "Works with TikUp bridge", "Viewers type commands in chat"],
        visual: <EmojiVisual emoji="🚀" />,
      },
    ],
  },

  auto_moderation: {
    title: "Chat Protection",
    steps: [
      {
        icon: <Shield size={20} />, title: "Protect Your Chat",
        subtitle: "Auto-filter spam, toxic messages, and unwanted content",
        bullets: ["Block spam & repeated messages", "Filter caps & emoji spam", "Custom banned word lists"],
        visual: <EmojiVisual emoji="🛡️" />,
      },
      {
        icon: <Eye size={20} />, title: "Configure Filters",
        subtitle: "Toggle filters on/off and customize sensitivity",
        bullets: ["Safe mode for family-friendly streams", "Slow mode to limit chat speed", "Link blocking with subscriber exceptions"],
        visual: <IconGlowVisual icon={Shield} color="hsl(160 100% 45%)" />,
      },
    ],
  },

  keystroke_triggers: {
    title: "Keystroke Triggers",
    steps: [
      {
        icon: <Keyboard size={20} />, title: "Keyboard Shortcuts",
        subtitle: "Trigger actions with keyboard shortcuts during your stream",
        bullets: ["Bind keys to overlay actions", "Trigger sound effects", "Control alerts with hotkeys"],
        visual: <EmojiVisual emoji="⌨️" />,
      },
      {
        icon: <Rocket size={20} />, title: "Setup the Bridge",
        subtitle: "Install the TikUp keystroke agent to enable hotkeys",
        bullets: ["Download the bridge agent", "Run it alongside your stream", "Keys trigger actions instantly"],
        visual: <EmojiVisual emoji="🚀" />,
      },
    ],
  },

  polls: {
    title: "Polls",
    steps: [
      {
        icon: <BarChart3 size={20} />, title: "Live Polls",
        subtitle: "Create polls your viewers can vote on during the stream",
        bullets: ["Multiple choice questions", "Real-time vote counting", "Display results on stream"],
        visual: <EmojiVisual emoji="📊" />,
      },
      {
        icon: <Rocket size={20} />, title: "Start a Poll",
        subtitle: "Create a poll and share it with your viewers",
        bullets: ["Set question and options", "Timer for voting period", "Results show live on stream"],
        visual: <EmojiVisual emoji="🚀" />,
      },
    ],
  },

  gift_browser: {
    title: "Gift Browser",
    steps: [
      {
        icon: <Gift size={20} />, title: "Browse All TikTok Gifts",
        subtitle: "See every TikTok gift with coin values and images",
        bullets: ["Search by gift name", "Filter by coin value", "See gift images and details"],
        visual: <EmojiVisual emoji="🎁" />,
      },
      {
        icon: <Eye size={20} />, title: "Enable for Alerts",
        subtitle: "Toggle which gifts trigger alerts on your stream",
        bullets: ["Bulk enable/disable gifts", "Set custom animations per gift", "Configure combo thresholds"],
        visual: <IconGlowVisual icon={Gift} color="hsl(280 100% 65%)" />,
      },
    ],
  },

  /* ─── Settings ─── */
  setup: {
    title: "Connect TikTok",
    steps: [
      {
        icon: <Share2 size={20} />, title: "Connect Your TikTok",
        subtitle: "Link your TikTok account to enable live features",
        bullets: ["Enter your TikTok username", "TikUp connects to your LIVE stream", "All overlays activate automatically"],
        visual: <EmojiVisual emoji="🔗" />,
      },
      {
        icon: <Rocket size={20} />, title: "Start Streaming",
        subtitle: "Once connected, go live and TikUp handles the rest",
        bullets: ["Overlays update in real-time", "Alerts trigger automatically", "Dashboard shows live stats"],
        visual: <EmojiVisual emoji="🚀" />,
      },
    ],
  },

  brand_settings: {
    title: "Brand & Style",
    steps: [
      {
        icon: <Palette size={20} />, title: "Customize Your Brand",
        subtitle: "Set your brand colors, fonts, and style across all overlays",
        bullets: ["Custom accent colors", "Font selection", "Logo upload for overlays"],
        visual: <EmojiVisual emoji="🎨" />,
      },
    ],
  },

  social_rotator: {
    title: "Social Media Rotator",
    steps: [
      {
        icon: <Share2 size={20} />, title: "Social Media Rotator",
        subtitle: "Display your social media profiles on a rotating carousel",
        bullets: ["Add TikTok, Instagram, X, YouTube & more", "Animated card-flip transitions", "Customizable rotation speed"],
        visual: <EmojiVisual emoji="📱" />,
      },
      {
        icon: <Rocket size={20} />, title: "Add to Stream",
        subtitle: "Copy the overlay URL and add as Browser Source",
        bullets: ["Works in OBS & TikTok Live Studio", "Viewers can see all your socials", "Fully customizable look"],
        visual: <EmojiVisual emoji="🚀" />,
      },
    ],
  },

  widgets: {
    title: "Custom Widgets",
    steps: [
      {
        icon: <Layers size={20} />, title: "Custom Widgets",
        subtitle: "Build your own HTML/CSS/JS widgets for your stream",
        bullets: ["Full code editor", "Live preview", "Access to real-time event data"],
        visual: <EmojiVisual emoji="🧩" />,
      },
    ],
  },

  tts: {
    title: "Text-to-Speech",
    steps: [
      {
        icon: <Volume2 size={20} />, title: "Text-to-Speech Alerts",
        subtitle: "Let viewers send voice messages through gifts or chat",
        bullets: ["Multiple voice options", "Content filtering built-in", "Customizable triggers and cooldowns"],
        visual: <EmojiVisual emoji="🗣️" />,
      },
      {
        icon: <Rocket size={20} />, title: "Add to Stream",
        subtitle: "Copy the TTS overlay URL into OBS",
        bullets: ["Audio plays through OBS", "Queue system prevents overlap", "Works with gift triggers or commands"],
        visual: <EmojiVisual emoji="🚀" />,
      },
    ],
  },
};
