// send-test-itb.js
// Send a test ITB email directly via backend API

const { Pool } = require('pg');
const { sendITB } = require('./utils/email');
require('dotenv').config();

async function sendTestITB() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
  });

  try {
    console.log('\n📧 Sending test ITB email...\n');

    // Get the test subcontractor
    const subResult = await pool.query(
      "SELECT * FROM companies WHERE notes LIKE '%email testing%' OR email = $1 ORDER BY id DESC LIMIT 1",
      [process.argv[2] || 'test@example.com']
    );

    if (subResult.rows.length === 0) {
      console.log('❌ No test subcontractor found. Run add-test-subcontractor.js first.');
      pool.end();
      return;
    }

    const subcontractor = subResult.rows[0];
    console.log('📬 Sending to:', subcontractor.name, `(${subcontractor.email})`);

    // Get the demo project
    const projectResult = await pool.query(
      'SELECT * FROM projects LIMIT 1'
    );

    if (projectResult.rows.length === 0) {
      console.log('❌ No projects found in database.');
      pool.end();
      return;
    }

    const project = projectResult.rows[0];
    console.log('📋 Project:', project.name);

    // Create ITB record
    const itbResult = await pool.query(
      `INSERT INTO itbs (project_id, subcontractor_id, status, sent_date, email_subject, email_body)
       VALUES ($1, $2, 'pending', NOW(), $3, $4)
       RETURNING *`,
      [
        project.id,
        subcontractor.id,
        `Invitation to Bid - ${project.name}`,
        `Test ITB email - Please disregard if received.`
      ]
    );

    const itb = itbResult.rows[0];
    console.log('✅ ITB record created (ID:', itb.id, ')\n');

    // Send the email
    console.log('📤 Sending email...\n');
    
    const emailResult = await sendITB({
      to: subcontractor.email,
      subcontractorName: subcontractor.name,
      projectName: project.name,
      projectAddress: project.address || 'Address TBD',
      bidDueDate: project.bid_due_date,
      itbId: itb.id
    });

    if (emailResult.success) {
      console.log('✅ Email sent successfully!');
      console.log('   Message ID:', emailResult.messageId);
      console.log('\n📬 Check your inbox (and spam folder) at:', subcontractor.email);
    } else {
      console.log('❌ Email failed to send');
      console.log('   Reason:', emailResult.message || emailResult.error);
    }

    console.log('\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
  } finally {
    pool.end();
  }
}

sendTestITB();
