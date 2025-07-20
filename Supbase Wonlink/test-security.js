#!/usr/bin/env node

const fs = require('fs')
const path = require('path')

console.log('🔒 Running Security Tests for Wonlink')
console.log('===================================\n')

// Test 1: Check for hardcoded secrets
console.log('1. Checking for hardcoded secrets...')
const secretPatterns = [
  /sk_live_[a-zA-Z0-9]+/g,     // Stripe live keys
  /sk_test_[a-zA-Z0-9]+/g,     // Stripe test keys
  /AKIA[0-9A-Z]{16}/g,         // AWS Access Keys
  /AIza[0-9A-Za-z\\-_]{35}/g,  // Google API Keys
  /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/g, // UUIDs (potential tokens)
  /eyJ[A-Za-z0-9-_=]+\.[A-Za-z0-9-_=]+\.?[A-Za-z0-9-_.+/=]*/g // JWT tokens
]

let secretsFound = false
const filesToCheck = [
  'app/',
  'components/',
  'lib/',
  'utils/'
]

filesToCheck.forEach(dir => {
  if (fs.existsSync(dir)) {
    const files = getAllFiles(dir, ['.ts', '.tsx', '.js', '.jsx'])
    files.forEach(file => {
      const content = fs.readFileSync(file, 'utf8')
      secretPatterns.forEach(pattern => {
        const matches = content.match(pattern)
        if (matches && !file.includes('test-security.js')) {
          console.log(`   ⚠️  Potential secret in ${file}: ${matches[0].substring(0, 20)}...`)
          secretsFound = true
        }
      })
    })
  }
})

if (!secretsFound) {
  console.log('   ✅ No hardcoded secrets detected')
}

