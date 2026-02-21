export const bookingConfirmationTemplate = (booking, slot) => {
    return `
Hi ${booking.userName},

Your meeting has been successfully booked!

Meeting Details:
- Title: ${slot.title}
- Description: ${slot.description}
- Date: ${slot.date}
- Time: ${slot.startTime} - ${slot.endTime}
- Duration: ${slot.duration} minutes


You can access the meeting link from your dashboard 5 minutes before the scheduled time.

🎥 Link availability: 5 minutes before start time


Important Notes:
- Save this email for future reference
- You can view and manage your bookings in your dashboard
- To cancel this booking, please visit your dashboard

Best regards,
The Team
`;
};

export const cancellationConfirmationTemplate = (booking, slot) => {
    return `
Hi ${booking.userName},

Your booking has been successfully cancelled.

Cancelled Meeting Details:
- Title: ${slot.title}
- Date: ${slot.date}
- Time: ${slot.startTime} - ${slot.endTime}

You can book another slot anytime from your dashboard.

Best regards,
The Team
`;
};
