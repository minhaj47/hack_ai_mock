const Reservation = require('../models/Reservation');
const { members, books, reservations, transactions, reservationIdCounter } = require('../config/database');
const { generateReservationId } = require('../utils/helpers');

class ReservationController {
    static createReservation(req, res, next) {
        try {
            const {
                member_id,
                book_id,
                reservation_type = 'standard',
                preferred_pickup_date,
                max_wait_days = 14,
                notification_preferences = {},
                group_reservation = {},
                special_requests = {},
                payment_info = {}
            } = req.body;

            // Validation
            const validationErrors = [];

            if (!members.has(member_id)) {
                validationErrors.push({
                    field: "member_id",
                    error: "member_not_found",
                    details: `Member with id ${member_id} was not found`
                });
            }

            if (!books.has(book_id)) {
                validationErrors.push({
                    field: "book_id",
                    error: "book_not_found",
                    details: `Book with id ${book_id} was not found`
                });
            }

            // Check if member already has active reservations
            const activeReservations = Array.from(reservations.values())
                .filter(r => r.member_id === member_id && r.reservation_status === 'confirmed').length;

            if (activeReservations >= 2) {
                validationErrors.push({
                    field: "member_id",
                    error: "member_has_active_reservation",
                    details: `Member already has ${activeReservations} active reservations (limit: 2)`
                });
            }

            // Check if book is being processed
            const book = books.get(book_id);
            if (book && !book.is_available) {
                const activeTransaction = Array.from(transactions.values())
                    .find(t => t.book_id === book_id && t.status === 'active');
                
                if (activeTransaction) {
                    validationErrors.push({
                        field: "book_id",
                        error: "book_not_available_for_reservation",
                        details: "Book is currently being processed for return"
                    });
                }
            }

            if (validationErrors.length > 0) {
                return res.status(400).json({
                    error: "reservation_conflict",
                    message: "Multiple complex validation failures detected",
                    details: {
                        validation_errors: validationErrors,
                        suggested_alternatives: {
                            alternative_books: [book_id + 1, book_id + 2, book_id + 3],
                            alternative_dates: [
                                new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
                                new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString()
                            ],
                            upgrade_options: ["premium_reservation", "group_reservation"]
                        },
                        queue_impact: {
                            estimated_wait_time: "7-10 days",
                            queue_position_if_accepted: 12
                        }
                    }
                });
            }

            // Calculate priority score
            const member = members.get(member_id);
            const memberTransactions = Array.from(transactions.values())
                .filter(t => t.member_id === member_id);
            
            const borrowingFrequency = memberTransactions.length / 12;
            const returnPunctuality = 0.9;
            const membershipTier = "gold";
            const loyaltyScore = Math.min(10, borrowingFrequency * 2 + returnPunctuality * 8);
            const priorityScore = loyaltyScore + (reservation_type === 'premium' ? 2 : 0);

            // Create reservation
            const reservationId = generateReservationId(reservationIdCounter);
            const currentQueue = Array.from(reservations.values())
                .filter(r => r.book_id === book_id && r.reservation_status !== 'expired').length;

            const reservationOptions = {
                is_available: book.is_available,
                queue_position: book.is_available ? 0 : currentQueue + 1,
                estimated_availability_date: new Date(Date.now() + (currentQueue * 7 * 24 * 60 * 60 * 1000)).toISOString(),
                priority_score: priorityScore,
                max_wait_days,
                preferred_pickup_date,
                reservation_type,
                fee_paid: payment_info.premium_fee || 0,
                total_in_queue: currentQueue + 1,
                member_priority_factors: {
                    borrowing_frequency: borrowingFrequency,
                    return_punctuality: returnPunctuality,
                    membership_tier: membershipTier,
                    special_circumstances: Object.keys(special_requests).filter(key => special_requests[key]),
                    loyalty_score: loyaltyScore
                },
                notifications_scheduled: [
                    {
                        type: "queue_position_update",
                        scheduled_for: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
                    },
                    {
                        type: "availability_alert",
                        scheduled_for: new Date(Date.now() + (currentQueue * 7 * 24 * 60 * 60 * 1000)).toISOString()
                    }
                ],
                conflict_resolution: {
                    simultaneous_requests: 0,
                    resolution_method: "priority_score",
                    competing_members: []
                }
            };

            const reservation = new Reservation(reservationId, member_id, book_id, book.title, reservationOptions);
            reservations.set(reservationId, reservation);

            res.json(reservation.toJSON());
        } catch (error) {
            next(error);
        }
    }
}

module.exports = ReservationController;