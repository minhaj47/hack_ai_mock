const Transaction = require('../models/Transaction');
const { members, books, transactions, transactionIdCounter } = require('../config/database');
const { calculateDaysDifference, formatISO } = require('../utils/helpers');

class TransactionController {
    static borrowBook(req, res, next) {
        try {
            const { member_id, book_id } = req.body;

            if (!members.has(member_id)) {
                return res.status(404).json({ 
                    message: `member with id: ${member_id} was not found` 
                });
            }

            if (!books.has(book_id)) {
                return res.status(404).json({ 
                    message: `book with id: ${book_id} was not found` 
                });
            }

            const member = members.get(member_id);
            const book = books.get(book_id);

            if (member.has_borrowed) {
                return res.status(400).json({ 
                    message: `member with id: ${member_id} has already borrowed a book` 
                });
            }

            if (!book.is_available) {
                return res.status(400).json({ 
                    message: `book with id: ${book_id} is not available` 
                });
            }

            const transactionId = transactionIdCounter();
            const transaction = new Transaction(transactionId, member_id, book_id);

            transactions.set(transactionId, transaction);
            
            // Update member and book status
            member.has_borrowed = true;
            book.is_available = false;
            members.set(member_id, member);
            books.set(book_id, book);

            res.json(transaction.toJSON());
        } catch (error) {
            next(error);
        }
    }

    static returnBook(req, res, next) {
        try {
            const { member_id, book_id } = req.body;

            // Find active transaction
            const activeTransaction = Array.from(transactions.values()).find(
                t => t.member_id === member_id && t.book_id === book_id && t.status === "active"
            );

            if (!activeTransaction) {
                return res.status(400).json({ 
                    message: `member with id: ${member_id} has not borrowed book with id: ${book_id}` 
                });
            }

            activeTransaction.returnBook();
            transactions.set(activeTransaction.transaction_id, activeTransaction);

            // Update member and book status
            const member = members.get(member_id);
            const book = books.get(book_id);
            member.has_borrowed = false;
            book.is_available = true;
            members.set(member_id, member);
            books.set(book_id, book);

            res.json(activeTransaction.toJSON());
        } catch (error) {
            next(error);
        }
    }

    static getBorrowedBooks(req, res, next) {
        try {
            const borrowedBooks = Array.from(transactions.values())
                .filter(t => t.status === "active")
                .map(t => {
                    const member = members.get(t.member_id);
                    const book = books.get(t.book_id);
                    const borrowedDate = new Date(t.borrowed_at);
                    const dueDate = new Date(borrowedDate.getTime() + (14 * 24 * 60 * 60 * 1000));

                    return {
                        transaction_id: t.transaction_id,
                        member_id: t.member_id,
                        member_name: member.name,
                        book_id: t.book_id,
                        book_title: book.title,
                        borrowed_at: t.borrowed_at,
                        due_date: formatISO(dueDate)
                    };
                });

            res.json({ borrowed_books: borrowedBooks });
        } catch (error) {
            next(error);
        }
    }

    static getOverdueBooks(req, res, next) {
        try {
            const currentDate = new Date();
            const overdueBooks = Array.from(transactions.values())
                .filter(t => t.status === "active")
                .map(t => {
                    const member = members.get(t.member_id);
                    const book = books.get(t.book_id);
                    const borrowedDate = new Date(t.borrowed_at);
                    const dueDate = new Date(borrowedDate.getTime() + (14 * 24 * 60 * 60 * 1000));
                    const daysOverdue = calculateDaysDifference(currentDate, dueDate);

                    return {
                        transaction_id: t.transaction_id,
                        member_id: t.member_id,
                        member_name: member.name,
                        book_id: t.book_id,
                        book_title: book.title,
                        borrowed_at: t.borrowed_at,
                        due_date: formatISO(dueDate),
                        days_overdue: daysOverdue,
                        is_overdue: currentDate > dueDate
                    };
                })
                .filter(item => item.is_overdue)
                .map(({ is_overdue, ...item }) => item);

            res.json({ overdue_books: overdueBooks });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = TransactionController;