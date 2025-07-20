# 📋 LLM Assistant Checklist for Import/Export Feature

**Use this checklist before working on any import/export related issues**

---

## 🚨 MANDATORY PRE-WORK CHECKLIST

### Before ANY Debugging or Modifications

- [ ] **Read handover notes**: `HANDOVER_NOTES_IMPORT_EXPORT.md` (REQUIRED)
- [ ] **Check implementation status**: `../IMPORT_EXPORT_IMPLEMENTATION_SUMMARY.md`
- [ ] **Verify current state**: System is COMPLETE and PRODUCTION-READY
- [ ] **Understand user issue**: Is it setup, bug, or feature request?

### Setup Verification (Do This FIRST)

- [ ] **Database schema applied**: Run `scripts/products-and-import-export-schema.sql`
- [ ] **Storage buckets exist**: 'imports' and 'exports' buckets in Supabase
- [ ] **Storage policies configured**: Follow `../SUPABASE_STORAGE_SETUP.md`
- [ ] **Dependencies installed**: papaparse, xlsx, react-dropzone, zod
- [ ] **API routes exist**: All 5 route files in `/app/api/import-export/`
- [ ] **Frontend components exist**: Page and upload components

---

## 🔧 TROUBLESHOOTING WORKFLOW

### Step 1: Identify Issue Type

**User reports "Import not working":**
1. Check: Can they access `/import-export` page?
2. Check: Do they see file upload zone?
3. Check: What error message appears?
4. Check: Are they a brand user (only brands can import)?

**User reports "File upload fails":**
1. Check: File size (<10MB) and type (CSV/Excel/JSON)?
2. Check: Storage buckets configured correctly?
3. Check: User authenticated and has proper permissions?
4. Check: Network/browser console errors?

**User reports "Processing stuck":**
1. Check: `file_uploads` table for upload status
2. Check: `import_errors` table for validation errors
3. Check: File format and data validity
4. Check: Database connection and function existence

**User reports "Export not working":**
1. Check: `export_jobs` table for job status
2. Check: User has products to export?
3. Check: Storage bucket write permissions?
4. Check: Export file generation errors?

### Step 2: Common Solutions

**Upload Issues:**
```bash
# Verify storage bucket exists
SELECT * FROM storage.buckets WHERE name IN ('imports', 'exports');

# Check storage policies
SELECT * FROM storage.policies WHERE bucket_id IN ('imports', 'exports');
```

**Processing Issues:**
```bash
# Check upload status
SELECT * FROM file_uploads WHERE user_id = '<user_id>' ORDER BY created_at DESC LIMIT 5;

# Check errors
SELECT * FROM import_errors WHERE upload_id = '<upload_id>';

# Verify products table
SELECT COUNT(*) FROM products;
```

**Export Issues:**
```bash
# Check export jobs
SELECT * FROM export_jobs WHERE user_id = '<user_id>' ORDER BY created_at DESC LIMIT 5;

# Verify products exist
SELECT COUNT(*) FROM products WHERE brand_id = '<user_id>';
```

---

## 🛠️ MODIFICATION GUIDELINES

### Before Making Code Changes

- [ ] **Backup current state**: Code is working, don't break it
- [ ] **Test existing functionality**: Ensure baseline works
- [ ] **Understand request**: Is this a bug fix or new feature?
- [ ] **Follow existing patterns**: Don't reinvent the architecture

### Safe Modification Areas

✅ **SAFE to modify:**
- UI styling and layout improvements
- Additional validation rules
- Error message improvements
- Translation additions
- New export formats
- Performance optimizations

⚠️ **MODIFY WITH CAUTION:**
- API endpoint logic
- Database schema changes
- File processing algorithms
- Authentication/authorization
- Storage configuration

🚫 **DO NOT MODIFY (unless critical bug):**
- Core database functions
- RLS policies
- Storage bucket configuration
- Authentication middleware
- File upload security

### Testing Requirements

