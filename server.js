// server.js - Main backend server for ITB/Bid Management System

const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public')); // Serve frontend

// Test database connection
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('❌ Database connection error:', err);
  } else {
    console.log('✅ Database connected:', res.rows[0].now);
  }
});

// ==========================================
// AUTHENTICATION MIDDLEWARE
// ==========================================

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid token' });
    }
    req.user = user;
    next();
  });
};

// Check user role
const requireRole = (roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    next();
  };
};

// ==========================================
// AUTH ROUTES
// ==========================================

// Login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const result = await pool.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = result.rows[0];
    const validPassword = await bcrypt.compare(password, user.password_hash);

    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Update last login
    await pool.query(
      'UPDATE users SET last_login = NOW() WHERE id = $1',
      [user.id]
    );

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get current user
app.get('/api/auth/me', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, name, email, role FROM users WHERE id = $1',
      [req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// ==========================================
// PROJECT ROUTES
// ==========================================

// Get all projects
app.get('/api/projects', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT p.*, u.name as created_by_name 
       FROM projects p 
       LEFT JOIN users u ON p.created_by = u.id 
       ORDER BY p.created_at DESC`
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Get projects error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get single project
app.get('/api/projects/:id', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT p.*, u.name as created_by_name 
       FROM projects p 
       LEFT JOIN users u ON p.created_by = u.id 
       WHERE p.id = $1`,
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Project not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Get project error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Create project
app.post('/api/projects', authenticateToken, requireRole(['senior_estimator', 'admin']), async (req, res) => {
  try {
    const { name, project_number, address, bid_due_date } = req.body;

    const result = await pool.query(
      `INSERT INTO projects (name, project_number, address, bid_due_date, created_by, status)
       VALUES ($1, $2, $3, $4, $5, 'active')
       RETURNING *`,
      [name, project_number, address, bid_due_date, req.user.id]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Create project error:', error);
    if (error.code === '23505') { // Unique violation
      res.status(400).json({ error: 'Project number already exists' });
    } else {
      res.status(500).json({ error: 'Server error' });
    }
  }
});

// Update project
app.put('/api/projects/:id', authenticateToken, requireRole(['senior_estimator', 'admin']), async (req, res) => {
  try {
    const { name, project_number, address, bid_due_date, status } = req.body;

    const result = await pool.query(
      `UPDATE projects 
       SET name = $1, project_number = $2, address = $3, bid_due_date = $4, status = $5, updated_at = NOW()
       WHERE id = $6
       RETURNING *`,
      [name, project_number, address, bid_due_date, status, req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Project not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Update project error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// ==========================================
// SUBCONTRACTOR ROUTES
// ==========================================

// Get all subcontractors
app.get('/api/subcontractors', authenticateToken, async (req, res) => {
  try {
    const { csi_code } = req.query;
    
    let query = 'SELECT * FROM companies ORDER BY csi_code, name';
    let params = [];

    if (csi_code) {
      query = 'SELECT * FROM companies WHERE csi_code = $1 ORDER BY name';
      params = [csi_code];
    }

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Get subcontractors error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Create subcontractor
app.post('/api/subcontractors', authenticateToken, requireRole(['senior_estimator', 'admin']), async (req, res) => {
  try {
    const { name, email, phone, csi_code, address, contact_person, notes } = req.body;

    const result = await pool.query(
      `INSERT INTO companies (name, email, phone, csi_code, address, contact_person, notes)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [name, email, phone, csi_code, address, contact_person, notes]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Create subcontractor error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update subcontractor
app.put('/api/subcontractors/:id', authenticateToken, requireRole(['senior_estimator', 'admin']), async (req, res) => {
  try {
    const { name, email, phone, csi_code, address, contact_person, notes } = req.body;

    const result = await pool.query(
      `UPDATE companies 
       SET name = $1, email = $2, phone = $3, csi_code = $4, address = $5, 
           contact_person = $6, notes = $7, updated_at = NOW()
       WHERE id = $8
       RETURNING *`,
      [name, email, phone, csi_code, address, contact_person, notes, req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Subcontractor not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Update subcontractor error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// ==========================================
// ITB ROUTES
// ==========================================

// Get ITBs for a project
app.get('/api/itbs', authenticateToken, async (req, res) => {
  try {
    const { project_id } = req.query;

    if (!project_id) {
      return res.status(400).json({ error: 'project_id required' });
    }

    const result = await pool.query(
      `SELECT i.*, c.name as subcontractor_name, c.email as subcontractor_email, c.csi_code
       FROM itbs i
       LEFT JOIN companies c ON i.subcontractor_id = c.id
       WHERE i.project_id = $1
       ORDER BY i.sent_date DESC`,
      [project_id]
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Get ITBs error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Create and send ITB
app.post('/api/itbs', authenticateToken, requireRole(['senior_estimator', 'admin']), async (req, res) => {
  try {
    const { project_id, subcontractor_ids, email_subject, email_body } = req.body;

    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');

      const createdITBs = [];

      for (const subcontractor_id of subcontractor_ids) {
        const result = await client.query(
          `INSERT INTO itbs (project_id, subcontractor_id, status, sent_date, email_subject, email_body)
           VALUES ($1, $2, 'pending', NOW(), $3, $4)
           RETURNING *`,
          [project_id, subcontractor_id, email_subject, email_body]
        );
        
        createdITBs.push(result.rows[0]);
      }

      await client.query('COMMIT');

      // TODO: Send actual emails via SendGrid here
      console.log(`📧 Would send ${createdITBs.length} ITB emails`);

      res.status(201).json(createdITBs);
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Create ITB error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// ==========================================
// BID ROUTES
// ==========================================

// Get bids for a project
app.get('/api/bids', authenticateToken, async (req, res) => {
  try {
    const { project_id } = req.query;

    if (!project_id) {
      return res.status(400).json({ error: 'project_id required' });
    }

    const result = await pool.query(
      `SELECT b.*, c.name as subcontractor_name, c.csi_code
       FROM bids b
       LEFT JOIN companies c ON b.subcontractor_id = c.id
       WHERE b.project_id = $1
       ORDER BY c.csi_code, b.bid_amount`,
      [project_id]
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Get bids error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Submit bid (subcontractor portal)
app.post('/api/bids', async (req, res) => {
  try {
    const { itb_id, project_id, subcontractor_id, bid_amount, timeline, inclusions, exclusions, notes } = req.body;

    const result = await pool.query(
      `INSERT INTO bids (itb_id, project_id, subcontractor_id, bid_amount, timeline, inclusions, exclusions, notes, submitted_date)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())
       RETURNING *`,
      [itb_id, project_id, subcontractor_id, bid_amount, timeline, inclusions, exclusions, notes]
    );

    // Update ITB status
    await pool.query(
      `UPDATE itbs SET status = 'submitted' WHERE id = $1`,
      [itb_id]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Submit bid error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// ==========================================
// HEALTH CHECK
// ==========================================

app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// ==========================================
// START SERVER
// ==========================================

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
});
