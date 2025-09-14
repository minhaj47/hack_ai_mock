class Book {
    constructor(book_id, title, author, isbn = null) {
        this.book_id = book_id;
        this.title = title;
        this.author = author;
        this.isbn = isbn;
        this.is_available = true;
        this.category = "General";
        this.published_date = null;
        this.rating = 0;
    }

    static validate(data) {
        const { book_id, title, author } = data;
        
        if (!book_id || !title || !author) {
            throw new Error("Missing required fields: book_id, title, author");
        }

        return true;
    }

    toJSON() {
        return {
            book_id: this.book_id,
            title: this.title,
            author: this.author,
            isbn: this.isbn,
            is_available: this.is_available
        };
    }

    toFullJSON() {
        return {
            book_id: this.book_id,
            title: this.title,
            author: this.author,
            isbn: this.isbn,
            is_available: this.is_available,
            category: this.category,
            published_date: this.published_date,
            rating: this.rating
        };
    }
}

module.exports = Book;