const organizationModel = require("../models/organization.model");
const userModel = require("../models/user.model");
const { generateToken } = require("../services/auth.service");

async function createOrganization(req, res, next) {
  try {
    const { name } = req.body;

    const org = await organizationModel.createOrganization({ name });

    if (req.user.role === "ORG_ADMIN") {
      await userModel.updateUser(req.user.user_id, {
        organization_id: org.organization_id,
      });

      const updatedUser = await userModel.getUserById(req.user.user_id);

      const token = generateToken(updatedUser);

      return res.status(201).json({
        organization: org,
        token,
      });
    }

    res.status(201).json(org);
  } catch (err) {
    next(err);
  }
}

async function getAllOrganizations(req, res, next) {
  try {
    if (req.user.role === "GLOBAL_ADMIN") {
      const orgs = await organizationModel.getAllOrganizations();
      return res.json(orgs);
    }

    if (!req.user.organization_id) {
      return res.json([]);
    }

    const org = await organizationModel.getOrganizationById(req.user.organization_id);
    res.json(org ? [org] : []);
  } catch (err) {
    next(err);
  }
}

async function getOrganizationById(req, res, next) {
  try {
    const org = await organizationModel.getOrganizationById(req.params.id);
    if (!org)
      return next({ type: "BUSINESS_LOGIC", message: "Organization not found", statusCode: 404 });

    if (
      req.user.role !== "GLOBAL_ADMIN" &&
      Number(req.user.organization_id) !== Number(org.organization_id)
    ) {
      return next({
        type: "BUSINESS_LOGIC",
        message: "Access denied",
        statusCode: 403,
      });
    }

    res.json(org);
  } catch (err) {
    next(err);
  }
}

async function updateOrganization(req, res, next) {
  try {
    const existing = await organizationModel.getOrganizationById(req.params.id);
    if (!existing) {
      return next({ type: "BUSINESS_LOGIC", message: "Organization not found", statusCode: 404 });
    }
    
    if (req.user.role !== "GLOBAL_ADMIN" && Number(req.user.organization_id) !== Number(req.params.id)) {
      return next({
        type: "BUSINESS_LOGIC",
        message: "Only GLOBAL_ADMIN or org's admin can update organization",
        statusCode: 403,
      });
    }

    const org = await organizationModel.updateOrganization(req.params.id, req.body);
    res.json(org);
  } catch (err) {
    next(err);
  }
}

async function deleteOrganization(req, res, next) {
  try {
    if (req.user.role !== "GLOBAL_ADMIN") {
      return next({
        type: "BUSINESS_LOGIC",
        message: "Only GLOBAL_ADMIN can delete organizations",
        statusCode: 403,
      });
    }

    await organizationModel.deleteOrganization(req.params.id);
    res.json({ message: "Organization deleted" });
  } catch (err) {
    next(err);
  }
}

module.exports = { 
    createOrganization, 
    getAllOrganizations, 
    getOrganizationById, 
    updateOrganization, 
    deleteOrganization,
};
