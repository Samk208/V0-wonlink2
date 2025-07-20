const fs = require('fs');
const path = require('path');

const filePath = './lib/translations.ts';

function fixDuplicateKeys() {
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');
  
  // Track seen keys within each language section
  let inEnSection = false;
  let inKoSection = false;
  let inZhSection = false;
  
  const seenKeysEn = new Set();
  const seenKeysKo = new Set();
  const seenKeysZh = new Set();
  
  const filteredLines = [];
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // Detect language sections
    if (line.trim() === 'en: {') {
      inEnSection = true;
      inKoSection = false;
      inZhSection = false;
      filteredLines.push(line);
      continue;
    } else if (line.trim() === 'ko: {') {
      inEnSection = false;
      inKoSection = true;
      inZhSection = false;
      filteredLines.push(line);
      continue;
    } else if (line.trim() === 'zh: {') {
      inEnSection = false;
      inKoSection = false;
      inZhSection = true;
      filteredLines.push(line);
      continue;
    }
    
    // Check for key definitions
    const keyMatch = line.match(/^\s*(\w+):\s*/);
    if (keyMatch) {
      const key = keyMatch[1];
      
      if (inEnSection) {
        if (seenKeysEn.has(key)) {
          console.log(`Removing duplicate key "${key}" from EN section at line ${i + 1}`);
          continue; // Skip this duplicate line
        }
        seenKeysEn.add(key);
      } else if (inKoSection) {
        if (seenKeysKo.has(key)) {
          console.log(`Removing duplicate key "${key}" from KO section at line ${i + 1}`);
          continue; // Skip this duplicate line
        }
        seenKeysKo.add(key);
      } else if (inZhSection) {
        if (seenKeysZh.has(key)) {
          console.log(`Removing duplicate key "${key}" from ZH section at line ${i + 1}`);
          continue; // Skip this duplicate line
        }
        seenKeysZh.add(key);
      }
    }
    
    filteredLines.push(line);
  }
  
  // Write the cleaned content back
  const cleanedContent = filteredLines.join('\n');
  fs.writeFileSync(filePath, cleanedContent, 'utf8');
  
  console.log('Fixed duplicate keys in translations.ts');
  console.log(`EN keys: ${seenKeysEn.size}`);
  console.log(`KO keys: ${seenKeysKo.size}`);
  console.log(`ZH keys: ${seenKeysZh.size}`);
}

fixDuplicateKeys();
