/**
 * @swagger
 * /api/availabilities:
 *   post:
 *     summary: Create availability for a user
 *     tags: [Availability]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - start_time
 *               - end_time
 *             properties:
 *               user_id:
 *                 type: integer
 *                 example: 12
 *                 description: Optional. Only ORG_ADMIN/GLOBAL_ADMIN may create availability for another user. Employees create availability for themselves.
 *               start_time:
 *                 type: string
 *                 format: date-time
 *                 example: "2025-01-20T09:00:00Z"
 *               end_time:
 *                 type: string
 *                 format: date-time
 *                 example: "2025-01-20T17:00:00Z"
 *               comments:
 *                 type: string
 *                 example: "Prefer morning shift"
 *     responses:
 *       201:
 *         description: Availability created
 *       400:
 *         description: Invalid date logic (past date, end before start, different days)
 *       403:
 *         description: User not allowed to create availability for other users
 *       404:
 *         description: User not found
 */

/**
 * @swagger
 * /api/availabilities/bulk:
 *   post:
 *     summary: Create multiple availability entries at once
 *     tags: [Availability]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: array
 *             items:
 *               type: object
 *               required:
 *                 - start_time
 *                 - end_time
 *               properties:
 *                 user_id:
 *                   type: integer
 *                   example: 12
 *                   description: Optional for admins.
 *                 start_time:
 *                   type: string
 *                   format: date-time
 *                   example: "2025-01-20T09:00:00Z"
 *                 end_time:
 *                   type: string
 *                   format: date-time
 *                   example: "2025-01-20T17:00:00Z"
 *                 comments:
 *                   type: string
 *                   example: "Bulk entry"
 *     responses:
 *       201:
 *         description: Bulk creation successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 inserted:
 *                   type: integer
 *                   example: 5
 *                 records:
 *                   type: array
 *                   items:
 *                     type: object
 *       400:
 *         description: Validation error or invalid body format
 *       403:
 *         description: Forbidden
 */

/**
 * @swagger
 * /api/availabilities/user/{user_id}:
 *   get:
 *     summary: Get availability for a specific user
 *     tags: [Availability]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: user_id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID of the user
 *     responses:
 *       200:
 *         description: List of availability entries
 *       403:
 *         description: Forbidden – cannot view availability of other user or organization
 *       404:
 *         description: User not found
 */

/**
 * @swagger
 * /api/availabilities/{id}:
 *   patch:
 *     summary: Update availability entry
 *     tags: [Availability]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: Availability ID
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               start_time:
 *                 type: string
 *                 format: date-time
 *                 example: "2025-01-20T10:00:00Z"
 *               end_time:
 *                 type: string
 *                 format: date-time
 *                 example: "2025-01-20T18:00:00Z"
 *               comments:
 *                 type: string
 *                 example: "Updated comment"
 *     responses:
 *       200:
 *         description: Availability updated
 *       400:
 *         description: Invalid date range or start_time in past
 *       403:
 *         description: Forbidden – cannot update this availability
 *       404:
 *         description: Availability not found
 */

/**
 * @swagger
 * /api/availabilities/{id}:
 *   delete:
 *     summary: Delete availability entry
 *     tags: [Availability]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: Availability ID
 *     responses:
 *       200:
 *         description: Availability deleted
 *       403:
 *         description: Forbidden – cannot delete this availability
 *       404:
 *         description: Availability not found
 */
