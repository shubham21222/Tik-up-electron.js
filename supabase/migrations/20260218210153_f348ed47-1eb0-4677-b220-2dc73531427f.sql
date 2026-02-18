
-- Add description and badge columns to feature_flags
ALTER TABLE public.feature_flags ADD COLUMN IF NOT EXISTS description text DEFAULT '';
ALTER TABLE public.feature_flags ADD COLUMN IF NOT EXISTS badge text DEFAULT '';

-- Insert missing feature flag for social-rotator
INSERT INTO public.feature_flags (feature_key, label, section, is_visible, description, badge)
VALUES ('/social-rotator', 'Social Rotator', 'Engagement', false, 'Rotate your social media handles on stream.', 'New')
ON CONFLICT DO NOTHING;

-- Update existing flags with descriptions and badges
UPDATE public.feature_flags SET description = 'Get notified when viewers send gifts.', badge = '' WHERE feature_key = '/actions';
UPDATE public.feature_flags SET description = 'Display live chat on your stream.', badge = '' WHERE feature_key = '/chat-overlay';
UPDATE public.feature_flags SET description = 'Show viewer count on stream.', badge = '' WHERE feature_key = '/viewer-count';
UPDATE public.feature_flags SET description = 'Display likes and followers live.', badge = '' WHERE feature_key = '/like-counter';
UPDATE public.feature_flags SET description = 'Add a countdown or elapsed timer.', badge = '' WHERE feature_key = '/stream-timer';
UPDATE public.feature_flags SET description = 'Let viewers speak through your stream.', badge = 'Popular' WHERE feature_key = '/tts';
UPDATE public.feature_flags SET description = 'Play sounds on gift events.', badge = '' WHERE feature_key = '/sound-alerts';
UPDATE public.feature_flags SET description = 'Show a live event feed.', badge = '' WHERE feature_key = '/recent-activity';
UPDATE public.feature_flags SET description = 'Set and track stream goals.', badge = '' WHERE feature_key = '/goal-overlays';
UPDATE public.feature_flags SET description = 'Show your top gifters.', badge = '' WHERE feature_key = '/leaderboard';
UPDATE public.feature_flags SET description = 'Reward loyal viewers with points.', badge = '' WHERE feature_key = '/points';
UPDATE public.feature_flags SET description = 'Set up custom chat commands.', badge = '' WHERE feature_key = '/chat-commands';
UPDATE public.feature_flags SET description = 'Auto-moderate chat messages.', badge = '' WHERE feature_key = '/auto-moderation';
UPDATE public.feature_flags SET description = 'Trigger keystrokes from gifts.', badge = 'New' WHERE feature_key = '/keystroke-triggers';
UPDATE public.feature_flags SET description = 'Let viewers control your GTA 5 game!', badge = 'Popular' WHERE feature_key = '/gta-triggers';
UPDATE public.feature_flags SET description = 'Browse TikTok gift catalog.', badge = '' WHERE feature_key = '/gift-browser';
UPDATE public.feature_flags SET description = 'Animated stream backgrounds.', badge = '' WHERE feature_key = '/backgrounds';
UPDATE public.feature_flags SET description = 'Premium overlay widgets.', badge = '' WHERE feature_key = '/overlays';
UPDATE public.feature_flags SET description = 'AI-generated voice packs.', badge = 'New' WHERE feature_key = '/sounds';
UPDATE public.feature_flags SET description = 'Multi-agency management.', badge = '' WHERE feature_key = '/agencies';
UPDATE public.feature_flags SET description = 'Enterprise analytics dashboard.', badge = '' WHERE feature_key = '/enterprise';
UPDATE public.feature_flags SET description = 'Customize your brand look.', badge = '' WHERE feature_key = '/brand-settings';
UPDATE public.feature_flags SET description = 'Connect external services.', badge = '' WHERE feature_key = '/integrations';
UPDATE public.feature_flags SET description = 'Manage your subscription.', badge = '' WHERE feature_key = '/pro';
UPDATE public.feature_flags SET description = 'Link your TikTok account.', badge = '' WHERE feature_key = '/setup';
