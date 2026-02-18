
-- Create storage bucket for sound alert uploads
INSERT INTO storage.buckets (id, name, public) VALUES ('sound-alerts', 'sound-alerts', true);

-- Allow authenticated users to upload sounds
CREATE POLICY "Users can upload their own sounds"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'sound-alerts' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Allow anyone to read sounds (public playback in OBS overlays)
CREATE POLICY "Sound alerts are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'sound-alerts');

-- Allow users to delete their own sounds
CREATE POLICY "Users can delete their own sounds"
ON storage.objects FOR DELETE
USING (bucket_id = 'sound-alerts' AND auth.uid()::text = (storage.foldername(name))[1]);
