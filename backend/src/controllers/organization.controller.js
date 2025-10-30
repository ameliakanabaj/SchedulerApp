const organizationModel = require("../models/organization.model");

async function createOrganization(req, res, next) {
  try {
    if (req.user.role !== "GLOBAL_ADMIN") {
      return next({ type: "BUSINESS_LOGIC", message: "Only GLOBAL_ADMIN can create organizations", statusCode: 403 });
    }

    const org = await organizationModel.createOrganization(req.body);
    res.status(201).json(org);
  } catch (err) {
    next(err);
  }
}

async function getAllOrganizations(req, res, next) {
  try {
    if (req.user.role === "ORG_ADMIN" || req.user.role === "EMPLOYEE") {
      const org = await organizationModel.getOrganizationById(req.user.organization_id);
      return res.json([org]);
    }

    const orgs = await organizationModel.getAllOrganizations();
    res.json(orgs);
  } catch (err) {
    next(err);
  }
}

async function getOrganizationById(req, res, next) {
  try {
    const org = await organizationModel.getOrganizationById(req.params.id);
    if (!org) return next({ type: "BUSINESS_LOGIC", message: "Organization not found", statusCode: 404 });

    if (req.user.role !== "GLOBAL_ADMIN" && req.user.organization_id !== org.organization_id) {
      return next({ type: "BUSINESS_LOGIC", message: "Access denied", statusCode: 403 });
    }

    res.json(org);
  } catch (err) {
    next(err);
  }
}

async function updateOrganization(req, res, next) {
  try {
    if (req.user.role !== "GLOBAL_ADMIN") {
      return next({ type: "BUSINESS_LOGIC", message: "Only GLOBAL_ADMIN can update organizations", statusCode: 403 });
    }

    const org = await organizationModel.updateOrganization(req.params.id, req.body);
    if (!org) return next({ type: "BUSINESS_LOGIC", message: "Organization not found", statusCode: 404 });

    res.json(org);
  } catch (err) {
    next(err);
  }
}

async function deleteOrganization(req, res, next) {
  try {
    if (req.user.role !== "GLOBAL_ADMIN") {
      return next({ type: "BUSINESS_LOGIC", message: "Only GLOBAL_ADMIN can delete organizations", statusCode: 403 });
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
    deleteOrganization 
};
