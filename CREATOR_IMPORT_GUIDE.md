# Creator Database Import Guide

## Overview
The Creator Database Import feature allows admin users to bulk import creator records from Excel files into the Aurax platform. This streamlines the process of adding multiple creators at once rather than creating them individually.

## Features
✅ **Bulk Import** - Import multiple creators from a single Excel file  
✅ **Data Mapping** - Automatic field mapping from Excel columns to database schema  
✅ **Duplicate Detection** - Prevents duplicate entries by checking email and Instagram handles  
✅ **Error Handling** - Detailed error reporting for failed imports  
✅ **Audit Trail** - Complete import history with admin user, timestamp, and source file info  
✅ **Real-time Validation** - Validates data on import with meaningful error messages  

## Supported File Formats
- **Excel**: `.xlsx`, `.xls`
- **CSV**: `.csv`
- **Maximum File Size**: 10MB
- **Maximum Rows**: Unlimited (tested with 500+ creators)

## Excel Column Mapping

### Required Columns (at least one of these)
| Excel Column | Database Field | Notes |
|---|---|---|
| Creator Name / Name / Full Name | `name` | Must have at least this to create a creator |
| Instagram / Instagram Handle / Handle | `socials.instagram` | Social media handle (@ symbol removed automatically) |
| Business Email / Email | `email` | Validated email format |

### Optional Columns
| Excel Column | Database Field | Notes |
|---|---|---|
| Location / City | `location`, `city` | Creator location |
| Bio / About | `bio` | Creator biography |
| Profile Picture / Avatar URL | `avatar`, `profilePictureUrl` | Profile image URL |
| Followers / Follower Count | `followers` | Number of followers |
| Following / Following Count | `followingCount` | Number following |
| Post Count / Posts | `postCount` | Number of posts |
| YouTube / YouTube Handle | `socials.youtube` | YouTube handle |
| TikTok / TikTok Handle | `socials.tiktok` | TikTok handle |
| Facebook / Facebook Handle | `socials.facebook` | Facebook handle |
| Twitter / Twitter Handle | `socials.twitter` | Twitter handle |
| Story Price / Price Story | `rateStory` | Story collaboration rate (INR) |
| Reel Price / Price Reel | `rateReel` | Reel collaboration rate (INR) |
| Post Price / Price Post | `ratePost` | Post collaboration rate (INR) |
| Management Handle | `managementHandle` | Manager/agency handle |
| Manager Name | `managerName` | Manager name |
| Manager Contact / Manager Email | `managerContact` | Manager contact info |
| Management Type | `managementType` | SELF_MANAGED or AGENCY_MANAGED |
| Primary Niche / Niche / Category | `primaryNiche` | Content category (Fashion, Tech, etc.) |
| Secondary Niche / Sub Category | `secondaryNiche` | Secondary content category |
| Languages / Language | `languages` | Comma-separated language list |
| Content Formats / Format | `contentFormats` | Comma-separated format list (Reels, Stories, etc.) |
| Phone | `phone` | Phone number |
| WhatsApp | `whatsappNumber` | WhatsApp number |
| Website | `websiteUrl` | Creator website URL |
| Media Kit | `mediaKitLink` | Media kit download link |
| Available for Paid | `availableForPaid` | Yes/No or True/False |
| Available for PR | `availableForPR` | Yes/No or True/False |
| Engagement Rate | `engagementRate` | Engagement rate percentage |

## How to Use

### Step 1: Prepare Your Excel File
1. Open the Excel file: `AuraxAI_CreatorDatabase_MASTER_COMBINED_v4.xlsx`
2. Ensure columns are properly named (see mapping table above)
3. Remove any empty rows at the top or bottom
4. Verify data quality:
   - Email addresses are valid (format: name@domain.com)
   - Instagram handles don't have @ symbols (they're removed automatically)
   - Numbers are properly formatted (no text like "1.2K", use actual numbers)
   - Prices are numeric values

