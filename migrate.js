// migrate.js - Database setup script
// Run this once to create all tables

const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

const setupDatabase = async () => {
  const client = await pool.connect();
  
  try {
    console.log('🔄 Starting database migration...');

    // Drop existing tables (if re-running migration)
    await client.query(`
      DROP TABLE IF EXISTS documents CASCADE;
      DROP TABLE IF EXISTS bids CASCADE;
      DROP TABLE IF EXISTS itbs CASCADE;
      DROP TABLE IF EXISTS projects CASCADE;
      DROP TABLE IF EXISTS companies CASCADE;
      DROP TABLE IF EXISTS users CASCADE;
    `);
    console.log('✅ Dropped old tables');

    // Create users table
    await client.query(`
      CREATE TABLE users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        name VARCHAR(255) NOT NULL,
        role VARCHAR(50) NOT NULL CHECK (role IN ('senior_estimator', 'junior_estimator', 'admin', 'subcontractor')),
        company_id INTEGER,
        created_at TIMESTAMP DEFAULT NOW(),
        last_login TIMESTAMP
      );
    `);
    console.log('✅ Created users table');

    // Create companies table (subcontractors)
    await client.query(`
      CREATE TABLE companies (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255),
        phone VARCHAR(50),
        csi_code VARCHAR(10),
        address TEXT,
        contact_person VARCHAR(255),
        notes TEXT,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);
    console.log('✅ Created companies table');

    // Create projects table
    await client.query(`
      CREATE TABLE projects (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        project_number VARCHAR(100) UNIQUE NOT NULL,
        address TEXT,
        bid_due_date DATE,
        status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'awarded', 'cancelled')),
        created_by INTEGER REFERENCES users(id),
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);
    console.log('✅ Created projects table');

    // Create ITBs table
    await client.query(`
      CREATE TABLE itbs (
        id SERIAL PRIMARY KEY,
        project_id INTEGER REFERENCES projects(id) ON DELETE CASCADE,
        subcontractor_id INTEGER REFERENCES companies(id) ON DELETE CASCADE,
        status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'submitted', 'declined', 'expired')),
        sent_date TIMESTAMP,
        opened_date TIMESTAMP,
        email_subject TEXT,
        email_body TEXT,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);
    console.log('✅ Created itbs table');

    // Create bids table
    await client.query(`
      CREATE TABLE bids (
        id SERIAL PRIMARY KEY,
        itb_id INTEGER REFERENCES itbs(id) ON DELETE CASCADE,
        project_id INTEGER REFERENCES projects(id) ON DELETE CASCADE,
        subcontractor_id INTEGER REFERENCES companies(id) ON DELETE CASCADE,
        bid_amount DECIMAL(12, 2),
        timeline VARCHAR(255),
        inclusions TEXT,
        exclusions TEXT,
        notes TEXT,
        estimated_response_date DATE,
        submitted_date TIMESTAMP,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);
    console.log('✅ Created bids table');

    // Create documents table
    await client.query(`
      CREATE TABLE documents (
        id SERIAL PRIMARY KEY,
        project_id INTEGER REFERENCES projects(id) ON DELETE CASCADE,
        filename VARCHAR(255) NOT NULL,
        file_path TEXT NOT NULL,
        file_type VARCHAR(50),
        uploaded_by INTEGER REFERENCES users(id),
        uploaded_at TIMESTAMP DEFAULT NOW()
      );
    `);
    console.log('✅ Created documents table');

    // Create indexes for better performance
    await client.query(`
      CREATE INDEX idx_projects_status ON projects(status);
      CREATE INDEX idx_projects_created_by ON projects(created_by);
      CREATE INDEX idx_itbs_project ON itbs(project_id);
      CREATE INDEX idx_itbs_subcontractor ON itbs(subcontractor_id);
      CREATE INDEX idx_itbs_status ON itbs(status);
      CREATE INDEX idx_bids_project ON bids(project_id);
      CREATE INDEX idx_bids_subcontractor ON bids(subcontractor_id);
      CREATE INDEX idx_companies_csi ON companies(csi_code);
    `);
    console.log('✅ Created indexes');

    // Insert demo data
    const bcrypt = require('bcrypt');
    const hashedPassword = await bcrypt.hash('password123', 10);

    // Create demo users
    await client.query(`
      INSERT INTO users (email, password_hash, name, role) VALUES
      ('john@construction.com', $1, 'John Smith', 'senior_estimator'),
      ('mary@construction.com', $1, 'Mary Johnson', 'junior_estimator'),
      ('admin@construction.com', $1, 'Admin User', 'admin');
    `, [hashedPassword]);
    console.log('✅ Created demo users');
    console.log('   📧 Login: john@construction.com / password123');

    // Create demo subcontractors
    await client.query(`
      INSERT INTO companies (name, email, phone, csi_code, contact_person) VALUES
      ('ABC Concrete Co.', 'bids@abcconcrete.com', '555-0101', '03', 'Mike Thompson'),
      ('Premier Concrete', 'estimating@premierconcrete.com', '555-0102', '03', 'Sarah Davis'),
      ('Elite Masonry', 'bids@elitemasonry.com', '555-0201', '04', 'Robert Brown'),
      ('Structural Steel Inc', 'quotes@structuralsteel.com', '555-0301', '05', 'Jennifer Wilson'),
      ('Modern HVAC Systems', 'bids@modernhvac.com', '555-0401', '23', 'David Martinez'),
      ('PowerTech Electric', 'estimating@powertechelectric.com', '555-0501', '26', 'Lisa Anderson');
    `);
    console.log('✅ Created demo subcontractors');

    // Create demo project
    await client.query(`
      INSERT INTO projects (name, project_number, address, bid_due_date, created_by, status) VALUES
      ('Downtown Office Complex', 'PRJ-2026-001', '123 Main St, Downtown', '2026-02-15', 1, 'active');
    `);
    console.log('✅ Created demo project');

    console.log('\n🎉 Database migration completed successfully!\n');
    console.log('📝 Summary:');
    console.log('   - 6 tables created');
    console.log('   - 3 demo users added');
    console.log('   - 6 demo subcontractors added');
    console.log('   - 1 demo project added');
    console.log('\n🔐 Login credentials:');
    console.log('   Email: john@construction.com');
    console.log('   Password: password123\n');

  } catch (error) {
    console.error('❌ Migration error:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
};

setupDatabase()
  .then(() => process.exit(0))
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
