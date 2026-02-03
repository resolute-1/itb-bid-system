// utils/email.js - Email sending functionality using Nodemailer

const nodemailer = require('nodemailer');

// Create reusable transporter
const createTransporter = () => {
  // Check if SMTP settings are configured
  if (!process.env.SMTP_HOST) {
    console.warn('⚠️  SMTP settings not configured. Emails will not be sent.');
    return null;
  }

  const config = {
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_SECURE === 'true', // true for 465, false for 587
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    },
    // Add timeouts and TLS settings for better reliability
    connectionTimeout: 10000, // 10 seconds
    greetingTimeout: 5000,
    socketTimeout: 15000,
    // TLS settings for Gmail
    tls: {
      rejectUnauthorized: true,
      minVersion: 'TLSv1.2'
    },
    // Enable debug output
    debug: process.env.NODE_ENV !== 'production',
    logger: process.env.NODE_ENV !== 'production'
  };

  console.log('📧 SMTP Config:', {
    host: config.host,
    port: config.port,
    secure: config.secure,
    user: config.auth.user,
    passLength: config.auth.pass?.length || 0
  });

  return nodemailer.createTransport(config);
};

// Email template for ITB invitation
const getITBEmailTemplate = (projectName, projectAddress, bidDueDate, bidPortalLink) => {
  return `
<!DOCTYPE html>
<html>
<head>
  <style>
    body {
      font-family: Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
    }
    .header {
      background-color: #2563eb;
      color: white;
      padding: 20px;
      text-align: center;
      border-radius: 5px 5px 0 0;
    }
    .content {
      background-color: #f9fafb;
      padding: 30px;
      border: 1px solid #e5e7eb;
    }
    .project-details {
      background-color: white;
      padding: 20px;
      margin: 20px 0;
      border-left: 4px solid #2563eb;
      border-radius: 4px;
    }
    .project-details h3 {
      margin-top: 0;
      color: #2563eb;
    }
    .detail-row {
      margin: 10px 0;
    }
    .detail-label {
      font-weight: bold;
      color: #4b5563;
    }
    .cta-button {
      display: inline-block;
      background-color: #2563eb;
      color: white;
      padding: 15px 30px;
      text-decoration: none;
      border-radius: 5px;
      margin: 20px 0;
      font-weight: bold;
    }
    .footer {
      margin-top: 30px;
      padding-top: 20px;
      border-top: 1px solid #e5e7eb;
      font-size: 12px;
      color: #6b7280;
      text-align: center;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>📋 Invitation to Bid</h1>
  </div>
  
  <div class="content">
    <p>Dear Subcontractor,</p>
    
    <p>You are invited to submit a bid for the following construction project:</p>
    
    <div class="project-details">
      <h3>Project Information</h3>
      <div class="detail-row">
        <span class="detail-label">Project Name:</span> ${projectName}
      </div>
      <div class="detail-row">
        <span class="detail-label">Location:</span> ${projectAddress}
      </div>
      <div class="detail-row">
        <span class="detail-label">Bid Due Date:</span> ${new Date(bidDueDate).toLocaleDateString('en-US', { 
          weekday: 'long', 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        })}
      </div>
    </div>
    
    <p>Please review the project details and submit your bid through our online portal:</p>
    
    <center>
      <a href="${bidPortalLink}" class="cta-button">
        Submit Your Bid →
      </a>
    </center>
    
    <p><strong>Important Notes:</strong></p>
    <ul>
      <li>All bids must be submitted by the due date listed above</li>
      <li>Please include detailed scope of work, pricing, and timeline</li>
      <li>List any exclusions or special conditions</li>
      <li>Contact us if you have questions or need additional information</li>
    </ul>
    
    <p>We look forward to receiving your bid.</p>
    
    <p>Best regards,<br>
    <strong>Project Estimating Team</strong></p>
  </div>
  
  <div class="footer">
    <p>This is an automated message from the ITB/Bid Management System.</p>
    <p>Please do not reply directly to this email.</p>
  </div>
</body>
</html>
  `;
};