### Step 2: Navigate to Creator Database
1. Log in to Aurax as an admin
2. Navigate to **Admin Dashboard → Creator Database**

### Step 3: Click Import Button
1. Look for the **"📥 Import from Excel"** button (next to "Create New Creator")
2. Click to open the import modal

### Step 4: Select Your File
1. Click the drop zone or the file area
2. Select your Excel file
3. File will be validated for:
   - Correct format (.xlsx, .xls, or .csv)
   - File size (max 10MB)

### Step 5: Confirm Import
1. Click **"✅ Import Creators"** button
2. Wait for the import to complete (progress indicator shows status)
3. View the import summary with results

### Step 6: Review Results
After import completes, you'll see:
- **Successfully Imported**: Number of new creators added
- **Duplicates Skipped**: Number of creators already in database
- **Failed Records**: Number of records with errors
- **Total Rows**: Total rows processed

## Understanding Import Results

### Success Cases ✅
- Creator imported with all available fields
- Existing creator with same email/Instagram skipped as duplicate
- Partial data imports (if some fields are missing)

### Duplicate Records ⚠️
When a creator with the same email or Instagram handle already exists:
- The new record is skipped
- No data is overwritten
- Original record remains unchanged
- Duplicate is listed in the report

### Failed Records ❌
Common reasons for import failures:
- **Missing name field** - Creator name is required
- **Invalid email format** - Email must be valid (email@domain.com)
- **Duplicate within same file** - Same email/Instagram appears twice in import file
- **Database constraint violations** - Schema validation failed
- **Data type mismatch** - e.g., text in a number field

### Error Messages
| Error | Cause | Solution |
|---|---|---|
| "Invalid file format" | Not Excel/CSV | Use .xlsx, .xls, or .csv |
| "File size exceeds 10MB" | File too large | Split into smaller files |
| "Missing required fields" | No creator name | Add Creator Name column |
| "Invalid email format" | Bad email | Check email format (x@y.z) |

## Data Validation Rules

### Field-Specific Rules
- **Name**: Required, max 255 characters
- **Email**: Optional but must be valid if provided
- **Followers/Following/PostCount**: Numeric values only, decimals removed
- **Prices**: Numeric values (INR), no currency symbols
- **Instagram Handle**: @ symbol automatically removed
- **Phone/WhatsApp**: Stored as strings, no validation
- **Management Type**: Must be SELF_MANAGED, AGENCY_MANAGED, or defaults to UNKNOWN
- **Languages/Content Formats**: Comma-separated values converted to arrays

### Automatic Data Cleaning
- Whitespace trimmed from all fields
- Email addresses converted to lowercase
- Social handles @ symbol removed
- Numbers extracted from formatted values (e.g., "1,234" → 1234)
- Boolean fields accept: yes/true/1 (true) or no/false/0 (false)

## Import Audit Trail

Each imported creator record includes:
- **Created By**: Admin user who initiated the import
- **Created At**: Timestamp of import
- **Updated By**: Admin user email
- **Updated At**: Timestamp of import
- **Imported From**: "EXCEL" flag
- **Source**: "MANUAL_IMPORT" flag

### Viewing Import History
To verify imports or troubleshoot:
1. Go to **Admin Dashboard → Creator Database**
2. Click on any creator profile
3. Scroll to the bottom to see metadata including creation/import info

## Troubleshooting

### Import Fails to Start
**Symptom**: Modal doesn't open or import button is disabled  
**Solution**:
- Ensure you're logged in as admin
- Check browser console for errors (F12 → Console tab)
- Verify file meets requirements

### No Records Imported (All Duplicates)
**Symptom**: Import shows 0 successfully imported, all marked as duplicates  
**Solution**:
- These creators already exist in the database
- Check if the imported file contains duplicate creators internally
- Verify email and Instagram handles match existing records
- Consider updating existing records instead

