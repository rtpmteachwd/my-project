const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Starting Vercel deployment process...\n');

async function deployToVercel() {
  try {
    // Step 1: Run pre-build script
    console.log('📋 Step 1: Running pre-build process...');
    execSync('node scripts/pre-build.js', { stdio: 'inherit' });

    // Step 2: Build the application
    console.log('\n🔨 Step 2: Building application...');
    execSync('npm run build', { stdio: 'inherit' });
    console.log('✅ Application built successfully');

    // Step 3: Check Git status
    console.log('\n📋 Step 3: Checking Git status...');
    try {
      const status = execSync('git status --porcelain', { encoding: 'utf8' });
      if (status.trim()) {
        console.log('⚠️  You have uncommitted changes:');
        console.log(status);
        console.log('\n💡 Commit these changes before deploying:');
        console.log('git add .');
        console.log('git commit -m "Prepare for Vercel deployment"');
        console.log('git push origin main');
        return;
      }
    } catch (error) {
      console.log('⚠️  Git not initialized or not in a git repository');
    }

    // Step 4: Check if Vercel CLI is installed
    console.log('\n📋 Step 4: Checking Vercel CLI...');
    try {
      execSync('vercel --version', { stdio: 'pipe' });
      console.log('✅ Vercel CLI is installed');
    } catch (error) {
      console.log('❌ Vercel CLI not found. Installing...');
      execSync('npm install -g vercel', { stdio: 'inherit' });
      console.log('✅ Vercel CLI installed');
    }

    // Step 5: Check if logged in to Vercel
    console.log('\n📋 Step 5: Checking Vercel login status...');
    try {
      execSync('vercel whoami', { stdio: 'pipe' });
      console.log('✅ Already logged in to Vercel');
    } catch (error) {
      console.log('🔐 Please login to Vercel:');
      execSync('vercel login', { stdio: 'inherit' });
    }

    // Step 6: Deploy to Vercel
    console.log('\n🚀 Step 6: Deploying to Vercel...');
    console.log('📝 This will deploy to production. Make sure you have set up environment variables in Vercel dashboard.\n');
    
    // Deploy
    execSync('vercel --prod', { stdio: 'inherit' });
    
    console.log('\n🎉 Deployment completed successfully!');
    console.log('\n📋 Post-Deployment Checklist:');
    console.log('1. ✅ Application deployed to Vercel');
    console.log('2. ⏳ Go to Vercel dashboard → Settings → Environment Variables');
    console.log('3. ⏳ Add these environment variables:');
    console.log('   - DATABASE_URL: "file:./dev.db"');
    console.log('   - NODE_ENV: "production"');
    console.log('   - NEXTAUTH_SECRET: "your-secret-here"');
    console.log('   - NEXTAUTH_URL: "https://your-app.vercel.app"');
    console.log('4. ⏳ Click "Redeploy" after adding variables');
    console.log('5. ⏳ Test all features: teacher dashboard, student interface, real-time features');
    
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