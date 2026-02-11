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

  const dbUserFull = { 
    user_id: 1, 
    email: "test@gmail.com", 
    password: "hashed", 
    role: "EMPLOYEE", 
    organization_id: 10,
    google_access_token: "access_123",
    google_refresh_token: "refresh_123"
  };

  const expectedSafeUser = { 
    user_id: 1, 
    email: "test@gmail.com", 
    role: "EMPLOYEE", 
    organization_id: 10,
    is_google_connected: true 
  };

  describe("getMe", () => {
    it("should return current user without password and tokens, but with is_google_connected", async () => {
      req.user.user_id = 1;
      userModel.getUserById.mockResolvedValue(dbUserFull);

      await userController.getMe(req, res, next);

      expect(res.json).toHaveBeenCalledWith(expectedSafeUser);
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
      userModel.getUserById.mockResolvedValue(dbUserFull);

      await userController.getUserById(req, res, next);

      expect(res.json).toHaveBeenCalledWith(expectedSafeUser);
    });

    it("should return user for ORG_ADMIN if same organization", async () => {
      req.user.role = "ORG_ADMIN";
      req.user.organization_id = 10;
      req.params.id = 1;
      userModel.getUserById.mockResolvedValue(dbUserFull);

      await userController.getUserById(req, res, next);

      expect(res.json).toHaveBeenCalledWith(expectedSafeUser);
    });

    it("should call next with 403 if ORG_ADMIN accessing other org", async () => {
      req.user.role = "ORG_ADMIN";
      req.user.organization_id = 2;
      req.params.id = 1;
      userModel.getUserById.mockResolvedValue(dbUserFull);

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
      userModel.getAllUsers.mockResolvedValue([dbUserFull]);

      await userController.getAllUsers(req, res, next);

      expect(res.json).toHaveBeenCalledWith([expectedSafeUser]);
    });

    it("should return users from org for ORG_ADMIN", async () => {
      req.user.role = "ORG_ADMIN";
      req.user.organization_id = 10;
      userModel.getUsersByOrganization.mockResolvedValue([dbUserFull]);

      await userController.getAllUsers(req, res, next);

      expect(res.json).toHaveBeenCalledWith([expectedSafeUser]);
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

    it("should create user and return 201 + token and safe user (no tokens)", async () => {
      req.user.role = "GLOBAL_ADMIN";
      const newUserInDb = { 
        ...dbUserFull,
        organization_id: null, 
        password_must_be_reset: true
      };
      userModel.getUserByEmail.mockResolvedValue(null);
      userModel.createUser.mockResolvedValue(newUserInDb);
      authService.generateToken.mockReturnValue("token123");
      bcrypt.hash.mockResolvedValue("hashed");

      await userController.createUser(req, res, next);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        message: "User created successfully",
        user: { 
          user_id: 1, 
          email: "test@gmail.com", 
          role: "EMPLOYEE", 
          organization_id: null, 
          password_must_be_reset: true,
          is_google_connected: true 
        },
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

    it("should call next if getUserByEmail throws error", async () => {
      req.user.role = "GLOBAL_ADMIN";
      const error = new Error("DB error");
      userModel.getUserByEmail.mockRejectedValue(error);

      await userController.createUser(req, res, next);
      expect(next).toHaveBeenCalledWith(error);
    });

    it("should call next if createUser throws error", async () => {
      req.user.role = "GLOBAL_ADMIN";
      userModel.getUserByEmail.mockResolvedValue(null);
      const error = new Error("DB error");
      userModel.createUser.mockRejectedValue(error);
      bcrypt.hash.mockResolvedValue("hashed");

      await userController.createUser(req, res, next);
      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe("getUsersByOrganization", () => {
    it("should return safe users from organization for allowed ORG_ADMIN", async () => {
      req.user.role = "ORG_ADMIN";
      req.user.organization_id = 10;
      req.params.organization_id = 10;
      userModel.getUsersByOrganization.mockResolvedValue([dbUserFull]);

      await userController.getUsersByOrganization(req, res, next);

      expect(res.json).toHaveBeenCalledWith([expectedSafeUser]);
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

    it("should allow GLOBAL_ADMIN to get users and return safe data", async () => {
      req.user.role = "GLOBAL_ADMIN";
      req.params.organization_id = 10;
      userModel.getUsersByOrganization.mockResolvedValue([dbUserFull]);

      await userController.getUsersByOrganization(req, res, next);

      expect(res.json).toHaveBeenCalledWith([expectedSafeUser]);
    });

    it("should call next if getUsersByOrganization rejects", async () => {
      req.user.role = "GLOBAL_ADMIN";
      req.params.organization_id = 10;
      const error = new Error("DB error");
      userModel.getUsersByOrganization.mockRejectedValue(error);

      await userController.getUsersByOrganization(req, res, next);
      expect(next).toHaveBeenCalledWith(error);
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
    it("should update allowed user and return safe data (no password/tokens)", async () => {
      req.user.role = "GLOBAL_ADMIN";
      req.params.id = 1;
      req.body = { first_name: "New" };
      
      const targetUser = { user_id: 1, organization_id: 5 };
      const updatedUserInDb = { 
        ...dbUserFull, 
        first_name: "New", 
        organization_id: 5 
      };
      
      userModel.getUserById.mockResolvedValue(targetUser);
      userModel.updateUser.mockResolvedValue(updatedUserInDb);

      await userController.updateUser(req, res, next);

      expect(res.json).toHaveBeenCalledWith({ 
        user_id: 1, 
        email: "test@gmail.com",
        role: "EMPLOYEE",
        first_name: "New", 
        organization_id: 5,
        is_google_connected: true 
      });
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
    it("should change password successfully and set password_must_be_reset to false", async () => {
      req.user.user_id = 1;
      req.body = { current_password: "old", new_password: "new" };
      const user = { user_id: 1, password: "hashed" };
      userModel.getUserById.mockResolvedValue(user);
      bcrypt.compare.mockResolvedValue(true);
      bcrypt.hash.mockResolvedValue("newHashed");

      await userController.changePassword(req, res, next);

      expect(userModel.updateUser).toHaveBeenCalledWith(1, { 
        password: "newHashed",
        password_must_be_reset: false,
      });
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
    it("should reset password for GLOBAL_ADMIN and set password_must_be_reset to true", async () => {
      req.user.role = "GLOBAL_ADMIN";
      req.params.id = 1;
      req.body = { new_password: "new" };
      const targetUser = { user_id: 1, email: "test@gmail.com", organization_id: 5 };
      userModel.getUserById.mockResolvedValue(targetUser);
      bcrypt.hash.mockResolvedValue("hashed");

      await userController.resetPassword(req, res, next);

      expect(userModel.updateUser).toHaveBeenCalledWith(1, { 
        password: "hashed",
        password_must_be_reset: true,
      });
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

    it("should call next if bcrypt.hash fails", async () => {
      req.user.role = "GLOBAL_ADMIN";
      req.params.id = 1;
      req.body = { new_password: "new" };
      const targetUser = { user_id: 1, email: "test@gmail.com", organization_id: 5 };
      userModel.getUserById.mockResolvedValue(targetUser);
      bcrypt.hash.mockRejectedValue(new Error("hash error"));

      await userController.resetPassword(req, res, next);
      expect(next).toHaveBeenCalledWith(expect.any(Error));
    });

    it("should call next if updateUser fails", async () => {
      req.user.role = "GLOBAL_ADMIN";
      req.params.id = 1;
      req.body = { new_password: "new" };
      const targetUser = { user_id: 1, email: "test@gmail.com", organization_id: 5 };
      userModel.getUserById.mockResolvedValue(targetUser);
      bcrypt.hash.mockResolvedValue("hashed");
      userModel.updateUser.mockRejectedValue(new Error("DB error"));

      await userController.resetPassword(req, res, next);
      expect(next).toHaveBeenCalledWith(expect.any(Error));
    });
  });
});
