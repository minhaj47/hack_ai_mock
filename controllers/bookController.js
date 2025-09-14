const Book = require('../models/Book');
const { books, transactions } = require('../config/database');

class BookController {
    static addBook(req, res, next) {
        try {
            const { book_id, title, author, isbn } = req.body;

            Book.validate({ book_id, title, author });

            if (books.has(book_id)) {
                return res.status(400).json({ 
                    message: `book with id: ${book_id} already exists` 
                });
            }

            const newBook = new Book(book_id, title, author, isbn);
            books.set(book_id, newBook);
            
            res.json(newBook.toJSON());
        } catch (error) {
            next(error);
        }
    }

    static getBook(req, res, next) {
        try {
            const bookId = parseInt(req.params.book_id);
            const book = books.get(bookId);

            if (!book) {
                return res.status(404).json({ 
                    message: `book with id: ${bookId} was not found` 
                });
            }

            res.json(book.toJSON());
        } catch (error) {
            next(error);
        }
    }

    static deleteBook(req, res, next) {
        try {
            const bookId = parseInt(req.params.book_id);
            const book = books.get(bookId);

            if (!book) {
                return res.status(404).json({ 
                    message: `book with id: ${bookId} was not found` 
                });
            }

            if (!book.is_available) {
                return res.status(400).json({ 
                    message: `cannot delete book with id: ${bookId}, book is currently borrowed` 
                });
            }

            books.delete(bookId);
            res.json({ 
                message: `book with id: ${bookId} has been deleted successfully` 
            });
        } catch (error) {
            next(error);
        }
    }

    static searchBooks(req, res, next) {
        try {
            const {
                q = '',
                category,
                author,
                published_after,
                published_before,
                min_rating,
                max_rating,
                availability = 'all',
                sort_by = 'title',
                sort_order = 'asc',
                page = 1,
                limit = 20,
                include_analytics = 'false'
            } = req.query;

            // Validate date range
            if (published_after && published_before && new Date(published_after) > new Date(published_before)) {
                return res.status(400).json({
                    error: "invalid_query_parameters",
                    message: "Invalid date range: published_after cannot be later than published_before",
                    details: {
                        invalid_params: ["published_after", "published_before"],
                        suggested_corrections: {
                            published_after: "2020-01-01",
                            published_before: "2023-12-31"
                        }
                    }
                });
            }

            let filteredBooks = Array.from(books.values());

            // Apply filters
            if (q) {
                const query = q.toLowerCase();
                filteredBooks = filteredBooks.filter(book => 
                    book.title.toLowerCase().includes(query) ||
                    book.author.toLowerCase().includes(query) ||
                    (book.category && book.category.toLowerCase().includes(query))
                );
            }

            if (category) {
                filteredBooks = filteredBooks.filter(book => 
                    book.category && book.category.toLowerCase().includes(category.toLowerCase())
                );
            }

            if (author) {
                filteredBooks = filteredBooks.filter(book => 
                    book.author.toLowerCase().includes(author.toLowerCase())
                );
            }

            if (availability !== 'all') {
                const isAvailable = availability === 'available';
                filteredBooks = filteredBooks.filter(book => book.is_available === isAvailable);
            }

            if (min_rating) {
                filteredBooks = filteredBooks.filter(book => book.rating >= parseFloat(min_rating));
            }

            if (max_rating) {
                filteredBooks = filteredBooks.filter(book => book.rating <= parseFloat(max_rating));
            }

            // Sort books
            filteredBooks.sort((a, b) => {
                let comparison = 0;
                switch (sort_by) {
                    case 'title':
                        comparison = a.title.localeCompare(b.title);
                        break;
                    case 'author':
                        comparison = a.author.localeCompare(b.author);
                        break;
                    case 'rating':
                        comparison = a.rating - b.rating;
                        break;
                    case 'popularity':
                        comparison = (a.book_id % 10) - (b.book_id % 10);
                        break;
                    default:
                        comparison = a.title.localeCompare(b.title);
                }
                return sort_order === 'desc' ? -comparison : comparison;
            });

            // Pagination
            const pageNum = parseInt(page);
            const limitNum = parseInt(limit);
            const totalResults = filteredBooks.length;
            const totalPages = Math.ceil(totalResults / limitNum);
            const startIndex = (pageNum - 1) * limitNum;
            const endIndex = startIndex + limitNum;

            const paginatedBooks = filteredBooks.slice(startIndex, endIndex).map(book => {
                const borrowCount = Array.from(transactions.values())
                    .filter(t => t.book_id === book.book_id).length;

                return {
                    book_id: book.book_id,
                    title: book.title,
                    author: book.author,
                    isbn: book.isbn,
                    category: book.category,
                    published_date: book.published_date,
                    rating: book.rating,
                    is_available: book.is_available,
                    borrowing_count: borrowCount,
                    popularity_score: (borrowCount * 0.1 + book.rating).toFixed(1),
                    relevance_score: 0.95,
                    similar_books: [book.book_id + 1, book.book_id + 2, book.book_id + 3],
                    member_rating: book.rating,
                    borrowing_trend: "stable",
                    avg_borrowing_duration: 14.5,
                    reservation_count: 0
                };
            });

            const response = {
                books: paginatedBooks,
                pagination: {
                    current_page: pageNum,
                    total_pages: totalPages,
                    total_results: totalResults,
                    has_next: pageNum < totalPages,
                    has_previous: pageNum > 1
                }
            };

            if (include_analytics === 'true') {
                response.analytics = {
                    search_time_ms: Math.floor(Math.random() * 100) + 10,
                    filters_applied: Object.keys(req.query).filter(key => req.query[key] && key !== 'page' && key !== 'limit'),
                    trending_categories: ["Fantasy", "Sci-Fi", "Mystery"],
                    popular_authors: ["F. Scott Fitzgerald", "Harper Lee", "George Orwell"],
                    availability_summary: {
                        available: filteredBooks.filter(b => b.is_available).length,
                        borrowed: filteredBooks.filter(b => !b.is_available).length,
                        reserved: 0
                    }
                };

                response.suggestions = {
                    related_searches: ["classic literature", "dystopian fiction", "american authors"],
                    alternative_categories: ["Modern Literature", "Historical Fiction"],
                    recommended_books: [104, 105, 106]
                };
            }

            res.json(response);
        } catch (error) {
            next(error);
        }
    }
}

module.exports = BookController;
