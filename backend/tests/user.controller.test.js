const userController = require("../src/controllers/user.controller");
const userModel = require("../src/models/user.model");
const authService = require("../src/services/auth.service");
const bcrypt = require("bcrypt");

jest.mock("../src/models/user.model");
jest.mock("../src/services/auth.service");
jest.mock("bcrypt");

describe("User Controller", () => {
  let req, res, next;

  beforeEach(() => {
    req = { body: {}, params: {}, user: {} };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    next = jest.fn();

    jest.clearAllMocks();
  });

  describe("getMe", () => {
    it("should return current user without password", async () => {
      req.user.user_id = 1;
      const dbUser = { user_id: 1, email: "test@gmail.com", password: "hashed", role: "EMPLOYEE" };
      userModel.getUserById.mockResolvedValue(dbUser);

      await userController.getMe(req, res, next);

      expect(res.json).toHaveBeenCalledWith({ user_id: 1, email: "test@gmail.com", role: "EMPLOYEE" });
    });

    it("should call next with 404 if user not found", async () => {
      req.user.user_id = 1;
      userModel.getUserById.mockResolvedValue(null);

      await userController.getMe(req, res, next);

      expect(next).toHaveBeenCalledWith({
        type: "BUSINESS_LOGIC",
        message: "User not found",
        statusCode: 404,
      });
    });

    it("should call next if db throws error", async () => {
      req.user.user_id = 1;
      const error = new Error("DB error");
      userModel.getUserById.mockRejectedValue(error);

      await userController.getMe(req, res, next);
      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe("getUserById", () => {
    it("should return user for GLOBAL_ADMIN", async () => {
      req.user.role = "GLOBAL_ADMIN";
      req.params.id = 1;
      const dbUser = { user_id: 1, email: "test@gmail.com", password: "hashed", role: "EMPLOYEE", organization_id: 10 };
      userModel.getUserById.mockResolvedValue(dbUser);

      await userController.getUserById(req, res, next);

      expect(res.json).toHaveBeenCalledWith({ user_id: 1, email: "test@gmail.com", role: "EMPLOYEE", organization_id: 10 });
    });

    it("should return user for ORG_ADMIN if same organization", async () => {
      req.user.role = "ORG_ADMIN";
      req.user.organization_id = 10;
      req.params.id = 1;
      const dbUser = { user_id: 1, email: "test@gmail.com", password: "hashed", role: "EMPLOYEE", organization_id: 10 };
      userModel.getUserById.mockResolvedValue(dbUser);

      await userController.getUserById(req, res, next);

      expect(res.json).toHaveBeenCalledWith({ user_id: 1, email: "test@gmail.com", role: "EMPLOYEE", organization_id: 10 });
    });

    it("should call next with 403 if ORG_ADMIN accessing other org", async () => {
      req.user.role = "ORG_ADMIN";
      req.user.organization_id = 2;
      req.params.id = 1;
      const dbUser = { user_id: 1, email: "test@gmail.com", password: "hashed", role: "EMPLOYEE", organization_id: 10 };
      userModel.getUserById.mockResolvedValue(dbUser);

      await userController.getUserById(req, res, next);

      expect(next).toHaveBeenCalledWith({
        type: "BUSINESS_LOGIC",
        message: "Forbidden: You can only view users from your organization",
        statusCode: 403,
      });
    });

    it("should call next with 404 if user not found", async () => {
      req.user.role = "GLOBAL_ADMIN";
      req.params.id = 1;
      userModel.getUserById.mockResolvedValue(null);

      await userController.getUserById(req, res, next);

      expect(next).toHaveBeenCalledWith({
        type: "BUSINESS_LOGIC",
        message: "User not found",
        statusCode: 404,
      });
    });
  });

  describe("getAllUsers", () => {
    it("should return all users for GLOBAL_ADMIN", async () => {
      req.user.role = "GLOBAL_ADMIN";
      const users = [{ user_id: 1, email: "test@gmail.com", password: "hashed", role: "EMPLOYEE" }];
      userModel.getAllUsers.mockResolvedValue(users);

      await userController.getAllUsers(req, res, next);

      expect(res.json).toHaveBeenCalledWith([{ user_id: 1, email: "test@gmail.com", role: "EMPLOYEE" }]);
    });

    it("should return users from org for ORG_ADMIN", async () => {
      req.user.role = "ORG_ADMIN";
      req.user.organization_id = 10;
      const users = [
        { user_id: 1, email: "test@gmail.com", password: "hashed", role: "EMPLOYEE", organization_id: 10 },
      ];
      userModel.getUsersByOrganization.mockResolvedValue(users);

      await userController.getAllUsers(req, res, next);

      expect(res.json).toHaveBeenCalledWith([{ user_id: 1, email: "test@gmail.com", role: "EMPLOYEE", organization_id: 10 }]);
    });

    it("should call next with 403 if EMPLOYEE tries to getAllUsers", async () => {
      req.user.role = "EMPLOYEE";

      await userController.getAllUsers(req, res, next);

      expect(next).toHaveBeenCalledWith({ type: "BUSINESS_LOGIC", message: "Forbidden", statusCode: 403 });
    });
  });

  describe("createUser", () => {
    beforeEach(() => {
      req.body = { first_name: "Anna", last_name: "Bell", email: "test@gmail.com", password: "Password123", role: "EMPLOYEE" };
    });

    it("should create user and return 201 + token", async () => {
      req.user.role = "GLOBAL_ADMIN";
      const newUser = { user_id: 1, email: "test@gmail.com", password: "hashed", role: "EMPLOYEE", organization_id: null };
      userModel.getUserByEmail.mockResolvedValue(null);
      userModel.createUser.mockResolvedValue(newUser);
      authService.generateToken.mockReturnValue("token123");
      bcrypt.hash.mockResolvedValue("hashed");

      await userController.createUser(req, res, next);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        message: "User created successfully",
        user: { user_id: 1, email: "test@gmail.com", role: "EMPLOYEE", organization_id: null },
        token: "token123",
      });
    });

    it("should call next with 400 if email already exists", async () => {
      req.user.role = "GLOBAL_ADMIN";
      userModel.getUserByEmail.mockResolvedValue({ email: "test@gmail.com" });

      await userController.createUser(req, res, next);

      expect(next).toHaveBeenCalledWith({ type: "BUSINESS_LOGIC", message: "Email already in use", statusCode: 400 });
    });

    it("should call next with 403 if ORG_ADMIN tries to create user in another org", async () => {
      req.user.role = "ORG_ADMIN";
      req.user.organization_id = 5;
      req.body.organization_id = 10;

      await userController.createUser(req, res, next);

      expect(next).toHaveBeenCalledWith({
        type: "BUSINESS_LOGIC",
        message: "You can only create users in your organization",
        statusCode: 403,
      });
    });
  });

  describe("getUsersByOrganization", () => {
    it("should return users from organization for allowed ORG_ADMIN", async () => {
      req.user.role = "ORG_ADMIN";
      req.user.organization_id = 10;
      req.params.organization_id = 10;
      const users = [{ user_id: 1, email: "test@gmail.com", password: "hashed", role: "EMPLOYEE" }];
      userModel.getUsersByOrganization.mockResolvedValue(users);

      await userController.getUsersByOrganization(req, res, next);

      expect(res.json).toHaveBeenCalledWith([{ user_id: 1, email: "test@gmail.com", role: "EMPLOYEE" }]);
    });

    it("should call next 403 if ORG_ADMIN accessing another org", async () => {
      req.user.role = "ORG_ADMIN";
      req.user.organization_id = 2;
      req.params.organization_id = 10;

      await userController.getUsersByOrganization(req, res, next);

      expect(next).toHaveBeenCalledWith({
        type: "BUSINESS_LOGIC",
        message: "You can only view users from your organization",
        statusCode: 403,
      });
    });
  });

  describe("deleteUser", () => {
    it("should delete user for allowed GLOBAL_ADMIN", async () => {
      req.user.role = "GLOBAL_ADMIN";
      req.params.id = 1;
      const targetUser = { user_id: 1, organization_id: 5 };
      userModel.getUserById.mockResolvedValue(targetUser);
      userModel.deleteUser.mockResolvedValue(true);

      await userController.deleteUser(req, res, next);

      expect(res.json).toHaveBeenCalledWith({ message: "User deleted" });
    });

    it("should call next 403 if ORG_ADMIN deleting user from another org", async () => {
      req.user.role = "ORG_ADMIN";
      req.user.organization_id = 2;
      req.params.id = 1;
      const targetUser = { user_id: 1, organization_id: 5 };
      userModel.getUserById.mockResolvedValue(targetUser);

      await userController.deleteUser(req, res, next);

      expect(next).toHaveBeenCalledWith({
        type: "BUSINESS_LOGIC",
        message: "You can only delete users from your organization",
        statusCode: 403,
      });
    });

    it("should call next 404 if target user not found", async () => {
      req.params.id = 1;
      req.user.role = "GLOBAL_ADMIN";
      userModel.getUserById.mockResolvedValue(null);

      await userController.deleteUser(req, res, next);

      expect(next).toHaveBeenCalledWith({
        type: "BUSINESS_LOGIC",
        message: "User not found",
        statusCode: 404,
      });
    });
  });

  describe("updateUser", () => {
    it("should update allowed user and remove password", async () => {
      req.user.role = "GLOBAL_ADMIN";
      req.params.id = 1;
      req.body = { first_name: "New" };
      const targetUser = { user_id: 1, organization_id: 5 };
      const updatedUser = { user_id: 1, first_name: "New", password: "hashed", organization_id: 5 };
      userModel.getUserById.mockResolvedValue(targetUser);
      userModel.updateUser.mockResolvedValue(updatedUser);

      await userController.updateUser(req, res, next);

      expect(res.json).toHaveBeenCalledWith({ user_id: 1, first_name: "New", organization_id: 5 });
    });

    it("should call next 403 if ORG_ADMIN updating user from another org", async () => {
      req.user.role = "ORG_ADMIN";
      req.user.organization_id = 2;
      req.params.id = 1;
      const targetUser = { user_id: 1, organization_id: 5 };
      userModel.getUserById.mockResolvedValue(targetUser);

      await userController.updateUser(req, res, next);

      expect(next).toHaveBeenCalledWith({
        type: "BUSINESS_LOGIC",
        message: "You can only update users from your organization",
        statusCode: 403,
      });
    });

    it("should call next 404 if target user not found", async () => {
      req.user.role = "GLOBAL_ADMIN";
      req.params.id = 1;
      userModel.getUserById.mockResolvedValue(null);

      await userController.updateUser(req, res, next);

      expect(next).toHaveBeenCalledWith({
        type: "BUSINESS_LOGIC",
        message: "User not found",
        statusCode: 404,
      });
    });
  });

  describe("changePassword", () => {
    it("should change password successfully", async () => {
      req.user.user_id = 1;
      req.body = { current_password: "old", new_password: "new" };
      const user = { user_id: 1, password: "hashed" };
      userModel.getUserById.mockResolvedValue(user);
      bcrypt.compare.mockResolvedValue(true);
      bcrypt.hash.mockResolvedValue("newHashed");

      await userController.changePassword(req, res, next);

      expect(userModel.updateUser).toHaveBeenCalledWith(1, { password: "newHashed" });
      expect(res.json).toHaveBeenCalledWith({ message: "Password updated successfully" });
    });

    it("should fail if current password incorrect", async () => {
      req.user.user_id = 1;
      req.body = { current_password: "old", new_password: "new" };
      userModel.getUserById.mockResolvedValue({ password: "hashed" });
      bcrypt.compare.mockResolvedValue(false);

      await userController.changePassword(req, res, next);

      expect(next).toHaveBeenCalledWith({
        type: "BUSINESS_LOGIC",
        message: "Current password is incorrect",
        statusCode: 400,
      });
    });

    it("should fail if new password same as current", async () => {
      req.user.user_id = 1;
      req.body = { current_password: "same", new_password: "same" };
      const user = { password: "same" };
      userModel.getUserById.mockResolvedValue(user);
      bcrypt.compare.mockResolvedValue(true);

      await userController.changePassword(req, res, next);

      expect(next).toHaveBeenCalledWith({
        type: "BUSINESS_LOGIC",
        message: "New password must be different",
        statusCode: 400,
      });
    });

    it("should fail if user not found", async () => {
      req.user.user_id = 1;
      userModel.getUserById.mockResolvedValue(null);

      await userController.changePassword(req, res, next);

      expect(next).toHaveBeenCalledWith({
        type: "BUSINESS_LOGIC",
        message: "User not found",
        statusCode: 404,
      });
    });
  });

  describe("resetPassword", () => {
    it("should reset password for GLOBAL_ADMIN", async () => {
      req.user.role = "GLOBAL_ADMIN";
      req.params.id = 1;
      req.body = { new_password: "new" };
      const targetUser = { user_id: 1, email: "test@gmail.com", organization_id: 5 };
      userModel.getUserById.mockResolvedValue(targetUser);
      bcrypt.hash.mockResolvedValue("hashed");

      await userController.resetPassword(req, res, next);

      expect(userModel.updateUser).toHaveBeenCalledWith(1, { password: "hashed" });
      expect(res.json).toHaveBeenCalledWith({ message: `Password reset successfully for user ${targetUser.email}` });
    });

    it("should fail if user role not allowed", async () => {
      req.user.role = "EMPLOYEE";
      req.params.id = 1;

      await userController.resetPassword(req, res, next);

      expect(next).toHaveBeenCalledWith({
        type: "BUSINESS_LOGIC",
        message: "Forbidden: insufficient privileges",
        statusCode: 403,
      });
    });

    it("should fail if ORG_ADMIN resets password of another org", async () => {
      req.user.role = "ORG_ADMIN";
      req.user.organization_id = 2;
      req.params.id = 1;
      const targetUser = { organization_id: 5 };
      userModel.getUserById.mockResolvedValue(targetUser);

      await userController.resetPassword(req, res, next);

      expect(next).toHaveBeenCalledWith({
        type: "BUSINESS_LOGIC",
        message: "You can only reset passwords for users in your organization",
        statusCode: 403,
      });
    });

    it("should fail if target user not found", async () => {
      req.user.role = "GLOBAL_ADMIN";
      req.params.id = 1;
      userModel.getUserById.mockResolvedValue(null);

      await userController.resetPassword(req, res, next);

      expect(next).toHaveBeenCalledWith({
        type: "BUSINESS_LOGIC",
        message: "User not found",
        statusCode: 404,
      });
    });
  });
});
