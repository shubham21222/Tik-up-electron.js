// =============================================
// Default settings for all overlay widget types
// =============================================

// Gift Alert
export const defaultGiftAlertSettings = {
  trigger_mode: "any_gift" as "any_gift" | "specific_gift" | "value_threshold" | "combo" | "milestone",
  specific_gift_type: "",
  value_threshold: 100,
  combo_threshold: 5,
  milestone_total: 1000,
  animation_style: "bounce" as "slide" | "bounce" | "explosion" | "flip_3d" | "glitch",
  duration: 5,
  entry_animation: "scale_up" as "scale_up" | "slide_left" | "slide_right" | "slide_top" | "fade",
  exit_animation: "fade" as "fade" | "slide_out" | "scale_down" | "dissolve",
  gift_image_size: 64,
  username_font: "heading" as "heading" | "mono" | "sans",
  glow_intensity: 50,
  shadow_depth: 30,
  border_glow: true,
  accent_color: "280 100% 65%",
  text_color: "0 0% 100%",
  glow_color: "280 100% 65%",
  bg_style: "glass" as "none" | "glass" | "neon" | "solid",
  font_family: "default" as "default" | "inter" | "space-grotesk" | "orbitron" | "bebas" | "press-start",
  font_size: 24,
  font_weight: 800,
  alert_position: "center" as "center" | "top" | "bottom" | "top-left" | "top-right" | "bottom-left" | "bottom-right",
  style_preset: "custom" as "custom" | "minimal" | "neon" | "cyber" | "luxury" | "fun",
  sound_url: "",
  sound_name: "",
  sound_volume: 80,
  sound_delay: 0,
  sound_loop: false,
  combo_sound_override: "",
  queue_enabled: true,
  priority_alerts: true,
  max_on_screen: 3,
  anti_spam_throttle: 2,
  alert_cooldown: 1,
  animation_speed: 1,
  transparent_bg: true,
  no_background: false,
  no_border: false,
  dark_bg: false,
  fps_limit: 60,
  custom_css: "",
};

// Style presets for Gift Alerts
export const giftAlertPresets: Record<string, Partial<typeof defaultGiftAlertSettings>> = {
  minimal: {
    bg_style: "none", glow_intensity: 0, shadow_depth: 0, border_glow: false, no_background: true, no_border: true,
    accent_color: "0 0% 100%", glow_color: "0 0% 80%", font_family: "inter", font_weight: 600, animation_style: "slide",
  },
  neon: {
    bg_style: "neon", glow_intensity: 90, shadow_depth: 60, border_glow: true,
    accent_color: "160 100% 50%", glow_color: "160 100% 50%", text_color: "0 0% 100%",
    font_family: "orbitron", font_weight: 700, animation_style: "glitch",
  },
  cyber: {
    bg_style: "glass", glow_intensity: 70, shadow_depth: 50, border_glow: true,
    accent_color: "200 100% 60%", glow_color: "200 100% 60%", text_color: "0 0% 100%",
    font_family: "space-grotesk", font_weight: 700, animation_style: "flip_3d",
  },
  luxury: {
    bg_style: "solid", glow_intensity: 30, shadow_depth: 80, border_glow: false,
    accent_color: "45 100% 55%", glow_color: "45 100% 50%", text_color: "0 0% 100%",
    font_family: "default", font_weight: 800, animation_style: "bounce",
  },
  fun: {
    bg_style: "glass", glow_intensity: 60, shadow_depth: 40, border_glow: true,
    accent_color: "330 100% 65%", glow_color: "330 100% 65%", text_color: "0 0% 100%",
    font_family: "bebas", font_weight: 400, animation_style: "explosion",
  },
};

// Chat Box
export const defaultChatBoxSettings = {
  display_mode: "cyber" as "minimal" | "twitch" | "cyber" | "glass",
  message_fade_time: 30,
  max_messages: 8,
  username_color_auto: true,
  show_badges: true,
  emote_scale: 1.2,
  highlight_gifts: true,
  highlight_keywords: "",
  highlight_moderators: true,
  auto_scroll: true,
  message_animation: "slide" as "slide" | "fade" | "pop" | "typewriter",
  shadow_depth: 20,
  font_size: 13,
  font_family: "sans" as "sans" | "mono" | "heading",
  transparent_bg: true,
  dark_bg: false,
  fps_limit: 60,
  custom_css: "",
  accent_color: "160 100% 45%",
};

