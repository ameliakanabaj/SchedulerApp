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
    const created = { user_id: 10, email: "example@gmail.com" };
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
    const updated = { user_id: 4, email: "user@gmail.com" };
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
});
