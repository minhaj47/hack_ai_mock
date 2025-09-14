const express = require('express');
const BookController = require('../controllers/bookController');

const router = express.Router();

router.post('/books', BookController.addBook);
router.get('/books/search', BookController.searchBooks); // Must come before /:book_id
router.get('/books/:book_id', BookController.getBook);
router.delete('/books/:book_id', BookController.deleteBook);

module.exports = router;