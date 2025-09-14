const express = require('express');
const TransactionController = require('../controllers/transactionController');

const router = express.Router();

router.post('/borrow', TransactionController.borrowBook);
router.post('/return', TransactionController.returnBook);
router.get('/borrowed', TransactionController.getBorrowedBooks);
router.get('/overdue', TransactionController.getOverdueBooks);

module.exports = router;