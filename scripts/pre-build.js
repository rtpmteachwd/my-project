const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Starting pre-build process for Vercel deployment...');

try {
  // Step 1: Install dependencies
  console.log('📦 Installing dependencies...');
  execSync('npm install', { stdio: 'inherit' });

  // Step 2: Generate Prisma client
  console.log('🗄️ Generating Prisma client...');
  execSync('npx prisma generate', { stdio: 'inherit' });

  // Step 3: Create database directory if it doesn't exist
  console.log('📁 Creating database directory...');
  const dbDir = path.join(process.cwd(), 'prisma');
  if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
  }

  console.log('✅ Pre-build process completed successfully!');
} catch (error) {
  console.error('❌ Pre-build process failed:', error.message);
  process.exit(1);
}