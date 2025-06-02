const express = require('express');
const app = express();
require('dotenv').config();
const port = process.env.PORT || 3000;

const db = require('./models/db');

const cookieParser = require('cookie-parser');
app.use(cookieParser());

// Test database connection before starting server
(async () => {
  try {
    const connection = await db.getConnection();
    console.log('✅ Connected to MySQL database');
    connection.release();

    // Middleware
    app.use(express.json());

    // // Routes
    // app.use('/api/users', require('./routes/users.routes'));
    // app.use('/api/patients', require('./routes/patients.routes'));
    // app.use('/api/appointments', require('./routes/appointments.routes'));
    // app.use('/api/treatments', require('./routes/treatments.routes'));
    // app.use('/api/consumables', require('./routes/consumable_items.routes'));
    // app.use('/api/debts', require('./routes/debts.routes'));
    // app.use('/api/logs', require('./routes/logs.routes'));
    // app.use('/api/schedules', require('./routes/schedules.routes'));
    app.use('/api/auth', require('./routes/auth.routes'));
    app.use('/api/users', require('./routes/users.routes'));
    app.use('/api/patients', require('./routes/patients.routes'));
    app.use('/api/appointments', require('./routes/appointments.routes'))


    // Health check
    app.get('/', (req, res) => res.send('Medical Backend API is running.'));

    app.listen(port, () => {
      console.log(`🚀 Server running at http://localhost:${port}`);
    });

  } catch (err) {
    console.error('❌ Error connecting to MySQL:', err.message);
    process.exit(1);
  }
})();