// Like Alert
export const defaultLikeAlertSettings = {
  animation_style: "hearts_rise" as "hearts_rise" | "pulse_burst" | "neon_wave" | "sparkle_trail" | "vortex" | "ripple_glow",
  duration: 4,
  icon_size: 48,
  glow_intensity: 60,
  particle_count: 12,
  color_mode: "warm" as "warm" | "cool" | "rainbow" | "mono",
  show_count: true,
  count_style: "animated" as "animated" | "static" | "milestone",
  milestone_interval: 100,
  milestone_animation: "confetti" as "confetti" | "flash" | "shake" | "explode",
  username_visible: true,
  combo_detection: true,
  combo_multiplier_visual: true,
  entry_animation: "float_up" as "float_up" | "slide_in" | "scale_pop" | "spiral",
  exit_animation: "fade_up" as "fade_up" | "dissolve" | "shrink" | "fly_away",
  sound_volume: 70,
  transparent_bg: true,
  dark_bg: false,
  fps_limit: 60,
  custom_css: "",
  accent_color: "350 90% 55%",
  queue_enabled: true,
  max_on_screen: 5,
  anti_spam_throttle: 0.5,
  animation_speed: 1,
};

// Follow Alert
export const defaultFollowAlertSettings = {
  animation_style: "spotlight" as "spotlight" | "badge_drop" | "neon_slide" | "hologram" | "portal" | "glitch_in",
  duration: 5,
  icon_size: 56,
  glow_intensity: 50,
  show_avatar: true,
  avatar_style: "circle" as "circle" | "hexagon" | "rounded_square",
  welcome_text: "just followed!",
  username_font: "heading" as "heading" | "mono" | "sans",
  card_style: "glass" as "glass" | "solid" | "neon_border" | "gradient" | "minimal",
  entry_animation: "drop_bounce" as "drop_bounce" | "slide_right" | "zoom_in" | "typewriter" | "flip",
  exit_animation: "fade" as "fade" | "slide_out" | "scale_down" | "glitch_out",
  sound_volume: 80,
  counter_visible: true,
  streak_detection: true,
  streak_threshold: 3,
  streak_animation: "rainbow" as "rainbow" | "shake" | "grow",
  transparent_bg: true,
  dark_bg: false,
  fps_limit: 60,
  custom_css: "",
  accent_color: "160 100% 45%",
  queue_enabled: true,
  max_on_screen: 3,
  anti_spam_throttle: 1,
  animation_speed: 1,
};

// Share Alert
export const defaultShareAlertSettings = {
  animation_style: "rocket_launch" as "rocket_launch" | "shockwave" | "neon_burst" | "paper_plane" | "warp_speed" | "sonic_boom",
  duration: 5,
  icon_size: 52,
  glow_intensity: 55,
  show_share_count: true,
  batch_detection: true,
  batch_threshold: 5,
  milestone_triggers: true,
  milestone_interval: 50,
  milestone_animation: "explosion" as "explosion" | "fireworks" | "rainbow_wave",
  username_visible: true,
  card_style: "cyber" as "cyber" | "glass" | "minimal" | "gradient",
  entry_animation: "burst" as "burst" | "slide" | "zoom" | "spiral",
  exit_animation: "fade" as "fade" | "fly_out" | "dissolve",
  sound_volume: 75,
  transparent_bg: true,
  dark_bg: false,
  fps_limit: 60,
  custom_css: "",
  accent_color: "200 100% 55%",
  queue_enabled: true,
  max_on_screen: 3,
  anti_spam_throttle: 1,
  animation_speed: 1,
};

// Like Counter
export const defaultLikeCounterSettings = {
  display_mode: "numeric" as "numeric" | "milestone" | "progress_ring" | "horizontal_bar" | "neon_counter",
  font_family: "heading" as "heading" | "mono" | "sans",
  font_weight: "bold" as "normal" | "bold" | "black",
  font_size: 48,
  glow_strength: 60,
  animated_increment: true,
  smoothing_effect: true,
  count_speed: 500,
  milestone_interval: 1000,
  milestone_animation: "confetti" as "confetti" | "flash" | "shake" | "explode",
  rolling_number: true,
  confetti_on_milestone: true,
  particle_burst: true,
  sound_on_milestone: true,
  reset_daily: false,
  accent_color: "280 100% 65%",
  transparent_bg: true,
  dark_bg: false,
  fps_limit: 60,
  custom_css: "",
};

