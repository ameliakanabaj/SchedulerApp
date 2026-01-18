const express = require("express");
const auth = require("../middlewares/auth.middleware");
const userController = require("../controllers/user.controller");
const { createUserValidation, changePasswordValidation, resetPasswordValidation } = require("../validations/auth.validation");

const router = express.Router();

router.get("/me", auth(), userController.getMe);
router.get("/:id", auth(), userController.getUserById);
router.get("/", auth(["ORG_ADMIN", "GLOBAL_ADMIN"]), userController.getAllUsers);
router.post("/", auth(["ORG_ADMIN", "GLOBAL_ADMIN"]), createUserValidation, userController.createUser);
router.get("/organization/:organization_id", auth(["ORG_ADMIN", "GLOBAL_ADMIN"]), userController.getUsersByOrganization);
router.delete("/:id", auth(["ORG_ADMIN", "GLOBAL_ADMIN"]), userController.deleteUser);
router.patch("/:id", auth(["ORG_ADMIN", "GLOBAL_ADMIN"]), userController.updateUser);
router.post("/change-password", auth(), changePasswordValidation, userController.changePassword);
router.post("/:id/reset-password", auth(["ORG_ADMIN", "GLOBAL_ADMIN"]), resetPasswordValidation, userController.resetPassword);

module.exports = router;
