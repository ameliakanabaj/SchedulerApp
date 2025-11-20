const express = require("express");
const router = express.Router();
const controller = require("../controllers/availability.controller");
const auth = require("../middlewares/auth.middleware");
const { createAvailabilityValidation, updateAvailabilityValidation } = require("../validations/availability.validation");

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
 *               - status
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
 *               status:
 *                 type: string
 *                 enum: [PENDING, APPROVED, REJECTED]
 *                 example: "PENDING"
 *     responses:
 *       201:
 *         description: Availability created
 *       400:
 *         description: Invalid date or end_time before start_time
 *       403:
 *         description: User not allowed to create availability for other users or ogranizations
 *       404:
 *         description: User not found
 */
router.post("/", auth(["EMPLOYEE", "ORG_ADMIN", "GLOBAL_ADMIN"]), createAvailabilityValidation, controller.createAvailability);

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
router.get("/user/:user_id", auth(["EMPLOYEE", "ORG_ADMIN", "GLOBAL_ADMIN"]), controller.getAvailabilityByUser);

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
 *               status:
 *                 type: string
 *                 enum: [PENDING, APPROVED, REJECTED]
 *                 example: "PENDING"
 *     responses:
 *       200:
 *         description: Availability updated
 *       400:
 *         description: Invalid date range
 *       403:
 *         description: Forbidden – cannot update this availability
 *       404:
 *         description: Availability not found
 */
router.patch("/:id", auth(["EMPLOYEE", "ORG_ADMIN", "GLOBAL_ADMIN"]), updateAvailabilityValidation, controller.updateAvailability);

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
router.delete("/:id", auth(["EMPLOYEE", "ORG_ADMIN", "GLOBAL_ADMIN"]), controller.deleteAvailability);

module.exports = router;