// Email template for bid received confirmation
const getBidReceivedTemplate = (projectName, subcontractorName, bidAmount) => {
  return `
<!DOCTYPE html>
<html>
<head>
  <style>
    body {
      font-family: Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
    }
    .header {
      background-color: #10b981;
      color: white;
      padding: 20px;
      text-align: center;
      border-radius: 5px 5px 0 0;
    }
    .content {
      background-color: #f9fafb;
      padding: 30px;
      border: 1px solid #e5e7eb;
    }
    .footer {
      margin-top: 30px;
      padding-top: 20px;
      border-top: 1px solid #e5e7eb;
      font-size: 12px;
      color: #6b7280;
      text-align: center;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>✅ Bid Received</h1>
  </div>
  
  <div class="content">
    <p>Dear ${subcontractorName},</p>
    
    <p>Thank you for submitting your bid for <strong>${projectName}</strong>.</p>
    
    <p>We have successfully received your bid in the amount of <strong>$${parseFloat(bidAmount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong>.</p>
    
    <p>Our team will review all bids and contact you with our decision.</p>
    
    <p>Thank you for your interest in this project.</p>
    
    <p>Best regards,<br>
    <strong>Project Estimating Team</strong></p>
  </div>
  
  <div class="footer">
    <p>This is an automated confirmation from the ITB/Bid Management System.</p>
  </div>
</body>
</html>
  `;
};

// Email template for bid reminder
const getBidReminderTemplate = (projectName, bidDueDate, daysRemaining, bidPortalLink) => {
  return `
<!DOCTYPE html>
<html>
<head>
  <style>
    body {
      font-family: Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
    }
    .header {
      background-color: #f59e0b;
      color: white;
      padding: 20px;
      text-align: center;
      border-radius: 5px 5px 0 0;
    }
    .content {
      background-color: #f9fafb;
      padding: 30px;
      border: 1px solid #e5e7eb;
    }
    .warning-box {
      background-color: #fef3c7;
      border-left: 4px solid #f59e0b;
      padding: 15px;
      margin: 20px 0;
      border-radius: 4px;
    }
    .cta-button {
      display: inline-block;
      background-color: #f59e0b;
      color: white;
      padding: 15px 30px;
      text-decoration: none;
      border-radius: 5px;
      margin: 20px 0;
      font-weight: bold;
    }
    .footer {
      margin-top: 30px;
      padding-top: 20px;
      border-top: 1px solid #e5e7eb;
      font-size: 12px;
      color: #6b7280;
      text-align: center;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>⏰ Bid Reminder</h1>
  </div>
  
  <div class="content">
    <p>Dear Subcontractor,</p>
    
    <div class="warning-box">
      <strong>⚠️ Reminder:</strong> The bid deadline for <strong>${projectName}</strong> is approaching.
    </div>
    
    <p><strong>Bid Due Date:</strong> ${new Date(bidDueDate).toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    })}</p>
    
    <p><strong>Days Remaining:</strong> ${daysRemaining} day(s)</p>
    
    <p>If you plan to submit a bid, please do so as soon as possible:</p>
    
    <center>
      <a href="${bidPortalLink}" class="cta-button">
        Submit Your Bid →
      </a>
    </center>
    
    <p>If you are unable to bid on this project, please let us know so we can update our records.</p>
    
    <p>Thank you,<br>
    <strong>Project Estimating Team</strong></p>
  </div>
  
  <div class="footer">
    <p>This is an automated reminder from the ITB/Bid Management System.</p>
  </div>
</body>
</html>
  `;
};

/**
 * Send ITB email to subcontractor
 * @param {Object} params - Email parameters
 * @param {string} params.to - Recipient email address
 * @param {string} params.subcontractorName - Name of subcontractor
 * @param {string} params.projectName - Name of project
 * @param {string} params.projectAddress - Project location
 * @param {string} params.bidDueDate - Bid due date
 * @param {number} params.itbId - ITB ID for tracking
 * @returns {Promise<Object>} - Result of email send
 */
