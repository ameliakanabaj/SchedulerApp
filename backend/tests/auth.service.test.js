const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const authService = require("../src/services/auth.service");
const userModel = require("../src/models/user.model");

jest.mock("bcrypt");
jest.mock("jsonwebtoken");
jest.mock("../src/models/user.model");

describe("Auth Service", () => {

  describe("generateToken", () => {
    it("should return a JWT token containing user_id, role, organization_id", () => {
      const user = { user_id: 1, role: "EMPLOYEE", organization_id: 2 };
      jwt.sign.mockReturnValue("mockedToken");

      const token = authService.generateToken(user);

      expect(token).toBe("mockedToken");
      expect(jwt.sign).toHaveBeenCalledWith(
        { user_id: 1, role: "EMPLOYEE", organization_id: 2 },
        expect.any(String),
        { expiresIn: "30d" }
      );
    });

    it("should handle organization_id inside user.organization", () => {
      const user = { user_id: 1, role: "EMPLOYEE", organization: { organization_id: 5 } };
      jwt.sign.mockReturnValue("mockedToken");

      const token = authService.generateToken(user);

      expect(token).toBe("mockedToken");
      expect(jwt.sign).toHaveBeenCalledWith(
        { user_id: 1, role: "EMPLOYEE", organization_id: 5 },
        expect.any(String),
        { expiresIn: "30d" }
      );
    });

    it("should handle missing organization_id gracefully", () => {
      const user = { user_id: 1, role: "EMPLOYEE" };
      jwt.sign.mockReturnValue("mockedToken");

      const token = authService.generateToken(user);

      expect(token).toBe("mockedToken");
      expect(jwt.sign).toHaveBeenCalledWith(
        { user_id: 1, role: "EMPLOYEE", organization_id: null },
        expect.any(String),
        { expiresIn: "30d" }
      );
    });
  });

  describe("register", () => {
    it("should throw if email already exists", async () => {
      userModel.getUserByEmail.mockResolvedValue({ email: "test@test.com" });

      await expect(authService.register({ email: "test@test.com" }))
        .rejects
        .toThrow("Email already exists");
    });

    it("should create a new user, hash password, and set password_must_be_reset to false", async () => {
      const inputData = { 
        email: "test@gmail.com", 
        password: "Password123", 
        first_name: "Ann", 
        last_name: "Bell",
        position: "Manager"
      };

      userModel.getUserByEmail.mockResolvedValue(null);
      bcrypt.hash.mockResolvedValue("hashedPassword");
      const createdUser = { 
        user_id: 1, 
        email: "test@gmail.com", 
        role: "ORG_ADMIN",
        password: "hashedPassword",
        position: "Manager",
        password_must_be_reset: false
      };
      userModel.createUser.mockResolvedValue(createdUser);
      jwt.sign.mockReturnValue("mockedToken");

      const result = await authService.register(inputData);

      expect(userModel.createUser).toHaveBeenCalledWith(expect.objectContaining({
        email: "test@gmail.com",
        password_hash: "hashedPassword",
        role: "ORG_ADMIN",
        password_must_be_reset: false,
      }));

      expect(result).toHaveProperty("token", "mockedToken");
      expect(result.user).toHaveProperty("email", "test@gmail.com");
      expect(result.user).toHaveProperty("password_must_be_reset", false);
      expect(result.user.password).toBeUndefined();
    });
  });

  describe("login", () => {
    it("should throw if email not found", async () => {
      userModel.getUserByEmail.mockResolvedValue(null);

      await expect(authService.login({ email: "test@gmail.com", password: "Password123" }))
        .rejects
        .toThrow("Invalid credentials");
    });

    it("should throw if password does not match", async () => {
      userModel.getUserByEmail.mockResolvedValue({ password: "hashed" });
      bcrypt.compare.mockResolvedValue(false);

      await expect(authService.login({ email: "test@gmail.com", password: "wrong" }))
        .rejects
        .toThrow("Invalid credentials");

      expect(bcrypt.compare).toHaveBeenCalledWith("wrong", "hashed");
    });

    it("should return user and token on success and remove password from user object", async () => {
      const mockUser = { user_id: 1, email: "test@gmail.com", password: "hashed", role: "EMPLOYEE" };
      userModel.getUserByEmail.mockResolvedValue(mockUser);
      bcrypt.compare.mockResolvedValue(true);
      jwt.sign.mockReturnValue("mockedToken");

      const result = await authService.login({ email: "test@gmail.com", password: "Password123" });

      expect(bcrypt.compare).toHaveBeenCalledWith("Password123", "hashed");
      expect(result).toEqual({ token: "mockedToken", user: { user_id: 1, email: "test@gmail.com", role: "EMPLOYEE" } });
      expect(result.user.password).toBeUndefined();
    });

    it("should include password_must_be_reset flag in the returned user object", async () => {
        const mockUserWithFlag = { 
            user_id: 2, 
            email: "admin_created@gmail.com", 
            password: "hashed", 
            role: "EMPLOYEE",
            password_must_be_reset: true
        };
        userModel.getUserByEmail.mockResolvedValue(mockUserWithFlag);
        bcrypt.compare.mockResolvedValue(true);
        jwt.sign.mockReturnValue("mockedTokenForReset");

        const result = await authService.login({ email: "admin_created@gmail.com", password: "Password123" });

        expect(result.user).toHaveProperty("password_must_be_reset", true);
        
        expect(result.user.password).toBeUndefined();
    });
  });
});
