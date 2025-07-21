# Sample Files for Testing

This directory contains sample files for testing the file upload functionality.

## Files Included:

### 1. sample-products.csv
- **Type**: CSV file with product data
- **Use Case**: Test product import functionality
- **Columns**: name, description, price, category, brand, sku
- **Records**: 10 sample products

### 2. sample-campaigns.json
- **Type**: JSON file with campaign data
- **Use Case**: Test campaign import functionality
- **Structure**: Array of campaign objects
- **Records**: 3 sample campaigns

### 3. sample-applications.csv
- **Type**: CSV file with influencer application data
- **Use Case**: Test application import functionality
- **Columns**: campaign_id, campaign_name, brand, influencer_id, influencer_name, platform, engagement_rate, reach, followers, proposed_rate, status
- **Records**: 10 sample applications

## How to Use:

1. Upload these files using the file upload utility
2. Test the import processing functionality
3. Verify that data is correctly parsed and stored
4. Check error handling with invalid files

## Testing Scenarios:

### Valid Files:
- Upload each sample file individually
- Upload multiple files at once
- Test with different file sizes

### Invalid Files:
- Create files with missing columns
- Create files with invalid data types
- Create files with duplicate records
- Test with unsupported file formats

## Expected Results:

- **sample-products.csv**: Should import 10 products successfully
- **sample-campaigns.json**: Should import 3 campaigns successfully
- **sample-applications.csv**: Should import 10 applications successfully

## Error Testing:

Create these invalid files to test error handling:

1. **invalid-products.csv**:
```csv
name,description,price
"Product 1","Description",invalid_price
"Product 2","Description",
```

2. **empty-file.csv**:
```csv
```

3. **wrong-format.txt**:
```
This is not a CSV or JSON file
```
