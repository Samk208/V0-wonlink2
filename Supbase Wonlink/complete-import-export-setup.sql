-- COMPLETE IMPORT/EXPORT SETUP FOR WONLINK PLATFORM
-- Run this entire script in your Supabase SQL Editor
-- This will create all necessary tables and security policies

-- =====================================================
-- 1. FILE UPLOADS TABLE
-- =====================================================

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
  mapping_config JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_file_uploads_user_id ON public.file_uploads(user_id);
CREATE INDEX IF NOT EXISTS idx_file_uploads_status ON public.file_uploads(status);
CREATE INDEX IF NOT EXISTS idx_file_uploads_created_at ON public.file_uploads(created_at);

-- =====================================================
-- 2. IMPORT ERRORS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS public.import_errors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  file_upload_id UUID REFERENCES public.file_uploads(id) ON DELETE CASCADE,
  row_number INTEGER,
  column_name TEXT,
  error_message TEXT NOT NULL,
  raw_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_import_errors_file_upload_id ON public.import_errors(file_upload_id);
CREATE INDEX IF NOT EXISTS idx_import_errors_row_number ON public.import_errors(row_number);

-- =====================================================
-- 3. IMPORT TEMPLATES TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS public.import_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  template_type TEXT NOT NULL CHECK (template_type IN ('product', 'campaign', 'influencer')),
  column_mappings JSONB NOT NULL,
  validation_rules JSONB,
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_import_templates_user_id ON public.import_templates(user_id);
CREATE INDEX IF NOT EXISTS idx_import_templates_type ON public.import_templates(template_type);

-- =====================================================
-- 4. EXPORT JOBS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS public.export_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  job_type TEXT NOT NULL CHECK (job_type IN ('products', 'campaigns', 'applications', 'analytics')),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  file_format TEXT NOT NULL CHECK (file_format IN ('csv', 'xlsx', 'json')),
  filters JSONB,
  total_records INTEGER,
  processed_records INTEGER DEFAULT 0,
  file_path TEXT,
  file_size BIGINT,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_export_jobs_user_id ON public.export_jobs(user_id);
CREATE INDEX IF NOT EXISTS idx_export_jobs_status ON public.export_jobs(status);
CREATE INDEX IF NOT EXISTS idx_export_jobs_created_at ON public.export_jobs(created_at);

-- =====================================================
-- 5. ROW LEVEL SECURITY POLICIES
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE public.file_uploads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.import_errors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.import_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.export_jobs ENABLE ROW LEVEL SECURITY;

-- File uploads policies
CREATE POLICY "Users can view their own file uploads" ON public.file_uploads
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own file uploads" ON public.file_uploads
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own file uploads" ON public.file_uploads
  FOR UPDATE USING (auth.uid() = user_id);

-- Import errors policies
CREATE POLICY "Users can view their own import errors" ON public.import_errors
  FOR SELECT USING (
    auth.uid() = (
      SELECT user_id FROM public.file_uploads WHERE id = import_errors.file_upload_id
    )
  );

-- Import templates policies
CREATE POLICY "Users can view their own templates" ON public.import_templates
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own templates" ON public.import_templates
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own templates" ON public.import_templates
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own templates" ON public.import_templates
  FOR DELETE USING (auth.uid() = user_id);

-- Export jobs policies
CREATE POLICY "Users can view their own export jobs" ON public.export_jobs
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own export jobs" ON public.export_jobs
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own export jobs" ON public.export_jobs
  FOR UPDATE USING (auth.uid() = user_id);

-- =====================================================
-- 6. SAMPLE DATA FOR TESTING
-- =====================================================

-- Insert sample import template for testing
INSERT INTO public.import_templates (
  user_id,
  name,
  description,
  template_type,
  column_mappings,
  validation_rules,
  is_default
) VALUES (
  (SELECT id FROM auth.users LIMIT 1), -- Replace with actual user ID
  'Default Product Import',
  'Default template for importing products with intelligent column mapping',
  'product',
  '{
    "name": ["product_name", "name", "title", "product_name"],
    "description": ["description", "desc", "product_description"],
    "price": ["price", "cost", "amount", "product_price"],
    "category": ["category", "product_category", "type"],
    "brand": ["brand", "manufacturer", "company"]
  }',
  '{
    "name": {"required": true, "minLength": 1},
    "price": {"required": true, "type": "number", "min": 0},
    "description": {"maxLength": 1000}
  }',
  true
) ON CONFLICT DO NOTHING;

-- =====================================================
-- 7. VERIFICATION QUERIES
-- =====================================================

-- Check if tables were created successfully
SELECT 
  'file_uploads' as table_name,
  COUNT(*) as row_count
FROM public.file_uploads
UNION ALL
SELECT 
  'import_errors' as table_name,
  COUNT(*) as row_count
FROM public.import_errors
UNION ALL
SELECT 
  'import_templates' as table_name,
  COUNT(*) as row_count
FROM public.import_templates
UNION ALL
SELECT 
  'export_jobs' as table_name,
  COUNT(*) as row_count
FROM public.export_jobs;

-- =====================================================
-- SETUP COMPLETE!
-- =====================================================

-- Your import/export system is now ready!
-- The tables support:
-- ✅ Intelligent column mapping
-- ✅ Data transformation
-- ✅ Batch processing
-- ✅ Error tracking
-- ✅ Progress monitoring
-- ✅ Template management
-- ✅ Export job management 