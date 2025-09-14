class ErrorHandler {
    static handleError(error, req, res, next) {
        console.error(error.stack);
        
        if (error.message.includes('invalid age') || 
            error.message.includes('Missing required fields') ||
            error.message.includes('already exists')) {
            return res.status(400).json({ message: error.message });
        }

        res.status(500).json({ message: 'Internal server error' });
    }

    static handle404(req, res) {
        res.status(404).json({ message: 'Endpoint not found' });
    }
}

module.exports = ErrorHandler;