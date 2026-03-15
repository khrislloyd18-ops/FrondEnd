const fs = require('fs');
const path = require('path');

const directories = [
  './src/components/auth',
  './src/components/dashboard',
  './src/components/weather',
  './src/components/common'
];

console.log('Checking component exports...\n');

directories.forEach(dir => {
  if (fs.existsSync(dir)) {
    console.log(`\n📁 ${dir}:`);
    const files = fs.readdirSync(dir);
    
    files.forEach(file => {
      if (file.endsWith('.jsx') || file.endsWith('.js')) {
        const filePath = path.join(dir, file);
        const content = fs.readFileSync(filePath, 'utf8');
        
        // Check for default export
        const hasDefaultExport = content.includes('export default');
        // Check for named exports
        const namedExports = content.match(/export const (\w+)/g) || [];
        
        console.log(`  ${file}:`);
        console.log(`    ✅ Default export: ${hasDefaultExport ? 'Yes' : '❌ No'}`);
        if (namedExports.length > 0) {
          console.log(`    📤 Named exports: ${namedExports.map(e => e.replace('export const ', '')).join(', ')}`);
        }
      }
    });
  } else {
    console.log(`\n❌ Directory not found: ${dir}`);
  }
});

// Check App.js
console.log('\n📁 Root:');
if (fs.existsSync('./src/App.jsx')) {
  const appContent = fs.readFileSync('./src/App.jsx', 'utf8');
  console.log(`  App.jsx: ${appContent.includes('export default App') ? '✅ OK' : '❌ Missing default export'}`);
}