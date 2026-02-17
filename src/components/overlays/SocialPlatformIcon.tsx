const icons: Record<string, (props: { size?: number; className?: string }) => JSX.Element> = {
  tiktok: ({ size = 24, className }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <path d="M16.6 5.82A4.28 4.28 0 0115.54 3h-3.09v12.4a2.59 2.59 0 01-2.59 2.5 2.59 2.59 0 01-2.59-2.5 2.59 2.59 0 012.59-2.6c.28 0 .54.04.79.11V9.7a5.73 5.73 0 00-.79-.05 5.72 5.72 0 00-5.72 5.72A5.72 5.72 0 009.86 21a5.72 5.72 0 005.72-5.72V9.04a7.33 7.33 0 004.28 1.37V7.33a4.28 4.28 0 01-3.26-1.51z" fill="currentColor"/>
    </svg>
  ),
  youtube: ({ size = 24, className }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" fill="currentColor"/>
    </svg>
  ),
};

interface SocialPlatformIconProps {
  platform: string;
  size?: number;
  className?: string;
}

const SocialPlatformIcon = ({ platform, size = 24, className }: SocialPlatformIconProps) => {
  const Icon = icons[platform];
  
  if (Icon) return <Icon size={size} className={className} />;

  // Support for custom image icons
  const iconMap: Record<string, string> = {
    kick: "/social-icons/kick.png",
    twitch: "/social-icons/twitch.png",
    discord: "/social-icons/discord.png",
    twitter: "/social-icons/twitter.webp",
    instagram: "/social-icons/instagram.png",
    x: "/social-icons/twitter.webp",
  };

  const imageSrc = iconMap[platform] || (platform.startsWith("/") || platform.startsWith("http") ? platform : null);

  if (imageSrc) {
    return (
      <img 
        src={imageSrc} 
        alt={platform} 
        style={{ 
          width: size || "100%", 
          height: size || "100%", 
          objectFit: "contain",
          borderRadius: platform === "kick" || platform === "discord" || platform === "instagram" ? "4px" : "0"
        }} 
        className={className} 
      />


    );
  }

  return <span className={className}>●</span>;

};

export default SocialPlatformIcon;
