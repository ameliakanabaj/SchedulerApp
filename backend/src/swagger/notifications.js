/**
 * @swagger
 * /api/notifications:
 *   get:
 *     summary: Get notifications for the current user
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of user notifications
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   notification_id:
 *                     type: integer
 *                     example: 5
 *                   user_id:
 *                     type: integer
 *                     example: 12
 *                   schedule_id:
 *                     type: integer
 *                     nullable: true
 *                     example: 3
 *                   type:
 *                     type: string
 *                     enum: [SCHEDULE_GENERATED, AVAILABILITY_OPEN, MISSING_AVAILABILITY, REMINDER_24H]
 *                     example: "REMINDER_24H"
 *                   status:
 *                     type: string
 *                     enum: [SENT, FAILED]
 *                     example: "SENT"
 *                   message:
 *                     type: string
 *                     example: "Reminder: Less than 24h left to submit availability"
 *                   is_read:
 *                     type: boolean
 *                     example: false
 *                   sent_at:
 *                     type: string
 *                     format: date-time
 *                     example: "2025-01-20T10:00:00Z"
 *       403:
 *         description: Forbidden – invalid token or insufficient permissions
 */

/**
 * @swagger
 * /api/notifications/{id}/read:
 *   patch:
 *     summary: Mark a notification as read
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: Notification ID
 *     responses:
 *       200:
 *         description: Notification marked as read
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Notification marked as read"
 *       400:
 *         description: Invalid Notification ID format (must be integer)
 *       403:
 *         description: Forbidden – cannot access this notification
 *       404:
 *         description: Notification not found
 */
