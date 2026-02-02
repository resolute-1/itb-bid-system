# CURSOR CONTEXT - ITB/BID MANAGEMENT SYSTEM

**READ THIS FILE AT THE START OF EVERY CURSOR SESSION**

---

## PROJECT VISION: PACKAGED SOFTWARE PRODUCT

**This is NOT just internal software - this is being built as a PRODUCT for sale/distribution.**

### Business Model:
- **Standalone installable software** that construction companies can deploy on their own servers
- **Multi-tenant capable** - one installation can serve multiple companies (optional)
- **Self-hosted** - customers own their data and infrastructure
- **Alternative to Procore/RedTeam** - but affordable and customizable

### Target Customers:
- Small to medium construction companies (1-50 employees)
- General contractors and subcontractors
- Companies wanting to own their data
- Companies wanting to avoid $400/user/month SaaS fees

### Deployment Options:
1. **Self-hosted** - Customer installs on their own server (primary)
2. **Hosted service** - We host for customer (optional future)
3. **Hybrid** - Some modules self-hosted, some cloud (future)

---

## PRODUCT ARCHITECTURE REQUIREMENTS

### Installation Requirements:
Must be easy for non-technical users to install:
- **Installer script** - Automated setup process
- **Dependency checking** - Verify Node.js, PostgreSQL available
- **Database initialization** - Automatic schema creation
- **Default configuration** - Sensible defaults, easy customization
- **Setup wizard** - Web-based initial configuration

### Multi-Tenant Considerations:
Even though primarily self-hosted, architecture should support:
- **Company isolation** - Data segregation between companies
- **Configurable branding** - Logo, colors, company name
- **Feature flags** - Enable/disable features per installation
- **Role-based permissions** - Flexible user access control

### Configuration Management:
- **Environment variables** - For sensitive settings
- **Config file** - For application settings (config.json)
- **Database-driven config** - For runtime settings
- **Admin panel** - Web interface for configuration

### Security Requirements:
- **Secure by default** - HTTPS, strong passwords enforced
- **Data encryption** - Sensitive data encrypted at rest
- **Audit logging** - Track all critical actions
- **Backup/restore** - Built-in backup functionality
- **Update mechanism** - Secure update process

### Licensing & Updates:
- **License key system** - Validate installations (future)
- **Version checking** - Notify when updates available
- **Update channel** - Automatic or manual updates
- **Migration scripts** - Database schema updates

---

## WHAT THIS APP DOES

Construction project management software for managing the Invitation to Bid (ITB) process and comparing subcontractor bids.

**Core Workflow:**
1. Estimators create projects
2. Select subcontractors by CSI trade codes
3. Send ITB emails to subcontractors
4. Subcontractors submit bids through portal
5. Estimators compare bids side-by-side
6. Generate proposals for clients

---

## CURRENT STATE (FULLY FUNCTIONAL)

### ✅ What's Working:
- Full-stack app deployed and live
- Frontend: React SPA serving from `/public/index.html`
- Backend: Express.js API on Node.js
- Database: PostgreSQL with all tables created
- Authentication: JWT-based with bcrypt password hashing
- Demo data: 3 users, 6 subcontractors, 1 project

### 🔗 Live Links:
- **Production:** https://itb-bid-system-production.up.railway.app
- **GitHub:** https://github.com/resolute-1/itb-bid-system
- **Railway:** Project "lively-abundance", service "itb-bid-system"

### 👤 Test Users:
```
john@construction.com / password123 (Senior Estimator - full access)
mary@construction.com / password123 (Junior Estimator - limited)
admin@construction.com / password123 (Admin)
```

---

## PROJECT STRUCTURE

```
itb-bid-system/
├── server.js              # Main backend API server
├── migrate.js             # Database setup script (one-time use)
├── package.json           # Dependencies
├── .env.example          # Environment variable template
├── .gitignore            # Git ignore rules
├── public/
│   └── index.html        # React SPA (all frontend code in one file)
├── PROJECT_MASTER.md     # Complete project documentation
├── CURSOR_CONTEXT.md     # This file
├── DEPLOYMENT_CHECKLIST.md
├── SETUP_GUIDE.md
└── README.md
```