// Follower Goal
export const defaultFollowerGoalSettings = {
  start_value: 0,
  target_value: 1000,
  current_value: 0,
  auto_detect: false,
  display_style: "glass_bar" as "glass_bar" | "neon_gradient" | "circular" | "minimal" | "liquid_fill",
  bar_height: 32,
  glow_color: "160 100% 45%",
  text_position: "inside" as "inside" | "above" | "below" | "hidden",
  show_percentage: true,
  auto_hide_complete: false,
  completion_animation: "confetti" as "confetti" | "flash" | "fireworks" | "none",
  multi_stage: false,
  milestone_alerts: true,
  time_based_mode: false,
  auto_reset_stream: false,
  title_text: "Follower Goal",
  accent_color: "160 100% 45%",
  transparent_bg: true,
  dark_bg: false,
  fps_limit: 60,
  custom_css: "",
};

// Viewer Count
export const defaultViewerCountSettings = {
  display_mode: "live_number" as "live_number" | "mini_graph" | "badge" | "pulse_dot",
  font_size: 36,
  font_family: "heading" as "heading" | "mono" | "sans",
  spike_animation: true,
  pulse_on_increase: true,
  drop_animation: true,
  peak_tracker: true,
  session_high_highlight: true,
  show_average: false,
  time_window: 60,
  spike_threshold: 50,
  icon_visible: true,
  label_text: "viewers",
  accent_color: "45 100% 55%",
  transparent_bg: true,
  dark_bg: false,
  fps_limit: 60,
  custom_css: "",
};

// Leaderboard
export const defaultLeaderboardSettings = {
  leaderboard_type: "gifters" as "gifters" | "likers" | "fans",
  time_range: "session" as "session" | "all_time" | "daily" | "weekly",
  display_mode: "vertical" as "vertical" | "ticker" | "podium" | "spotlight",
  max_entries: 5,
  rank_badge_style: "number" as "number" | "medal" | "crown" | "neon",
  crown_for_first: true,
  glow_per_rank: true,
  animated_rank_change: true,
  auto_refresh: 30,
  sliding_transitions: true,
  show_values: true,
  show_avatars: true,
  accent_color: "45 100% 55%",
  transparent_bg: true,
  dark_bg: false,
  fps_limit: 60,
  custom_css: "",
};

// Stream Timer
export const defaultStreamTimerSettings = {
  display_mode: "digital" as "digital" | "neon_segmented" | "minimal_dot",
  font_family: "mono" as "heading" | "mono" | "sans",
  font_size: 42,
  start_on_connect: true,
  show_hours: true,
  show_seconds: true,
  glow_animation: true,
  glow_intensity: 50,
  milestone_notifications: true,
  milestone_interval: 60,
  session_memory: true,
  auto_hide_offline: true,
  label_text: "LIVE",
  show_label: true,
  accent_color: "0 100% 60%",
  transparent_bg: true,
  dark_bg: false,
  fps_limit: 60,
  custom_css: "",
};

// Custom Text
export const defaultCustomTextSettings = {
  text_content: "Welcome to {streamer}'s stream!",
  font_family: "heading" as "heading" | "mono" | "sans",
  font_size: 28,
  font_weight: "bold" as "normal" | "bold" | "black",
  text_align: "center" as "left" | "center" | "right",
  animated_gradient: true,
  gradient_colors: "280 100% 65%, 200 100% 55%",
  gradient_speed: 3,
  background_blur: 0,
  background_opacity: 0,
  text_shadow: true,
  shadow_color: "0 0% 0%",
  shadow_blur: 10,
  variable_binding: true,
  refresh_interval: 10,
  scroll_mode: "none" as "none" | "horizontal" | "vertical",
  scroll_speed: 30,
  accent_color: "280 100% 65%",
  transparent_bg: true,
  dark_bg: false,
  fps_limit: 60,
  custom_css: "",
};

// TTS Overlay
export const defaultTTSSettings = {
  voice_id: "JBFqnCBsd6RMkjVDRZzb",
  volume: 80,
  speed: 1.0,
  show_bubble: true,
  bubble_position: "bottom-center" as "bottom-center" | "bottom-left" | "bottom-right" | "top-center",
  bubble_style: "glass" as "glass" | "neon" | "minimal",
  show_soundwave: true,
  show_avatar: true,
  accent_color: "160 100% 45%",
  transparent_bg: true,
  dark_bg: false,
  fps_limit: 60,
  custom_css: "",
};

