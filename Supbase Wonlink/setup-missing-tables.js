#!/usr/bin/env node

/**
 * Setup Missing Import/Export Tables for Wonlink Platform
 * Creates the required tables for the import/export system
 */

const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

// Colors for console output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
}

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`)
}

function logSuccess(message) {
  log(`✅ ${message}`, 'green')
}

function logError(message) {
  log(`❌ ${message}`, 'red')
}

function logWarning(message) {
  log(`⚠️  ${message}`, 'yellow')
}

function logInfo(message) {
  log(`ℹ️  ${message}`, 'blue')
}

async function setupTables() {
  log('🚀 Setting up missing import/export tables...', 'bold')
  
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  )

  const tables = [
    {
      name: 'file_uploads',
      sql: `
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
        
        CREATE INDEX IF NOT EXISTS idx_file_uploads_user_id ON public.file_uploads(user_id);
        CREATE INDEX IF NOT EXISTS idx_file_uploads_status ON public.file_uploads(status);
        CREATE INDEX IF NOT EXISTS idx_file_uploads_created_at ON public.file_uploads(created_at);
      `
    },
    {
      name: 'import_errors',
      sql: `
        CREATE TABLE IF NOT EXISTS public.import_errors (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          file_upload_id UUID REFERENCES public.file_uploads(id) ON DELETE CASCADE,
          row_number INTEGER,
          column_name TEXT,
          error_message TEXT NOT NULL,
          raw_data JSONB,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        
        CREATE INDEX IF NOT EXISTS idx_import_errors_file_upload_id ON public.import_errors(file_upload_id);
        CREATE INDEX IF NOT EXISTS idx_import_errors_row_number ON public.import_errors(row_number);
      `
    },
    {
      name: 'import_templates',
      sql: `
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
        
        CREATE INDEX IF NOT EXISTS idx_import_templates_user_id ON public.import_templates(user_id);
        CREATE INDEX IF NOT EXISTS idx_import_templates_type ON public.import_templates(template_type);
      `
    },
    {
      name: 'export_jobs',
      sql: `
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
        
        CREATE INDEX IF NOT EXISTS idx_export_jobs_user_id ON public.export_jobs(user_id);
        CREATE INDEX IF NOT EXISTS idx_export_jobs_status ON public.export_jobs(status);
        CREATE INDEX IF NOT EXISTS idx_export_jobs_created_at ON public.export_jobs(created_at);
      `
    }
  ]

  for (const table of tables) {
    try {
      logInfo(`Creating table: ${table.name}`)
      
      const { error } = await supabase.rpc('exec_sql', { sql: table.sql })
      
      if (error) {
        // Try direct SQL execution
        const { error: directError } = await supabase.from('_exec_sql').select('*').limit(0)
        if (directError) {
          logWarning(`Table ${table.name} might already exist or need manual creation`)
          logInfo(`Please run this SQL in your Supabase SQL Editor:`)
          console.log(table.sql)
        }
      } else {
        logSuccess(`Table ${table.name} created successfully`)
      }
    } catch (error) {
      logWarning(`Could not create table ${table.name} automatically`)
      logInfo(`Please run this SQL in your Supabase SQL Editor:`)
      console.log(table.sql)
    }
  }

  // Set up RLS policies
  const policies = [
    {
      name: 'file_uploads_policy',
      sql: `
        ALTER TABLE public.file_uploads ENABLE ROW LEVEL SECURITY;
        
        CREATE POLICY "Users can view their own file uploads" ON public.file_uploads
          FOR SELECT USING (auth.uid() = user_id);
        
        CREATE POLICY "Users can insert their own file uploads" ON public.file_uploads
          FOR INSERT WITH CHECK (auth.uid() = user_id);
        
        CREATE POLICY "Users can update their own file uploads" ON public.file_uploads
          FOR UPDATE USING (auth.uid() = user_id);
      `
    },
    {
      name: 'import_errors_policy',
      sql: `
        ALTER TABLE public.import_errors ENABLE ROW LEVEL SECURITY;
        
        CREATE POLICY "Users can view their own import errors" ON public.import_errors
          FOR SELECT USING (
            auth.uid() = (
              SELECT user_id FROM public.file_uploads WHERE id = import_errors.file_upload_id
            )
          );
      `
    },
    {
      name: 'import_templates_policy',
      sql: `
        ALTER TABLE public.import_templates ENABLE ROW LEVEL SECURITY;
        
        CREATE POLICY "Users can view their own templates" ON public.import_templates
          FOR SELECT USING (auth.uid() = user_id);
        
        CREATE POLICY "Users can insert their own templates" ON public.import_templates
          FOR INSERT WITH CHECK (auth.uid() = user_id);
        
        CREATE POLICY "Users can update their own templates" ON public.import_templates
          FOR UPDATE USING (auth.uid() = user_id);
        
        CREATE POLICY "Users can delete their own templates" ON public.import_templates
          FOR DELETE USING (auth.uid() = user_id);
      `
    },
    {
      name: 'export_jobs_policy',
      sql: `
        ALTER TABLE public.export_jobs ENABLE ROW LEVEL SECURITY;
        
        CREATE POLICY "Users can view their own export jobs" ON public.export_jobs
          FOR SELECT USING (auth.uid() = user_id);
        
        CREATE POLICY "Users can insert their own export jobs" ON public.export_jobs
          FOR INSERT WITH CHECK (auth.uid() = user_id);
        
        CREATE POLICY "Users can update their own export jobs" ON public.export_jobs
          FOR UPDATE USING (auth.uid() = user_id);
      `
    }
  ]

  logInfo('Setting up Row Level Security policies...')
  
  for (const policy of policies) {
    try {
      const { error } = await supabase.rpc('exec_sql', { sql: policy.sql })
      if (error) {
        logWarning(`Policy ${policy.name} might need manual setup`)
        logInfo(`Please run this SQL in your Supabase SQL Editor:`)
        console.log(policy.sql)
      } else {
        logSuccess(`Policy ${policy.name} created successfully`)
      }
    } catch (error) {
      logWarning(`Could not create policy ${policy.name} automatically`)
      logInfo(`Please run this SQL in your Supabase SQL Editor:`)
      console.log(policy.sql)
    }
  }

  logSuccess('Setup complete! Running final verification...')
  
  // Verify tables exist
  const tableNames = ['file_uploads', 'import_errors', 'import_templates', 'export_jobs']
  
  for (const tableName of tableNames) {
    try {
      const { data, error } = await supabase.from(tableName).select('count').limit(1)
      if (error) {
        logError(`Table ${tableName} verification failed: ${error.message}`)
      } else {
        logSuccess(`Table ${tableName} verified and accessible`)
      }
    } catch (error) {
      logError(`Table ${tableName} verification failed: ${error.message}`)
    }
  }
}

setupTables().catch(console.error) 