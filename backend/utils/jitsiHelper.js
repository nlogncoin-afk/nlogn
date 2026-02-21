export const generateJitsiRoomName = (slotTitle, date, time) => {
    // Remove spaces and special characters from title
    const sanitizedTitle = slotTitle.replace(/[^a-zA-Z0-9]/g, '');

    // Format: Title-YYYYMMDD-HHMM-RandomString
    const dateFormatted = date.replace(/-/g, ''); // 20240315
    const timeFormatted = time.replace(/:/g, ''); // 1000
    const randomString = Math.random().toString(36).substring(2, 8);

    return `${sanitizedTitle}-${dateFormatted}-${timeFormatted}-${randomString}`;
};

export const generateJitsiMeetingLink = (roomName) => {
    return `https://meet.jit.si/${roomName}`;
};
