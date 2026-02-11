const googleCalendarService = require('../services/googleCalendar.service');

async function connect(req, res, next) {
    try {
        const url = googleCalendarService.getAuthUrl(req.user.user_id);
        res.json({ url });
    } catch (error) {
        next(error);
    }
}

async function callback(req, res, next) {
    try {
        const { code, state } = req.query;
        await googleCalendarService.handleCallback(code, state);
        
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:4200';
        res.redirect(`${frontendUrl}/profile?google=success`);
    } catch (error) {
        next(error);
    }
}

async function disconnect(req, res, next) {
    try {
        const userId = req.user.user_id;
        await googleCalendarService.disconnectUser(userId);
        return res.status(200).json({ 
            message: "Successfully disconnected from Google Calendar." 
        });
    } catch (error) {
        console.error("[GOOGLE AUTH] Disconnect error:", error);
        if (next) return next(error); 
        res.status(500).json({ error: "Failed to disconnect account." });
    }
}

module.exports = { connect, callback, disconnect };
