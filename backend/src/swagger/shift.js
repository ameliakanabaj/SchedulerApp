/**
 * @swagger
 * /api/shifts:
 *   post:
 *     summary: Create a new shift
 *     tags: [Shifts]
 *     security:
 *       - bearerAuth: []
 *     description: |
 *       - **GLOBAL_ADMIN** – can create a shift in any organization  
 *       - **ORG_ADMIN** – can create a shift only in their own organization
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - organization_id
 *               - start_time
 *               - end_time
 *               - place
 *               - required_people
 *             properties:
 *               organization_id:
 *                 type: integer
 *                 example: 3
 *               start_time:
 *                 type: string
 *                 format: date-time
 *                 example: "2025-01-20T09:00:00Z"
 *               end_time:
 *                 type: string
 *                 format: date-time
 *                 example: "2025-01-20T17:00:00Z"
 *               place:
 *                 type: string
 *                 example: "Anne's Bakery"
 *               required_people:
 *                 type: integer
 *                 example: 3
 *     responses:
 *       201:
 *         description: Shift created
 *       403:
 *         description: ORG_ADMIN can only create shifts in their own organization
 *       400:
 *         description: Validation error
 */

/**
 * @swagger
 * /api/shifts:
 *   get:
 *     summary: Get all shifts depending on user role
 *     tags: [Shifts]
 *     security:
 *       - bearerAuth: []
 *     description: |
 *       Returned shifts depend on the user's role:
 *       - **GLOBAL_ADMIN** - all shifts  
 *       - **ORG_ADMIN** - only shifts from their organization  
 *       - **EMPLOYEE** - only shifts they are assigned to
 *     responses:
 *       200:
 *         description: List of shifts
 *       403:
 *         description: Forbidden
 */

/**
 * @swagger
 * /api/shifts/{id}:
 *   get:
 *     summary: Get shift by ID
 *     tags: [Shifts]
 *     security:
 *       - bearerAuth: []
 *     description: |
 *       Access rules:
 *         - **GLOBAL_ADMIN** - always allowed  
 *         - **ORG_ADMIN** - only if shift belongs to their organization  
 *         - **EMPLOYEE** - only if assigned to that shift  
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Shift ID
 *     responses:
 *       200:
 *         description: Shift details
 *       403:
 *         description: Access denied
 *       404:
 *         description: Shift not found
 */

/**
 * @swagger
 * /api/shifts/{id}:
 *   patch:
 *     summary: Update shift
 *     tags: [Shifts]
 *     security:
 *       - bearerAuth: []
 *     description: |
 *       Only GLOBAL_ADMIN can update any shift.  
 *       ORG_ADMIN can update shifts only inside their organization.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Shift ID
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
 *                 example: "2025-01-20T14:00:00Z"
 *               end_time:
 *                 type: string
 *                 format: date-time
 *                 example: "2025-01-20T21:00:00Z"
 *               place:
 *                 type: string
 *                 example: "Anne's Bakery"
 *               required_people:
 *                 type: integer
 *                 example: 2
 *     responses:
 *       200:
 *         description: Shift updated
 *       403:
 *         description: User is not allowed to update this shift
 *       404:
 *         description: Shift not found
 */

/**
 * @swagger
 * /api/shifts/{id}:
 *   delete:
 *     summary: Delete shift
 *     tags: [Shifts]
 *     security:
 *       - bearerAuth: []
 *     description: |
 *       - Only **GLOBAL_ADMIN**  can delete any shift.  
 *       - **ORG_ADMIN** can delete a shift only if it belongs to their organization.
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: Shift ID
 *     responses:
 *       200:
 *         description: Shift deleted
 *       403:
 *         description: User is not allowed to delete this shift
 *       404:
 *         description: Shift not found
 */
