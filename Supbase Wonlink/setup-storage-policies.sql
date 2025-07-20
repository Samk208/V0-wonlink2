-- Supabase Storage Policies for Import/Export Functionality
-- Run this script in Supabase SQL Editor

-- Enable RLS on storage.objects if not already enabled
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Users can upload own files" ON storage.objects;
DROP POLICY IF EXISTS "Users can view own files" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload own exports" ON storage.objects;
DROP POLICY IF EXISTS "Users can view own exports" ON storage.objects;

-- Policy 1: Users can upload own files to imports bucket
CREATE POLICY "Users can upload own files" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'imports' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Policy 2: Users can view own files from imports bucket
CREATE POLICY "Users can view own files" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'imports' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Policy 3: Users can upload own exports to exports bucket
CREATE POLICY "Users can upload own exports" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'exports' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Policy 4: Users can view own exports from exports bucket
CREATE POLICY "Users can view own exports" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'exports' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Verify policies were created
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'objects' 
  AND schemaname = 'storage'
  AND policyname IN (
    'Users can upload own files',
    'Users can view own files', 
    'Users can upload own exports',
    'Users can view own exports'
  ); 