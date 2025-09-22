// Simple test to verify the setup works
// Run this with: node test-setup.js

const fs = require('fs');
const path = require('path');

console.log('🧪 Testing O&M Module Frontend Setup...\n');

// Check if required files exist
const requiredFiles = [
  'package.json',
  'vite.config.js',
  'tailwind.config.js',
  'index.html',
  'src/main.jsx',
  'src/App.jsx',
  'src/api/apiClient.js',
  'src/context/AuthContext.jsx',
  'src/components/ProtectedRoute.jsx',
  'src/components/RoleBasedRedirect.jsx',
  'src/pages/SignIn.jsx',
  'src/pages/Dashboard.jsx',
  'src/pages/MaintenanceDashboard.jsx'
];

let allFilesExist = true;

console.log('📁 Checking required files:');
requiredFiles.forEach(file => {
  const exists = fs.existsSync(path.join(__dirname, file));
  console.log(`   ${exists ? '✅' : '❌'} ${file}`);
  if (!exists) allFilesExist = false;
});

if (allFilesExist) {
  console.log('\n🎉 All required files are present!');
  console.log('\nNext steps:');
  console.log('1. Run: npm install');
  console.log('2. Run: npm run dev');
  console.log('3. Open: http://localhost:3000');
  console.log('4. Login with:');
  console.log('   Admin: admin/admin123');
  console.log('   Maintenance: maintenance/maintenance123');
} else {
  console.log('\n❌ Some files are missing. Please check the setup.');
}

// Check node_modules
if (fs.existsSync(path.join(__dirname, 'node_modules'))) {
  console.log('\n📦 Dependencies are installed');
} else {
  console.log('\n⚠️  Dependencies not installed. Run: npm install');
}

console.log('\n✨ Setup verification complete!');
