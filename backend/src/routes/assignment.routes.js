const express = require("express");
const router = express.Router();
const controller = require("../controllers/assignment.controller");
const auth = require("../middlewares/auth.middleware");
const { createAssignmentValidation, updateAssignmentValidation } = require("../validations/assignment.validation");

/**
 * @swagger
 * /api/assignments/:
 *   post:
 *     summary: Creates an assignment (user to shift)
 *     tags: [Assignments]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - shift_id
 *               - user_id
 *               - role_on_shift
 *             properties:
 *               shift_id:
 *                 type: integer
 *                 example: 12
 *               user_id:
 *                 type: integer
 *                 example: 44
 *               role_on_shift:
 *                 type: string
 *                 example: "CASHIER"
 *     responses:
 *       201:
 *         description: Assignment created
 *       400:
 *          description: User is not in the same organization as the shift
 *       403:
 *         description: Not allowed (wrong organization or user)
 *       404:
 *         description: Shift or user not found
 */
router.post("/", auth(["ORG_ADMIN", "GLOBAL_ADMIN"]), createAssignmentValidation, controller.createAssignment);
/**
 * @swagger
 * /api/assignments/assignments/{id}:
 *   get:
 *     summary: gets assignment by assignment id
 *     tags: [Assignments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID of assignment
 *     responses:
 *       200:
 *         description: Assignment found
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Assignment not found
 */
router.get("/assignments/:id", controller.getAssignmentById);

/**
 * @swagger
 * /api/assignments/shift/{shift_id}:
 *   get:
 *     summary: gets assignment by shift id
 *     tags: [Assignments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: shift_id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID of assignment
 *     responses:
 *       200:
 *         description: Assignment found
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Shift not found
 */
router.get("/shift/:shift_id", auth(["ORG_ADMIN", "GLOBAL_ADMIN", "EMPLOYEE"]), controller.getAssignmentsByShift);

/**
 * @swagger
 * /api/assignments/user/{user_id}:
 *   get:
 *     summary: gets assignment by user id
 *     tags: [Assignments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: shift_id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID of assignment
 *     responses:
 *       200:
 *         description: Assignment found
 *       403:
 *         description: Forbidden
 *       404:
 *         description: User not found
 */
router.get("/user/:user_id", auth(["ORG_ADMIN", "GLOBAL_ADMIN", "EMPLOYEE"]), controller.getAssignmentsByUser);

/**
 * @swagger
 * /api/assignments/user/{user_id}:
 *   get:
 *     summary: gets assignment by user id
 *     tags: [Assignments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: shift_id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID of assignment
 *     responses:
 *       200:
 *         description: Assignment found
 *       403:
 *         description: Forbidden
 *       404:
 *         description: User not found
 */
router.get("/:id", auth(["ORG_ADMIN", "GLOBAL_ADMIN", "EMPLOYEE"]), controller.getAssignmentById);
router.patch("/:id", auth(["ORG_ADMIN", "GLOBAL_ADMIN"]), updateAssignmentValidation, controller.updateAssignment);
router.delete("/:id", auth(["ORG_ADMIN", "GLOBAL_ADMIN"]), controller.deleteAssignment);

module.exports = router;
