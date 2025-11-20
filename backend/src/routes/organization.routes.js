const express = require("express");
const router = express.Router();
const controller = require("../controllers/organization.controller");
const auth = require("../middlewares/auth.middleware");
const { createOrganizationValidation, updateOrganizationValidation } = require("../validations/organization.validation");

router.post("/", auth(["GLOBAL_ADMIN", "ORG_ADMIN"]), createOrganizationValidation, controller.createOrganization);
router.get("/", auth(), controller.getAllOrganizations);
router.get("/:id", auth(), controller.getOrganizationById);
router.patch("/:id", auth(["GLOBAL_ADMIN"]), updateOrganizationValidation, controller.updateOrganization);
router.delete("/:id", auth(["GLOBAL_ADMIN"]), controller.deleteOrganization);

module.exports = router;
