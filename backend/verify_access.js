
import { canAccessMeetingLink } from './utils/meetingAccessControl.js';

console.log('--- Testing Access Control Logic ---');

const now = new Date();
const oneHourFromNow = new Date(now.getTime() + 60 * 60 * 1000);
const fiveMinutesFromNow = new Date(now.getTime() + 5 * 60 * 1000);
const tenMinutesFromNow = new Date(now.getTime() + 10 * 60 * 1000);
const oneMinuteFromNow = new Date(now.getTime() + 1 * 60 * 1000);
const pastMeeting = new Date(now.getTime() - 30 * 60 * 1000);

const mockBooking = (meetingDate) => ({
    status: 'confirmed',
    meetingDate: meetingDate.toISOString().split('T')[0],
    meetingStartTime: meetingDate.toTimeString().split(' ')[0].substring(0, 5),
    meetingEndTime: new Date(meetingDate.getTime() + 60 * 60 * 1000).toTimeString().split(' ')[0].substring(0, 5)
});

// Test 1: Admin should always access
console.log('\nTest 1: Admin Access');
const adminResult = canAccessMeetingLink(mockBooking(oneHourFromNow), 'admin');
console.log('Admin access (1 hour away):', adminResult.canAccess === true ? 'PASS' : 'FAIL', adminResult);

// Test 2: User access - > 5 minutes away
console.log('\nTest 2: User Access (> 5 mins away)');
const userResultFuture = canAccessMeetingLink(mockBooking(tenMinutesFromNow), 'user');
console.log('User access (10 mins away):', userResultFuture.canAccess === false ? 'PASS' : 'FAIL', userResultFuture);

// Test 3: User access - <= 5 minutes away
console.log('\nTest 3: User Access (<= 5 mins away)');
const userResultNear = canAccessMeetingLink(mockBooking(oneMinuteFromNow), 'user');
console.log('User access (1 min away):', userResultNear.canAccess === true ? 'PASS' : 'FAIL', userResultNear);

// Test 4: User access - Meeting in progress (technically "past start time" but valid)
// The utility compares current time vs start time. If start time is NOW or slightly past, difference is <= 5 mins.
// Wait, if meeting started 10 mins ago, difference is -10 mins. -10 <= 5 is true.
console.log('\nTest 4: User Access (Meeting in progress)');
const userResultProgress = canAccessMeetingLink(mockBooking(pastMeeting), 'user');
console.log('User access (Started 30 mins ago):', userResultProgress.canAccess === true ? 'PASS' : 'FAIL', userResultProgress);

// Test 5: Cancelled booking
console.log('\nTest 5: Cancelled Booking');
const cancelledBooking = { ...mockBooking(oneMinuteFromNow), status: 'cancelled' };
const cancelledResult = canAccessMeetingLink(cancelledBooking, 'user');
console.log('Cancelled booking access:', cancelledResult.canAccess === false ? 'PASS' : 'FAIL', cancelledResult);
