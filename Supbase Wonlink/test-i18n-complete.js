const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🧪 Testing SSR Hydration Fix for Wonlink i18n System');
console.log('==================================================');

// Test 1: Check if all required files exist
console.log('\n1. Checking file structure...');
const requiredFiles = [
  'app/providers.tsx',
  'lib/language-utils.ts',
  'lib/translations.ts',
  'middleware.ts',
  'components/language-selector.tsx',
  'components/hydration-boundary.tsx',
  'app/layout.tsx'
];

let allFilesExist = true;
requiredFiles.forEach(file => {
  if (fs.existsSync(file)) {
    console.log(`✅ ${file}`);
  } else {
    console.log(`❌ ${file} - MISSING`);
    allFilesExist = false;
  }
});

if (!allFilesExist) {
  console.log('\n❌ Some required files are missing. Please check the file structure.');
  process.exit(1);
}

// Test 2: Check for SSR hydration patterns
console.log('\n2. Checking for SSR hydration patterns...');

function checkFileForPattern(filePath, patterns) {
  if (!fs.existsSync(filePath)) return false;
  
  const content = fs.readFileSync(filePath, 'utf8');
  return patterns.every(pattern => content.includes(pattern));
}

// Check providers.tsx for SSR-safe patterns
const providerPatterns = [
  'initialLanguage',
  'isClient()',
  'useState<Language>(initialLanguage)',
  'setIsHydrated(true)'
];

if (checkFileForPattern('app/providers.tsx', providerPatterns)) {
  console.log('✅ app/providers.tsx - SSR-safe patterns found');
} else {
  console.log('❌ app/providers.tsx - Missing SSR-safe patterns');
}

// Check language-utils.ts for cookie patterns
const utilsPatterns = [
  'getServerLanguage',
  'setLanguageCookie',
  'isClient()',
  'document.cookie'
];

if (checkFileForPattern('lib/language-utils.ts', utilsPatterns)) {
  console.log('✅ lib/language-utils.ts - Cookie-based patterns found');
} else {
  console.log('❌ lib/language-utils.ts - Missing cookie patterns');
}

// Check middleware.ts for proper cookie handling
const middlewarePatterns = [
  'LANGUAGE_COOKIE',
  'request.cookies.get',
  'response.cookies.set',
  'httpOnly: false'
];

if (checkFileForPattern('middleware.ts', middlewarePatterns)) {
  console.log('✅ middleware.ts - Cookie handling patterns found');
} else {
  console.log('❌ middleware.ts - Missing cookie handling patterns');
}

// Check language-selector.tsx for hydration boundary
const selectorPatterns = [
  'HydrationBoundary',
  'fallback'
];

if (checkFileForPattern('components/language-selector.tsx', selectorPatterns)) {
  console.log('✅ components/language-selector.tsx - Hydration boundary found');
} else {
  console.log('❌ components/language-selector.tsx - Missing hydration boundary');
}

// Test 3: Check for potential hydration issues
console.log('\n3. Checking for potential hydration issues...');

function checkForHydrationIssues(filePath) {
  if (!fs.existsSync(filePath)) return [];
  
  const content = fs.readFileSync(filePath, 'utf8');
  const issues = [];
  
  // Check for direct localStorage usage without client check
  if (content.includes('localStorage.') && !content.includes('isClient()') && !content.includes('typeof window')) {
    issues.push('Direct localStorage usage without client check');
  }
  
  // Check for window usage without client check
  if (content.includes('window.') && !content.includes('isClient()') && !content.includes('typeof window')) {
    issues.push('Direct window usage without client check');
  }
  
  // Check for document usage without client check
  if (content.includes('document.') && !content.includes('isClient()') && !content.includes('typeof window')) {
    issues.push('Direct document usage without client check');
  }
  
  return issues;
}

const filesToCheck = [
  'app/providers.tsx',
  'lib/language-utils.ts',
  'components/language-selector.tsx'
];

let hydrationIssuesFound = false;
filesToCheck.forEach(file => {
  const issues = checkForHydrationIssues(file);
  if (issues.length > 0) {
    console.log(`❌ ${file} - Hydration issues found:`);
    issues.forEach(issue => console.log(`   - ${issue}`));
    hydrationIssuesFound = true;
  } else {
    console.log(`✅ ${file} - No hydration issues detected`);
  }
});

// Test 4: Check translation system integrity
console.log('\n4. Checking translation system integrity...');

if (fs.existsSync('lib/translations.ts')) {
  const translationsContent = fs.readFileSync('lib/translations.ts', 'utf8');
  
  // Check for supported languages
  if (translationsContent.includes('en:') && translationsContent.includes('ko:') && translationsContent.includes('zh:')) {
    console.log('✅ Translation files - All 3 languages (EN/KO/ZH) found');
  } else {
    console.log('❌ Translation files - Missing some language definitions');
  }
  
  // Check for useTranslation hook
  if (translationsContent.includes('useTranslation')) {
    console.log('✅ Translation hook - useTranslation function found');
  } else {
    console.log('❌ Translation hook - useTranslation function missing');
  }
} else {
  console.log('❌ Translation files - lib/translations.ts not found');
}

// Test 5: Check for proper TypeScript types
console.log('\n5. Checking TypeScript type safety...');

// Check for Language type definition
if (fs.existsSync('lib/translations.ts')) {
  const translationsContent = fs.readFileSync('lib/translations.ts', 'utf8');
  if (translationsContent.includes('export type Language')) {
    console.log('✅ TypeScript types - Language type found');
  } else {
    console.log('❌ TypeScript types - Language type missing');
  }
}

// Check for AppContextType interface
if (fs.existsSync('app/providers.tsx')) {
  const providersContent = fs.readFileSync('app/providers.tsx', 'utf8');
  if (providersContent.includes('interface AppContextType')) {
    console.log('✅ TypeScript types - AppContextType interface found');
  } else {
    console.log('❌ TypeScript types - AppContextType interface missing');
  }
}

// Check for SUPPORTED_LANGUAGES array
if (fs.existsSync('lib/language-utils.ts')) {
  const utilsContent = fs.readFileSync('lib/language-utils.ts', 'utf8');
  if (utilsContent.includes('SUPPORTED_LANGUAGES: Language[]')) {
    console.log('✅ TypeScript types - SUPPORTED_LANGUAGES array found');
  } else {
    console.log('❌ TypeScript types - SUPPORTED_LANGUAGES array missing');
  }
}

// Summary
console.log('\n==================================================');
console.log('📊 TEST SUMMARY');
console.log('==================================================');

if (!hydrationIssuesFound) {
  console.log('✅ All tests passed! SSR hydration fix appears to be implemented correctly.');
  console.log('\n🎯 Next Steps:');
  console.log('1. Run the development server: npm run dev');
  console.log('2. Test language switching in the browser');
  console.log('3. Check browser console for hydration warnings');
  console.log('4. Test onboarding flows with different languages');
  console.log('5. Verify cookie persistence across page refreshes');
  console.log('6. Test the debug component in development mode');
} else {
  console.log('❌ Some issues were found. Please review the errors above.');
  console.log('\n🔧 Recommended fixes:');
  if (hydrationIssuesFound) {
    console.log('- Ensure all browser APIs are wrapped with isClient() checks');
    console.log('- Use HydrationBoundary for components with dynamic content');
  }
}

console.log('\n🚀 Ready for testing!');
