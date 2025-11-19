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
  });

  describe("register", () => {
    it("should throw if email already exists", async () => {
      userModel.getUserByEmail.mockResolvedValue({ email: "test@test.com" });

      await expect(authService.register({ email: "test@test.com" }))
        .rejects
        .toThrow("Email already exists");
    });

    it("should create a new user and return token", async () => {
      userModel.getUserByEmail.mockResolvedValue(null);
      bcrypt.hash.mockResolvedValue("hashedPassword");
      userModel.createUser.mockResolvedValue({ user_id: 1, email: "test@gmail.com", role: "ORG_ADMIN" });
      jwt.sign.mockReturnValue("mockedToken");

      const result = await authService.register({ email: "test@gmail.com", password: "Password123", first_name: "Anna", last_name: "Bell" });

      expect(result).toHaveProperty("token", "mockedToken");
      expect(result.user).toHaveProperty("email", "test@gmail.com");
    });
  });

  describe("login", () => {
    it("should throw if email not found", async () => {
      userModel.getUserByEmail.mockResolvedValue(null);

      await expect(authService.login({ email: "test@gmail.com", password: "Password123" }))
        .rejects.toThrow("Invalid credentials");
    });

    it("should throw if password does not match", async () => {
      userModel.getUserByEmail.mockResolvedValue({ password: "hashed" });
      bcrypt.compare.mockResolvedValue(false);

      await expect(authService.login({ email: "test@gmail.com", password: "wrong" }))
        .rejects.toThrow("Invalid credentials");
    });

    it("should return user and token on success", async () => {
      userModel.getUserByEmail.mockResolvedValue({ user_id: 1, email: "test@gmail.com", password: "hashed", role: "EMPLOYEE" });
      bcrypt.compare.mockResolvedValue(true);
      jwt.sign.mockReturnValue("mockedToken");

      const result = await authService.login({ email: "test@gmail.com", password: "Password123" });

      expect(result).toEqual({ token: "mockedToken", user: { user_id: 1, email: "test@gmail.com", role: "EMPLOYEE" } });
    });
  });
});
