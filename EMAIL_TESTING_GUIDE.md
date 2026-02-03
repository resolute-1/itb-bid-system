# Email Testing Guide - Nodemailer Integration

**Created:** February 3, 2026  
**Session 3 Deliverable**

---

## 🎉 What Was Implemented

### ✅ Completed Features:
1. **Nodemailer Integration** - Full SMTP email functionality
2. **HTML Email Templates** - Professional, responsive designs
3. **Three Email Types:**
   - ITB Invitation emails
   - Bid received confirmations
   - Bid reminder emails
4. **Dev Mode Fallback** - Works without SMTP configured (logs to console)
5. **Updated API** - POST /api/itbs now sends real emails

---

## 📋 Quick Start

### Option 1: Test Locally WITHOUT Email (Dev Mode)

**No SMTP configuration needed!**

1. Run the server:
   ```bash
   npm install
   node server.js
   ```

2. Create an ITB via the frontend or API

3. Check console output - you'll see:
   ```
   📧 [DEV MODE] Would send ITB email to contractor@example.com for project: Downtown Office Complex
   ```

**This is the fastest way to test that everything works without setting up email.**

---

### Option 2: Test with Real Emails (Gmail)

#### Step 1: Set Up Gmail App Password

1. Go to your Google Account settings
2. Enable 2-Factor Authentication (required)
3. Go to: Security → App passwords
4. Generate an app password for "Mail"
5. Copy the 16-character password

#### Step 2: Configure Environment Variables

Create a `.env` file (or add to Railway):

```bash
DATABASE_URL=<your_database_url>
JWT_SECRET=<your_jwt_secret>
NODE_ENV=development
PORT=3000

# Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-16-char-app-password
SMTP_FROM_NAME=Your Company Name
SMTP_FROM_EMAIL=your-email@gmail.com

FRONTEND_URL=http://localhost:3000
```

#### Step 3: Test Sending Emails

1. Start the server: `node server.js`
2. Login to the app
3. Create a new ITB and send to a subcontractor
4. Check the console for:
   ```
   ✅ ITB email sent to contractor@example.com: <message-id>
   ```
5. Check your inbox (and spam folder)!

---

## 🧪 Testing Other Email Providers

### Using Outlook/Office 365:

```bash
SMTP_HOST=smtp-mail.outlook.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@outlook.com
SMTP_PASS=your-password
```

### Using Custom SMTP Server:

```bash
SMTP_HOST=mail.yourdomain.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=noreply@yourdomain.com
SMTP_PASS=your-smtp-password
```

### Using Mailgun, SendGrid, or other services:

All provide SMTP credentials - use their SMTP settings instead of their APIs.

---

## 📧 Email Templates Preview

### 1. ITB Invitation Email

**Subject:** `Invitation to Bid - [Project Name]`

**Includes:**
- Professional header with project details
- Project name, location, bid due date
- "Submit Your Bid" button with link to portal
- Important notes and instructions
- Responsive HTML design

**Link Format:** `https://your-domain.com/bid-portal?itb_id=123`

---

### 2. Bid Received Confirmation

**Subject:** `Bid Received - [Project Name]`

**Includes:**
- Thank you message
- Confirmation of bid amount received
- Next steps information

---

### 3. Bid Reminder Email

**Subject:** `Reminder: Bid Due Soon - [Project Name]`

**Includes:**
- Warning box with approaching deadline
- Days remaining counter
- "Submit Your Bid" button
- Option to decline if not bidding

---

## 🚀 Deployment to Railway

### Step 1: Add Environment Variables

1. Go to Railway dashboard
2. Select your service: `itb-bid-system`
3. Go to **Variables** tab
4. Add these variables:
   ```
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_SECURE=false
   SMTP_USER=your-email@gmail.com
   SMTP_PASS=your-app-password
   SMTP_FROM_NAME=ITB Bid System
   SMTP_FROM_EMAIL=your-email@gmail.com
   ```

### Step 2: Deploy

1. Commit and push changes:
   ```bash
   git add .
   git commit -m "Add Nodemailer email integration"
   git push origin main
   ```

2. Railway will auto-deploy (watch the Deploy Logs)

### Step 3: Test on Production