---

## DATABASE SCHEMA

**All tables created and populated with demo data**

### Tables:
1. **users** - System users (estimators, admins)
2. **companies** - Subcontractor companies
3. **projects** - Construction projects
4. **itbs** - Invitation to Bid records
5. **bids** - Submitted bids from subcontractors
6. **documents** - File attachments (not implemented yet)

**Important:** Never drop tables in production! Use migrations for schema changes.

---

## TECHNOLOGY STACK

### Backend:
- Node.js v18.20.8
- Express.js v4.18.2
- PostgreSQL (via `pg` package)
- bcrypt for password hashing
- jsonwebtoken for authentication
- cors for cross-origin requests
- dotenv for environment variables

### Frontend:
- React 18 (loaded via CDN in single HTML file)
- Tailwind CSS (via CDN)
- No build process - pure HTML/JS

### Deployment:
- Railway.app (auto-deploy from GitHub)
- PostgreSQL hosted on Railway
- Environment variables stored in Railway

---

## ENVIRONMENT VARIABLES (Set in Railway)

```
DATABASE_URL=<postgresql connection string from Railway Postgres>
JWT_SECRET=<random secret for JWT signing>
NODE_ENV=production
PORT=3000
SENDGRID_API_KEY=<to be added>
FRONTEND_URL=https://itb-bid-system-production.up.railway.app
```

**Note:** Never commit these to Git! They're in Railway only.

---

## API ENDPOINTS (All Working)

### Authentication:
- POST `/api/auth/login` - User login (returns JWT token)
- GET `/api/auth/me` - Get current user (requires auth)

### Projects:
- GET `/api/projects` - List all projects (requires auth)
- GET `/api/projects/:id` - Get single project
- POST `/api/projects` - Create project (senior_estimator/admin only)
- PUT `/api/projects/:id` - Update project

### Subcontractors:
- GET `/api/subcontractors` - List all subs (optional ?csi_code filter)
- POST `/api/subcontractors` - Add subcontractor
- PUT `/api/subcontractors/:id` - Update subcontractor

### ITBs:
- GET `/api/itbs?project_id=1` - Get ITBs for project
- POST `/api/itbs` - Create and send ITBs

### Bids:
- GET `/api/bids?project_id=1` - Get bids for project
- POST `/api/bids` - Submit bid (no auth required - for sub portal)

### Special:
- GET `/setup` - One-time database initialization (already run)
- GET `/api/health` - Health check

---

## CSI DIVISION CODES (Industry Standard)

The app organizes subcontractors by CSI (Construction Specifications Institute) codes:

- **03** - Concrete
- **04** - Masonry
- **05** - Metals
- **06** - Wood, Plastics, Composites
- **07** - Thermal & Moisture Protection
- **08** - Openings (doors, windows)
- **09** - Finishes
- **21** - Fire Suppression
- **22** - Plumbing
- **23** - HVAC
- **26** - Electrical
- **31** - Earthwork
- **32** - Exterior Improvements

---

## WHAT TO BUILD NEXT (Priority Order)

### Session 3: Email Integration with SendGrid
**Goal:** Actually send ITB emails (currently just logs to console)

**Tasks:**
1. Sign up for SendGrid free account (100 emails/day)
2. Get API key and add to Railway environment variables
3. Update `/api/itbs` POST endpoint to send real emails
4. Create email templates with project details and bid portal link
5. Add email tracking (opens, clicks) via SendGrid webhooks
6. Test with real email addresses

**Files to modify:**
- `server.js` - ITB creation endpoint
- Add new file: `emails/templates.js` for email HTML

---

### Session 4: File Upload & Storage
**Goal:** Let users upload plans, specs, and documents to projects

**Tasks:**
1. Choose storage solution (Railway volumes or AWS S3)
2. Add multer for file upload handling
3. Create `/api/documents/upload` endpoint
4. Update frontend to show file attachments
5. Add download functionality
6. Implement file type validation and size limits

**Files to modify:**
- `server.js` - Add upload endpoint
- `public/index.html` - Add file upload UI
- `package.json` - Add multer dependency

---

### Session 5: Automated Reminders
**Goal:** Send reminder emails to subcontractors who haven't responded

