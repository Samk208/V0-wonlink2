const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials in .env.local')
  console.error('Please ensure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

// Bucket configurations
const buckets = [
  {
    name: 'imports',
    public: true,
    fileSizeLimit: 52428800, // 50MB
    allowedMimeTypes: [
      'text/csv',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel',
      'application/json'
    ]
  },
  {
    name: 'exports',
    public: true,
    fileSizeLimit: 52428800, // 50MB
    allowedMimeTypes: [
      'text/csv',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/json'
    ]
  },
  {
    name: 'avatars',
    public: true,
    fileSizeLimit: 5242880, // 5MB
    allowedMimeTypes: [
      'image/jpeg',
      'image/png',
      'image/webp'
    ]
  },
  {
    name: 'campaigns',
    public: true,
    fileSizeLimit: 10485760, // 10MB
    allowedMimeTypes: [
      'image/jpeg',
      'image/png',
      'image/webp',
      'application/pdf'
    ]
  }
]

async function setupStorageBuckets() {
  console.log('🚀 Setting up Supabase Storage Buckets...\n')

  for (const bucket of buckets) {
    try {
      console.log(`📦 Creating bucket: ${bucket.name}`)
      
      // Create bucket
      const { data: bucketData, error: bucketError } = await supabase.storage.createBucket(bucket.name, {
        public: bucket.public,
        fileSizeLimit: bucket.fileSizeLimit,
        allowedMimeTypes: bucket.allowedMimeTypes
      })

      if (bucketError) {
        if (bucketError.message.includes('already exists')) {
          console.log(`✅ Bucket '${bucket.name}' already exists`)
        } else {
          console.error(`❌ Error creating bucket '${bucket.name}':`, bucketError.message)
          continue
        }
      } else {
        console.log(`✅ Created bucket '${bucket.name}' successfully`)
      }

      // Create folder structure
      const folders = ['uploads', 'temp', 'processed']
      for (const folder of folders) {
        try {
          // Create a dummy file to establish the folder structure
          const dummyContent = 'dummy'
          const { error: folderError } = await supabase.storage
            .from(bucket.name)
            .upload(`${folder}/.keep`, dummyContent, {
              contentType: 'text/plain',
              upsert: true
            })

          if (folderError) {
            console.log(`⚠️  Note: Could not create folder '${folder}' in '${bucket.name}' (this is normal)`)
          } else {
            console.log(`📁 Created folder '${folder}' in '${bucket.name}'`)
          }
        } catch (error) {
          console.log(`📁 Folder '${folder}' in '${bucket.name}' (may already exist)`)
        }
      }

      console.log(`✅ Bucket '${bucket.name}' setup complete\n`)

    } catch (error) {
      console.error(`❌ Failed to setup bucket '${bucket.name}':`, error.message)
    }
  }

  console.log('🎉 Storage bucket setup complete!')
  console.log('\n📋 Summary of created buckets:')
  buckets.forEach(bucket => {
    console.log(`   • ${bucket.name} (${bucket.public ? 'Public' : 'Private'})`)
  })
  
  console.log('\n📝 Next steps:')
  console.log('1. Run the sample files script: node scripts/create-sample-files.js')
  console.log('2. Test file uploads using the upload utility')
  console.log('3. Verify storage policies are working correctly')
}

// Run the setup
setupStorageBuckets().catch(console.error) 