1. Visit: https://itb-bid-system-production.up.railway.app
2. Login with: `john@construction.com` / `password123`
3. Create an ITB and send to a test email address
4. Check Railway logs: `railway logs`
5. Look for: `✅ ITB email sent to...`

---

## 🔍 Troubleshooting

### Issue: "SMTP not configured - running in dev mode"

**Cause:** Environment variables not set  
**Solution:** Add SMTP_HOST at minimum. The app checks for this variable.

---

### Issue: Emails not sending (Gmail)

**Possible causes:**
1. **App password not generated** - Gmail requires app passwords when using 2FA
2. **"Less secure apps" blocked** - Use app password instead
3. **Wrong credentials** - Double-check SMTP_USER and SMTP_PASS

**Solution:** 
- Verify app password is correct
- Check Railway logs for error messages
- Try sending a test email from Gmail SMTP test tool

---

### Issue: Emails go to spam

**Possible causes:**
1. Sending from Gmail address (not a domain)
2. No SPF/DKIM records
3. Low sender reputation

**Solutions:**
- Use a custom domain email (better for production)
- Set up SPF/DKIM records with your email provider
- Start with low volume to build reputation
- Add clear unsubscribe options

---

### Issue: "Error: self signed certificate in certificate chain"

**Cause:** SSL certificate validation issues  
**Solution:** Check `SMTP_SECURE` setting:
- Port 587 → `SMTP_SECURE=false`
- Port 465 → `SMTP_SECURE=true`

---

## 📊 Monitoring Email Status

### Console Logs

When emails are sent, you'll see:

```
📧 Sent 3 ITB emails
  ✅ ABC Concrete Co. (bids@abcconcrete.com)
  ✅ Elite Masonry (bids@elitemasonry.com)
  ⚠️  PowerTech Electric (estimating@powertechelectric.com) - SMTP not configured
```

### Railway Logs

View live logs:
```bash
railway logs
```

Or in Railway dashboard → Deployments → View Logs

---

## 🎯 Next Steps

### For Development:
1. Test locally without SMTP (dev mode works!)
2. Set up Gmail app password
3. Send test ITBs to your own email
4. Verify email templates look good

### For Production:
1. Decide on email provider:
   - Gmail (easy, 500/day limit)
   - Custom SMTP (better deliverability)
   - Email service (SendGrid, Mailgun, etc.)
2. Add environment variables to Railway
3. Deploy and test
4. Monitor logs for any issues

### Future Enhancements (Not in this session):
- Email tracking (opens/clicks)
- Email queue for high volume
- Retry logic for failed sends
- Email templates in database
- Unsubscribe functionality
- Attachment support

---

## 📚 Code Reference

### Email Functions

Located in: `utils/email.js`

```javascript
// Send ITB invitation
await sendITB({
  to: 'contractor@example.com',
  subcontractorName: 'ABC Concrete',
  projectName: 'Downtown Office Complex',
  projectAddress: '123 Main St',
  bidDueDate: '2026-02-15',
  itbId: 1
});

// Send bid confirmation
await sendBidReceived({
  to: 'contractor@example.com',
  subcontractorName: 'ABC Concrete',
  projectName: 'Downtown Office Complex',
  bidAmount: 125000.00
});

// Send reminder
await sendBidReminder({
  to: 'contractor@example.com',
  projectName: 'Downtown Office Complex',
  bidDueDate: '2026-02-15',
  daysRemaining: 3,
  itbId: 1
});
```

### API Response

POST /api/itbs now returns:

```json
{
  "itbs": [
    {
      "id": 1,
      "project_id": 1,
      "subcontractor_id": 1,
      "status": "pending",
      "sent_date": "2026-02-03T10:30:00Z"
    }
  ],
  "emailResults": [
    {
      "subcontractor": "ABC Concrete Co.",
      "email": "bids@abcconcrete.com",
      "success": true,
      "messageId": "<abc123@gmail.com>"
    }
  ]
}
```

---

## ✅ Session 3 Complete!

**What's working:**
- ✅ Nodemailer installed and configured
- ✅ Email templates created (HTML)
- ✅ ITB emails send automatically
- ✅ Dev mode works without SMTP
- ✅ Production-ready for Railway

**Ready for Session 4:** File Upload & Storage

---

**Questions?** Check the PROJECT_STATUS.md or CURSOR_CONTEXT.md files for more information.
