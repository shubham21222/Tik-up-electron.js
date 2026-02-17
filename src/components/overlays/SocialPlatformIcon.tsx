const icons: Record<string, (props: { size?: number; className?: string }) => JSX.Element> = {
  youtube: ({ size = 24, className }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" fill="currentColor"/>
    </svg>
  ),
};

const iconMap: Record<string, string> = {
  tiktok: "/social-icons/tiktok.png",
  kick: "/social-icons/kick.png",
  twitch: "/social-icons/twitch.png",
  discord: "/social-icons/discord.png",
  twitter: "/social-icons/twitter.webp",
  instagram: "/social-icons/instagram.png",
  x: "/social-icons/twitter.webp",
};

interface SocialPlatformIconProps {
  platform: string;
  size?: number;
  className?: string;
}

const SocialPlatformIcon = ({ platform, size = 24, className }: SocialPlatformIconProps) => {
  const imageSrc = iconMap[platform] || null;

  if (imageSrc) {
    return (
      <img
        src={imageSrc}
        alt={platform}
        style={{
          width: size,
          height: size,
          objectFit: "contain",
          borderRadius: "4px",
        }}
        className={className}
      />
    );
  }

  const Icon = icons[platform];
  if (Icon) return <Icon size={size} className={className} />;

  return <span className={className}>●</span>;
};

export default SocialPlatformIcon;
