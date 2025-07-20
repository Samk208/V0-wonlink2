-- PRODUCTS TABLE AND IMPORT/EXPORT COMPLETE SCHEMA
-- This script adds the missing products table and import/export functionality
-- Run this script in Supabase SQL Editor

-- Create products table (missing from the main schema)
CREATE TABLE IF NOT EXISTS public.products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  category TEXT NOT NULL,
  brand TEXT,
  sku TEXT UNIQUE,
  image_url TEXT,
  tags TEXT[] DEFAULT '{}',
  availability TEXT DEFAULT 'in_stock' CHECK (availability IN ('in_stock', 'out_of_stock', 'discontinued')),
  commission_rate DECIMAL(5,2) DEFAULT 0,
  
  -- Import tracking fields
  import_batch_id UUID,
  external_id TEXT,
  last_imported_at TIMESTAMP WITH TIME ZONE,
  
  -- Standard fields
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Brand ownership
  brand_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE
);

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
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.file_uploads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.import_errors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.import_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.export_jobs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for products table
CREATE POLICY "Users can view all products" ON public.products
  FOR SELECT USING (true);

CREATE POLICY "Brands can insert their own products" ON public.products
  FOR INSERT WITH CHECK (auth.uid() = brand_id);

CREATE POLICY "Brands can update their own products" ON public.products
  FOR UPDATE USING (auth.uid() = brand_id);

CREATE POLICY "Brands can delete their own products" ON public.products
  FOR DELETE USING (auth.uid() = brand_id);

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
CREATE INDEX IF NOT EXISTS idx_products_brand_id ON public.products(brand_id);
CREATE INDEX IF NOT EXISTS idx_products_category ON public.products(category);
CREATE INDEX IF NOT EXISTS idx_products_sku ON public.products(sku);
CREATE INDEX IF NOT EXISTS idx_products_name ON public.products USING gin(to_tsvector('english', name));
CREATE INDEX IF NOT EXISTS idx_products_tags ON public.products USING gin(tags);
CREATE INDEX IF NOT EXISTS idx_products_import_batch ON public.products(import_batch_id);
CREATE INDEX IF NOT EXISTS idx_products_external_id ON public.products(external_id);
CREATE INDEX IF NOT EXISTS idx_products_created_at ON public.products(created_at);

CREATE INDEX IF NOT EXISTS idx_file_uploads_user_id ON public.file_uploads(user_id);
CREATE INDEX IF NOT EXISTS idx_file_uploads_status ON public.file_uploads(status);
CREATE INDEX IF NOT EXISTS idx_file_uploads_created_at ON public.file_uploads(created_at);

CREATE INDEX IF NOT EXISTS idx_import_errors_upload_id ON public.import_errors(upload_id);
CREATE INDEX IF NOT EXISTS idx_import_errors_row_number ON public.import_errors(row_number);

CREATE INDEX IF NOT EXISTS idx_import_templates_user_id ON public.import_templates(user_id);
CREATE INDEX IF NOT EXISTS idx_import_templates_file_type ON public.import_templates(file_type);

CREATE INDEX IF NOT EXISTS idx_export_jobs_user_id ON public.export_jobs(user_id);
CREATE INDEX IF NOT EXISTS idx_export_jobs_status ON public.export_jobs(status);

-- Add foreign key constraint for import tracking
ALTER TABLE public.file_uploads ADD CONSTRAINT fk_file_uploads_import_batch 
  FOREIGN KEY (id) REFERENCES public.products(import_batch_id) ON DELETE SET NULL;

-- Create updated_at trigger for products
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON public.products
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create trigger for import_templates
CREATE TRIGGER update_import_templates_updated_at BEFORE UPDATE ON public.import_templates
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

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
        tags,
        availability,
        commission_rate,
        import_batch_id,
        last_imported_at,
        brand_id,
        created_at
      ) VALUES (
        product_record->>'name',
        product_record->>'description',
        (product_record->>'price')::DECIMAL,
        product_record->>'category',
        product_record->>'brand',
        product_record->>'sku',
        product_record->>'image_url',
        CASE 
          WHEN product_record->'tags' IS NOT NULL 
          THEN ARRAY(SELECT jsonb_array_elements_text(product_record->'tags'))
          ELSE '{}'::TEXT[]
        END,
        COALESCE(product_record->>'availability', 'in_stock'),
        COALESCE((product_record->>'commission_rate')::DECIMAL, 0),
        batch_id,
        NOW(),
        user_id,
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

-- Create view for product analytics
CREATE OR REPLACE VIEW product_analytics AS
SELECT 
  p.brand_id,
  COUNT(p.id) as total_products,
  COUNT(CASE WHEN p.availability = 'in_stock' THEN 1 END) as in_stock_products,
  COUNT(CASE WHEN p.availability = 'out_of_stock' THEN 1 END) as out_of_stock_products,
  AVG(p.price) as average_price,
  MIN(p.price) as min_price,
  MAX(p.price) as max_price,
  COUNT(DISTINCT p.category) as categories_count,
  COUNT(DISTINCT p.brand) as brands_count,
  COUNT(CASE WHEN p.import_batch_id IS NOT NULL THEN 1 END) as imported_products,
  MAX(p.last_imported_at) as last_import_date,
  MAX(p.created_at) as last_product_date
FROM products p
GROUP BY p.brand_id;

-- Insert sample products for testing
INSERT INTO public.products (name, description, price, category, brand, sku, brand_id, availability, commission_rate) VALUES
(
  'Sample Fashion Item',
  'A beautiful fashion item perfect for summer styling',
  29.99,
  'Fashion',
  'Demo Brand',
  'DEMO-FASHION-001',
  '00000000-0000-0000-0000-000000000001',
  'in_stock',
  15.00
),
(
  'Beauty Product Sample',
  'Premium beauty product for daily skincare routine',
  45.50,
  'Beauty',
  'Glow Cosmetics',
  'GLOW-BEAUTY-001',
  '00000000-0000-0000-0000-000000000001',
  'in_stock',
  20.00
),
(
  'Tech Gadget Example',
  'Innovative tech gadget for modern lifestyle',
  199.99,
  'Technology',
  'TechInnovate',
  'TECH-GAD-001',
  '00000000-0000-0000-0000-000000000001',
  'in_stock',
  10.00
)
ON CONFLICT (sku) DO NOTHING;

-- Create storage bucket setup instructions (to be run separately in Supabase Dashboard)
-- These are SQL comments with the commands to run:

/*
-- Run these commands in Supabase Dashboard > Storage > Create bucket
INSERT INTO storage.buckets (id, name, public) VALUES ('imports', 'imports', false);
INSERT INTO storage.buckets (id, name, public) VALUES ('exports', 'exports', false);

-- Storage policies (to be added in Supabase Dashboard > Storage > Policies)
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

-- Success message
SELECT 'Products table and Import/Export schema setup completed successfully! 🎉' as status,
       'Sample products have been inserted. Storage buckets need to be created manually in Supabase Dashboard.' as next_step;