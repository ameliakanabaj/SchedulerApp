const express = require("express");
const router = express.Router();
const notificationController = require("../controllers/notifications.controller");
const auth = require("../middlewares/auth.middleware");
const { markAsReadValidation } = require("../validations/notifications.validation");

router.get("/", auth(["EMPLOYEE", "ORG_ADMIN", "GLOBAL_ADMIN"]), notificationController.getMyNotifications);
router.patch("/:id/read", auth(["EMPLOYEE", "ORG_ADMIN", "GLOBAL_ADMIN"]), markAsReadValidation, notificationController.markAsRead);

module.exports = router;
