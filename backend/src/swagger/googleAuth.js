/**
 * @swagger
 * tags:
 *   name: GoogleAuth
 *   description: Google Calendar OAuth2 integration
 */

/**
 * @swagger
 * /api/auth/google/connect:
 *   get:
 *     summary: Get Google OAuth connection URL
 *     tags: [GoogleAuth]
 *     security:
 *       - bearerAuth: []
 *     description: Returns a URL to redirect the user to Google for authentication.
 *     responses:
 *       200:
 *         description: Authorization URL generated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 url:
 *                   type: string
 *                   example: "https://accounts.google.com/o/oauth2/v2/auth?..."
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /api/auth/google/callback:
 *   get:
 *     summary: Google OAuth callback handler
 *     tags: [GoogleAuth]
 *     description: Endpoint where Google redirects the user after authentication. Exchange code for tokens.
 *     parameters:
 *       - in: query
 *         name: code
 *         required: true
 *         schema:
 *           type: string
 *         description: The authorization code returned by Google
 *       - in: query
 *         name: state
 *         required: true
 *         schema:
 *           type: string
 *         description: The state (userId) passed during the initial request
 *     responses:
 *       302:
 *         description: Redirects back to frontend with success/error status
 *       400:
 *         description: Missing code or state
 */

/**
 * @swagger
 * /api/auth/google/disconnect:
 *   delete:
 *     summary: Disconnect Google Calendar
 *     tags: [GoogleAuth]
 *     security:
 *       - bearerAuth: []
 *     description: Clears Google OAuth tokens from the user's account.
 *     responses:
 *       200:
 *         description: Successfully disconnected
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Successfully disconnected from Google Calendar."
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Failed to disconnect account
 */
