// Verification script for O&M Module Frontend
const fs = require('fs');
const path = require('path');

console.log('🔍 Verifying O&M Module Frontend Setup...\n');

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
  'src/components/Layout.jsx',
  'src/components/ProtectedRoute.jsx',
  'src/components/RoleBasedRedirect.jsx',
  'src/pages/SignIn.jsx',
  'src/pages/admin/Dashboard.jsx',
  'src/pages/maintenance/Dashboard.jsx'
];

console.log('📁 Checking required files:');
let allFilesExist = true;
requiredFiles.forEach(file => {
  const exists = fs.existsSync(path.join(__dirname, file));
  console.log(`   ${exists ? '✅' : '❌'} ${file}`);
  if (!exists) allFilesExist = false;
});

// Check for unwanted files that might cause conflicts
const unwantedFiles = [
  'src/App.js',
  'src/index.js',
  'src/components/FileUpload.js',
  'src/components/ProcessingStatus.js',
  'src/components/ResultsDisplay.js',
  'src/pages/Analytics.jsx',
  'src/pages/Dashboard.jsx',
  'src/pages/Settings.jsx',
  'src/pages/UploadInfer.jsx'
];

console.log('\n🧹 Checking for conflicting files:');
let hasConflicts = false;
unwantedFiles.forEach(file => {
  const exists = fs.existsSync(path.join(__dirname, file));
  if (exists) {
    console.log(`   ❌ CONFLICT: ${file} (should be deleted)`);
    hasConflicts = true;
  } else {
    console.log(`   ✅ Clean: ${file}`);
  }
});

// Check main.jsx content
console.log('\n📄 Verifying main.jsx entry point:');
try {
  const mainContent = fs.readFileSync(path.join(__dirname, 'src/main.jsx'), 'utf8');
  if (mainContent.includes('App.jsx')) {
    console.log('   ✅ main.jsx correctly imports App.jsx');
  } else {
    console.log('   ❌ main.jsx import issue');
  }
} catch (err) {
  console.log('   ❌ Error reading main.jsx');
}

// Summary
console.log('\n📊 SUMMARY:');
if (allFilesExist && !hasConflicts) {
  console.log('✅ Setup is PERFECT! Ready to run.');
  console.log('\n🚀 Next steps:');
  console.log('1. Run: npm install');
  console.log('2. Run: npm run dev');
  console.log('3. Open: http://localhost:3000');
  console.log('4. Should redirect to /signin');
  console.log('5. Login with admin/admin123 or maintenance/maintenance123');
} else {
  console.log('❌ Setup has issues that need to be fixed.');
  if (!allFilesExist) {
    console.log('- Missing required files');
  }
  if (hasConflicts) {
    console.log('- Conflicting files need to be deleted');
  }
}

console.log('\n✨ Verification complete!');
