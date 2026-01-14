const express = require("express");
const router = express.Router();
const controller = require("../controllers/availability.controller");
const auth = require("../middlewares/auth.middleware");
const loadAvailability = require("../middlewares/loadAvailability.middleware");
const { createAvailabilityValidation, updateAvailabilityValidation, createAvailabilitiesBulkValidation } = require("../validations/availability.validation");

router.post("/", auth(["EMPLOYEE", "ORG_ADMIN", "GLOBAL_ADMIN"]), createAvailabilityValidation, controller.createAvailability);
router.post("/bulk", auth(["EMPLOYEE", "ORG_ADMIN", "GLOBAL_ADMIN"]), createAvailabilitiesBulkValidation, controller.createAvailabilitiesBulk);
router.get("/user/:user_id", auth(["EMPLOYEE", "ORG_ADMIN", "GLOBAL_ADMIN"]), controller.getAvailabilityByUser);
router.patch("/:id", auth(["EMPLOYEE", "ORG_ADMIN", "GLOBAL_ADMIN"]), loadAvailability, updateAvailabilityValidation, controller.updateAvailability);
router.delete("/:id", auth(["EMPLOYEE", "ORG_ADMIN", "GLOBAL_ADMIN"]), loadAvailability, controller.deleteAvailability);

module.exports = router;
