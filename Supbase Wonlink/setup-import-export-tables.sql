-- IMPORT/EXPORT TABLES SETUP
-- Run this script in Supabase SQL Editor to create the missing tables

-- Create file_uploads table for tracking file uploads and processing status
CREATE TABLE IF NOT EXISTS public.file_uploads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  original_name TEXT NOT NULL,
  file_size BIGINT,
  file_type TEXT,
  mime_type TEXT,
  storage_path TEXT,
  status TEXT DEFAULT 'uploaded' CHECK (status IN ('uploaded', 'processing', 'completed', 'failed')),
  progress INTEGER DEFAULT 0,
  total_records INTEGER,
  processed_records INTEGER DEFAULT 0,
  success_count INTEGER DEFAULT 0,
  error_count INTEGER DEFAULT 0,
  error_details JSONB,
  mapping_config JSONB, -- Store column mapping configuration
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Create import_errors table for detailed error tracking
CREATE TABLE IF NOT EXISTS public.import_errors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  upload_id UUID REFERENCES file_uploads(id) ON DELETE CASCADE,
  row_number INTEGER,
  column_name TEXT,
  error_type TEXT,
  error_message TEXT,
  raw_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create import_templates table for storing reusable column mappings
CREATE TABLE IF NOT EXISTS public.import_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  file_type TEXT,
  mapping_config JSONB NOT NULL,
  is_default BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create export_jobs table for tracking export operations
CREATE TABLE IF NOT EXISTS public.export_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  export_type TEXT NOT NULL, -- 'products', 'campaigns', 'analytics'
  file_format TEXT NOT NULL, -- 'csv', 'xlsx', 'pdf'
  file_name TEXT,
  storage_path TEXT,
  filters JSONB,
  columns JSONB,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  progress INTEGER DEFAULT 0,
  total_records INTEGER,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS for all new tables
ALTER TABLE public.file_uploads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.import_errors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.import_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.export_jobs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for file_uploads
CREATE POLICY "Users can view own uploads" ON public.file_uploads
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own uploads" ON public.file_uploads  
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own uploads" ON public.file_uploads
  FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policies for import_errors
CREATE POLICY "Users can view own import errors" ON public.import_errors
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM file_uploads 
      WHERE file_uploads.id = import_errors.upload_id 
      AND file_uploads.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own import errors" ON public.import_errors
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM file_uploads 
      WHERE file_uploads.id = import_errors.upload_id 
      AND file_uploads.user_id = auth.uid()
    )
  );

-- RLS Policies for import_templates
CREATE POLICY "Users can view own templates" ON public.import_templates
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own templates" ON public.import_templates
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own templates" ON public.import_templates
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own templates" ON public.import_templates
  FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for export_jobs
CREATE POLICY "Users can view own exports" ON public.export_jobs
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own exports" ON public.export_jobs
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own exports" ON public.export_jobs
  FOR UPDATE USING (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_file_uploads_user_id ON public.file_uploads(user_id);
CREATE INDEX IF NOT EXISTS idx_file_uploads_status ON public.file_uploads(status);
CREATE INDEX IF NOT EXISTS idx_file_uploads_created_at ON public.file_uploads(created_at);

CREATE INDEX IF NOT EXISTS idx_import_errors_upload_id ON public.import_errors(upload_id);
CREATE INDEX IF NOT EXISTS idx_import_errors_row_number ON public.import_errors(row_number);

CREATE INDEX IF NOT EXISTS idx_import_templates_user_id ON public.import_templates(user_id);
CREATE INDEX IF NOT EXISTS idx_import_templates_file_type ON public.import_templates(file_type);

CREATE INDEX IF NOT EXISTS idx_export_jobs_user_id ON public.export_jobs(user_id);
CREATE INDEX IF NOT EXISTS idx_export_jobs_status ON public.export_jobs(status);

-- Create trigger for import_templates
CREATE TRIGGER update_import_templates_updated_at BEFORE UPDATE ON public.import_templates
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Success message
SELECT 'Import/Export tables setup completed successfully! 🎉' as status; 