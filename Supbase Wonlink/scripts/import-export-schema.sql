-- Import/Export Database Schema for Wonlink Platform
-- File Upload Tracking and Import Management

-- Create file_uploads table for tracking file uploads and processing status
CREATE TABLE IF NOT EXISTS file_uploads (
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
CREATE TABLE IF NOT EXISTS import_errors (
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
CREATE TABLE IF NOT EXISTS import_templates (
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
CREATE TABLE IF NOT EXISTS export_jobs (
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

-- Add columns to products table for import tracking (if not already present)
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'import_batch_id') THEN
    ALTER TABLE products ADD COLUMN import_batch_id UUID REFERENCES file_uploads(id);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'external_id') THEN
    ALTER TABLE products ADD COLUMN external_id TEXT;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'last_imported_at') THEN
    ALTER TABLE products ADD COLUMN last_imported_at TIMESTAMP WITH TIME ZONE;
  END IF;
END $$;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_file_uploads_user_id ON file_uploads(user_id);
CREATE INDEX IF NOT EXISTS idx_file_uploads_status ON file_uploads(status);
CREATE INDEX IF NOT EXISTS idx_file_uploads_created_at ON file_uploads(created_at);

CREATE INDEX IF NOT EXISTS idx_import_errors_upload_id ON import_errors(upload_id);
CREATE INDEX IF NOT EXISTS idx_import_errors_row_number ON import_errors(row_number);

CREATE INDEX IF NOT EXISTS idx_import_templates_user_id ON import_templates(user_id);
CREATE INDEX IF NOT EXISTS idx_import_templates_file_type ON import_templates(file_type);

CREATE INDEX IF NOT EXISTS idx_export_jobs_user_id ON export_jobs(user_id);
CREATE INDEX IF NOT EXISTS idx_export_jobs_status ON export_jobs(status);

CREATE INDEX IF NOT EXISTS idx_products_import_batch ON products(import_batch_id);
CREATE INDEX IF NOT EXISTS idx_products_external_id ON products(external_id);

-- Enable RLS (Row Level Security)
ALTER TABLE file_uploads ENABLE ROW LEVEL SECURITY;
ALTER TABLE import_errors ENABLE ROW LEVEL SECURITY;
ALTER TABLE import_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE export_jobs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for file_uploads
CREATE POLICY "Users can view own uploads" ON file_uploads
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own uploads" ON file_uploads  
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own uploads" ON file_uploads
  FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policies for import_errors
CREATE POLICY "Users can view own import errors" ON import_errors
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM file_uploads 
      WHERE file_uploads.id = import_errors.upload_id 
      AND file_uploads.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own import errors" ON import_errors
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM file_uploads 
      WHERE file_uploads.id = import_errors.upload_id 
      AND file_uploads.user_id = auth.uid()
    )
  );

-- RLS Policies for import_templates
CREATE POLICY "Users can view own templates" ON import_templates
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own templates" ON import_templates
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own templates" ON import_templates
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own templates" ON import_templates
  FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for export_jobs
CREATE POLICY "Users can view own exports" ON export_jobs
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own exports" ON export_jobs
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own exports" ON export_jobs
  FOR UPDATE USING (auth.uid() = user_id);

-- Create storage bucket for file uploads (this needs to be run separately in Supabase Dashboard)
-- INSERT INTO storage.buckets (id, name, public) VALUES ('imports', 'imports', false);
-- INSERT INTO storage.buckets (id, name, public) VALUES ('exports', 'exports', false);

-- Storage policies (to be added in Supabase Dashboard)
/*
-- Policy for file uploads bucket
CREATE POLICY "Users can upload own files" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'imports' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can view own files" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'imports' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Policy for export files bucket
CREATE POLICY "Users can upload own exports" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'exports' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can view own exports" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'exports' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );
*/

-- Create PostgreSQL function for bulk product inserts
CREATE OR REPLACE FUNCTION bulk_insert_products(
  products_data JSONB,
  batch_id UUID,
  user_id UUID
) RETURNS TABLE (
  success_count INTEGER,
  error_count INTEGER,
  errors JSONB
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  product_record JSONB;
  success_cnt INTEGER := 0;
  error_cnt INTEGER := 0;
  error_details JSONB := '[]'::JSONB;
  error_msg TEXT;
BEGIN
  -- Loop through each product in the JSON array
  FOR product_record IN SELECT * FROM jsonb_array_elements(products_data)
  LOOP
    BEGIN
      -- Insert product with error handling
      INSERT INTO products (
        name,
        description,
        price,
        category,
        brand,
        sku,
        image_url,
        import_batch_id,
        last_imported_at,
        created_at
      ) VALUES (
        product_record->>'name',
        product_record->>'description',
        (product_record->>'price')::DECIMAL,
        product_record->>'category',
        product_record->>'brand',
        product_record->>'sku',
        product_record->>'image_url',
        batch_id,
        NOW(),
        NOW()
      );
      
      success_cnt := success_cnt + 1;
      
    EXCEPTION WHEN OTHERS THEN
      error_cnt := error_cnt + 1;
      error_msg := SQLERRM;
      
      -- Add error to details array
      error_details := error_details || jsonb_build_object(
        'product', product_record,
        'error', error_msg
      );
    END;
  END LOOP;
  
  -- Return results
  RETURN QUERY SELECT success_cnt, error_cnt, error_details;
END;
$$;

-- Create function to update file upload progress
CREATE OR REPLACE FUNCTION update_upload_progress(
  upload_id UUID,
  new_progress INTEGER,
  new_status TEXT DEFAULT NULL,
  processed_count INTEGER DEFAULT NULL,
  success_count INTEGER DEFAULT NULL,
  error_count INTEGER DEFAULT NULL
) RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE file_uploads 
  SET 
    progress = new_progress,
    status = COALESCE(new_status, status),
    processed_records = COALESCE(processed_count, processed_records),
    success_count = COALESCE(success_count, success_count),
    error_count = COALESCE(error_count, error_count),
    started_at = CASE WHEN started_at IS NULL AND new_status = 'processing' THEN NOW() ELSE started_at END,
    completed_at = CASE WHEN new_status IN ('completed', 'failed') THEN NOW() ELSE completed_at END
  WHERE id = upload_id;
END;
$$;

-- Create materialized view for import/export analytics
CREATE MATERIALIZED VIEW IF NOT EXISTS import_export_analytics AS
SELECT 
  u.id as user_id,
  COUNT(f.id) as total_imports,
  COUNT(CASE WHEN f.status = 'completed' THEN 1 END) as successful_imports,
  COUNT(CASE WHEN f.status = 'failed' THEN 1 END) as failed_imports,
  COALESCE(SUM(f.success_count), 0) as total_products_imported,
  COALESCE(SUM(f.error_count), 0) as total_import_errors,
  COUNT(e.id) as total_exports,
  COUNT(CASE WHEN e.status = 'completed' THEN 1 END) as successful_exports,
  COALESCE(AVG(f.file_size), 0) as avg_file_size,
  MAX(f.created_at) as last_import_date,
  MAX(e.created_at) as last_export_date
FROM auth.users u
LEFT JOIN file_uploads f ON f.user_id = u.id
LEFT JOIN export_jobs e ON e.user_id = u.id
GROUP BY u.id;

-- Create index on the materialized view
CREATE UNIQUE INDEX IF NOT EXISTS idx_import_export_analytics_user_id 
ON import_export_analytics(user_id);

-- Refresh function for the materialized view
CREATE OR REPLACE FUNCTION refresh_import_export_analytics() 
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY import_export_analytics;
END;
$$;