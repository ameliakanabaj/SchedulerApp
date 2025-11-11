const express = require("express");
const router = express.Router();
const controller = require("../controllers/shift.controller");
const auth = require("../middlewares/auth.middleware");
const { createShiftValidation, updateShiftValidation } = require("../validations/shift.validation");

router.post("/", auth(["ORG_ADMIN", "GLOBAL_ADMIN"]), createShiftValidation, controller.createShift);
router.get("/", auth(["ORG_ADMIN", "GLOBAL_ADMIN", "EMPLOYEE"]), controller.getAllShifts);
router.get("/:id", auth(["ORG_ADMIN", "GLOBAL_ADMIN", "EMPLOYEE"]), controller.getShiftById);
router.patch("/:id", auth(["ORG_ADMIN", "GLOBAL_ADMIN"]), updateShiftValidation, controller.updateShift);
router.delete("/:id", auth(["ORG_ADMIN", "GLOBAL_ADMIN"]), controller.deleteShift);

module.exports = router;
