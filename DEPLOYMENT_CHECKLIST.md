# DEPLOYMENT CHECKLIST - START HERE!

**Follow these steps in order. Check off each one as you complete it.**

---

## ✅ PHASE 1: ACCOUNTS & SETUP (10 minutes)

### Step 1: Create Railway Account
- [ ] Go to https://railway.app
- [ ] Click "Login" → "Login with GitHub"
- [ ] Authorize Railway

### Step 2: Create GitHub Account (if needed)
- [ ] Go to https://github.com
- [ ] Sign up if you don't have an account
- [ ] Verify your email

### Step 3: Install Required Software
- [ ] Install Git: https://git-scm.com/downloads
- [ ] Install Node.js: https://nodejs.org (download LTS version)
- [ ] Verify installation:
  ```bash
  git --version
  node --version
  npm --version
  ```

---

## ✅ PHASE 2: GITHUB REPOSITORY (5 minutes)

### Step 4: Create Repository
- [ ] Go to https://github.com
- [ ] Click "+" → "New repository"
- [ ] Name: `itb-bid-system`
- [ ] Make it Public (or Private)
- [ ] ✅ Check "Add a README file"
- [ ] Click "Create repository"

### Step 5: Clone Repository to Your Computer
Open Terminal/Command Prompt and run:
```bash
cd Desktop  # or wherever you want to work
git clone https://github.com/YOUR-USERNAME/itb-bid-system.git
cd itb-bid-system
```

### Step 6: Add Project Files
- [ ] Copy all files from the outputs folder into your `itb-bid-system` folder
- [ ] Make sure these files are there:
  - server.js
  - migrate.js
  - package.json
  - .gitignore
  - .env.example
  - README.md
  - PROJECT_MASTER.md
  - SETUP_GUIDE.md
  - itb-bid-system.html

### Step 7: Push to GitHub
```bash
git add .
git commit -m "Initial commit - ITB Bid Management System"
git push origin main
```

---

## ✅ PHASE 3: RAILWAY DEPLOYMENT (5 minutes)

### Step 8: Create Railway Project
- [ ] In Railway, click "New Project"
- [ ] Select "Deploy from GitHub repo"
- [ ] Click "Configure GitHub App"
- [ ] Select your `itb-bid-system` repository
- [ ] Click "Deploy"

### Step 9: Add PostgreSQL Database
- [ ] In Railway project, click "New" (top right)
- [ ] Select "Database" → "Add PostgreSQL"
- [ ] Wait for it to provision (30 seconds)

### Step 10: Set Environment Variables
- [ ] Click on your web service (not database)
- [ ] Go to "Variables" tab
- [ ] Add these variables:

**Required Variables:**
```
JWT_SECRET=<generate a random string>
NODE_ENV=production
PORT=3000
```

**To generate JWT_SECRET:** Run this in terminal:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

- [ ] DATABASE_URL should already be set automatically by Railway

### Step 11: Deploy!
- [ ] Railway will automatically deploy
- [ ] Watch the "Deployments" tab for logs
- [ ] Wait for "Build successful" message

---

## ✅ PHASE 4: DATABASE SETUP (2 minutes)

### Step 12: Run Migration Script
Option A - Using Railway CLI (easiest):
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Link to your project
railway link

# Run migration
railway run npm run migrate
```

Option B - Using Railway Console:
- [ ] In Railway, click on your web service
- [ ] Click "Settings" → "Console"
- [ ] Run: `npm run migrate`

### Step 13: Verify Database
Check that you see:
```
✅ Created users table
✅ Created companies table
✅ Created projects table
✅ Created itbs table
✅ Created bids table
🎉 Database migration completed successfully!
```

---

## ✅ PHASE 5: TEST THE APP (3 minutes)

### Step 14: Get Your App URL
- [ ] In Railway, click on your web service
- [ ] Click "Settings"
- [ ] Find "Domains" section
- [ ] Your URL will be something like: `https://your-app.up.railway.app`

### Step 15: Test Login
- [ ] Open your Railway app URL in browser
- [ ] Click "Login" 
- [ ] Use these credentials:
  - Email: `john@construction.com`
  - Password: `password123`

### Step 16: Test Basic Functions
- [ ] Create a new project
- [ ] Add a subcontractor
- [ ] Send an ITB
- [ ] View bid comparison

---

## 🎉 SUCCESS CHECKLIST

If you can do all of these, you're live:
- [ ] App loads in browser
- [ ] Can log in
- [ ] Can create a project
- [ ] Can see subcontractors
- [ ] Can send ITBs
- [ ] Database is saving data (refresh page, data persists)

---

## 🚨 TROUBLESHOOTING

### App won't deploy
- Check Railway logs in "Deployments" tab
- Make sure all files were pushed to GitHub
- Verify `package.json` exists

### Database connection error
- Make sure PostgreSQL service is running (green status)
- Check that DATABASE_URL is set in variables
- Try restarting the web service

### Can't log in
- Make sure you ran `npm run migrate`
- Check Railway logs for errors
- Try using Railway console to run migration again

### Need help?
- Check `PROJECT_MASTER.md` for detailed info
- Check `SETUP_GUIDE.md` for Railway-specific help
- Look at Railway logs for specific error messages

---

## 📝 NEXT SESSION PREPARATION

Before our next session, save these files:
- [ ] `PROJECT_MASTER.md` - Upload this at the start of next session
- [ ] This checklist (save your progress)
- [ ] Note any errors or issues you encountered

---

## 💰 RAILWAY COSTS

- **First $5:** FREE (included)
- **After that:** ~$5-10/month
- You can monitor usage in Railway dashboard
- No credit card required to start

---

**Questions? Start working through this checklist and let me know where you get stuck!**
