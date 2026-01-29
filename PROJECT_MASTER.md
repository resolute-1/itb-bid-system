# ITB/BID MANAGEMENT SYSTEM - PROJECT MASTER DOCUMENT

**IMPORTANT: Upload this file at the start of every session so Claude knows the complete project state**

---

## PROJECT OVERVIEW

**Purpose:** Construction project management software focusing on Invitation to Bid (ITB) and bid comparison workflow

**Client:** Construction company needing to manage subcontractor bidding process

**Tech Stack:**
- Frontend: React (single-page HTML artifact for now)
- Backend: Node.js + Express.js (to be built)
- Database: PostgreSQL on Railway
- Email: SendGrid API
- Hosting: Railway.app
- Version Control: GitHub

**Timeline:** 5 days to MVP (Minimum Viable Product)

---

## CURRENT STATUS

### ✅ COMPLETED (Session 1):
1. **Frontend Prototype Built** (`itb-bid-system.html`)
   - Estimator dashboard with project management
   - ITB creation and tracking interface
   - Subcontractor database organized by CSI codes
   - Bid comparison spreadsheet view
   - Subcontractor portal for bid submission
   - All functionality works with local state (no backend yet)

### 🚧 IN PROGRESS:
- Setting up Railway hosting platform
- Creating backend API structure
- Designing PostgreSQL database schema

### 📋 NEXT STEPS:
1. Deploy frontend to Railway
2. Build Node.js/Express backend API
3. Create PostgreSQL database schema
4. Connect frontend to backend
5. Add user authentication
6. Integrate email functionality

---

## SYSTEM ARCHITECTURE

### Frontend Components:
1. **Dashboard** - Project overview, create new projects, view stats
2. **ITB Management** - Select subs, customize email, send ITBs, track status
3. **Subcontractor Database** - Add/manage subs organized by CSI codes
4. **Bid Comparison** - Spreadsheet-style comparison grouped by CSI division
5. **Subcontractor Portal** - Separate interface for subs to submit bids

### CSI Codes Used:
- 03 - Concrete
- 04 - Masonry
- 05 - Metals
- 06 - Wood, Plastics, and Composites
- 07 - Thermal and Moisture Protection
- 08 - Openings
- 09 - Finishes
- 21 - Fire Suppression
- 22 - Plumbing
- 23 - HVAC
- 26 - Electrical
- 31 - Earthwork
- 32 - Exterior Improvements

### User Roles:
1. **Senior Estimator** - Full access (create projects, send ITBs, manage everything)
2. **Junior Estimator** - Limited access (view only, can submit bids for review)
3. **Subcontractor** - Portal access only (view ITBs, submit bids)
4. **Owner/Admin** - Dashboard view for project status overview

---

## DATABASE SCHEMA (PostgreSQL)

### Tables:

**users**
- id (primary key)
- email (unique)
- password_hash
- name
- role (senior_estimator, junior_estimator, admin, subcontractor)
- company_id (foreign key to companies - for subcontractors)
- created_at
- last_login

**companies** (subcontractor companies)
- id (primary key)
- name
- email
- phone
- csi_code
- address
- contact_person
- notes
- created_at
- updated_at

**projects**
- id (primary key)
- name
- project_number (unique)
- address
- bid_due_date
- status (active, awarded, cancelled)
- created_by (foreign key to users)
- created_at
- updated_at

**itbs** (Invitation to Bid records)
- id (primary key)
- project_id (foreign key to projects)
- subcontractor_id (foreign key to companies)
- status (pending, submitted, declined, expired)
- sent_date
- opened_date (email tracking)
- email_subject
- email_body
- created_at

**bids**
- id (primary key)
- itb_id (foreign key to itbs)
- project_id (foreign key to projects)
- subcontractor_id (foreign key to companies)
- bid_amount (decimal)
- timeline
- inclusions (text)
- exclusions (text)
- notes (text)
- estimated_response_date
- submitted_date
- created_at
- updated_at

**documents** (plans, specs, attachments)
- id (primary key)
- project_id (foreign key to projects)
- filename
- file_path
- file_type
- uploaded_by (foreign key to users)
- uploaded_at

---

## API ENDPOINTS (To Be Built)

### Authentication:
- POST /api/auth/login
- POST /api/auth/logout
- GET /api/auth/me

### Projects:
- GET /api/projects (list all)
- GET /api/projects/:id (single project)
- POST /api/projects (create)
- PUT /api/projects/:id (update)
- DELETE /api/projects/:id

### Subcontractors:
- GET /api/subcontractors (list all)
- GET /api/subcontractors?csi_code=03 (filter by CSI)
- POST /api/subcontractors (create)
- PUT /api/subcontractors/:id (update)
- DELETE /api/subcontractors/:id

### ITBs:
- GET /api/itbs?project_id=1 (list for project)
- POST /api/itbs (create and send)
- PUT /api/itbs/:id/status (update status)
- GET /api/itbs/:id/tracking (email open tracking)

### Bids:
- GET /api/bids?project_id=1 (list for project)
- POST /api/bids (submit bid)
- PUT /api/bids/:id (update bid)
- GET /api/bids/compare?project_id=1 (comparison view)

### Documents:
- POST /api/documents/upload
- GET /api/documents/:id
- DELETE /api/documents/:id

---

## EMAIL INTEGRATION PLAN

**Service:** SendGrid (free tier: 100 emails/day)

**Email Types:**
1. **ITB Invitation** - Sent to subcontractors with bid portal link
2. **Bid Reminder** - Automated reminder 3 days before due date
3. **Bid Received Notification** - Alert estimator when sub submits
4. **Bid Status Update** - Notify sub if bid accepted/rejected

