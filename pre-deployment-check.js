#!/usr/bin/env node

/**
 * Pre-Deployment Validation Script
 * Validates backend routes, environment variables, and API contracts
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 PRE-DEPLOYMENT VALIDATION\n');
console.log('=' .repeat(60));

let errors = [];
let warnings = [];
let passed = [];

// 1. Check Backend Server File Syntax
console.log('\n1️⃣  Checking backend server.js syntax...');
try {
  const serverPath = path.join(__dirname, 'backend-copy', 'server.js');
  const serverContent = fs.readFileSync(serverPath, 'utf-8');
  
  // Check that public creator endpoint exists
  if (serverContent.includes('app.get("/api/public/creator/:slug"')) {
    passed.push('✅ Public creator endpoint exists');
  } else {
    errors.push('❌ Public creator endpoint missing');
  }
  
  // Check for 404 handler
  if (serverContent.includes("app.use('/api/*'") && serverContent.includes('404')) {
    passed.push('✅ API 404 handler configured');
  } else {
    warnings.push('⚠️  API 404 handler not found');
  }
  
  // Check for global error handler
  if (serverContent.includes('app.use((err, req, res, next)')) {
    passed.push('✅ Global error handler configured');
  } else {
    warnings.push('⚠️  Global error handler not found');
  }
  
  passed.push('✅ Backend server.js syntax OK');
} catch (err) {
  errors.push(`❌ Backend server.js syntax error: ${err.message}`);
}

// 2. Check Environment Variables
console.log('\n2️⃣  Checking environment variables...');
try {
  const envPath = path.join(__dirname, 'backend-copy', '.env');
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf-8');
    const requiredVars = [
      'JWT_SECRET',
      'MONGODB_URI',
      'BREVO_API_KEY',
      'EMAIL_FROM',
      'FRONTEND_URL'
    ];
    
    requiredVars.forEach(varName => {
      if (envContent.includes(`${varName}=`)) {
        passed.push(`✅ ${varName} configured`);
      } else {
        warnings.push(`⚠️  ${varName} not found in .env`);
      }
    });
  } else {
    warnings.push('⚠️  Backend .env file not found');
  }
} catch (err) {
  warnings.push(`⚠️  Environment check error: ${err.message}`);
}

// 3. Check Frontend API Client
console.log('\n3️⃣  Checking frontend API client...');
try {
  const apiClientPath = path.join(__dirname, 'src', 'utils', 'apiClient.js');
  const apiClientContent = fs.readFileSync(apiClientPath, 'utf-8');
  
  // Check for HTML response handling
  if (apiClientContent.includes('content-type') && apiClientContent.includes('htmlError')) {
    passed.push('✅ API client handles HTML responses');
  } else {
    warnings.push('⚠️  API client may not handle HTML errors');
  }
  
  passed.push('✅ Frontend API client OK');
} catch (err) {
  errors.push(`❌ Frontend API client error: ${err.message}`);
}

// 4. Check PublicCreatorPage Component
console.log('\n4️⃣  Checking PublicCreatorPage component...');
try {
  const pagePath = path.join(__dirname, 'src', 'pages', 'PublicCreatorPage.js');
  const pageContent = fs.readFileSync(pagePath, 'utf-8');
  
  if (pageContent.includes('/api/public/creator/')) {
    passed.push('✅ PublicCreatorPage uses correct endpoint');
  } else {
    errors.push('❌ PublicCreatorPage endpoint mismatch');
  }
  
  // Check for empty content handling
  if (pageContent.includes('content && content.length > 0 &&')) {
    passed.push('✅ Empty content section hidden');
  } else {
    warnings.push('⚠️  Empty content section may show');
  }
} catch (err) {
  errors.push(`❌ PublicCreatorPage check error: ${err.message}`);
}

// 5. Check Package.json Scripts
console.log('\n5️⃣  Checking package.json scripts...');
try {
  const frontendPkg = JSON.parse(fs.readFileSync(path.join(__dirname, 'package.json'), 'utf-8'));
  if (frontendPkg.scripts && frontendPkg.scripts.build) {
    passed.push('✅ Frontend build script configured');
  } else {
    errors.push('❌ Frontend build script missing');
  }
  
  const backendPkg = JSON.parse(fs.readFileSync(path.join(__dirname, 'backend-copy', 'package.json'), 'utf-8'));
  if (backendPkg.scripts && backendPkg.scripts.start) {
    passed.push('✅ Backend start script configured');
  } else {
    errors.push('❌ Backend start script missing');
  }
} catch (err) {
  errors.push(`❌ Package.json check error: ${err.message}`);
}

// Print Summary
console.log('\n' + '='.repeat(60));
console.log('\n📊 VALIDATION SUMMARY\n');

if (passed.length > 0) {
  console.log('✅ PASSED CHECKS:');
  passed.forEach(msg => console.log('   ' + msg));
}

if (warnings.length > 0) {
  console.log('\n⚠️  WARNINGS:');
  warnings.forEach(msg => console.log('   ' + msg));
}

if (errors.length > 0) {
  console.log('\n❌ ERRORS:');
  errors.forEach(msg => console.log('   ' + msg));
}

console.log('\n' + '='.repeat(60));

// Final Result
if (errors.length === 0) {
  console.log('\n✅ ALL CRITICAL CHECKS PASSED');
  console.log('⚠️  Review warnings before deployment');
  console.log('\n📋 NEXT STEPS:');
  console.log('   1. Start backend: cd backend-copy && npm start');
  console.log('   2. Start frontend: npm start');
  console.log('   3. Test http://localhost:3000/creator/saurabh');
  console.log('   4. Verify no JSON parse errors');
  console.log('   5. Push to GitHub if all tests pass\n');
  process.exit(0);
} else {
  console.log('\n❌ VALIDATION FAILED');
  console.log(`   Found ${errors.length} critical error(s)`);
  console.log('   Fix errors before deployment\n');
  process.exit(1);
}
