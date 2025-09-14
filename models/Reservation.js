const { formatISO } = require('../utils/helpers');

class Reservation {
    constructor(reservation_id, member_id, book_id, book_title, options = {}) {
        this.reservation_id = reservation_id;
        this.member_id = member_id;
        this.book_id = book_id;
        this.book_title = book_title;
        this.reservation_status = options.is_available ? "confirmed" : "queued";
        this.queue_position = options.queue_position || 0;
        this.estimated_availability_date = options.estimated_availability_date || formatISO();
        this.priority_score = options.priority_score || 5.0;
        
        this.reservation_details = {
            created_at: formatISO(),
            expires_at: new Date(Date.now() + (options.max_wait_days || 14) * 24 * 60 * 60 * 1000).toISOString(),
            pickup_window_start: options.preferred_pickup_date || new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
            pickup_window_end: new Date(new Date(options.preferred_pickup_date || Date.now()).getTime() + 2 * 24 * 60 * 60 * 1000).toISOString(),
            reservation_type: options.reservation_type || 'standard',
            fee_paid: options.fee_paid || 0
        };

        this.queue_analytics = {
            total_in_queue: options.total_in_queue || 1,
            avg_wait_time_days: 5.2,
            queue_movement_rate: "moderate",
            cancellation_rate: 0.15
        };

        this.member_priority_factors = options.member_priority_factors || {};
        this.notifications_scheduled = options.notifications_scheduled || [];
        this.conflict_resolution = options.conflict_resolution || {
            simultaneous_requests: 0,
            resolution_method: "priority_score",
            competing_members: []
        };
    }

    toJSON() {
        return {
            reservation_id: this.reservation_id,
            member_id: this.member_id,
            book_id: this.book_id,
            book_title: this.book_title,
            reservation_status: this.reservation_status,
            queue_position: this.queue_position,
            estimated_availability_date: this.estimated_availability_date,
            priority_score: this.priority_score,
            reservation_details: this.reservation_details,
            queue_analytics: this.queue_analytics,
            member_priority_factors: this.member_priority_factors,
            notifications_scheduled: this.notifications_scheduled,
            conflict_resolution: this.conflict_resolution
        };
    }
}

module.exports = Reservation;