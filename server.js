const express = require('express');
const memberRoutes = require('./routes/memberRoutes');
const bookRoutes = require('./routes/bookRoutes');
const transactionRoutes = require('./routes/transactionRoutes');
const reservationRoutes = require('./routes/reservationRoutes');
const errorHandler = require('./middleware/errorHandler');
const { initializeData } = require('./config/database');

const app = express();
const port = 8000;

// Middleware
app.use(express.json());

// Initialize sample data
initializeData();

// Routes
app.use('/api', memberRoutes);
app.use('/api', bookRoutes);
app.use('/api', transactionRoutes);
app.use('/api', reservationRoutes);

// Error handling middleware
app.use(errorHandler.handleError);
app.use(errorHandler.handle404);

app.listen(port, () => {
    console.log(`Library Management System running on http://localhost:${port}`);
    console.log('\nAvailable endpoints:');
    console.log('POST   /api/members              - Create Member');
    console.log('GET    /api/members/:id          - Get Member Info'); 
    console.log('GET    /api/members              - List All Members');
    console.log('PUT    /api/members/:id          - Update Member Info');
    console.log('DELETE /api/members/:id          - Delete Member');
    console.log('POST   /api/borrow               - Borrow Book');
    console.log('POST   /api/return               - Return Book');
    console.log('GET    /api/borrowed             - List Borrowed Books');
    console.log('GET    /api/members/:id/history  - Get Borrowing History');
    console.log('GET    /api/overdue              - Get Overdue Books');
    console.log('POST   /api/books                - Add Book');
    console.log('GET    /api/books/:id            - Get Book Info');
    console.log('GET    /api/books/search         - Advanced Book Search');
    console.log('POST   /api/reservations         - Create Reservation');
    console.log('DELETE /api/books/:id            - Delete Book');
});

module.exports = app;