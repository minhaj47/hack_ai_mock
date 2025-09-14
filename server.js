const express = require('express');
const app = express();
const PORT = process.env.PORT || 8000;


// Routes
const userRoutes = require('./routes/userRoutes');

// Middleware
app.use(express.json());

// Routers
app.use('/api/members', userRoutes);


app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
