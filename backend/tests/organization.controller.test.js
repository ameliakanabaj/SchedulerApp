const organizationController = require("../src/controllers/organization.controller");
const organizationModel = require("../src/models/organization.model");
const userModel = require("../src/models/user.model");
const authService = require("../src/services/auth.service");

jest.mock("../src/models/organization.model");
jest.mock("../src/models/user.model");
jest.mock("../src/services/auth.service");

describe("Organization Controller", () => {
  let req, res, next;

  beforeEach(() => {
    req = { body: {}, params: {}, user: {} };
    res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    next = jest.fn();

    jest.clearAllMocks();
  });

  describe("createOrganization", () => {
    it("should create organization and assign org_id to ORG_ADMIN", async () => {
      req.body = { name: "TestOrg" };
      req.user = { user_id: 1, role: "ORG_ADMIN" };

      organizationModel.createOrganization.mockResolvedValue({
        organization_id: 10,
        name: "TestOrg"
      });

      userModel.updateUser.mockResolvedValue({});
      userModel.getUserById.mockResolvedValue({
        user_id: 1,
        role: "ORG_ADMIN",
        organization_id: 10
      });

      authService.generateToken.mockReturnValue("FAKE_TOKEN");

      await organizationController.createOrganization(req, res, next);

      expect(organizationModel.createOrganization).toHaveBeenCalledWith({ name: "TestOrg" });
      expect(userModel.updateUser).toHaveBeenCalledWith(1, { organization_id: 10 });
      expect(authService.generateToken).toHaveBeenCalledWith({
        user_id: 1,
        role: "ORG_ADMIN",
        organization_id: 10
      });
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        organization: { organization_id: 10, name: "TestOrg" },
        token: "FAKE_TOKEN"
      });
    });

    it("should call next(err) on model error", async () => {
      const error = new Error("DB error");
      organizationModel.createOrganization.mockRejectedValue(error);

      await organizationController.createOrganization(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
    });

    it("should NOT call updateUser for non-ORG_ADMIN", async () => {
      req.user.role = "EMPLOYEE";
      req.body.name = "TestOrg";

      organizationModel.createOrganization.mockResolvedValue({ organization_id: 10, name: "TestOrg" });

      await organizationController.createOrganization(req, res, next);

      expect(userModel.updateUser).not.toHaveBeenCalled();
    });

    it("should call next(err) if updateUser throws error", async () => {
      req.user.role = "ORG_ADMIN";
      req.user.user_id = 1;
      req.body.name = "Org";

      organizationModel.createOrganization.mockResolvedValue({ organization_id: 10, name: "Org" });
      const error = new Error("Update error");
      userModel.updateUser.mockRejectedValue(error);

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

    it("should call next(err) if getAllOrganizations throws", async () => {
      req.user.role = "GLOBAL_ADMIN";

      const error = new Error("DB error");
      organizationModel.getAllOrganizations.mockRejectedValue(error);

      await organizationController.getAllOrganizations(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
    });

    it("should call next(err) if getOrganizationById throws error for non-global admin", async () => {
      req.user.role = "ORG_ADMIN";
      req.user.organization_id = 5;

      const error = new Error("DB error");
      organizationModel.getOrganizationById.mockRejectedValue(error);

      await organizationController.getAllOrganizations(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
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

    it("should return org for ORG_ADMIN when organization_id matches", async () => {
      req.user.role = "ORG_ADMIN";
      req.user.organization_id = 3;
      req.params.id = 3;

      const org = { organization_id: 3, name: "OrgX" };
      organizationModel.getOrganizationById.mockResolvedValue(org);

      await organizationController.getOrganizationById(req, res, next);

      expect(res.json).toHaveBeenCalledWith(org);
    });

    it("should call next(err) if getOrganizationById throws error", async () => {
      req.user.role = "GLOBAL_ADMIN";
      req.params.id = 1;

      const error = new Error("DB error");
      organizationModel.getOrganizationById.mockRejectedValue(error);

      await organizationController.getOrganizationById(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
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

    it("should call next(err) if updateOrganization throws", async () => {
      req.user.role = "GLOBAL_ADMIN";
      req.params.id = 1;
      req.body = { name: "X" };

      organizationModel.getOrganizationById.mockResolvedValue({ organization_id: 1 });
      const error = new Error("DB error");
      organizationModel.updateOrganization.mockRejectedValue(error);

      await organizationController.updateOrganization(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
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

    it("should call next(err) if deleteOrganization throws", async () => {
      req.user.role = "GLOBAL_ADMIN";
      req.params.id = 1;

      const error = new Error("DB error");
      organizationModel.deleteOrganization.mockRejectedValue(error);

      await organizationController.deleteOrganization(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
    });

    it("should call deleteOrganization with correct ID", async () => {
      req.user.role = "GLOBAL_ADMIN";
      req.params.id = 123;

      organizationModel.deleteOrganization.mockResolvedValue(true);

      await organizationController.deleteOrganization(req, res, next);

      expect(organizationModel.deleteOrganization).toHaveBeenCalledWith(123);
    });
  });
});
