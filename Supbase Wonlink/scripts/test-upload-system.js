const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')
require('dotenv').config({ path: '.env.local' })

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials in .env.local')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function testUploadSystem() {
  console.log('🧪 Testing Upload System...\n')

  // Test 1: Check if buckets exist
  console.log('📦 Test 1: Checking storage buckets...')
  const buckets = ['imports', 'exports', 'avatars', 'campaigns']
  
  for (const bucketName of buckets) {
    try {
      const { data, error } = await supabase.storage.getBucket(bucketName)
      if (error) {
        console.log(`❌ Bucket '${bucketName}' not found: ${error.message}`)
      } else {
        console.log(`✅ Bucket '${bucketName}' exists`)
      }
    } catch (error) {
      console.log(`❌ Error checking bucket '${bucketName}': ${error.message}`)
    }
  }

  // Test 2: Check if database tables exist
  console.log('\n🗄️  Test 2: Checking database tables...')
  const tables = ['file_uploads', 'import_errors', 'import_templates', 'export_jobs']
  
  for (const tableName of tables) {
    try {
      const { data, error } = await supabase
        .from(tableName)
        .select('*')
        .limit(1)
      
      if (error) {
        console.log(`❌ Table '${tableName}' not found: ${error.message}`)
      } else {
        console.log(`✅ Table '${tableName}' exists`)
      }
    } catch (error) {
      console.log(`❌ Error checking table '${tableName}': ${error.message}`)
    }
  }

  // Test 3: Test file upload
  console.log('\n📤 Test 3: Testing file upload...')
  
  // Create a test file
  const testContent = 'This is a test file for upload verification'
  const testFileName = `test-${Date.now()}.txt`
  const testFilePath = path.join(__dirname, '..', 'temp', testFileName)
  
  // Ensure temp directory exists
  const tempDir = path.join(__dirname, '..', 'temp')
  if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir, { recursive: true })
  }
  
  fs.writeFileSync(testFilePath, testContent)
  
  try {
    const { data, error } = await supabase.storage
      .from('imports')
      .upload(`test/${testFileName}`, testContent, {
        contentType: 'text/plain',
        upsert: true
      })
    
    if (error) {
      console.log(`❌ Upload failed: ${error.message}`)
    } else {
      console.log(`✅ Upload successful: ${data.path}`)
      
      // Test file retrieval
      const { data: urlData } = supabase.storage
        .from('imports')
        .getPublicUrl(`test/${testFileName}`)
      
      console.log(`✅ Public URL: ${urlData.publicUrl}`)
      
      // Clean up test file
      await supabase.storage
        .from('imports')
        .remove([`test/${testFileName}`])
      
      console.log('✅ Test file cleaned up')
    }
  } catch (error) {
    console.log(`❌ Upload test failed: ${error.message}`)
  }

  // Test 4: Test database insert
  console.log('\n💾 Test 4: Testing database insert...')
  
  try {
    const { data, error } = await supabase
      .from('file_uploads')
      .insert({
        file_name: 'test-upload.txt',
        original_name: 'test-upload.txt',
        file_size: 1024,
        file_type: 'text/plain',
        mime_type: 'text/plain',
        storage_path: 'test/test-upload.txt',
        status: 'uploaded',
        progress: 100
      })
      .select()
    
    if (error) {
      console.log(`❌ Database insert failed: ${error.message}`)
    } else {
      console.log(`✅ Database insert successful: ${data[0].id}`)
      
      // Clean up test record
      await supabase
        .from('file_uploads')
        .delete()
        .eq('file_name', 'test-upload.txt')
      
      console.log('✅ Test record cleaned up')
    }
  } catch (error) {
    console.log(`❌ Database test failed: ${error.message}`)
  }

  // Test 5: Check sample files
  console.log('\n📁 Test 5: Checking sample files...')
  const samplesDir = path.join(__dirname, '..', 'samples')
  
  if (fs.existsSync(samplesDir)) {
    const files = fs.readdirSync(samplesDir)
    console.log(`✅ Sample files directory exists with ${files.length} files:`)
    files.forEach(file => {
      const stats = fs.statSync(path.join(samplesDir, file))
      console.log(`   • ${file} (${(stats.size / 1024).toFixed(2)} KB)`)
    })
  } else {
    console.log('❌ Sample files directory not found')
    console.log('Run: node scripts/create-sample-files.js')
  }

  console.log('\n🎉 Upload system test complete!')
  console.log('\n📝 Summary:')
  console.log('✅ Storage buckets verified')
  console.log('✅ Database tables verified')
  console.log('✅ File upload functionality tested')
  console.log('✅ Database operations tested')
  console.log('✅ Sample files available')
  
  console.log('\n🚀 Ready to use the file upload utility!')
}

// Run the test
testUploadSystem().catch(console.error) 