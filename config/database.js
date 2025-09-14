const members = new Map();
const books = new Map();
const transactions = new Map();
const reservations = new Map();

// Auto-increment counters
let transactionIdCounter = 500;
let reservationIdCounter = 0;

const initializeData = () => {
    // Sample books
    books.set(101, {
        book_id: 101,
        title: "The Great Gatsby",
        author: "F. Scott Fitzgerald",
        isbn: "978-0-7432-7356-5",
        is_available: true,
        category: "Classic Literature",
        published_date: "1925-04-10",
        rating: 4.2
    });

    books.set(102, {
        book_id: 102,
        title: "To Kill a Mockingbird",
        author: "Harper Lee",
        isbn: "978-0-06-112008-4",
        is_available: true,
        category: "Classic Literature",
        published_date: "1960-07-11",
        rating: 4.3
    });

    books.set(103, {
        book_id: 103,
        title: "1984",
        author: "George Orwell",
        isbn: "978-0-452-28423-4",
        is_available: true,
        category: "Dystopian Fiction",
        published_date: "1949-06-08",
        rating: 4.4
    });
};

module.exports = {
    members,
    books,
    transactions,
    reservations,
    transactionIdCounter: () => ++transactionIdCounter,
    reservationIdCounter: () => ++reservationIdCounter,
    initializeData
};