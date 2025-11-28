/**
 * @swagger
 * /api/schedules:
 *   post:
 *     summary: Create a schedule for an organization
 *     tags: [Schedules]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - organization_id
 *               - date_from
 *               - date_to
 *               - deadline_generate_date
 *             properties:
 *               organization_id:
 *                 type: integer
 *                 example: 1
 *               date_from:
 *                 type: string
 *                 format: date-time
 *                 example: "2025-01-01T00:00:00Z"
 *               date_to:
 *                 type: string
 *                 format: date-time
 *                 example: "2025-01-07T23:59:00Z"
 *               deadline_generate_date:
 *                 type: string
 *                 format: date-time
 *                 example: "2024-12-20T23:59:00Z"
 *     responses:
 *       201:
 *         description: Schedule created successfully
 *       400:
 *         description: Invalid request body
 *       403:
 *         description: Only ORG_ADMIN or GLOBAL_ADMIN can create schedules
 *       404:
 *         description: Organization not found
 *       401:
 *         description: Missing token
 */


/**
 * @swagger
 * /api/schedules/organization/{organizationId}:
 *   get:
 *     summary: Get all schedules for an organization
 *     tags: [Schedules]
 *     parameters:
 *       - in: path
 *         name: organizationId
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID of the organization
 *     responses:
 *       200:
 *         description: List of schedules for this organization
 *       400:
 *         description: Invalid organization ID
 *       404:
 *         description: Organization not found
 *       403:
 *         description: Access denied
 *       401:
 *         description: Missing token
 */


/**
 * @swagger
 * /api/schedules/user/{userId}:
 *   get:
 *     summary: Get all schedules where the user has assignments
 *     tags: [Schedules]
 *     parameters:
 *       - in: path
 *         name: userId
 *         schema:
 *           type: integer
 *         required: true
 *         description: User ID
 *     responses:
 *       200:
 *         description: List of schedules assigned to the user
 *       400:
 *         description: Invalid user ID
 *       404:
 *         description: User not found
 *       403:
 *         description: Access denied
 *       401:
 *         description: Missing token
 */

/**
 * @swagger
 * /api/schedules/{scheduleId}:
 *   patch:
 *     summary: Update schedule details (date range, status, etc.)
 *     tags: [Schedules]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: scheduleId
 *         schema:
 *           type: integer
 *         required: true
 *         description: Schedule ID
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               date_from:
 *                 type: string
 *                 format: date-time
 *               date_to:
 *                 type: string
 *                 format: date-time
 *               status:
 *                 type: string
 *                 enum: [PENDING, GENERATED, APPROVED, REJECTED, NOT_APPROVED]
 *               deadline_generate_date:
 *                 type: string
 *                 format: date-time
 *     responses:
 *       200:
 *         description: Schedule updated successfully
 *       400:
 *         description: Invalid update data
 *       403:
 *         description: Only ORG_ADMIN or GLOBAL_ADMIN can update schedules
 *       404:
 *         description: Schedule not found
 *       401:
 *         description: Missing token
 */


/**
 * @swagger
 * /api/schedules/{scheduleId}:
 *   delete:
 *     summary: Delete a schedule by ID
 *     tags: [Schedules]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: scheduleId
 *         schema:
 *           type: integer
 *         required: true
 *         description: Schedule ID
 *     responses:
 *       200:
 *         description: Schedule deleted successfully
 *       403:
 *         description: Only ORG_ADMIN or GLOBAL_ADMIN can delete schedules
 *       404:
 *         description: Schedule not found
 *       401:
 *         description: Missing token
 */

/**
 * @swagger
 * /api/schedules/{scheduleId}:
 *   get:
 *     summary: Get single schedule by ID
 *     tags: [Schedules]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: scheduleId
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID of the schedule
 *     responses:
 *       200:
 *         description: Schedule found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 schedule_id:
 *                   type: integer
 *                 organization_id:
 *                   type: integer
 *                 date_from:
 *                   type: string
 *                   format: date-time
 *                 date_to:
 *                   type: string
 *                   format: date-time
 *                 generated_at:
 *                   type: string
 *                   format: date-time
 *                 status:
 *                   type: string
 *                   enum: [PENDING, GENERATED, APPROVED, REJECTED, NOT_APPROVED]
 *                 assignments:
 *                   type: array
 *                   items:
 *                     type: object
 *       403:
 *         description: Access denied
 *       404:
 *         description: Schedule not found
 */
