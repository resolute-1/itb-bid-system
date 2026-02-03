# LICENSE VERIFICATION SYSTEM - Technical Specification

**Created:** February 3, 2026  
**Priority:** HIGH - Required before first sale  
**Target Session:** Session 8-9 (After core features complete)

---

## BUSINESS REQUIREMENT

**User Story:** As a product owner, I need the system to periodically verify license keys so that if a customer's subscription expires or is not renewed, the system automatically shuts down to prevent unauthorized use.

**Why This Matters:**
- Enforce subscription renewals ($500/year maintenance)
- Prevent piracy and unauthorized installations
- Enable remote license revocation if needed
- Track active installations
- Enforce tier limitations (Professional vs Enterprise features)

---

## LICENSE VERIFICATION ARCHITECTURE

### 1. LICENSE KEY FORMAT

**Structure:**
```
LICENSE-{EDITION}-{CUSTOMER_ID}-{SIGNATURE}

Example:
PRO-A8F3-2026-Q7K9M-8X2P5-JWHS6
```

**Encoded Data (in key):**
```json
{
  "customerId": "A8F3",
  "edition": "professional|enterprise|source_code",
  "issuedDate": "2026-02-01",
  "expiresDate": "2027-02-01",  // null for lifetime
  "features": ["email", "files", "projects", "quickbooks"],
  "limits": {
    "maxProjects": null,      // null = unlimited
    "maxUsers": 10,
    "maxStorageGB": 100
  },
  "checkInFrequency": "weekly", // daily|weekly|monthly
  "signature": "RSA-SHA256-signature"
}
```

---

### 2. VERIFICATION FLOW

#### On Application Startup:
```
1. Read license key from database (system_settings table)
2. Validate license key signature (offline check)
3. Check expiration date (offline check)
4. If expired → Show "License Expired" message and block access
5. If valid → Continue startup
6. Schedule periodic check-in
```

#### Periodic Check-In (Weekly by default):
```
1. Send HTTP request to license server
2. Include: license key, installation ID, version, usage stats
3. Server responds: 
   - "valid" → Continue operation
   - "expired" → Graceful shutdown
   - "revoked" → Immediate shutdown + show message
   - "upgrade_available" → Show update notification
4. Update last_check_in timestamp in database
5. If check-in fails (network error) → Grace period (30 days)
```

#### Grace Period (Network Outages):
```
- Allow 30 days without successful check-in
- After 30 days, show warning: "Cannot verify license. System will shutdown in X days"
- After 45 days without check-in → Shutdown
- Prevents false positives from temporary network issues
```

---

### 3. LICENSE SERVER (API)

**Host:** `https://license.yourproduct.com` (your server)

#### Endpoint: POST /api/v1/verify

**Request:**
```json
{
  "licenseKey": "PRO-A8F3-2026-...",
  "installationId": "uuid-of-installation",
  "version": "1.2.3",
  "stats": {
    "userCount": 8,
    "projectCount": 45,
    "storageUsedGB": 12.5
  }
}
```

**Response (Valid):**
```json
{
  "status": "valid",
  "expiresAt": "2027-02-01T00:00:00Z",
  "daysRemaining": 365,
  "edition": "professional",
  "features": ["email", "files", "projects"],
  "message": "License is active"
}
```

**Response (Expired):**
```json
{
  "status": "expired",
  "expiredAt": "2026-12-01T00:00:00Z",
  "daysOverdue": 63,
  "message": "License expired. Please renew at yourproduct.com/renew",
  "renewalUrl": "https://yourproduct.com/renew?license=PRO-A8F3-2026-..."
}
```

**Response (Revoked):**
```json
{
  "status": "revoked",
  "reason": "payment_chargeback",
  "message": "License has been revoked. Contact support@yourproduct.com"
}
```

---

### 4. SHUTDOWN BEHAVIOR

#### When License Expires or is Revoked:

**Option A: Immediate Hard Shutdown (Strict)**
```javascript
if (licenseStatus === 'expired' || licenseStatus === 'revoked') {
  // Stop accepting new requests
  server.close();
  
  // Disconnect from database
  pool.end();
  
  // Show error page on all requests
  app.use((req, res) => {
    res.status(403).render('license-expired', {
      message: 'License expired. Please renew.',
      renewalUrl: 'https://yourproduct.com/renew'
    });
  });
  
  // Log shutdown
  console.error('System shutdown: License expired');
}
```

