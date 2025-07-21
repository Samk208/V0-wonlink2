# Storage and File Setup Guide

This guide will help you set up the storage buckets and create sample files for testing the file upload functionality.

## Prerequisites

1. **Supabase Project**: Ensure you have a Supabase project set up
2. **Environment Variables**: Make sure your `.env.local` file contains:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   ```

## Step 1: Create Storage Buckets

### Option A: Using the Setup Script (Recommended)

Run the automated setup script:

```bash
node scripts/setup-storage-buckets.js
```

This script will:
- Create all required storage buckets
- Set appropriate file size limits
- Configure allowed MIME types
- Create folder structure

### Option B: Manual Setup via Supabase Dashboard

1. Go to your Supabase project dashboard
2. Navigate to **Storage** in the left sidebar
3. Create the following buckets:

#### Bucket: `imports`
- **Public**: Yes
- **File size limit**: 50MB
- **Allowed MIME types**: 
  - `text/csv`
  - `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`
  - `application/vnd.ms-excel`
  - `application/json`

#### Bucket: `exports`
- **Public**: Yes
- **File size limit**: 50MB
- **Allowed MIME types**:
  - `text/csv`
  - `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`
  - `application/json`

#### Bucket: `avatars`
- **Public**: Yes
- **File size limit**: 5MB
- **Allowed MIME types**:
  - `image/jpeg`
  - `image/png`
  - `image/webp`

#### Bucket: `campaigns`
- **Public**: Yes
- **File size limit**: 10MB
- **Allowed MIME types**:
  - `image/jpeg`
  - `image/png`
  - `image/webp`
  - `application/pdf`

## Step 2: Create Sample Files

Run the sample files creation script:

```bash
node scripts/create-sample-files.js
```

This will create:
- `samples/sample-products.csv` - Product data for testing
- `samples/sample-campaigns.json` - Campaign data for testing
- `samples/sample-applications.csv` - Application data for testing
- `samples/README.md` - Documentation for the sample files

## Step 3: Test the System

Run the test script to verify everything is working:

```bash
node scripts/test-upload-system.js
```

This script will:
- Verify storage buckets exist
- Check database tables are accessible
- Test file upload functionality
- Test database operations
- Verify sample files are available

## Step 4: Verify Storage Policies

Ensure the storage policies are properly configured by running:

```sql
-- Check if policies exist
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
```

## Step 5: Test File Upload

### Using the Upload Utility

```typescript
import { uploadFile } from '@/lib/upload-utils'

// Test with a sample file
const file = new File(['test content'], 'test.csv', { type: 'text/csv' })

const result = await uploadFile(file, {
  bucket: 'imports',
  processImmediately: true,
  onProgress: (progress) => {
    console.log(`Progress: ${progress}%`)
  }
})

console.log('Upload result:', result)
```

### Using the Example Components

1. **Simple Upload Example**:
   ```tsx
   import { SimpleUploadExample } from '@/components/examples/simple-upload-example'
   
   export default function TestPage() {
     return <SimpleUploadExample />
   }
   ```

2. **Advanced Upload Example**:
   ```tsx
   import { FileUploadExample } from '@/components/examples/file-upload-example'
   
   export default function TestPage() {
     return <FileUploadExample />
   }
   ```

## File Structure Created

After running the scripts, you'll have:

```
your-project/
├── samples/
│   ├── sample-products.csv
│   ├── sample-campaigns.json
│   ├── sample-applications.csv
│   └── README.md
├── scripts/
│   ├── setup-storage-buckets.js
│   ├── create-sample-files.js
│   └── test-upload-system.js
└── lib/
    └── upload-utils.ts
```

## Storage Bucket Structure

```
imports/
├── uploads/          # User uploaded files
├── temp/             # Temporary processing files
└── processed/        # Processed files

exports/
├── uploads/          # User uploaded files
├── temp/             # Temporary processing files
└── processed/        # Processed files

avatars/
├── uploads/          # User profile images
└── processed/        # Optimized images

campaigns/
├── uploads/          # Campaign assets
└── processed/        # Optimized assets
```

## Troubleshooting

### Common Issues

1. **"Bucket not found" error**:
   - Ensure you're using the correct Supabase credentials
   - Check that the bucket was created successfully
   - Verify the bucket name matches exactly

2. **"Permission denied" error**:
   - Check that storage policies are properly configured
   - Ensure the user is authenticated
   - Verify RLS is enabled on storage.objects

3. **"File too large" error**:
   - Check the file size limit on the bucket
   - Ensure the file is within the allowed size

4. **"Invalid file type" error**:
   - Check the allowed MIME types for the bucket
   - Ensure the file extension matches the content type

### Debug Steps

1. **Check Supabase Logs**:
   - Go to your Supabase dashboard
   - Navigate to Logs > Storage
   - Look for any error messages

2. **Test with Simple File**:
   ```typescript
   const testFile = new File(['test'], 'test.txt', { type: 'text/plain' })
   const result = await uploadFile(testFile, { bucket: 'imports' })
   console.log(result)
   ```

3. **Verify Environment Variables**:
   ```bash
   echo $NEXT_PUBLIC_SUPABASE_URL
   echo $SUPABASE_SERVICE_ROLE_KEY
   ```

## Next Steps

Once everything is set up:

1. **Test the upload functionality** with the sample files
2. **Integrate the upload utility** into your components
3. **Customize the upload options** for your specific needs
4. **Add error handling** and user feedback
5. **Implement progress tracking** for better UX

## Support

If you encounter issues:

1. Check the troubleshooting section above
2. Review the Supabase documentation
3. Check the console for error messages
4. Verify all environment variables are set correctly

The file upload system is now ready to use! 🚀 