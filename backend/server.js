const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const mysql = require('mysql2/promise');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

function buildMysqlUri(rawUri) {
  const parsed = new URL(rawUri);
  parsed.searchParams.delete('ssl-mode');
  return parsed.toString();
}

const pool = mysql.createPool({
  uri: buildMysqlUri(process.env.MYSQL_URI),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  ssl: {
    rejectUnauthorized: false,
  },
});

async function initializeDatabase() {
  const createTableSql = `
    CREATE TABLE IF NOT EXISTS users (
      uid INT AUTO_INCREMENT PRIMARY KEY,
      username VARCHAR(50) NOT NULL,
      fullname VARCHAR(100) NOT NULL,
      phone VARCHAR(20) NOT NULL,
      useremail VARCHAR(120) NOT NULL UNIQUE,
      password VARCHAR(255) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;

  await pool.query(createTableSql);
  console.log('Database connected and users table is ready.');
}

app.post('/api/register', async (req, res) => {
  try {
    const { username, name, phone, email, password, confirmPassword } = req.body;

    if (!username || !name || !phone || !email || !password || !confirmPassword) {
      return res.status(400).json({ message: 'All fields are required.' });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ message: 'Passwords do not match.' });
    }

    const [existingUser] = await pool.query('SELECT uid FROM users WHERE useremail = ?', [email]);
    if (existingUser.length > 0) {
      return res.status(409).json({ message: 'Email already registered.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await pool.query(
      'INSERT INTO users (username, fullname, phone, useremail, password) VALUES (?, ?, ?, ?, ?)',
      [username, name, phone, email, hashedPassword]
    );

    return res.status(201).json({ message: 'User registered successfully.' });
  } catch (error) {
    console.error('Register error:', error);
    return res.status(500).json({ message: 'Internal server error.' });
  }
});

app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required.' });
    }

    const [rows] = await pool.query('SELECT uid, fullname, useremail, password FROM users WHERE useremail = ?', [email]);

    if (rows.length === 0) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    const user = rows[0];
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    return res.status(200).json({
      message: 'Login successful.',
      user: {
        uid: user.uid,
        name: user.fullname,
        email: user.useremail,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ message: 'Internal server error.' });
  }
});

app.use(express.static(path.join(__dirname, '..', 'frontend')));

app.get('/', (_req, res) => {
  res.sendFile(path.join(__dirname, '..', 'frontend', 'index.html'));
});

initializeDatabase()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    console.error('Database initialization failed:', error);
    process.exit(1);
  });