**Option B: Graceful Shutdown (Recommended)**
```javascript
if (licenseStatus === 'expired') {
  // Allow read-only access for 7 days
  app.use((req, res, next) => {
    if (req.method !== 'GET') {
      return res.status(403).json({ 
        error: 'License expired. System in read-only mode.',
        renewalUrl: 'https://yourproduct.com/renew'
      });
    }
    next();
  });
  
  // Show banner on all pages
  injectBanner('⚠️ LICENSE EXPIRED: System will shutdown in X days');
  
  // After 7 days → Full shutdown
  if (daysSinceExpiry > 7) {
    performHardShutdown();
  }
}
```

**Option C: Contact-Home Shutdown (Most Flexible)**
```javascript
// After failed check-in:
// Day 1-30: Continue normal operation (grace period)
// Day 31-45: Show warnings, read-only mode
// Day 45+: Full shutdown

const daysSinceLastCheckIn = getDaysSinceLastCheckIn();

if (daysSinceLastCheckIn > 45) {
  performHardShutdown();
} else if (daysSinceLastCheckIn > 30) {
  enableReadOnlyMode();
  showWarningBanner(`System will shutdown in ${45 - daysSinceLastCheckIn} days`);
}
```

---

### 5. IMPLEMENTATION FILES

#### Create: `lib/license.js`
```javascript
const crypto = require('crypto');
const fetch = require('node-fetch');

class LicenseManager {
  constructor(pool) {
    this.pool = pool;
    this.checkInInterval = null;
    this.gracePeriodDays = 30;
    this.shutdownThresholdDays = 45;
  }
  
  async initialize() {
    // Load license from database
    const license = await this.getLicenseFromDB();
    
    if (!license) {
      throw new Error('No license key configured');
    }
    
    // Validate signature (offline)
    const isValid = this.validateSignature(license);
    if (!isValid) {
      throw new Error('Invalid license signature');
    }
    
    // Check expiration (offline)
    const isExpired = this.isExpired(license);
    if (isExpired) {
      throw new Error('License expired');
    }
    
    // Perform initial check-in
    await this.checkIn();
    
    // Schedule periodic check-ins
    this.scheduleCheckIns();
    
    return license;
  }
  
  async checkIn() {
    try {
      const response = await fetch('https://license.yourproduct.com/api/v1/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          licenseKey: this.licenseKey,
          installationId: this.installationId,
          version: require('../package.json').version,
          stats: await this.getUsageStats()
        }),
        timeout: 10000 // 10 second timeout
      });
      
      const result = await response.json();
      
      // Update last check-in time
      await this.updateLastCheckIn(result);
      
      if (result.status === 'expired') {
        this.handleExpiredLicense(result);
      } else if (result.status === 'revoked') {
        this.handleRevokedLicense(result);
      }
      
      return result;
    } catch (error) {
      console.error('License check-in failed:', error);
      // Increment failed check-in counter
      await this.incrementFailedCheckIns();
      
      // Check if grace period exceeded
      const daysSinceLastCheckIn = await this.getDaysSinceLastCheckIn();
      if (daysSinceLastCheckIn > this.shutdownThresholdDays) {
        this.handleGracePeriodExpired();
      }
    }
  }
  
  scheduleCheckIns() {
    // Check in every 7 days (configurable)
    const intervalMs = 7 * 24 * 60 * 60 * 1000;
    
    this.checkInInterval = setInterval(() => {
      this.checkIn();
    }, intervalMs);
  }
  
  async getLicenseFromDB() {
    const result = await this.pool.query(
      'SELECT value FROM system_settings WHERE key = $1',
      ['license.key']
    );
    return result.rows[0]?.value;
  }
  
  validateSignature(licenseKey) {
    // Decode license key
    const decoded = this.decodeLicense(licenseKey);
    
    // Verify RSA signature with public key
    const publicKey = fs.readFileSync('./keys/license-public.pem');
    const verifier = crypto.createVerify('RSA-SHA256');
    verifier.update(JSON.stringify(decoded.data));
    
    return verifier.verify(publicKey, decoded.signature, 'base64');
  }
  
  isExpired(licenseKey) {
    const decoded = this.decodeLicense(licenseKey);
    
    if (!decoded.data.expiresDate) {
      return false; // Lifetime license
    }
    
    return new Date(decoded.data.expiresDate) < new Date();
  }
  
  handleExpiredLicense(result) {
    console.error('LICENSE EXPIRED:', result.message);
    
    // Set read-only mode
    global.LICENSE_STATUS = 'expired';
    global.LICENSE_MESSAGE = result.message;
    global.RENEWAL_URL = result.renewalUrl;
    
    // Schedule shutdown after grace period
    setTimeout(() => {
      this.performShutdown('License expired');
    }, 7 * 24 * 60 * 60 * 1000); // 7 days
  }
  
  handleRevokedLicense(result) {
    console.error('LICENSE REVOKED:', result.message);
    
    // Immediate shutdown for revoked licenses
    this.performShutdown('License revoked: ' + result.reason);
  }
  
  performShutdown(reason) {
    console.error('SYSTEM SHUTDOWN:', reason);
    
    // Close server
    if (global.httpServer) {
      global.httpServer.close();
    }
    
    // Close database connections
    this.pool.end();
    
    // Exit process
    process.exit(1);
  }
}

module.exports = LicenseManager;
```

