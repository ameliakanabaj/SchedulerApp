beforeEach(() => {
  jest.resetModules();
  jest.clearAllMocks();
});

describe("User Model", () => {
  let userModel;
  let prisma;

  beforeEach(() => {
    jest.mock("../src/generated/prisma", () => {
      const prismaMock = {
        user: {
          findUnique: jest.fn(),
          findMany: jest.fn(),
          create: jest.fn(),
          update: jest.fn(),
          delete: jest.fn(),
        },
      };

      return {
        PrismaClient: jest.fn(() => prismaMock),
      };
    });

    jest.isolateModules(() => {
      const { PrismaClient } = require("../src/generated/prisma");
      prisma = new PrismaClient();
      userModel = require("../src/models/user.model");
    });
  });

  test("getUserById should call prisma.user.findUnique with include organization", async () => {
    prisma.user.findUnique.mockResolvedValue({ user_id: 3 });
    const result = await userModel.getUserById(3);

    expect(prisma.user.findUnique).toHaveBeenCalledWith({
      where: { user_id: 3 },
      include: { organization: true },
    });
    expect(result).toEqual({ user_id: 3 });
  });

  test("getUserByEmail should call findUnique with email and include organization", async () => {
    prisma.user.findUnique.mockResolvedValue({ email: "test@gmail.com" });
    const result = await userModel.getUserByEmail("test@gmail.com");

    expect(prisma.user.findUnique).toHaveBeenCalledWith({
      where: { email: "test@gmail.com" },
      include: { organization: true },
    });
    expect(result).toEqual({ email: "test@gmail.com" });
  });

  test("getAllUsers should call findMany with include organization", async () => {
    prisma.user.findMany.mockResolvedValue([{ user_id: 1 }]);
    const result = await userModel.getAllUsers();

    expect(prisma.user.findMany).toHaveBeenCalledWith({
      include: { organization: true },
    });
    expect(result).toEqual([{ user_id: 1 }]);
  });

  test("getUsersByOrganization should call findMany with where organization_id and include", async () => {
    prisma.user.findMany.mockResolvedValue([{ user_id: 2 }]);
    const result = await userModel.getUsersByOrganization(5);

    expect(prisma.user.findMany).toHaveBeenCalledWith({
      where: { organization_id: 5 },
      include: { organization: true },
    });
    expect(result).toEqual([{ user_id: 2 }]);
  });

  test("createUser should call prisma.user.create with mapped fields and include organization", async () => {
    const created = { user_id: 10, email: "example@gmail.com", password_must_be_reset: true };
    prisma.user.create.mockResolvedValue(created);

    const result = await userModel.createUser({
        organization_id: 7,
        first_name: "Ann",
        last_name: "Bell",
        email: "example@gmail.com",
        password_hash: "hashed",
        role: "EMPLOYEE",
        position: "Dev",
    });

    expect(prisma.user.create).toHaveBeenCalledWith({
        data: {
            first_name: "Ann",
            last_name: "Bell",
            email: "example@gmail.com",
            password: "hashed",
            role: "EMPLOYEE",
            position: "Dev",
            organization_id: 7,
            password_must_be_reset: true,
        },
        include: { organization: true },
    });

    expect(result).toEqual(created);
  });

  test("deleteUser should call prisma.user.delete with numeric user_id", async () => {
    prisma.user.delete.mockResolvedValue(true);

    const result = await userModel.deleteUser("9");

    expect(prisma.user.delete).toHaveBeenCalledWith({
      where: { user_id: 9 },
    });
    expect(result).toEqual(true);
  });

  test("updateUser should handle organization connect and password and include organization", async () => {
    const updated = { user_id: 4, email: "user@gmail.com", password_must_be_reset: true };
    prisma.user.update.mockResolvedValue(updated);

    const res = await userModel.updateUser(4, {
        organization_id: 3,
        password: "newpass",
        first_name: "New",
        email: "user@gmail.com",
    });

    expect(prisma.user.update).toHaveBeenCalledWith({
        where: { user_id: 4 },
        data: {
            first_name: "New",
            email: "user@gmail.com",
            organization: { connect: { organization_id: 3 } },
            password: "newpass",
        },
        include: { organization: true },
    });

    expect(res).toEqual(updated);
  });

  test("updateUser should disconnect organization when organization_id is null", async () => {
    prisma.user.update.mockResolvedValue({ user_id: 5 });
    await userModel.updateUser(5, { organization_id: null });

    expect(prisma.user.update).toHaveBeenCalledWith({
      where: { user_id: 5 },
      data: {
        organization: { disconnect: true },
      },
      include: { organization: true },
    });
  });

  test("createUser should default password_must_be_reset to true", async () => {
    const created = { user_id: 10, email: "default@gmail.com", password_must_be_reset: true };
    prisma.user.create.mockResolvedValue(created);

    const result = await userModel.createUser({
        first_name: "Ann",
        last_name: "Bell",
        email: "default@gmail.com",
        password_hash: "hashed",
    });

    expect(prisma.user.create).toHaveBeenCalledWith(
        expect.objectContaining({
            data: expect.objectContaining({
                password_must_be_reset: true,
            }),
        })
    );
    expect(result).toEqual(created);
});

  test("createUser should accept explicit password_must_be_reset: false", async () => {
      const created = { user_id: 11, email: "explicit@gmail.com", password_must_be_reset: false };
      prisma.user.create.mockResolvedValue(created);

      const result = await userModel.createUser({
          first_name: "Ann",
          last_name: "Bell",
          email: "explicit@gmail.com",
          password_hash: "hashed",
          password_must_be_reset: false,
      });

      expect(prisma.user.create).toHaveBeenCalledWith(
          expect.objectContaining({
              data: expect.objectContaining({
                  password_must_be_reset: false,
              }),
          })
      );
      expect(result).toEqual(created);
  });

  test("updateUser should handle password_must_be_reset update", async () => {
    const updated = { user_id: 4, password_must_be_reset: false };
    prisma.user.update.mockResolvedValue(updated);

    const res = await userModel.updateUser(4, {
        password_must_be_reset: false,
    });

    expect(prisma.user.update).toHaveBeenCalledWith({
        where: { user_id: 4 },
        data: {
            password_must_be_reset: false,
        },
        include: { organization: true },
    });
    expect(res).toEqual(updated);
  });

  test("storeGoogleTokens should update user with google tokens and expiry", async () => {
    const userId = 1;
    const tokens = {
      access_token: "mock_access_token",
      refresh_token: "mock_refresh_token",
      expiry_date: 1712345678900,
    };

    const updatedUser = { 
      user_id: userId, 
      google_access_token: tokens.access_token 
    };
    
    prisma.user.update.mockResolvedValue(updatedUser);

    const result = await userModel.storeGoogleTokens(userId, tokens);

    expect(prisma.user.update).toHaveBeenCalledWith({
      where: { user_id: Number(userId) },
      data: {
        google_access_token: tokens.access_token,
        google_refresh_token: tokens.refresh_token,
        google_token_expiry: new Date(tokens.expiry_date),
      },
    });
    expect(result).toEqual(updatedUser);
  });

  test("clearGoogleTokens should set all google related fields to null", async () => {
    const userId = 10;
    const updatedUser = { 
      user_id: userId, 
      google_access_token: null,
      google_refresh_token: null,
      google_token_expiry: null 
    };
    
    prisma.user.update.mockResolvedValue(updatedUser);

    const result = await userModel.clearGoogleTokens(userId);

    expect(prisma.user.update).toHaveBeenCalledWith({
      where: { user_id: Number(userId) },
      data: {
        google_access_token: null,
        google_refresh_token: null,
        google_token_expiry: null,
      },
    });
    expect(result).toEqual(updatedUser);
  });
});
