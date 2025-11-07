-- Create builds table to track APK build status
CREATE TABLE public.builds (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  platform TEXT NOT NULL DEFAULT 'android',
  status TEXT NOT NULL DEFAULT 'pending',
  expo_build_id TEXT,
  download_url TEXT,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.builds ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view own builds"
  ON public.builds
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own builds"
  ON public.builds
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own builds"
  ON public.builds
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Create trigger for updated_at
CREATE TRIGGER update_builds_updated_at
  BEFORE UPDATE ON public.builds
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();