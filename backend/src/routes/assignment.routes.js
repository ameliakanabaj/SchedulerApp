const express = require("express");
const router = express.Router();
const controller = require("../controllers/assignment.controller");
const auth = require("../middlewares/auth.middleware");
const { createAssignmentValidation } = require("../validations/assignment.validation");

router.post("/", auth(["ORG_ADMIN", "GLOBAL_ADMIN"]), createAssignmentValidation, controller.createAssignment);
router.get("/shift/:shift_id", auth(["ORG_ADMIN", "GLOBAL_ADMIN", "EMPLOYEE"]), controller.getAssignmentsByShift);
router.get("/user/:user_id", auth(["ORG_ADMIN", "GLOBAL_ADMIN", "EMPLOYEE"]), controller.getAssignmentsByUser);
router.delete("/:id", auth(["ORG_ADMIN", "GLOBAL_ADMIN"]), controller.deleteAssignment);

module.exports = router;
