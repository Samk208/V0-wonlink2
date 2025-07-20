# Supabase Storage Setup for Import/Export Functionality

This guide explains how to set up the required storage buckets for the import/export functionality in the Wonlink platform.

## Required Storage Buckets

The import/export system requires two storage buckets:

1. **imports** - For storing uploaded files during import process
2. **exports** - For storing generated export files

## Setup Instructions

### Step 1: Create Storage Buckets

1. Go to your Supabase Dashboard
2. Navigate to **Storage** in the left sidebar
3. Click **Create bucket** button

#### Create 'imports' bucket:
- **Name**: `imports`
- **Public**: `false` (keep private)
- Click **Create bucket**

#### Create 'exports' bucket:
- **Name**: `exports`
- **Public**: `false` (keep private)
- Click **Create bucket**

### Step 2: Set Up Storage Policies

After creating the buckets, you need to set up Row Level Security (RLS) policies for proper access control.

#### For 'imports' bucket:

1. Go to **Storage** > **Policies**
2. Find the `imports` bucket and click **New Policy**
3. Create the following policies:

**Policy 1: Users can upload own files**
```sql
CREATE POLICY "Users can upload own files" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'imports' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );
```

**Policy 2: Users can view own files**
```sql
CREATE POLICY "Users can view own files" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'imports' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );
```

#### For 'exports' bucket:

**Policy 3: Users can upload own exports**
```sql
CREATE POLICY "Users can upload own exports" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'exports' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );
```

**Policy 4: Users can view own exports**
```sql
CREATE POLICY "Users can view own exports" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'exports' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );
```

### Step 3: Verify Setup

To verify the setup is correct:

1. Check that both buckets appear in the Storage section
2. Ensure both buckets are marked as "Private"
3. Verify that the policies are created and active
4. Test file upload through the application

## File Organization

The storage buckets will organize files as follows:

### Imports bucket structure:
```
imports/
├── [user-id-1]/
│   ├── timestamp_filename.csv
│   ├── timestamp_filename.xlsx
│   └── timestamp_filename.json
├── [user-id-2]/
│   └── ...
```

### Exports bucket structure:
```
exports/
├── [user-id-1]/
│   ├── products_export_timestamp.csv
│   ├── campaigns_export_timestamp.xlsx
│   └── analytics_export_timestamp.pdf
├── [user-id-2]/
│   └── ...
```

## Security Features

- **User Isolation**: Each user can only access their own files
- **Private Buckets**: Files are not publicly accessible
- **Authenticated Access**: Only authenticated users can upload/download
- **Temporary URLs**: Download URLs expire after 1 hour for security

## Troubleshooting

### Common Issues:

1. **Upload fails with 403 error**
   - Check that storage policies are correctly created
   - Verify user authentication

2. **Files not appearing**
   - Check bucket names match exactly (`imports` and `exports`)
   - Verify RLS policies are active

3. **Access denied errors**
   - Ensure user is authenticated
   - Check that policies reference correct bucket names

### Support

If you encounter issues:
1. Check the browser console for error messages
2. Verify Supabase project settings
3. Test with the Supabase Storage API directly
4. Contact development team with specific error messages

## Next Steps

After completing the storage setup:
1. Run the database schema script: `scripts/products-and-import-export-schema.sql`
2. Test the import/export functionality through the application
3. Monitor storage usage in the Supabase Dashboard