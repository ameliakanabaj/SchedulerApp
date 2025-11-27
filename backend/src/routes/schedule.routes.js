const express = require("express");
const router = express.Router();
const auth = require("../middlewares/auth.middleware");
const controller = require("../controllers/schedule.controller");
const {
  createScheduleValidation,
  updateScheduleValidation,
  getOrganizationSchedulesValidation,
  getUserSchedulesValidation,
  deleteScheduleValidation
} = require("../validations/schedule.validation");

router.post("/", auth(["GLOBAL_ADMIN", "ORG_ADMIN"]), createScheduleValidation, controller.createSchedule);
router.get("/organization/:organizationId", getOrganizationSchedulesValidation, controller.getSchedulesByOrganization);
router.get("/user/:userId", getUserSchedulesValidation, controller.getSchedulesForUser);
router.patch("/:scheduleId", auth(["GLOBAL_ADMIN", "ORG_ADMIN"]), updateScheduleValidation, controller.updateSchedule);
router.delete("/:scheduleId", auth(["GLOBAL_ADMIN", "ORG_ADMIN"]), deleteScheduleValidation, controller.deleteSchedule);

module.exports = router;
