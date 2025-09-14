const { formatISO } = require('../utils/helpers');

class Transaction {
    constructor(transaction_id, member_id, book_id) {
        this.transaction_id = transaction_id;
        this.member_id = member_id;
        this.book_id = book_id;
        this.borrowed_at = formatISO();
        this.returned_at = null;
        this.status = "active";
    }

    returnBook() {
        this.returned_at = formatISO();
        this.status = "returned";
    }

    toJSON() {
        return {
            transaction_id: this.transaction_id,
            member_id: this.member_id,
            book_id: this.book_id,
            borrowed_at: this.borrowed_at,
            returned_at: this.returned_at,
            status: this.status
        };
    }
}

module.exports = Transaction;