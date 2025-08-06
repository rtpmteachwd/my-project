# Vercel Deployment Guide for Gamified Teaching Platform

## Overview

This guide will walk you through deploying your gamified teaching platform to Vercel. The platform includes real-time features using Socket.IO, a database backend with Prisma, and a Next.js frontend.

## Prerequisites

1. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
2. **GitHub Repository**: Your code should be in a GitHub repository
3. **Node.js**: v18 or higher installed locally
4. **Git**: For version control

## Step 1: Prepare Your Local Project

### 1.1 Update Dependencies
```bash
npm install
```

### 1.2 Create Environment Variables
Copy the example environment file:
```bash
cp .env.example .env.local
```

### 1.3 Build and Test Locally
```bash
npm run build
npm run dev
```

## Step 2: Choose Your Database Strategy

### Option A: Vercel Postgres (Recommended for Production)

1. **Create a Vercel Postgres Database**
   - Go to your Vercel dashboard
   - Navigate to your project
   - Click on the "Storage" tab
   - Click "Create Database" → "Postgres"
   - Choose your region and plan

2. **Get Database Connection String**
   - Once created, click on your database
   - Copy the connection string from the "Connect" tab

3. **Update Prisma Schema**
   ```bash
   cp prisma/schema.production.prisma prisma/schema.prisma
   ```

4. **Update Environment Variables**
   ```
   DATABASE_URL=postgres://user:password@host:port/database?sslmode=require
   ```

### Option B: SQLite with Vercel KV (For Development)

1. **Create Vercel KV Store**
   - Go to Vercel dashboard → Storage → Create Database → KV
   - Copy the connection string

2. **Keep Current SQLite Setup**
   - No schema changes needed
   - Use the existing SQLite configuration

## Step 3: Configure Vercel Deployment

### 3.1 Method 1: Vercel Dashboard (Recommended)

1. **Connect GitHub Repository**
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Select your GitHub repository
   - Click "Import"