**Tasks:**
1. Create scheduled job (node-cron or Railway cron)
2. Query for pending ITBs with approaching due dates
3. Send reminder emails automatically
4. Add "decline" option for subcontractors
5. Track reminder history

**Files to create:**
- `jobs/reminders.js` - Scheduled tasks

---

### Session 6: Proposal Generation
**Goal:** Export bid comparison to PDF proposal for clients

**Tasks:**
1. Add PDF generation library (pdfkit or puppeteer)
2. Create proposal template
3. Generate PDF with selected bids
4. Add download button in frontend
5. Include company branding/logo

**Files to create:**
- `utils/pdf-generator.js`

---

## COMMON ISSUES & SOLUTIONS

### Issue: "Cannot GET /"
**Solution:** Make sure `public/index.html` exists and server is serving static files with `app.use(express.static('public'))`

### Issue: Database connection error
**Solution:** Check DATABASE_URL in Railway variables. Get fresh connection string from Postgres service if needed.

### Issue: JWT token invalid
**Solution:** Check JWT_SECRET matches between sessions. Generate new secret if needed.

### Issue: CORS errors
**Solution:** CORS is already configured. If issues persist, check frontend URL in Railway variables.

### Issue: Railway deployment fails
**Solution:** Check Deploy Logs in Railway. Common causes: missing dependencies, syntax errors, wrong start command.

---

## DEVELOPMENT WORKFLOW

### Local Development:
1. Clone repo: `git clone https://github.com/resolute-1/itb-bid-system.git`
2. Install: `npm install`
3. Create `.env` file (copy from `.env.example`)
4. Get DATABASE_URL from Railway Postgres service
5. Run: `npm run dev` (or `node server.js`)
6. Visit: `http://localhost:3000`

### Making Changes:
1. Edit files in Cursor
2. Test locally if possible
3. Commit: `git add . && git commit -m "Description"`
4. Push: `git push origin main`
5. Railway auto-deploys (watch Deployments tab)
6. Test on production URL

### Database Changes:
**NEVER run `/setup` on production again** - it drops all tables!

For schema changes:
1. Write migration script
2. Test locally first
3. Run on production database via Railway console
4. Update `migrate.js` for future reference

---

## CURSOR-SPECIFIC TIPS

### Starting a Session:
```
Hi Claude! Read CURSOR_CONTEXT.md and help me [specific task].

Context: This is a construction ITB/Bid management system. 
Currently working on: [what you want to build]
```

### Effective Prompts:
✅ "Add SendGrid email sending to the POST /api/itbs endpoint"
✅ "Create a file upload endpoint using multer for project documents"
✅ "Fix the authentication bug where JWT tokens expire too quickly"

❌ "Make the app better"
❌ "Add features"
❌ "Fix everything"

### If I Seem Confused:
1. Point me back to this file
2. Show me the specific file you're working on
3. Give me the exact error message
4. Tell me what you expected vs what happened

---

## TESTING CHECKLIST

Before deploying changes:

- [ ] No console errors in browser
- [ ] All API endpoints return proper status codes
- [ ] Authentication works (can login/logout)
- [ ] Database queries don't cause errors
- [ ] Frontend UI renders correctly
- [ ] No sensitive data exposed in responses
- [ ] Git commit has clear message
- [ ] Railway deployment succeeds

---

## IMPORTANT REMINDERS

1. **Never commit `.env` file** - it's in `.gitignore`
2. **Test on production URL after deploy** - Railway auto-deploys
3. **Railway resets filesystem on deploy** - use database or S3 for persistent storage
4. **Frontend is single-file** - `public/index.html` contains all React code
5. **Database has demo data** - don't delete it, users need it for testing

---

## HELPFUL RAILWAY COMMANDS

```bash
# Login to Railway CLI
railway login

# Link to project
railway link

# View logs
railway logs

# Run commands on Railway
railway run npm run migrate

# Open Railway dashboard
railway open
```

---

## CONTACT INFO

**Client:** resolute-1
**GitHub:** https://github.com/resolute-1
**Railway Project:** lively-abundance

---

## END OF CONTEXT FILE

**Remember:** Read this file at the start of every session for full context!