### Partial Import (Some Records Failed)
**Symptom**: Some rows imported, others failed  
**Solution**:
1. Review failed records list in import result
2. Fix errors in Excel (missing name, invalid email, etc.)
3. Create new file with only the failed rows
4. Re-import the corrected file

### Special Characters Causing Issues
**Symptom**: Names with emojis, accents, or special characters fail  
**Solution**:
- Most characters are supported
- If specific character fails, remove it from Excel
- Test with simple ASCII text first

### API Connection Error
**Symptom**: "Failed to connect to server" error  
**Solution**:
- Verify backend is running (`npm start` in backend-copy)
- Check API URL in .env file matches backend address
- Ensure CORS is enabled for your domain
- Check browser network tab (F12) for details

## Performance Considerations

### Import Speed
- **100 creators**: ~10-20 seconds
- **500 creators**: ~30-50 seconds
- **1000+ creators**: 1-2 minutes

### Database Impact
- Imports use batch processing for efficiency
- Duplicate checks happen sequentially for accuracy
- No existing records are modified during import
- Can import while application is in use

### File Size Guidelines
- **Recommended**: < 5MB (≈ 500-1000 creators)
- **Maximum**: 10MB
- **Ideal rows per file**: 200-500 for faster processing

## API Reference

### Endpoint
```
POST /api/admin/import/creators
```

### Authentication
- **Required**: Admin role
- **Header**: Authorization: Bearer {token}
- **Content-Type**: multipart/form-data

### Request
```bash
curl -X POST http://localhost:5002/api/admin/import/creators \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "file=@creators.xlsx"
```

### Response Success (200)
```json
{
  "status": "success",
  "message": "Successfully imported 45 creators",
  "summary": {
    "timestamp": "2025-01-31T10:30:00Z",
    "sourceFile": "creators.xlsx",
    "adminUser": "admin@example.com",
    "totalRows": 50,
    "successful": 45,
    "duplicates": 3,
    "failed": 2,
    "skipped": 0
  },
  "data": {
    "imported": [
      { "_id": "...", "name": "...", "email": "...", "instagram": "..." },
      // ... more records
    ],
    "duplicates": [
      { "row": 5, "name": "John Doe", "email": "john@example.com", ... }
    ],
    "errors": [
      { "row": 8, "name": "Jane", "error": "Invalid email format" }
    ]
  }
}
```

### Response Error (400/500)
```json
{
  "status": "error",
  "message": "Invalid file format. Only Excel and CSV files allowed."
}
```

## Best Practices

### Before Importing
1. ✅ Validate all email addresses
2. ✅ Check Instagram handles (remove @ symbols)
3. ✅ Ensure Creator Name column exists
4. ✅ Remove duplicate rows within the file
5. ✅ Test with 10-20 rows first to verify column mapping
6. ✅ Backup original file

### During Import
1. ✅ Don't close the browser tab
2. ✅ Wait for completion before refreshing
3. ✅ Monitor import progress in modal

### After Import
1. ✅ Review the import summary
2. ✅ Check failed records and fix if needed
3. ✅ Go to Creator List to verify imports
4. ✅ Sample check a few imported creators for data accuracy

## Example Excel Format

Here's what a valid Excel file should look like:

| Creator Name | Instagram | Business Email | Followers | Location | Bio | Primary Niche |
|---|---|---|---|---|---|---|
| Aisha Khan | aisha_khan | aisha@example.com | 150000 | Mumbai | Fashion & Lifestyle | Fashion |
| Rohan Patel | rohan.patel | rohan@example.com | 280000 | Delhi | Tech Reviews | Technology |
| Priya Singh | priya_style | priya@example.com | 95000 | Bangalore | Beauty & Makeup | Beauty |

## Contacting Support

For issues or questions about the import feature:
- Email: admin@aurax.io
- Slack: #creator-database
- Issues: GitHub Issues on repository

---

**Last Updated**: January 31, 2025  
**Version**: 1.0.0  
**Status**: Production Ready
