const { google } = require('googleapis');
const userModel = require('../models/user.model');

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);

function getAuthUrl(userId) {
  return oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: ['https://www.googleapis.com/auth/calendar.events'],
    state: userId.toString(),
    prompt: 'consent'
  });
}

async function handleCallback(code, userId) {
  const { tokens } = await oauth2Client.getToken(code);
  await userModel.updateUser(userId, {
    google_access_token: tokens.access_token,
    google_refresh_token: tokens.refresh_token,
    google_token_expiry: tokens.expiry_date ? new Date(tokens.expiry_date) : null,
  });
  return tokens;
}

async function createCalendarEvent(user, shift) {
  console.log(`[GOOGLE] Creating event: ${user.email}, Shift: ${shift.place}`);

  const auth = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
  );
  
  auth.setCredentials({
    access_token: user.google_access_token,
    refresh_token: user.google_refresh_token,
    expiry_date: user.google_token_expiry ? new Date(user.google_token_expiry).getTime() : null
  });

  auth.on('tokens', async (tokens) => {
    const updateData = {
      google_access_token: tokens.access_token,
      google_token_expiry: tokens.expiry_date ? new Date(tokens.expiry_date) : null,
    };
    if (tokens.refresh_token) updateData.google_refresh_token = tokens.refresh_token;
    await userModel.updateUser(user.user_id, updateData);
  });

  const calendar = google.calendar({ version: 'v3', auth });

  const formatLocalTime = (dateStr) => {
    const date = new Date(dateStr);
    return date.toISOString().split('.')[0].replace('Z', '');
  };

  const event = {
    summary: `Shift: ${shift.place || 'Work'}`,
    description: `Automatically generated shift in Scheduler system.`,
    start: { 
      dateTime: formatLocalTime(shift.start_time),
      timeZone: 'Europe/Warsaw'
    },
    end: { 
      dateTime: formatLocalTime(shift.end_time),
      timeZone: 'Europe/Warsaw'
    },
  };

  return await calendar.events.insert({
    calendarId: 'primary',
    resource: event,
  });
}

async function disconnectUser(userId) {
  const id = parseInt(userId, 10);
  return await userModel.clearGoogleTokens(id);
}

module.exports = {
  getAuthUrl,
  handleCallback,
  createCalendarEvent,
  disconnectUser,
};
