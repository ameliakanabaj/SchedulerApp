const express = require("express");
const auth = require("../middlewares/auth.middleware");
const userController = require("../controllers/user.controller");
const { createUserValidation } = require("../validations/auth.validation");

const router = express.Router();

router.get("/me", auth(), userController.getMe);
router.get("/:id", auth(["ORG_ADMIN", "GLOBAL_ADMIN"]), userController.getUserById);
router.get("/", auth(["ORG_ADMIN", "GLOBAL_ADMIN"]), userController.getAllUsers);
router.post("/", auth(["ORG_ADMIN", "GLOBAL_ADMIN"]), createUserValidation, userController.createUser);

module.exports = router;
