const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Starting FREE Vercel deployment process...\n');

async function deployToVercel() {
  try {
    // Step 1: Check if Vercel CLI is installed
    console.log('📋 Step 1: Checking Vercel CLI...');
    try {
      execSync('vercel --version', { stdio: 'pipe' });
      console.log('✅ Vercel CLI is installed');
    } catch (error) {
      console.log('❌ Vercel CLI not found. Installing...');
      execSync('npm install -g vercel', { stdio: 'inherit' });
      console.log('✅ Vercel CLI installed');
    }

    // Step 2: Install dependencies
    console.log('\n📦 Step 2: Installing dependencies...');
    execSync('npm install', { stdio: 'inherit' });
    console.log('✅ Dependencies installed');

    // Step 3: Generate Prisma client
    console.log('\n🗄️ Step 3: Generating Prisma client...');
    execSync('npx prisma generate', { stdio: 'inherit' });
    console.log('✅ Prisma client generated');

    // Step 4: Build the application
    console.log('\n🔨 Step 4: Building application...');
    execSync('npm run build', { stdio: 'inherit' });
    console.log('✅ Application built successfully');

    // Step 5: Deploy to Vercel
    console.log('\n🚀 Step 5: Deploying to Vercel...');
    console.log('📝 Note: You may need to login to Vercel if this is your first time\n');
    
    // Check if already logged in
    try {
      execSync('vercel whoami', { stdio: 'pipe' });
      console.log('✅ Already logged in to Vercel');
    } catch (error) {
      console.log('🔐 Please login to Vercel:');
      execSync('vercel login', { stdio: 'inherit' });
    }

    // Deploy
    console.log('\n🌍 Deploying to Vercel...');
    execSync('vercel --prod', { stdio: 'inherit' });
    
    console.log('\n🎉 Deployment completed successfully!');
    console.log('\n📋 Next Steps:');
    console.log('1. Go to your Vercel dashboard');
    console.log('2. Add environment variables:');
    console.log('   - DATABASE_URL: "file:./dev.db"');
    console.log('   - NODE_ENV: "production"');
    console.log('   - NEXTAUTH_SECRET: "your-secret-here"');
    console.log('   - NEXTAUTH_URL: "https://your-app.vercel.app"');
    console.log('3. Redeploy after adding environment variables');
    
  } catch (error) {
    console.error('❌ Deployment failed:', error.message);
    process.exit(1);
  }
}

// Run deployment if called directly
if (require.main === module) {
  deployToVercel();
}

module.exports = { deployToVercel };