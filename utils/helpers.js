const formatISO = (date = new Date()) => date.toISOString();

const calculateDaysDifference = (date1, date2) => {
    const diffTime = Math.abs(date2 - date1);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

const validateAge = (age) => {
    if (typeof age !== 'number' || age < 12) {
        throw new Error(`invalid age: ${age}, must be 12 or older`);
    }
};

const generateReservationId = (reservationIdCounter) => {
    const date = new Date().toISOString().split('T')[0].replace(/-/g, '');
    return `RES-${date}-${String(reservationIdCounter()).padStart(3, '0')}`;
};

module.exports = {
    formatISO,
    calculateDaysDifference,
    validateAge,
    generateReservationId
};