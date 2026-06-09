-- Create notes table
CREATE TABLE IF NOT EXISTS notes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT,
  content TEXT NOT NULL,
  image_urls TEXT[] DEFAULT '{}',
  tags TEXT[] DEFAULT '{}',
  summary TEXT,
  source_url TEXT,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'ready', 'published')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on created_at for sorting
CREATE INDEX IF NOT EXISTS idx_notes_created_at ON notes(created_at DESC);

-- Create index on tags for filtering
CREATE INDEX IF NOT EXISTS idx_notes_tags ON notes USING GIN(tags);

-- Create storage bucket for images
INSERT INTO storage.buckets (id, name, public)
VALUES ('note-images', 'note-images', true)
ON CONFLICT (id) DO NOTHING;

-- Enable RLS
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;

-- Create policy for notes
CREATE POLICY "Anyone can view notes"
  ON notes FOR SELECT
  USING (true);

CREATE POLICY "Anyone can insert notes"
  ON notes FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can update notes"
  ON notes FOR UPDATE
  USING (true);

CREATE POLICY "Anyone can delete notes"
  ON notes FOR DELETE
  USING (true);

-- Create storage policy
CREATE POLICY "Anyone can upload images"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'note-images');

CREATE POLICY "Anyone can view images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'note-images');
