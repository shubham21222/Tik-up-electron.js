import { motion } from "framer-motion";

interface GiftActionItem {
  img: string;
  label: string;
}

interface Props {
  items?: GiftActionItem[];
  icon_size?: number;
  label_size?: number;
  show_labels?: boolean;
  label_style?: "bold" | "outline" | "glow";
  auto_scroll?: boolean;
  scroll_speed?: number;
  spacing?: number;
}

const DEFAULT_ITEMS: GiftActionItem[] = [
  { img: "/gifts/rose.png", label: "Jump" },
  { img: "/gifts/flame_heart.png", label: "Dance" },
  { img: "/gifts/fluffy_heart.png", label: "Emote" },
  { img: "/gifts/morning_bloom.png", label: "Spin" },
  { img: "/gifts/love_you_so_much.png", label: "Shoutout" },
  { img: "/gifts/wink_wink.png", label: "Surprise" },
];

const GiftActionsPreview = ({
  items,
  icon_size = 42,
  label_size = 10,
  show_labels = true,
  label_style = "bold",
  auto_scroll = true,
  scroll_speed = 30,
  spacing = 20,
}: Props) => {
  const displayItems = items && items.length > 0 ? items : DEFAULT_ITEMS;
  // Scale icon size for preview (preview is smaller than OBS)
  const previewScale = Math.min(icon_size / 64, 1.5);
  const imgSize = 42 * previewScale;
  const lblSize = Math.max(8, label_size * 0.7);
  const gap = Math.max(8, spacing * 0.6);

  const scrollItems = auto_scroll ? [...displayItems, ...displayItems] : displayItems;
  const singleWidth = displayItems.length * (imgSize + gap);
  const duration = singleWidth / (scroll_speed || 30);

  const labelStyleCSS: React.CSSProperties =
    label_style === "outline"
      ? { color: "transparent", WebkitTextStroke: "1px white" }
      : label_style === "glow"
      ? { color: "white", textShadow: "0 0 6px hsl(280 100% 65%), 0 0 14px hsl(280 100% 65% / 0.4)" }
      : { color: "white", textShadow: "0 1px 6px rgba(0,0,0,0.8), 0 0 2px rgba(0,0,0,0.5)" };

  const content = scrollItems.map((item, i) => (
    <motion.div
      key={`${item.img}-${i}`}
      className="flex flex-col items-center flex-shrink-0"
      style={{ gap: 4, minWidth: imgSize }}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: i * 0.08 }}
    >
      <motion.img
        src={item.img}
        alt={item.label}
        style={{
          width: imgSize,
          height: imgSize,
          objectFit: "contain",
          filter: "drop-shadow(0 2px 6px rgba(0,0,0,0.4))",
        }}
        draggable={false}
        animate={{ y: [0, -3, 0] }}
        transition={{ duration: 2, repeat: Infinity, delay: i * 0.25 }}
      />
      {show_labels && (
        <span
          className="font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-md whitespace-nowrap"
          style={{
            fontSize: lblSize,
            fontFamily: "var(--font-heading, sans-serif)",
            ...labelStyleCSS,
          }}
        >
          {item.label}
        </span>
      )}
    </motion.div>
  ));

  return (
    <div className="w-full h-full flex items-center justify-center overflow-hidden">
      {auto_scroll ? (
        <motion.div
          className="flex items-end"
          style={{ gap }}
          animate={{ x: [0, -singleWidth] }}
          transition={{ duration, repeat: Infinity, ease: "linear" }}
        >
          {content}
        </motion.div>
      ) : (
        <div className="flex items-end justify-center" style={{ gap }}>
          {content}
        </div>
      )}
    </div>
  );
};

export default GiftActionsPreview;
