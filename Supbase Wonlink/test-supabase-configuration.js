#!/usr/bin/env node

/**
 * Supabase Configuration Test for Wonlink Platform
 * Tests environment setup, database connection, storage, and import/export functionality
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

async function testSupabaseConfiguration() {
  log('🚀 Testing Supabase Configuration for Wonlink Platform', 'bold')
  log('=' * 60)
  
  let allTestsPassed = true
  
  // Test 1: Environment Variables
  log('\n📋 Test 1: Environment Variables')
  const requiredEnvVars = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    'SUPABASE_SERVICE_ROLE_KEY'
  ]
  
  const missingVars = requiredEnvVars.filter(varName => !process.env[varName])
  
  if (missingVars.length > 0) {
    logError(`Missing environment variables: ${missingVars.join(', ')}`)
    logInfo('Please create .env.local file with your Supabase credentials')
    allTestsPassed = false
  } else {
    logSuccess('All required environment variables are set')
  }
  
  // Test 2: Supabase Connection
  log('\n🔌 Test 2: Supabase Connection')
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    )
    
    const { data, error } = await supabase.from('profiles').select('count').limit(1)
    
    if (error) {
      logError(`Database connection failed: ${error.message}`)
      allTestsPassed = false
    } else {
      logSuccess('Supabase connection successful')
    }
  } catch (error) {
    logError(`Connection error: ${error.message}`)
    allTestsPassed = false
  }
  
  // Test 3: Database Tables
  log('\n🗄️ Test 3: Database Tables')
  const requiredTables = [
    'profiles',
    'campaigns', 
    'campaign_applications',
    'notifications',
    'wallet_transactions',
    'file_uploads',
    'import_errors',
    'import_templates',
    'export_jobs'
  ]
  
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    )
    
    for (const tableName of requiredTables) {
      try {
        const { data, error } = await supabase
          .from(tableName)
          .select('*')
          .limit(1)
        
        if (error) {
          logError(`Table '${tableName}' not accessible: ${error.message}`)
          allTestsPassed = false
        } else {
          logSuccess(`Table '${tableName}' accessible`)
        }
      } catch (error) {
        logError(`Table '${tableName}' test failed: ${error.message}`)
        allTestsPassed = false
      }
    }
  } catch (error) {
    logError(`Database tables test failed: ${error.message}`)
    allTestsPassed = false
  }
  
  // Test 4: Storage Buckets
  log('\n📦 Test 4: Storage Buckets')
  const requiredBuckets = ['imports', 'exports']
  
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    )
    
    for (const bucketName of requiredBuckets) {
      try {
        const { data, error } = await supabase.storage.getBucket(bucketName)
        
        if (error) {
          logError(`Bucket '${bucketName}' not found: ${error.message}`)
          logInfo(`Please create bucket '${bucketName}' in Supabase Dashboard`)
          allTestsPassed = false
        } else {
          logSuccess(`Bucket '${bucketName}' exists`)
        }
      } catch (error) {
        logError(`Bucket '${bucketName}' test failed: ${error.message}`)
        allTestsPassed = false
      }
    }
  } catch (error) {
    logError(`Storage buckets test failed: ${error.message}`)
    allTestsPassed = false
  }
  
  // Test 5: Import/Export Configuration
  log('\n📊 Test 5: Import/Export Configuration')
  const importExportConfig = {
    maxFileSize: process.env.NEXT_PUBLIC_MAX_FILE_SIZE || '10485760',
    supportedFileTypes: process.env.NEXT_PUBLIC_SUPPORTED_FILE_TYPES || '.csv,.xlsx,.xls,.json',
    batchSize: process.env.NEXT_PUBLIC_BATCH_SIZE || '100',
    maxRecords: process.env.NEXT_PUBLIC_MAX_RECORDS || '10000',
    importsBucket: process.env.NEXT_PUBLIC_IMPORTS_BUCKET || 'imports',
    exportsBucket: process.env.NEXT_PUBLIC_EXPORTS_BUCKET || 'exports'
  }
  
  logInfo('Import/Export Configuration:')
  Object.entries(importExportConfig).forEach(([key, value]) => {
    log(`  ${key}: ${value}`)
  })
  
  // Test 6: Internationalization
  log('\n🌍 Test 6: Internationalization')
  const supportedLanguages = process.env.NEXT_PUBLIC_SUPPORTED_LANGUAGES || 'en,ko,zh'
  const defaultLanguage = process.env.NEXT_PUBLIC_DEFAULT_LANGUAGE || 'en'
  
  logSuccess(`Supported languages: ${supportedLanguages}`)
  logSuccess(`Default language: ${defaultLanguage}`)
  
  // Test 7: File System
  log('\n📁 Test 7: File System')
  const fs = require('fs')
  const path = require('path')
  
  const requiredFiles = [
    'lib/translations.ts',
    'lib/supabase.ts',
    'app/import-export/page.tsx',
    'components/import-export/file-upload-zone.tsx',
    'lib/import-export/index.ts',
    'lib/import-export/transformers/column-mapper.ts',
    'lib/import-export/transformers/data-transformer.ts',
    'lib/import-export/batch/progress-tracker.ts'
  ]
  
  for (const filePath of requiredFiles) {
    if (fs.existsSync(filePath)) {
      logSuccess(`File exists: ${filePath}`)
    } else {
      logError(`File missing: ${filePath}`)
      allTestsPassed = false
    }
  }
  
  // Test 8: Dependencies
  log('\n📦 Test 8: Dependencies')
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'))
  const requiredDependencies = [
    '@supabase/supabase-js',
    'papaparse',
    'xlsx',
    'react-dropzone',
    'zod'
  ]
  
  for (const dep of requiredDependencies) {
    if (packageJson.dependencies?.[dep] || packageJson.devDependencies?.[dep]) {
      logSuccess(`Dependency installed: ${dep}`)
    } else {
      logError(`Dependency missing: ${dep}`)
      allTestsPassed = false
    }
  }
  
  // Summary
  log('\n' + '=' * 60)
  if (allTestsPassed) {
    logSuccess('🎉 All tests passed! Supabase configuration is ready.')
    logInfo('Next steps:')
    logInfo('1. Start development server: npm run dev')
    logInfo('2. Navigate to /import-export')
    logInfo('3. Test file upload and export functionality')
    logInfo('4. Verify internationalization works')
  } else {
    logError('❌ Some tests failed. Please fix the issues above.')
    logInfo('Check the configuration guide: SUPABASE_CONFIGURATION_GUIDE.md')
  }
  
  return allTestsPassed
}

// Run the test
if (require.main === module) {
  testSupabaseConfiguration()
    .then(success => {
      process.exit(success ? 0 : 1)
    })
    .catch(error => {
      logError(`Test failed with error: ${error.message}`)
      process.exit(1)
    })
}

module.exports = { testSupabaseConfiguration } 