---

#### Modify: `server.js` (Add license check on startup)
```javascript
const LicenseManager = require('./lib/license');

// Initialize license manager
const licenseManager = new LicenseManager(pool);

async function startServer() {
  try {
    // Check license before starting
    const license = await licenseManager.initialize();
    console.log('✅ License valid:', license.edition);
    
    // Start server
    const server = app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
    
    global.httpServer = server;
    
  } catch (error) {
    console.error('❌ License validation failed:', error.message);
    console.error('System cannot start without valid license.');
    process.exit(1);
  }
}

startServer();
```

---

#### Create: `middleware/license-check.js`
```javascript
// Middleware to enforce license restrictions
function checkLicenseStatus(req, res, next) {
  if (global.LICENSE_STATUS === 'expired') {
    // Read-only mode
    if (req.method !== 'GET') {
      return res.status(403).json({
        error: 'System in read-only mode due to expired license',
        message: global.LICENSE_MESSAGE,
        renewalUrl: global.RENEWAL_URL
      });
    }
    
    // Inject banner for UI
    res.locals.licenseBanner = {
      type: 'warning',
      message: '⚠️ License expired. System will shutdown soon. Please renew.'
    };
  }
  
  if (global.LICENSE_STATUS === 'revoked') {
    return res.status(403).json({
      error: 'License has been revoked',
      message: 'Contact support@yourproduct.com'
    });
  }
  
  next();
}

module.exports = { checkLicenseStatus };
```

---

### 6. LICENSE SERVER IMPLEMENTATION

**Simple Node.js License Server:**

```javascript
// license-server.js (separate service you host)
const express = require('express');
const app = express();

// Database of issued licenses
const licenses = new Map(); // In production: use PostgreSQL

app.post('/api/v1/verify', async (req, res) => {
  const { licenseKey, installationId, version, stats } = req.body;
  
  // Look up license in database
  const license = await db.query('SELECT * FROM licenses WHERE key = $1', [licenseKey]);
  
  if (!license) {
    return res.json({ status: 'invalid', message: 'License not found' });
  }
  
  // Check expiration
  if (license.expires_at && new Date(license.expires_at) < new Date()) {
    return res.json({
      status: 'expired',
      expiredAt: license.expires_at,
      message: 'License expired',
      renewalUrl: `https://yourproduct.com/renew?key=${licenseKey}`
    });
  }
  
  // Check if revoked
  if (license.revoked) {
    return res.json({
      status: 'revoked',
      reason: license.revoked_reason,
      message: 'License revoked'
    });
  }
  
  // Log check-in
  await db.query(
    'INSERT INTO license_checkins (license_id, installation_id, version, stats, checked_at) VALUES ($1, $2, $3, $4, NOW())',
    [license.id, installationId, version, JSON.stringify(stats)]
  );
  
  // Return valid status
  res.json({
    status: 'valid',
    expiresAt: license.expires_at,
    edition: license.edition,
    features: license.features,
    message: 'License is active'
  });
});

