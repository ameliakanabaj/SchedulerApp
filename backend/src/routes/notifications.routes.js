const express = require("express");
const router = express.Router();
const notificationController = require("../controllers/notification.controller");
const auth = require("../middlewares/auth.middleware");

router.get("/", auth(["EMPLOYEE", "ORG_ADMIN", "GLOBAL_ADMIN"]), notificationController.getMyNotifications);
router.patch("/:id/read", auth(["EMPLOYEE", "ORG_ADMIN", "GLOBAL_ADMIN"]), notificationController.markAsRead);

module.exports = router;
