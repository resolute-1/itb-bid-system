// add-test-subcontractor.js
// Quick script to add a test subcontractor with your email for testing

const { Pool } = require('pg');
require('dotenv').config();

async function addTestSubcontractor() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
  });

  try {
    // Prompt for email (or hardcode it below)
    const testEmail = process.argv[2] || 'test@example.com';
    
    console.log(`\n🔧 Adding test subcontractor with email: ${testEmail}\n`);

    // Check if already exists
    const existing = await pool.query(
      'SELECT * FROM companies WHERE email = $1',
      [testEmail]
    );

    if (existing.rows.length > 0) {
      console.log('✅ Subcontractor already exists:');
      console.log(existing.rows[0]);
      console.log('\nYou can send ITBs to this email now!\n');
      pool.end();
      return;
    }

    // Add new test subcontractor
    const result = await pool.query(
      `INSERT INTO companies (name, email, phone, csi_code, address, contact_person, notes)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [
        'Test Company (Email Testing)',
        testEmail,
        '555-TEST',
        '03', // Concrete
        'Test Address',
        'Test Contact',
        'Added for email testing purposes'
      ]
    );

    console.log('✅ Test subcontractor added successfully!');
    console.log('\nDetails:');
    console.log(result.rows[0]);
    console.log('\n📧 You can now send ITBs to this email address!\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    pool.end();
  }
}

addTestSubcontractor();