// Gift Combo Counter
export const defaultGiftComboSettings = {
  combo_timeout: 5,
  min_combo: 2,
  animation_style: "escalate" as "escalate" | "pulse" | "shake" | "explode",
  show_multiplier: true,
  show_gift_icon: true,
  font_size: 56,
  font_family: "heading" as "heading" | "mono" | "sans",
  glow_intensity: 70,
  escalation_tiers: [5, 10, 25, 50, 100],
  tier_colors: ["160 100% 45%", "45 100% 55%", "350 90% 55%", "280 100% 65%", "0 100% 60%"],
  particle_burst: true,
  screen_shake: true,
  combo_sound: true,
  accent_color: "280 100% 65%",
  transparent_bg: true,
  dark_bg: false,
  fps_limit: 60,
  custom_css: "",
};

// Notifications Ticker
export const defaultTickerSettings = {
  scroll_speed: 40,
  direction: "left" as "left" | "right",
  font_size: 14,
  font_family: "sans" as "heading" | "mono" | "sans",
  show_icons: true,
  show_timestamps: false,
  max_items: 20,
  event_types: ["follow", "like", "gift", "share"] as string[],
  separator_style: "dot" as "dot" | "pipe" | "diamond" | "star",
  glow_intensity: 40,
  bar_height: 40,
  bar_position: "bottom" as "top" | "bottom",
  background_blur: true,
  accent_color: "200 100% 55%",
  transparent_bg: true,
  dark_bg: false,
  fps_limit: 60,
  custom_css: "",
};

// Animated Background
export const defaultAnimatedBgSettings = {
  bg_type: "gradient" as "gradient" | "particles" | "grid" | "aurora" | "waves",
  color_1: "280 100% 65%",
  color_2: "200 100% 55%",
  color_3: "160 100% 45%",
  animation_speed: 1,
  particle_count: 50,
  particle_size: 3,
  opacity: 0.6,
  blur_amount: 0,
  grid_size: 40,
  wave_amplitude: 20,
  react_to_events: false,
  accent_color: "280 100% 65%",
  transparent_bg: false,
  dark_bg: true,
  fps_limit: 60,
  custom_css: "",
};

// Sound Reactive
export const defaultSoundReactiveSettings = {
  display_mode: "bars" as "bars" | "waveform" | "circle" | "spectrum",
  bar_count: 32,
  bar_width: 4,
  bar_gap: 2,
  bar_radius: 2,
  sensitivity: 70,
  smoothing: 0.8,
  mirror: true,
  color_mode: "gradient" as "solid" | "gradient" | "rainbow" | "reactive",
  glow_intensity: 50,
  position: "bottom" as "top" | "bottom" | "center" | "full",
  height_percent: 30,
  accent_color: "200 100% 55%",
  transparent_bg: true,
  dark_bg: false,
  fps_limit: 60,
  custom_css: "",
};

// Social Media Rotator
export const defaultSocialRotatorSettings = {
  rotation_speed: 4,
  icon_size: 48,
  font_size: 16,
  glow_intensity: 40,
  glass_bg: true,
  show_indicators: true,
  social_links: [] as { id?: string; icon: string; label: string; handle: string; color: string }[],
  accent_color: "200 100% 55%",
  transparent_bg: true,
  dark_bg: false,
  fps_limit: 60,
  custom_css: "",
};

// Gift Firework Animation
export const defaultGiftFireworkSettings = {
  duration: 3,
  particle_count: 20,
  explosion_radius: 80,
  glow_intensity: 60,
  show_username: true,
  gravity: true,
  multi_burst: false,
  particle_colors: ["45 100% 55%", "280 100% 65%", "160 100% 45%", "350 90% 55%"],
  accent_color: "45 100% 55%",
  transparent_bg: true,
  dark_bg: false,
  fps_limit: 60,
  custom_css: "",
};

// Promo Overlay
export const defaultPromoOverlaySettings = {
  logo_size: 140,
  tagline: "Follow for more!",
  handle: "@tikup",
  show_handle: true,
  accent_color: "160 100% 45%",
  glow_intensity: 60,
  animation_style: "pulse" as "pulse" | "rotate" | "float",
  show_rings: true,
  transparent_bg: true,
  dark_bg: false,
  fps_limit: 60,
  custom_css: "",
};

// Stream Border
export const defaultStreamBorderSettings = {
  border_style: "neon_pulse" as "neon_pulse" | "gold_metallic" | "glitch_digital" | "electric_spark" | "liquid_flow" | "holographic_grid" | "particles_glow" | "retro_wave" | "firefly_trail" | "pulse_circuit" | "cod_tactical" | "fortnite_victory" | "arch_raider" | "battle_royale_pro" | "space_fighter",
  border_thickness: 4,
  animation_speed: 1,
  glow_intensity: 60,
  color_1: "180 100% 50%",
  color_2: "280 100% 65%",
  corner_radius: 16,
  transparent_bg: true,
  dark_bg: false,
  fps_limit: 60,
  custom_css: "",
};