async function sendITB({ to, subcontractorName, projectName, projectAddress, bidDueDate, itbId }) {
  const transporter = createTransporter();
  
  if (!transporter) {
    console.log(`📧 [DEV MODE] Would send ITB email to ${to} for project: ${projectName}`);
    return { success: false, message: 'SMTP not configured - running in dev mode' };
  }

  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
  const bidPortalLink = `${frontendUrl}/bid-portal?itb_id=${itbId}`;

  const mailOptions = {
    from: `"${process.env.SMTP_FROM_NAME || 'ITB Bid System'}" <${process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER}>`,
    to: to,
    subject: `Invitation to Bid - ${projectName}`,
    html: getITBEmailTemplate(projectName, projectAddress, bidDueDate, bidPortalLink)
  };

  try {
    // Verify transporter connection before sending
    await transporter.verify();
    console.log(`✅ SMTP connection verified`);
    
    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ ITB email sent to ${to}: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error(`❌ Failed to send ITB email to ${to}:`, error);
    
    // Provide more specific error messages
    let errorMessage = error.message;
    if (error.code === 'ECONNECTION' || error.code === 'ETIMEDOUT') {
      errorMessage = 'Connection timeout - check SMTP settings and network';
    } else if (error.code === 'EAUTH') {
      errorMessage = 'Authentication failed - check SMTP username/password';
    } else if (error.responseCode === 535) {
      errorMessage = 'Invalid credentials - check App Password';
    }
    
    return { success: false, error: errorMessage, details: error.code };
  }
}

/**
 * Send bid received confirmation email
 * @param {Object} params - Email parameters
 * @param {string} params.to - Recipient email address
 * @param {string} params.subcontractorName - Name of subcontractor
 * @param {string} params.projectName - Name of project
 * @param {number} params.bidAmount - Bid amount
 * @returns {Promise<Object>} - Result of email send
 */
async function sendBidReceived({ to, subcontractorName, projectName, bidAmount }) {
  const transporter = createTransporter();
  
  if (!transporter) {
    console.log(`📧 [DEV MODE] Would send bid confirmation email to ${to}`);
    return { success: false, message: 'SMTP not configured - running in dev mode' };
  }

  const mailOptions = {
    from: `"${process.env.SMTP_FROM_NAME || 'ITB Bid System'}" <${process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER}>`,
    to: to,
    subject: `Bid Received - ${projectName}`,
    html: getBidReceivedTemplate(projectName, subcontractorName, bidAmount)
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ Bid confirmation email sent to ${to}: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error(`❌ Failed to send bid confirmation to ${to}:`, error.message);
    return { success: false, error: error.message };
  }
}

/**
 * Send bid reminder email
 * @param {Object} params - Email parameters
 * @param {string} params.to - Recipient email address
 * @param {string} params.projectName - Name of project
 * @param {string} params.bidDueDate - Bid due date
 * @param {number} params.daysRemaining - Days until deadline
 * @param {number} params.itbId - ITB ID for tracking
 * @returns {Promise<Object>} - Result of email send
 */
async function sendBidReminder({ to, projectName, bidDueDate, daysRemaining, itbId }) {
  const transporter = createTransporter();
  
  if (!transporter) {
    console.log(`📧 [DEV MODE] Would send reminder email to ${to}`);
    return { success: false, message: 'SMTP not configured - running in dev mode' };
  }

  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
  const bidPortalLink = `${frontendUrl}/bid-portal?itb_id=${itbId}`;

  const mailOptions = {
    from: `"${process.env.SMTP_FROM_NAME || 'ITB Bid System'}" <${process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER}>`,
    to: to,
    subject: `Reminder: Bid Due Soon - ${projectName}`,
    html: getBidReminderTemplate(projectName, bidDueDate, daysRemaining, bidPortalLink)
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ Reminder email sent to ${to}: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error(`❌ Failed to send reminder to ${to}:`, error.message);
    return { success: false, error: error.message };
  }
}

module.exports = {
  sendITB,
  sendBidReceived,
  sendBidReminder
};
