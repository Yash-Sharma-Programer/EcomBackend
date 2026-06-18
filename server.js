const express = require('express');
const cors = require('cors');
require('dotenv').config();
require('express-async-errors');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('client/build'));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/products', require('./routes/products'));
app.use('/api/categories', require('./routes/categories'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/users', require('./routes/users'));
app.use('/api/reviews', require('./routes/reviews'));
app.use('/api/settings', require('./routes/settings'));
app.use('/api/pages', require('./routes/pages'));
app.use('/api/menus', require('./routes/menus'));

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error'
  });
});

// Serve React app
app.get('*', (req, res) => {
  res.sendFile(__dirname + '/client/build/index.html');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