// Webcam Frame
export const defaultWebcamFrameSettings = {
  frame_style: "neon_cyber" as "neon_cyber" | "golden_luxe" | "digital_pulse" | "particle_aura" | "circuit_flow" | "electro_corners" | "liquid_glow" | "holographic_shift" | "ember_flicker" | "audio_reactive",
  frame_thickness: 4,
  frame_size: 300,
  animation_speed: 1,
  glow_intensity: 60,
  color_1: "180 100% 50%",
  color_2: "280 100% 65%",
  corner_radius: 12,
  transparent_bg: true,
  dark_bg: false,
  fps_limit: 60,
  custom_css: "",
};

// Video Cam Frame
export const defaultVideoCamFrameSettings = {
  frame_color: "160 100% 45%",
  opacity: 100,
  scale: 100,
  playback_speed: 1,
  glow_intensity: 40,
  position: "top-left" as "top-left" | "top-right" | "bottom-left" | "bottom-right" | "center",
  transparent_bg: true,
  dark_bg: false,
  fps_limit: 60,
  custom_css: "",
};

// Video Label Bar
export const defaultVideoLabelBarSettings = {
  label_color: "280 100% 65%",
  label_text: "LIVE",
  opacity: 100,
  scale: 100,
  playback_speed: 1,
  glow_intensity: 40,
  position: "bottom" as "top" | "bottom" | "center",
  transparent_bg: true,
  dark_bg: false,
  fps_limit: 60,
  custom_css: "",
};

// Coin Jar
export const defaultCoinJarSettings = {
  jar_style: "glass" as "glass" | "crystal" | "neon" | "gold",
  target_coins: 5000,
  fill_animation: "bounce" as "bounce" | "float" | "pop" | "spiral",
  show_gift_icons: true,
  show_sender: true,
  show_total: true,
  glow_intensity: 50,
  completion_effect: "confetti" as "confetti" | "fireworks" | "glow_burst" | "none",
  transparent_bg: true,
  custom_css: "",
};

// Spin Wheel
export const defaultSpinWheelSettings = {
  segments: [
    { label: "10x Push-ups", color: "350 80% 50%" },
    { label: "15x Planks", color: "45 100% 50%" },
    { label: "Nothing!", color: "160 80% 40%" },
    { label: "5x Squats", color: "200 80% 50%" },
    { label: "Dance!", color: "280 70% 55%" },
    { label: "Shoutout", color: "15 90% 50%" },
  ],
  spin_duration: 4,
  auto_spin: false,
  trigger_mode: "gift" as "gift" | "specific_gift" | "chat_command" | "manual",
  show_winner: true,
  winner_duration: 5,
  glow_intensity: 50,
  wheel_size: 400,
  transparent_bg: true,
  custom_css: "",
};

// Gift Actions Slider
export const defaultGiftActionsSettings = {
  items: [
    { emoji: "🏀", label: "Jump" },
    { emoji: "🌹", label: "Dance" },
    { emoji: "💜", label: "Emote" },
    { emoji: "🍩", label: "Spin" },
  ],
  scroll_speed: 30,
  icon_size: 64,
  label_size: 16,
  spacing: 24,
  show_labels: true,
  auto_scroll: true,
  transparent_bg: true,
  label_style: "bold" as "bold" | "outline" | "glow",
  custom_css: "",
};

// Event Feed
export const defaultEventFeedSettings = {
  eventTypes: ["followers", "gifts", "likes", "shares", "comments", "joins"] as string[],
  animationStyle: "slide_in" as "slide_in" | "fade_in" | "pop_up" | "zoom" | "bounce",
  animationDuration: 1.5,
  animationSpeed: 1,
  soundEnabled: false,
  soundPack: "default",
  order: "newest" as "newest" | "oldest",
  theme: "default",
  maxEvents: 10,
};

// Stream Buddies
export const defaultStreamBuddiesSettings = {
  theme: "pixel" as "pixel" | "chibi" | "cyber" | "fantasy",
  max_avatars: 15,
  show_chat_bubbles: true,
  show_usernames: true,
  min_gift_coins: 1,
  avatar_speed: 1,
  spawn_cooldown: 3,
  transparent_bg: true,
  custom_css: "",
};

