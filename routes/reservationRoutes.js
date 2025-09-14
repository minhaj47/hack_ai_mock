const express = require('express');
const ReservationController = require('../controllers/reservationController');

const router = express.Router();

router.post('/reservations', ReservationController.createReservation);

module.exports = router;