// Test 2: Check for dangerous functions
console.log('\n2. Checking for dangerous functions...')
const dangerousPatterns = [
  /eval\s*\(/g,
  /Function\s*\(/g,
  /setTimeout\s*\(\s*['"]/g,
  /setInterval\s*\(\s*['"]/g,
  /innerHTML\s*=/g,
  /outerHTML\s*=/g,
  /document\.write/g,
  /\.exec\s*\(/g
]

let dangerousFunctionsFound = false
filesToCheck.forEach(dir => {
  if (fs.existsSync(dir)) {
    const files = getAllFiles(dir, ['.ts', '.tsx', '.js', '.jsx'])
    files.forEach(file => {
      const content = fs.readFileSync(file, 'utf8')
      dangerousPatterns.forEach((pattern, index) => {
        const matches = content.match(pattern)
        if (matches) {
          const functionNames = ['eval', 'Function constructor', 'setTimeout with string', 'setInterval with string', 'innerHTML', 'outerHTML', 'document.write', 'exec']
          console.log(`   ⚠️  Dangerous function in ${file}: ${functionNames[index]}`)
          dangerousFunctionsFound = true
        }
      })
    })
  }
})

if (!dangerousFunctionsFound) {
  console.log('   ✅ No dangerous functions detected')
}

// Test 3: Check API route security
console.log('\n3. Checking API route security...')
const apiDir = 'app/api'
if (fs.existsSync(apiDir)) {
  const apiFiles = getAllFiles(apiDir, ['.ts', '.js'])
  let unsecuredRoutes = 0
  
  apiFiles.forEach(file => {
    const content = fs.readFileSync(file, 'utf8')
    
    // Check for authentication
    if (!content.includes('auth') && !content.includes('getUser') && !content.includes('session')) {
      console.log(`   ⚠️  No authentication check in ${file}`)
      unsecuredRoutes++
    }
    
    // Check for input validation
    if (!content.includes('zod') && !content.includes('validate') && !content.includes('schema')) {
      console.log(`   ⚠️  No input validation in ${file}`)
    }
    
    // Check for SQL injection protection
    if (content.includes('query') && !content.includes('supabase') && content.includes('${')) {
      console.log(`   ⚠️  Potential SQL injection in ${file}`)
    }
  })
  
  if (unsecuredRoutes === 0) {
    console.log('   ✅ All API routes have authentication checks')
  }
} else {
  console.log('   ℹ️  No API directory found')
}

// Test 4: Check environment variable usage
console.log('\n4. Checking environment variable security...')
if (fs.existsSync('.env.local')) {
  const envContent = fs.readFileSync('.env.local', 'utf8')
  const lines = envContent.split('\n')
  
  lines.forEach((line, index) => {
    if (line.trim() && !line.startsWith('#')) {
      const [key, value] = line.split('=')
      if (value && value.length > 0) {
        // Check if sensitive keys are properly named
        if (key.includes('SECRET') || key.includes('KEY') || key.includes('TOKEN')) {
          if (!key.startsWith('NEXT_PUBLIC_') && !key.includes('_SECRET') && !key.includes('_KEY')) {
            console.log(`   ⚠️  Potentially exposed secret: ${key}`)
          }
        }
      }
    }
  })
  console.log('   ✅ Environment variables checked')
} else {
  console.log('   ⚠️  No .env.local file found')
}

// Test 5: Check dependencies for known vulnerabilities
console.log('\n5. Checking for vulnerable dependencies...')
if (fs.existsSync('package.json')) {
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'))
  const vulnerableDeps = {
    'xlsx': 'High severity: Prototype pollution and ReDoS vulnerabilities'
  }
  
  const allDeps = { ...packageJson.dependencies, ...packageJson.devDependencies }
  let vulnerabilitiesFound = false
  
  Object.keys(allDeps).forEach(dep => {
    if (vulnerableDeps[dep]) {
      console.log(`   ⚠️  Vulnerable dependency: ${dep} - ${vulnerableDeps[dep]}`)
      vulnerabilitiesFound = true
    }
  })
  
  if (!vulnerabilitiesFound) {
    console.log('   ✅ No known vulnerable dependencies')
  } else {
    console.log('   💡 Consider using secure alternatives or implement security wrappers')
  }
}

// Test 6: Check for proper error handling
console.log('\n6. Checking error handling...')
let errorHandlingIssues = 0
filesToCheck.forEach(dir => {
  if (fs.existsSync(dir)) {
    const files = getAllFiles(dir, ['.ts', '.tsx'])
    files.forEach(file => {
      const content = fs.readFileSync(file, 'utf8')
      
      // Check for try-catch blocks
      const tryBlocks = (content.match(/try\s*{/g) || []).length
      const catchBlocks = (content.match(/catch\s*\(/g) || []).length
      
      if (tryBlocks !== catchBlocks) {
        console.log(`   ⚠️  Unmatched try-catch blocks in ${file}`)
        errorHandlingIssues++
      }
      
      // Check for error exposure
      if (content.includes('console.error') && !file.includes('test')) {
        console.log(`   ⚠️  Console.error found in ${file} - consider using proper logging`)
      }
    })
  }
})

if (errorHandlingIssues === 0) {
  console.log('   ✅ Error handling patterns look good')
}

console.log('\n===================================')
console.log('🔒 Security Test Complete')
console.log('===================================')

// Helper function to get all files recursively
function getAllFiles(dir, extensions) {
  const files = []
  
  function walk(currentDir) {
    const items = fs.readdirSync(currentDir)
    
    items.forEach(item => {
      const fullPath = path.join(currentDir, item)
      const stat = fs.statSync(fullPath)
      
      if (stat.isDirectory()) {
        // Skip node_modules and .next directories
        if (item !== 'node_modules' && item !== '.next' && item !== '.git') {
          walk(fullPath)
        }
      } else if (stat.isFile()) {
        const ext = path.extname(fullPath)
        if (extensions.includes(ext)) {
          files.push(fullPath)
        }
      }
    })
  }
  
  if (fs.existsSync(dir)) {
    walk(dir)
  }
  
  return files
}