// Neon Event List
export const defaultNeonEventListSettings = {
  max_events: 5,
  event_types: ["gift", "follow", "like", "share"] as string[],
  accent_color: "200 100% 60%",
  glow_intensity: 60,
  show_header: true,
  header_text: "Live Events",
  corner_style: "tech" as "tech" | "rounded" | "sharp",
  row_animation: "slide" as "slide" | "fade" | "pop",
  transparent_bg: true,
  dark_bg: false,
  fps_limit: 60,
  custom_css: "",
};

// Glow Alert Popup
export const defaultGlowAlertPopupSettings = {
  accent_color: "350 90% 60%",
  glow_intensity: 70,
  show_icon: true,
  icon_size: 48,
  show_label: true,
  show_sub_text: true,
  entry_animation: "pop" as "pop" | "slide_down" | "fade" | "bounce",
  duration: 4,
  corner_style: "tech" as "tech" | "rounded" | "sharp",
  scan_line: true,
  ring_animation: true,
  transparent_bg: true,
  dark_bg: false,
  fps_limit: 60,
  custom_css: "",
};

// Circular Profile Widget
export const defaultCircularProfileWidgetSettings = {
  accent_color: "45 100% 58%",
  glow_intensity: 60,
  max_profiles: 5,
  rotation_speed: 3,
  show_rank: true,
  show_coins: true,
  show_username: true,
  leaderboard_type: "gifters" as "gifters" | "likers" | "fans",
  wheel_segments: 6,
  transparent_bg: true,
  dark_bg: false,
  fps_limit: 60,
  custom_css: "",
};

// Map type → defaults
export const overlayDefaultsMap: Record<string, Record<string, any>> = {
  gift_alert: defaultGiftAlertSettings,
  chat_box: defaultChatBoxSettings,
  like_alert: defaultLikeAlertSettings,
  follow_alert: defaultFollowAlertSettings,
  share_alert: defaultShareAlertSettings,
  like_counter: defaultLikeCounterSettings,
  follower_goal: defaultFollowerGoalSettings,
  viewer_count: defaultViewerCountSettings,
  leaderboard: defaultLeaderboardSettings,
  stream_timer: defaultStreamTimerSettings,
  custom_text: defaultCustomTextSettings,
  tts: defaultTTSSettings,
  gift_combo: defaultGiftComboSettings,
  ticker: defaultTickerSettings,
  animated_bg: defaultAnimatedBgSettings,
  sound_reactive: defaultSoundReactiveSettings,
  social_rotator: defaultSocialRotatorSettings,
  gift_firework: defaultGiftFireworkSettings,
  promo_overlay: defaultPromoOverlaySettings,
  stream_border: defaultStreamBorderSettings,
  webcam_frame: defaultWebcamFrameSettings,
  video_cam_frame: defaultVideoCamFrameSettings,
  video_label_bar: defaultVideoLabelBarSettings,
  coin_jar: defaultCoinJarSettings,
  spin_wheel: defaultSpinWheelSettings,
  gift_actions: defaultGiftActionsSettings,
  battle_royale: { entry_trigger: "gift", max_fighters: 8, round_speed: 3, show_hp: true, winner_shoutout: true, transparent_bg: true, custom_css: "" },
  slot_machine: { trigger: "gift", spin_duration: 2, win_chance: 20, jackpot_action: "shoutout", show_jackpot: true, transparent_bg: true, custom_css: "" },
  vote_battle: { team_a_name: "Team A", team_b_name: "Team B", vote_source: "gifts", duration: 120, show_pct: true, transparent_bg: true, custom_css: "" },
  progress_race: { team_count: 3, target: 100, score_source: "gifts", show_pct: true, auto_reset: true, transparent_bg: true, custom_css: "" },
  event_feed: defaultEventFeedSettings,
  stream_buddies: defaultStreamBuddiesSettings,
  pacman: { theme: "tikup", ghost_count: 4, chaos_mode: true, ai_mode: true, base_escape_chance: 95, vote_interval: 1.5, speed_boost_duration: 3, shield_duration: 5, power_duration: 7, slow_pac_duration: 3, freeze_duration: 1.5, reverse_duration: 4, ghost_speed_duration: 5, swarm_duration: 8, slow_ghost_duration: 4, confusion_duration: 5, transparent_bg: true, custom_css: "" },
  neon_event_list: defaultNeonEventListSettings,
  glow_alert_popup: defaultGlowAlertPopupSettings,
  circular_profile_widget: defaultCircularProfileWidgetSettings,
};
