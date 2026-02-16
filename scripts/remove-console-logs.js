const fs = require('fs');
const path = require('path');

// Remove console.log statements but keep console.error
function removeConsoleLogs(content) {
  // Remove console.log statements
  content = content.replace(/^(\s*)console\.log\([^;]*\);?\s*$/gm, '');
  content = content.replace(/console\.log\([^)]*\);?/g, '');
  content = content.replace(/console\.warn\([^)]*\);?/g, '');
  content = content.replace(/console\.info\([^)]*\);?/g, '');
  content = content.replace(/console\.debug\([^)]*\);?/g, '');
  
  // Remove JSX onLoad with console.log
  content = content.replace(/\s*onLoad=\{\(\) => console\.log\([^)]+\)\}/g, '');
  
  // Clean up multiple empty lines
  content = content.replace(/\n\s*\n\s*\n/g, '\n\n');
  
  return content;
}

function processFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const cleaned = removeConsoleLogs(content);
    
    if (content !== cleaned) {
      fs.writeFileSync(filePath, cleaned, 'utf8');
      console.log(`✅ Cleaned: ${filePath}`);
      return true;
    }
    return false;
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error.message);
    return false;
  }
}

function walkDirectory(dir, filePattern = /\.(js|jsx|ts|tsx)$/) {
  let files = [];
  const items = fs.readdirSync(dir);
  
  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      if (!item.startsWith('.') && item !== 'node_modules' && item !== 'build') {
        files = files.concat(walkDirectory(fullPath, filePattern));
      }
    } else if (filePattern.test(item)) {
      files.push(fullPath);
    }
  }
  
  return files;
}

// Main execution
const srcDir = path.join(__dirname, '..', 'src');
console.log('🧹 Removing console.log statements from production code...\n');

const files = walkDirectory(srcDir);
let cleanedCount = 0;

files.forEach(file => {
  if (processFile(file)) {
    cleanedCount++;
  }
});

console.log(`\n✨ Done! Cleaned ${cleanedCount} files.`);
