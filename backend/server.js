require('dotenv').config();
const express = require('express');
const cors = require('cors');
const routes = require('./routes');
const authRoutes = require('./routes/authRoutes');
const sequelize = require('./config/config');

const app = express();

app.use(cors());
app.use(express.json());
app.use('/api', routes);

app.use('/api/auth', authRoutes);
// Test database connection
const startServer = async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connected successfully');
    
    // Sync database (in development)
    await sequelize.sync();
    console.log('Database synchronized');

    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Unable to start server:', error);
  }
};

startServer();
module.exports = app;