app.listen(3001, () => {
  console.log('License server running on port 3001');
});
```

---

### 7. DATABASE SCHEMA ADDITIONS

```sql
-- Add to migration script
CREATE TABLE system_settings (
  key VARCHAR(255) PRIMARY KEY,
  value TEXT,
  category VARCHAR(50),
  description TEXT,
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE license_checkins (
  id SERIAL PRIMARY KEY,
  installation_id UUID NOT NULL,
  license_key VARCHAR(255),
  checked_at TIMESTAMP DEFAULT NOW(),
  status VARCHAR(50),
  version VARCHAR(20),
  stats JSONB,
  response JSONB
);

CREATE INDEX idx_license_checkins_installation ON license_checkins(installation_id);
CREATE INDEX idx_license_checkins_checked_at ON license_checkins(checked_at);
```

---

### 8. ADMIN UI FOR LICENSE MANAGEMENT

Add to admin panel:

```javascript
// Admin Panel: License Status Page
<div className="license-status">
  <h2>License Status</h2>
  
  <div className="status-card">
    <div className="status-indicator success">✅ Active</div>
    <p><strong>Edition:</strong> Professional</p>
    <p><strong>Expires:</strong> February 1, 2027 (365 days remaining)</p>
    <p><strong>Last Check-in:</strong> 2 hours ago</p>
  </div>
  
  <div className="license-details">
    <h3>License Key</h3>
    <input type="text" value={licenseKey} readOnly />
    <button onClick={copyToClipboard}>Copy</button>
  </div>
  
  <div className="actions">
    <button onClick={manualCheckIn}>Check License Now</button>
    <button onClick={updateLicense}>Update License Key</button>
    <a href={renewalUrl}>Renew License →</a>
  </div>
  
  <div className="check-in-history">
    <h3>Check-in History</h3>
    <table>
      <thead>
        <tr>
          <th>Date</th>
          <th>Status</th>
          <th>Version</th>
        </tr>
      </thead>
      <tbody>
        {checkIns.map(checkIn => (
          <tr key={checkIn.id}>
            <td>{checkIn.checked_at}</td>
            <td>{checkIn.status}</td>
            <td>{checkIn.version}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
</div>
```

---

## SECURITY CONSIDERATIONS

### 1. **Signature Verification**
- Use RSA-2048 or RSA-4096 keys
- Sign license keys with your private key (keep secure!)
- App validates with public key (embedded in app)
- Prevents license key forgery

### 2. **Prevent Tampering**
- Obfuscate license check code
- Use checksums to detect code modification
- Multiple check points throughout app

### 3. **Grace Period**
- Allow 30-45 days without check-in (network failures)
- Prevents customer anger from false positives
- Warn before shutting down

### 4. **Installation Tracking**
- Each installation gets unique UUID
- Track how many times same license is used
- Enforce concurrent installation limits

---

## TESTING PLAN

### Test Cases:

1. **Valid License**
   - ✅ App starts normally
   - ✅ Check-in succeeds
   - ✅ All features accessible

2. **Expired License**
   - ✅ Shows expiration warning
   - ✅ Enters read-only mode
   - ✅ Shuts down after grace period
   - ✅ Displays renewal URL

3. **Revoked License**
   - ✅ Immediate shutdown
   - ✅ Shows contact support message

4. **Network Failure**
   - ✅ Continues operating during grace period
   - ✅ Shows warning after 30 days
   - ✅ Shuts down after 45 days

5. **Invalid License Key**
   - ✅ App refuses to start
   - ✅ Shows clear error message

---

## IMPLEMENTATION SCHEDULE

**Session 8: License System Foundation**
- Implement license key generation
- Build basic validation (signature + expiration)
- Add system_settings table
- Test license validation on startup

**Session 9: Check-in System**
- Build license server API
- Implement periodic check-in
- Add grace period logic
- Test network failure scenarios

**Session 10: Admin UI**
- Add license status page
- Add license update form
- Add check-in history table
- Test shutdown behavior

---

## CUSTOMER EXPERIENCE

### First Installation:
1. Customer receives license key via email after purchase
2. Runs setup wizard
3. Enters license key in "License Key" field
4. System validates and activates
5. Success message: "License activated. System ready."

### Renewal Time:
1. System sends email 30 days before expiration
2. In-app banner appears: "License expires in X days"
3. Customer clicks "Renew" button → Redirects to payment page
4. After payment, receives new license key
5. Updates license key in admin panel
6. No downtime needed

### Expired License:
1. System enters read-only mode
2. Banner: "⚠️ License expired. Renew now to restore full access"
3. After 7 days, system shuts down
4. Shows: "System shutdown. Please renew at [URL]"

---

## ALTERNATIVES CONSIDERED

### Option A: No License Checking (Honor System)
**Pros:** Simple, no license server needed  
**Cons:** Easy to pirate, no revenue protection  
**Decision:** ❌ Not viable for commercial product

### Option B: Online-Only Activation
**Pros:** Strongest protection  
**Cons:** Customers hate it, requires constant internet  
**Decision:** ❌ Too restrictive

### Option C: Periodic Check-in (CHOSEN)
**Pros:** Balance of protection and usability  
**Cons:** Some complexity  
**Decision:** ✅ Best option

---

## CONCLUSION

This license verification system provides:
- ✅ Revenue protection (enforces renewals)
- ✅ Piracy prevention (signed keys)
- ✅ Remote revocation capability
- ✅ Usage tracking
- ✅ Grace period (network-friendly)
- ✅ Professional customer experience

**Implementation Priority:** HIGH  
**Must Complete Before:** First customer sale  
**Estimated Effort:** 2-3 sessions (Sessions 8-10)

---

**Next Steps:**
1. Complete core features (Sessions 4-7)
2. Implement license system (Sessions 8-10)
3. Test thoroughly with beta customers
4. Launch with confidence! 🚀
