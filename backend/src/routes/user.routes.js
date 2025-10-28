const express = require("express");
const auth = require("../middlewares/auth.middleware");
const userController = require("../controllers/user.controller");

const router = express.Router();

router.get("/me", auth(), userController.getMe);
router.get("/:id", auth(["ORG_ADMIN", "GLOBAL_ADMIN"]), userController.getUserById);

module.exports = router;
