// Simple test for i18n functionality
const { translations, useTranslation } = require('./lib/translations.ts');

console.log('Testing i18n implementation...');
console.log('');

// Test 1: Check if translations object exists and has all languages
console.log('1. Checking translation structure:');
console.log('- English keys:', Object.keys(translations.en).length);
console.log('- Korean keys:', Object.keys(translations.ko).length); 
console.log('- Chinese keys:', Object.keys(translations.zh).length);
console.log('');

// Test 2: Check specific translations
const testKeys = [
  'dashboard',
  'activeCampaigns', 
  'totalApplications',
  'createCampaign',
  'welcomeBack',
  'recentCampaigns'
];

console.log('2. Testing key translations:');
testKeys.forEach(key => {
  console.log(`Key: ${key}`);
  console.log(`  EN: ${translations.en[key] || 'MISSING'}`);
  console.log(`  KO: ${translations.ko[key] || 'MISSING'}`);
  console.log(`  ZH: ${translations.zh[key] || 'MISSING'}`);
  console.log('');
});

console.log('i18n test complete!');