2. **Configure Project Settings**
   - **Framework Preset**: Next.js
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next`
   - **Install Command**: `npm install`

3. **Set Environment Variables**
   In the Vercel dashboard, go to "Settings" → "Environment Variables" and add:
   ```
   DATABASE_URL=your_database_connection_string
   NODE_ENV=production
   NEXTAUTH_SECRET=generate_a_random_secret
   NEXTAUTH_URL=https://your-app-name.vercel.app
   ```

4. **Deploy**
   - Click "Deploy"
   - Wait for the build to complete

### 3.2 Method 2: Vercel CLI

1. **Install Vercel CLI**
   ```bash
   npm i -g vercel
   ```

2. **Login**
   ```bash
   vercel login
   ```

3. **Deploy**
   ```bash
   vercel
   ```

4. **Set Environment Variables**
   ```bash
   vercel env add DATABASE_URL
   vercel env add NEXTAUTH_SECRET
   vercel env add NEXTAUTH_URL
   ```

5. **Redeploy**
   ```bash
   vercel --prod
   ```

## Step 4: Database Migration

### 4.1 For Vercel Postgres

1. **Generate Prisma Client**
   ```bash
   npx prisma generate
   ```

2. **Push Schema to Database**
   ```bash
   npx prisma db push
   ```

3. **Seed Database (Optional)**
   ```bash
   npm run db:seed
   ```

### 4.2 For SQLite

The database will be created automatically on first access.

## Step 5: Configure Socket.IO for Vercel

### 5.1 Socket.IO is Already Configured

Your application already includes Socket.IO configuration that works with Vercel:
- Server-side: `src/lib/socket.ts`
- Client-side: Uses the existing Socket.IO client
- Configuration: Handles CORS and connection paths properly

### 5.2 Verify Socket.IO Configuration

The `server.ts` file already includes:
```typescript
const io = new Server(server, {
  path: '/api/socketio',
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});
```

## Step 6: Post-Deployment Checks

### 6.1 Verify Application Health

1. **Check Main Application**
   - Visit your Vercel URL
   - Verify the main page loads correctly

2. **Test API Endpoints**
   ```bash
   curl https://your-app-name.vercel.app/api/health
   ```

3. **Test Database Connection**
   - Try creating a game room
   - Verify data persistence

### 6.2 Test Real-time Features

1. **Test Socket.IO Connection**
   - Open the application in two browser tabs
   - Join a game room as teacher and student
   - Test real-time communication

2. **Test Timer Functionality**
   - Create a question with timer enabled
   - Verify countdown works correctly
   - Test timer expiration behavior

### 6.3 Test All Core Features

1. **Teacher Dashboard**
   - Create game rooms
   - Add questions with timers
   - Start and manage games

2. **Student Interface**
   - Join game rooms
   - Participate in quizzes
   - View timer and score updates

3. **Real-time Features**
   - Buzz functionality
   - Answer submission
   - Score updates
   - Timer synchronization

## Step 7: Monitoring and Maintenance

### 7.1 Vercel Dashboard

1. **Monitor Deployments**
   - Check build logs
   - Monitor deployment status
   - View performance metrics

2. **Set Up Alerts**
   - Configure deployment notifications
   - Set up error monitoring

### 7.2 Database Monitoring

1. **Vercel Postgres Dashboard**
   - Monitor connection usage
   - Check query performance
   - Monitor storage usage

2. **Prisma Studio**
   ```bash
   npx prisma studio
   ```

### 7.3 Performance Optimization

1. **Enable Caching**
   - Configure Next.js caching
   - Optimize database queries

2. **Monitor Performance**
   - Use Vercel Analytics
   - Monitor Core Web Vitals

## Step 8: Troubleshooting

### 8.1 Common Issues

**Build Failures**
```bash
# Check build logs in Vercel dashboard
# Verify all dependencies are installed
# Check TypeScript errors
```

**Database Connection Issues**
```bash
# Verify DATABASE_URL is correct
# Check database is accessible
# Verify SSL configuration for Postgres
```

**Socket.IO Connection Issues**
```bash
# Verify CORS configuration
# Check connection path
# Verify WebSocket support
```

### 8.2 Debug Commands

```bash
# Check environment variables
vercel env ls

# Redeploy with latest changes
vercel --prod

# Check deployment logs
vercel logs your-app-name
```

## Step 9: Custom Domain (Optional)

### 9.1 Configure Custom Domain

1. **Add Domain in Vercel**
   - Go to project settings
   - Click "Domains"
   - Add your custom domain

2. **Configure DNS**
   - Update DNS records with your provider
   - Wait for propagation

3. **Verify SSL**
   - Vercel automatically provisions SSL certificates
   - Verify HTTPS is working

## Step 10: Backup and Recovery

### 10.1 Database Backups

**Vercel Postgres**
- Automatic backups are enabled
- Configure point-in-time recovery
- Export data regularly

**SQLite**
- Download database file periodically
- Use Vercel KV for backup storage

### 10.2 Application Backup

- Keep GitHub repository updated
- Tag releases
- Maintain deployment scripts

## Conclusion

Your gamified teaching platform is now deployed to Vercel! The platform includes:

- ✅ Next.js frontend with Tailwind CSS
- ✅ Real-time Socket.IO functionality
- ✅ Database integration with Prisma
- ✅ Timer functionality for questions
- ✅ Teacher and student interfaces
- ✅ Responsive design
- ✅ Production-ready configuration

## Next Steps

1. **Monitor Performance**: Use Vercel Analytics to track usage
2. **Gather Feedback**: Collect user feedback for improvements
3. **Scale Resources**: Upgrade database and server resources as needed
4. **Add Features**: Continue developing new educational features

## Support

If you encounter any issues:
1. Check Vercel deployment logs
2. Review this guide
3. Consult Vercel documentation
4. Contact Vercel support for platform-specific issues

Happy teaching! 🎓🚀