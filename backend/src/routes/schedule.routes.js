const express = require("express");
const router = express.Router();
const auth = require("../middlewares/auth.middleware");
const controller = require("../controllers/schedule.controller");
const {
  createScheduleValidation,
  updateScheduleValidation,
  getOrganizationSchedulesValidation,
  getUserSchedulesValidation,
  deleteScheduleValidation,
  getScheduleValidation,
  generateScheduleValidation,
  checkGenerateScheduleValidation
} = require("../validations/schedule.validation");

router.post("/", auth(["GLOBAL_ADMIN", "ORG_ADMIN"]), createScheduleValidation, controller.createSchedule);
router.post("/generate", auth(["GLOBAL_ADMIN", "ORG_ADMIN"]), generateScheduleValidation, controller.generateSchedule);
router.get("/organization/:organizationId", auth(), getOrganizationSchedulesValidation, controller.getSchedulesByOrganization);
router.get("/:scheduleId/can-generate", auth(["GLOBAL_ADMIN", "ORG_ADMIN"]), checkGenerateScheduleValidation, controller.checkIfScheduleReady);
router.get("/user/:userId", auth(), getUserSchedulesValidation, controller.getSchedulesForUser);
router.patch("/:scheduleId", auth(["GLOBAL_ADMIN", "ORG_ADMIN"]), updateScheduleValidation, controller.updateSchedule);
router.delete("/:scheduleId", auth(["GLOBAL_ADMIN", "ORG_ADMIN"]), deleteScheduleValidation, controller.deleteSchedule);
router.get("/:scheduleId", auth(), getScheduleValidation, controller.getScheduleById);

module.exports = router;
