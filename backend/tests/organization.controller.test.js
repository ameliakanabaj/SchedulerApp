const organizationController = require("../src/controllers/organization.controller");
const organizationModel = require("../src/models/organization.model");
const userModel = require("../src/models/user.model");

jest.mock("../src/models/organization.model");
jest.mock("../src/models/user.model");

describe("Organization Controller", () => {
  let req, res, next;

  beforeEach(() => {
    req = { body: {}, params: {}, user: {} };
    res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    next = jest.fn();
  });

  describe("createOrganization", () => {
    it("should create organization and assign org_id to ORG_ADMIN", async () => {
      req.user.role = "ORG_ADMIN";
      req.user.user_id = 1;
      req.body.name = "TestOrg";

      organizationModel.createOrganization.mockResolvedValue({ organization_id: 10, name: "TestOrg" });
      userModel.updateUser.mockResolvedValue({});

      await organizationController.createOrganization(req, res, next);

      expect(organizationModel.createOrganization).toHaveBeenCalledWith({ name: "TestOrg" });
      expect(userModel.updateUser).toHaveBeenCalledWith(1, { organization_id: 10 });
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({ organization_id: 10, name: "TestOrg" });
    });

    it("should call next(err) on model error", async () => {
      const error = new Error("DB error");
      organizationModel.createOrganization.mockRejectedValue(error);

      await organizationController.createOrganization(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe("getAllOrganizations", () => {
    it("should return all organizations for GLOBAL_ADMIN", async () => {
      req.user.role = "GLOBAL_ADMIN";
      const orgs = [{ organization_id: 1, name: "Org1" }];
      organizationModel.getAllOrganizations.mockResolvedValue(orgs);

      await organizationController.getAllOrganizations(req, res, next);

      expect(res.json).toHaveBeenCalledWith(orgs);
    });

    it("should return only user's org if not GLOBAL_ADMIN", async () => {
      req.user.role = "ORG_ADMIN";
      req.user.organization_id = 5;
      const org = { organization_id: 5, name: "Org5" };
      organizationModel.getOrganizationById.mockResolvedValue(org);

      await organizationController.getAllOrganizations(req, res, next);

      expect(res.json).toHaveBeenCalledWith([org]);
    });

    it("should return empty array if user has no org and not GLOBAL_ADMIN", async () => {
      req.user.role = "EMPLOYEE";
      req.user.organization_id = null;

      await organizationController.getAllOrganizations(req, res, next);

      expect(res.json).toHaveBeenCalledWith([]);
    });
  });

  describe("getOrganizationById", () => {
    it("should return org for GLOBAL_ADMIN", async () => {
      req.user.role = "GLOBAL_ADMIN";
      req.params.id = 1;
      const org = { organization_id: 1, name: "Org1" };
      organizationModel.getOrganizationById.mockResolvedValue(org);

      await organizationController.getOrganizationById(req, res, next);

      expect(res.json).toHaveBeenCalledWith(org);
    });

    it("should call next with 404 if org not found", async () => {
      req.user.role = "GLOBAL_ADMIN";
      req.params.id = 1;
      organizationModel.getOrganizationById.mockResolvedValue(null);

      await organizationController.getOrganizationById(req, res, next);

      expect(next).toHaveBeenCalledWith({
        type: "BUSINESS_LOGIC",
        message: "Organization not found",
        statusCode: 404,
      });
    });

    it("should call next with 403 if user not allowed to access", async () => {
      req.user.role = "ORG_ADMIN";
      req.user.organization_id = 5;
      req.params.id = 10;
      organizationModel.getOrganizationById.mockResolvedValue({ organization_id: 10 });

      await organizationController.getOrganizationById(req, res, next);

      expect(next).toHaveBeenCalledWith({
        type: "BUSINESS_LOGIC",
        message: "Access denied",
        statusCode: 403,
      });
    });
  });

  describe("updateOrganization", () => {
    it("should update org if GLOBAL_ADMIN", async () => {
      req.user.role = "GLOBAL_ADMIN";
      req.params.id = 1;
      req.body.name = "UpdatedOrg";

      organizationModel.getOrganizationById.mockResolvedValue({ organization_id: 1, name: "Org1" });
      organizationModel.updateOrganization.mockResolvedValue({ organization_id: 1, name: "UpdatedOrg" });

      await organizationController.updateOrganization(req, res, next);

      expect(res.json).toHaveBeenCalledWith({ organization_id: 1, name: "UpdatedOrg" });
    });

    it("should call next with 404 if org not found", async () => {
      req.user.role = "GLOBAL_ADMIN";
      req.params.id = 1;

      organizationModel.getOrganizationById.mockResolvedValue(null);

      await organizationController.updateOrganization(req, res, next);

      expect(next).toHaveBeenCalledWith({
        type: "BUSINESS_LOGIC",
        message: "Organization not found",
        statusCode: 404,
      });
    });

    it("should call next with 403 if not authorized", async () => {
      req.user.role = "ORG_ADMIN";
      req.user.organization_id = 2;
      req.params.id = 5;
      req.body.name = "X";

      organizationModel.getOrganizationById.mockResolvedValue({ organization_id: 5 });

      await organizationController.updateOrganization(req, res, next);

      expect(next).toHaveBeenCalledWith({
        type: "BUSINESS_LOGIC",
        message: "Only GLOBAL_ADMIN or org's admin can update organization",
        statusCode: 403,
      });
    });
  });

  describe("deleteOrganization", () => {
    it("should delete org if GLOBAL_ADMIN", async () => {
      req.user.role = "GLOBAL_ADMIN";
      req.params.id = 1;
      organizationModel.deleteOrganization.mockResolvedValue(true);

      await organizationController.deleteOrganization(req, res, next);

      expect(res.json).toHaveBeenCalledWith({ message: "Organization deleted" });
    });

    it("should call next with 403 if not GLOBAL_ADMIN", async () => {
      req.user.role = "ORG_ADMIN";
      req.params.id = 1;

      await organizationController.deleteOrganization(req, res, next);

      expect(next).toHaveBeenCalledWith({
        type: "BUSINESS_LOGIC",
        message: "Only GLOBAL_ADMIN can delete organizations",
        statusCode: 403,
      });
    });
  });
});
