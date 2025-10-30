const express = require("express");
const router = express.Router();
const controller = require("../controllers/availability.controller");
const auth = require("../middlewares/auth.middleware");
const { createAvailabilityValidation, updateAvailabilityValidation } = require("../validations/availability.validation");

router.post("/", auth(["EMPLOYEE", "ORG_ADMIN", "GLOBAL_ADMIN"]), createAvailabilityValidation, controller.createAvailability);
router.get("/user/:user_id", auth(["EMPLOYEE", "ORG_ADMIN", "GLOBAL_ADMIN"]), controller.getAvailabilityByUser);
router.put("/:id", auth(["EMPLOYEE", "ORG_ADMIN", "GLOBAL_ADMIN"]), updateAvailabilityValidation, controller.updateAvailability);
router.delete("/:id", auth(["EMPLOYEE", "ORG_ADMIN", "GLOBAL_ADMIN"]), controller.deleteAvailability);

module.exports = router;
