// Backend Integration Helper for Aurax Instagram Authentication
// File: backend-integration-helper.js
// Copy this to your backend-copy directory and run: node backend-integration-helper.js

const fs = require("fs");
const path = require("path");

console.log("🚀 Aurax Instagram Authentication Integration Helper\n");

// Check if required files exist
const requiredFiles = [
  "../frontend-copy/backend-auth-routes.js",
  "../frontend-copy/backend-instagram-api-routes.js",
  "../frontend-copy/backend-instagram-oauth-routes.js",
];

console.log("📁 Checking required files...");
const missingFiles = [];

requiredFiles.forEach((file) => {
  if (fs.existsSync(file)) {
    console.log(`   ✅ ${file}`);
  } else {
    console.log(`   ❌ ${file} - NOT FOUND`);
    missingFiles.push(file);
  }
});

if (missingFiles.length > 0) {
  console.log(
    "\n❌ Missing required files. Please ensure all backend route files are created."
  );
} else {
  console.log("\n✅ All required files found!");
}

// Create package.json dependencies list
console.log("\n📦 Required NPM packages:");
const requiredPackages = [
  "bcryptjs",
  "jsonwebtoken",
  "nodemailer",
  "node-fetch@2.7.0",
  "express",
  "cors",
];

console.log("   Run this command in your backend directory:");
console.log(`   npm install ${requiredPackages.join(" ")}\n`);

// Create sample server integration
const serverIntegration = `// Add this to your main server file (server.js or app.js)

// Import authentication and Instagram routes
const authRoutes = require('../frontend-copy/backend-auth-routes');
const instagramRoutes = require('../frontend-copy/backend-instagram-api-routes');
const instagramOAuthRoutes = require('../frontend-copy/backend-instagram-oauth-routes');

// Add middleware (if not already present)
app.use(express.json());
app.use(cors({
  origin: ['http://localhost:3000', 'https://fe84fc3a4e9e.ngrok-free.app'],
  credentials: true
}));

// Add routes
app.use('/api', authRoutes);
app.use('/api', instagramRoutes);
app.use('/api', instagramOAuthRoutes);

console.log('🎯 Aurax Instagram Authentication routes loaded');`;

fs.writeFileSync("aurax-server-integration-example.js", serverIntegration);
console.log("📝 Created: aurax-server-integration-example.js");

// Create environment variables template
const envTemplate = `# Aurax Backend Environment Variables
# Copy these to your .env file

# JWT Secret (generate a secure random string)
JWT_SECRET=your-super-secret-jwt-key-here-make-it-long-and-random

# Email Configuration (Gmail recommended)
EMAIL_USER=your-email@gmail.com  
EMAIL_PASS=your-gmail-app-password

# Instagram OAuth Credentials
INSTAGRAM_CLIENT_ID=your-instagram-client-id
INSTAGRAM_CLIENT_SECRET=your-instagram-client-secret

# MongoDB Connection (adjust as needed)
MONGODB_URI=mongodb://localhost:27017/aurax_db

# Server Configuration
PORT=5002
NODE_ENV=development`;

fs.writeFileSync(".env.aurax-template", envTemplate);
console.log("📝 Created: .env.aurax-template");

console.log("\n🎉 Backend integration files created successfully!");
console.log("\n📋 Next steps:");
console.log(
  "   1. Run: npm install bcryptjs jsonwebtoken nodemailer node-fetch@2.7.0 express cors"
);
console.log(
  "   2. Copy .env.aurax-template to .env and fill in your credentials"
);
console.log(
  "   3. Add the code from aurax-server-integration-example.js to your server.js"
);
console.log("   4. Ensure MongoDB is running and connected");
console.log("   5. Start your backend server");
console.log("   6. Test the integration using the frontend");
console.log("\n🔗 Frontend: http://localhost:3000");
console.log("🔗 Backend: http://localhost:5002");
console.log("📖 Guide: AURAX_INSTAGRAM_AUTH_INTEGRATION_GUIDE.md");