**Tracking:**
- Email opens (SendGrid webhook)
- Link clicks
- Submission status

---

## SECURITY CONSIDERATIONS

1. **Password Hashing:** bcrypt with salt rounds
2. **JWT Tokens:** For session management
3. **Rate Limiting:** Prevent API abuse
4. **SQL Injection Prevention:** Parameterized queries
5. **CORS:** Restrict to production domain
6. **File Upload Validation:** Check file types, size limits
7. **Role-Based Access Control (RBAC):** Middleware for route protection

---

## DEPLOYMENT STRATEGY

### Railway Setup:
1. Connect GitHub repository
2. Add PostgreSQL plugin
3. Set environment variables
4. Auto-deploy on git push

### Environment Variables Needed:
```
DATABASE_URL=<postgresql connection string>
JWT_SECRET=<random secret key>
SENDGRID_API_KEY=<sendgrid key>
NODE_ENV=production
PORT=3000
FRONTEND_URL=<production domain>
```

---

## FEATURE ROADMAP

### Phase 1 (Days 1-2): MVP Core
- ✅ Frontend prototype
- ⏳ Backend API
- ⏳ Database setup
- ⏳ Basic CRUD operations

### Phase 2 (Days 3-4): Authentication & Email
- User login system
- Role-based permissions
- Email integration
- ITB sending and tracking

### Phase 3 (Day 5): Advanced Features
- File uploads
- Automated reminders
- Dashboard analytics
- Export to proposal

### Phase 4 (Future):
- Mobile app
- QuickBooks integration
- Advanced reporting
- Multi-company support

---

## KNOWN ISSUES / NOTES

- Current frontend uses mock data stored in React state
- Need to convert to API calls once backend is ready
- CSI codes are hardcoded - may need to make configurable
- Email tracking requires webhook setup with SendGrid
- File storage will use Railway's persistent volumes or S3

---

## SESSION NOTES

### Session 1 (Jan 28, 2026):
**COMPLETED:**
- ✅ Created frontend prototype with all core features (itb-bid-system.html)
- ✅ Built complete backend API (server.js) with all CRUD operations
- ✅ Created database migration script (migrate.js)
- ✅ Set up GitHub repository: https://github.com/resolute-1/itb-bid-system
- ✅ Created Railway account and project
- ✅ Deployed app to Railway - ONLINE
- ✅ Added PostgreSQL database to Railway
- ✅ Set environment variables (DATABASE_URL, JWT_SECRET, NODE_ENV, etc.)
- ✅ Installed Railway CLI locally
- ✅ Linked local project to Railway
- ✅ Added /setup endpoint to server.js for easy database initialization

**ISSUE AT END OF SESSION 1:**
- App was CRASHED on Railway
- Database tables NOT created yet

---

### Session 2 (Jan 29, 2026):
**PROBLEMS SOLVED:**
- ✅ **Fixed syntax errors in server.js** - Found 3 missing backticks in template literals (lines 394, 575, 595-596)
- ✅ **Reconnected GitHub to Railway** - Railway had lost OAuth connection, had to reauthorize via GitHub settings
- ✅ **Fixed DATABASE_URL connection** - Was set to placeholder text, reconnected properly to Postgres service
- ✅ **App is now DEPLOYED and ACTIVE!** - Successfully running on Railway

**CURRENT STATUS - APP IS FULLY DEPLOYED AND WORKING!**
- ✅ GitHub repo: https://github.com/resolute-1/itb-bid-system - All files synced
- ✅ Railway app: ACTIVE and DEPLOYED successfully
- ✅ PostgreSQL database: Online with all tables created
- ✅ Environment variables: All set correctly
- ✅ Public domain: https://itb-bid-system-production.up.railway.app
- ✅ Database tables: Created with demo data
- ✅ App tested and working - logged in as John Smith

**APP IS LIVE AND FUNCTIONAL!**
- URL: https://itb-bid-system-production.up.railway.app
- Login: john@construction.com / password123
- Demo project: "Downtown Office Complex" visible on dashboard
- All features operational

**RAILWAY APP INFO:**
- Project: lively-abundance
- Service: itb-bid-system (ACTIVE)
- Database: Postgres (ONLINE)
- Region: us-west2
- Private URL: itb-bid-system.railway.internal
- Public URL: [Generate Domain to get this]

**FILES LOCATIONS:**
- Local: ~/Desktop/itb-bid-system
- GitHub: https://github.com/resolute-1/itb-bid-system (all files synced)
- Railway: Connected and auto-deploying from GitHub main branch

**WHAT'S WORKING:**
- ✅ Backend server running
- ✅ Database connection established
- ✅ All API endpoints ready
- ✅ Frontend files served from /public folder
- ✅ Auto-deploy from GitHub working

**REMAINING TASKS:**
1. Generate public domain
2. Run database migration via /setup endpoint
3. Test the app
4. (Future) Add email integration with SendGrid
5. (Future) Add file upload capability

**LESSONS LEARNED:**
- Template literal syntax errors (backticks) will crash Node.js
- Railway can lose GitHub OAuth connection - need to reauthorize
- DATABASE_URL must be actual connection string, not placeholder
- Always check Deploy Logs when app crashes

---

## COMMANDS TO REMEMBER

### Start local development:
```bash
npm install
npm run dev
```

### Database migrations:
```bash
npm run migrate
```

### Deploy to Railway:
```bash
git push origin main
```

---

## CONTACT & ACCESS

**Railway Account:** [To be set up]
**GitHub Repo:** [To be created]
**SendGrid Account:** [To be set up]

---

**REMINDER:** Update this document at the end of each session with progress notes!
