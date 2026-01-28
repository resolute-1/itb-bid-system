# RAILWAY SETUP GUIDE - ITB/BID MANAGEMENT SYSTEM

**Follow these steps exactly - this will get your app online in 10 minutes**

---

## STEP 1: CREATE RAILWAY ACCOUNT (2 minutes)

1. Go to **https://railway.app**
2. Click "Login" (top right)
3. Choose "Login with GitHub" (easiest option)
4. Authorize Railway to access your GitHub
5. You'll get $5 free credit (enough for testing)

✅ **You now have a Railway account!**

---

## STEP 2: CREATE GITHUB REPOSITORY (3 minutes)

1. Go to **https://github.com**
2. Click the "+" icon (top right) → "New repository"
3. Name it: `itb-bid-system`
4. Description: "Construction ITB and Bid Management System"
5. Choose "Public" (or Private if you prefer)
6. ✅ Check "Add a README file"
7. Click "Create repository"

✅ **You now have a GitHub repo!**

---

## STEP 3: CREATE RAILWAY PROJECT (2 minutes)

1. In Railway, click "New Project"
2. Select "Deploy from GitHub repo"
3. Click "Configure GitHub App"
4. Select your `itb-bid-system` repository
5. Click "Deploy"

Railway will create your project (it might fail to deploy initially - that's OK, we haven't pushed code yet)

✅ **Railway project created!**

---

## STEP 4: ADD POSTGRESQL DATABASE (1 minute)

1. In your Railway project, click "New" (top right)
2. Select "Database" → "Add PostgreSQL"
3. Railway automatically creates the database
4. Click on the PostgreSQL service
5. Go to "Variables" tab
6. Copy the `DATABASE_URL` value (you'll need this later)

✅ **Database ready!**

---

## STEP 5: SET UP LOCAL DEVELOPMENT (5 minutes)

### On Your Computer:

1. **Install Git** (if you don't have it):
   - Windows: https://git-scm.com/download/win
   - Mac: Open Terminal and type `git --version` (it will auto-install)

2. **Install Node.js** (if you don't have it):
   - Go to https://nodejs.org
   - Download LTS version (20.x)
   - Run installer

3. **Clone Your Repository:**
   Open Terminal/Command Prompt and run:
   ```bash
   git clone https://github.com/YOUR-USERNAME/itb-bid-system.git
   cd itb-bid-system
   ```

✅ **Local environment ready!**

---

## STEP 6: PUSH INITIAL CODE (Next Step)

We'll create the backend code structure and push it to GitHub, which will automatically deploy to Railway.

---

## RAILWAY DASHBOARD TOUR

### Project View:
- **Services**: Your app and database
- **Variables**: Environment variables (secrets, API keys)
- **Deployments**: History of all deployments
- **Settings**: Domain, regions, etc.

### What You Get Free:
- 500 hours of runtime per month
- 1 GB RAM
- 1 GB storage
- PostgreSQL database
- Custom domain option

### Costs:
- First $5 credit is free
- After that: ~$5-10/month for basic usage
- Pay-as-you-go (no contracts)

---

## ENVIRONMENT VARIABLES TO SET

In Railway project → Your service → Variables tab, add these:

```
DATABASE_URL=<already set by Railway>
JWT_SECRET=your-super-secret-key-change-this-123
NODE_ENV=production
PORT=3000
SENDGRID_API_KEY=<we'll add this later>
```

**Generate a secure JWT_SECRET:**
You can use any random string, or generate one:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

## DEBUGGING TIPS

### If deployment fails:
1. Check "Deployments" tab for error logs
2. Make sure `package.json` has correct start script
3. Verify environment variables are set

### If database won't connect:
1. Make sure DATABASE_URL is set
2. Check if PostgreSQL service is running (should show green)
3. Restart the app service

### View logs:
Click on your service → "Logs" tab to see real-time output

---

## USEFUL RAILWAY COMMANDS

### Deploy from CLI (optional):
```bash
npm install -g @railway/cli
railway login
railway link
railway up
```

### View logs:
```bash
railway logs
```

### Open app in browser:
```bash
railway open
```

---

## NEXT STEPS

Once Railway is set up, we'll:
1. Create the backend API code structure
2. Push to GitHub (auto-deploys to Railway)
3. Test the database connection
4. Connect the frontend to the backend

---

## TROUBLESHOOTING

**Problem:** "Railway won't deploy my app"
- **Solution:** Make sure you have `package.json` and `package-lock.json` in your repo

**Problem:** "Database connection error"
- **Solution:** Check that DATABASE_URL environment variable is set correctly

**Problem:** "App crashes on startup"
- **Solution:** Check logs in Railway dashboard, usually a missing dependency or environment variable

---

## SECURITY REMINDERS

⚠️ **NEVER commit these to GitHub:**
- Database passwords
- API keys
- JWT secrets

✅ **Always use environment variables in Railway**

---

**Ready to proceed? Let me know when you've completed Steps 1-4!**