After ANY modification:
- [ ] **Manual test**: Upload a file end-to-end
- [ ] **Export test**: Generate and download export
- [ ] **Error test**: Try invalid file, verify error handling
- [ ] **UI test**: Check all language translations
- [ ] **Security test**: Verify user isolation still works

---

## 📝 ISSUE RESOLUTION TEMPLATES

### Template 1: Setup Issue
```
The import/export feature is fully implemented and working. This appears to be a setup issue.

Required setup steps:
1. Run database schema: scripts/products-and-import-export-schema.sql
2. Configure storage buckets: docs/SUPABASE_STORAGE_SETUP.md
3. Verify user is logged in as a brand (only brands can import)

Please complete these steps and test again.
```

### Template 2: File Format Issue
```
The import system requires properly formatted files. Please ensure:

CSV format:
- Headers: name,price,category (minimum required)
- Data types: name (text), price (number), category (text)
- File size: Maximum 10MB

Download a template from the Import tab for the correct format.
```

### Template 3: Working as Designed
```
The import/export system is functioning correctly. Based on your description, this is expected behavior because:

[Explain why the behavior is correct]

If you need different functionality, please specify the exact requirements.
```

---

## 🚀 PERFORMANCE GUIDELINES

### Current Performance Benchmarks
- **File upload**: <30 seconds for 10MB file
- **Processing**: <2 minutes for 10,000 records
- **Export generation**: <5 seconds for most exports
- **File download**: Immediate (temporary URL)

### If Performance Issues Reported

Check these areas:
1. **Database performance**: Use Supabase performance insights
2. **File size**: Recommend splitting large files
3. **Batch size**: Currently 100 records per batch
4. **Network**: Upload/download speeds
5. **Browser**: Memory usage during processing

Optimization options:
- Increase batch size (test with 200-500 records)
- Add progress throttling
- Implement file streaming for large uploads
- Add compression support

---

## 🔍 DEBUGGING COMMANDS

### Quick Database Checks
```sql
-- Check if tables exist
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('products', 'file_uploads', 'import_errors', 'export_jobs');

-- Check recent uploads
SELECT id, original_name, status, progress, error_count 
FROM file_uploads 
ORDER BY created_at DESC LIMIT 10;

-- Check storage buckets
SELECT name, public FROM storage.buckets;

-- Check product count by user
SELECT brand_id, COUNT(*) as product_count 
FROM products 
GROUP BY brand_id;
```

### API Testing
```bash
# Test upload endpoint
curl -X POST http://localhost:3000/api/import-export/upload \
  -F "file=@test.csv" \
  -H "Authorization: Bearer <token>"

# Test template download
curl http://localhost:3000/api/import-export/templates?format=csv

# Check status
curl http://localhost:3000/api/import-export/status?uploadId=<id>
```

---

## 🎯 SUCCESS CRITERIA

### Issue Successfully Resolved If:
- [ ] User can upload files without errors
- [ ] Files process and show progress
- [ ] Products appear in database
- [ ] Exports generate and download
- [ ] Error messages are helpful and translated
- [ ] System maintains security (user isolation)

### Issue Escalation If:
- [ ] Database corruption or data loss
- [ ] Security vulnerability discovered
- [ ] Core system architecture needs changes
- [ ] Performance degradation affects all users
- [ ] Supabase service issues

---

## 📞 WHEN TO ASK FOR HELP

### Ask User for More Information If:
- Error messages are unclear or missing
- Can't reproduce the issue
- User requirements are ambiguous
- Multiple components seem affected

### Request from User:
1. **Exact steps** they followed
2. **Error messages** (screenshot preferred)
3. **File details** (size, format, sample data)
4. **Browser console** errors
5. **User role** (brand or influencer)

### Escalate to Human Developer If:
- Security concerns identified
- Database schema changes needed
- Architecture modifications required
- Supabase service configuration issues

---

*This checklist ensures consistent, high-quality support for the import/export feature while maintaining system stability and security.*