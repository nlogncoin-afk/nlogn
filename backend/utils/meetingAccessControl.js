/**
 * Check if a user can access the Jitsi meeting link
 * @param {Object} booking - The booking object
 * @param {String} userRole - User's role ('admin' or 'user')
 * @returns {Object} - { canAccess: boolean, reason: string, minutesUntilAccess: number }
 */
const canAccessMeetingLink = (booking, userRole) => {
    // Admins always have access
    if (userRole === 'admin') {
        return {
            canAccess: true,
            reason: 'Admin access granted',
            minutesUntilAccess: 0
        };
    }

    // Check if booking is cancelled
    if (booking.status === 'cancelled') {
        return {
            canAccess: false,
            reason: 'Booking has been cancelled',
            minutesUntilAccess: null
        };
    }

    // Parse meeting date and time
    const meetingDateTime = new Date(`${booking.meetingDate}T${booking.meetingStartTime}:00`);
    const currentTime = new Date();

    // Calculate time difference in minutes
    const timeDifferenceMs = meetingDateTime - currentTime;
    const minutesUntilMeeting = Math.floor(timeDifferenceMs / (1000 * 60));

    // Check if meeting has already passed
    if (minutesUntilMeeting < -60) { // Meeting ended more than 1 hour ago
        return {
            canAccess: false,
            reason: 'Meeting has ended',
            minutesUntilAccess: null
        };
    }

    // Check if within access window (5 minutes before to 1 hour after)
    const ACCESS_WINDOW_MINUTES = 5;

    if (minutesUntilMeeting <= ACCESS_WINDOW_MINUTES) {
        return {
            canAccess: true,
            reason: 'Access window open',
            minutesUntilAccess: 0
        };
    }

    // Link not yet accessible
    return {
        canAccess: false,
        reason: 'Meeting link will be available 5 minutes before the scheduled time',
        minutesUntilAccess: minutesUntilMeeting - ACCESS_WINDOW_MINUTES
    };
};

/**
 * Format minutes into human-readable time
 * @param {Number} minutes - Minutes to format
 * @returns {String} - Formatted time string
 */
const formatTimeUntilAccess = (minutes) => {
    if (minutes <= 0) return 'Now';

    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;

    if (hours > 24) {
        const days = Math.floor(hours / 24);
        const remainingHours = hours % 24;
        return `${days}d ${remainingHours}h`;
    }

    if (hours > 0) {
        return `${hours}h ${mins}m`;
    }

    return `${mins} minutes`;
};

export {
    canAccessMeetingLink,
    formatTimeUntilAccess
};
