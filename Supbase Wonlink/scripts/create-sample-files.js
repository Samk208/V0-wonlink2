const fs = require('fs')
const path = require('path')

// Create samples directory if it doesn't exist
const samplesDir = path.join(__dirname, '..', 'samples')
if (!fs.existsSync(samplesDir)) {
  fs.mkdirSync(samplesDir, { recursive: true })
}

// Sample CSV data for products
const sampleCSV = `name,description,price,category,brand,sku
"iPhone 15 Pro","Latest iPhone with advanced camera",999.99,Electronics,Apple,IPH15PRO
"Samsung Galaxy S24","Premium Android smartphone",899.99,Electronics,Samsung,SAMS24
"MacBook Air M2","Lightweight laptop for productivity",1199.99,Computers,Apple,MACBOOKAIR
"Nike Air Max 270","Comfortable running shoes",129.99,Footwear,Nike,NIKE270
"Adidas Ultraboost","Performance running shoes",179.99,Footwear,Adidas,ADIDASUB
"Canon EOS R5","Professional mirrorless camera",3899.99,Electronics,Canon,CANONR5
"Sony WH-1000XM4","Noise-cancelling headphones",349.99,Electronics,Sony,SONYWH4
"iPad Pro 12.9","Large tablet for creative work",1099.99,Electronics,Apple,IPADPRO
"Microsoft Surface Pro","2-in-1 laptop and tablet",1299.99,Computers,Microsoft,SURFACEPRO
"Logitech MX Master 3","Premium wireless mouse",99.99,Electronics,Logitech,LOGIMX3`

// Sample JSON data for campaigns
const sampleJSON = [
  {
    "id": "camp_001",
    "title": "Summer Fashion Campaign",
    "description": "Promote summer clothing collection",
    "budget": 5000,
    "platforms": ["Instagram", "TikTok"],
    "target_audience": {
      "age_range": [18, 35],
      "interests": ["fashion", "lifestyle"],
      "location": ["US", "CA", "UK"]
    },
    "deliverables": ["Instagram posts", "TikTok videos", "Stories"],
    "start_date": "2024-06-01",
    "end_date": "2024-08-31",
    "status": "active"
  },
  {
    "id": "camp_002",
    "title": "Tech Product Launch",
    "description": "Launch campaign for new smartphone",
    "budget": 10000,
    "platforms": ["YouTube", "Instagram", "Twitter"],
    "target_audience": {
      "age_range": [25, 45],
      "interests": ["technology", "gadgets"],
      "location": ["US", "CA", "AU"]
    },
    "deliverables": ["YouTube videos", "Instagram posts", "Twitter threads"],
    "start_date": "2024-07-01",
    "end_date": "2024-09-30",
    "status": "draft"
  },
  {
    "id": "camp_003",
    "title": "Fitness App Promotion",
    "description": "Promote new fitness tracking app",
    "budget": 3000,
    "platforms": ["Instagram", "TikTok", "YouTube"],
    "target_audience": {
      "age_range": [18, 40],
      "interests": ["fitness", "health", "wellness"],
      "location": ["US", "UK", "AU"]
    },
    "deliverables": ["Instagram posts", "TikTok videos", "YouTube reviews"],
    "start_date": "2024-08-01",
    "end_date": "2024-10-31",
    "status": "active"
  }
]

// Sample Excel data (CSV format that can be opened in Excel)
const sampleExcel = `campaign_id,campaign_name,brand,influencer_id,influencer_name,platform,engagement_rate,reach,followers,proposed_rate,status
CAMP001,Summer Fashion,Adidas,INF001,@fashionista_emma,Instagram,4.2,50000,120000,500,approved
CAMP002,Tech Launch,Samsung,INF002,@tech_guru_mike,YouTube,3.8,75000,200000,800,pending
CAMP003,Fitness App,Nike,INF003,@fit_life_sarah,TikTok,5.1,30000,80000,400,approved
CAMP004,Beauty Products,L'Oreal,INF004,@beauty_expert_jane,Instagram,4.5,40000,95000,600,rejected
CAMP005,Gaming Console,Sony,INF005,@gamer_pro_tom,YouTube,4.8,100000,250000,1200,approved
CAMP006,Food Delivery,Uber Eats,INF006,@foodie_lisa,Instagram,3.9,35000,75000,350,pending
CAMP007,Travel App,Booking.com,INF007,@travel_vlog_dave,YouTube,4.1,60000,150000,700,approved
CAMP008,Home Decor,IKEA,INF008,@home_design_amy,Instagram,4.3,25000,60000,300,approved
CAMP009,Music Streaming,Spotify,INF009,@music_lover_carl,TikTok,4.7,45000,110000,550,pending
CAMP010,Car Brand,Tesla,INF010,@auto_reviewer_sam,YouTube,4.0,80000,180000,900,approved`

// Create sample files
const files = [
  {
    name: 'sample-products.csv',
    content: sampleCSV,
    type: 'text/csv'
  },
  {
    name: 'sample-campaigns.json',
    content: JSON.stringify(sampleJSON, null, 2),
    type: 'application/json'
  },
  {
    name: 'sample-applications.csv',
    content: sampleExcel,
    type: 'text/csv'
  }
]

// Write files
files.forEach(file => {
  const filePath = path.join(samplesDir, file.name)
  fs.writeFileSync(filePath, file.content)
  console.log(`✅ Created: ${file.name}`)
})

// Create a README for the samples
const readmeContent = `# Sample Files for Testing

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
\`\`\`csv
name,description,price
"Product 1","Description",invalid_price
"Product 2","Description",
\`\`\`

2. **empty-file.csv**:
\`\`\`csv
\`\`\`

3. **wrong-format.txt**:
\`\`\`
This is not a CSV or JSON file
\`\`\`
`

fs.writeFileSync(path.join(samplesDir, 'README.md'), readmeContent)
console.log('✅ Created: README.md')

console.log('\n🎉 Sample files created successfully!')
console.log(`📁 Location: ${samplesDir}`)
console.log('\nNext steps:')
console.log('1. Upload these files using your file upload utility')
console.log('2. Test the import processing functionality')
console.log('3. Verify data is correctly parsed and stored') 