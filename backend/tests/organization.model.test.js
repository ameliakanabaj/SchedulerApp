beforeEach(() => {
  jest.resetModules();
  jest.clearAllMocks();
});

describe("Organization Model", () => {
  let organizationModel;
  let prisma;

  beforeEach(() => {
    jest.mock("../src/generated/prisma", () => {
      const prismaMock = {
        organization: {
          create: jest.fn(),
          findMany: jest.fn(),
          findUnique: jest.fn(),
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
      organizationModel = require("../src/models/organization.model");
    });
  });

  test("createOrganization should call prisma.organization.create with data name", async () => {
    prisma.organization.create.mockResolvedValue({ organization_id: 1, name: "Org" });

    const res = await organizationModel.createOrganization({ name: "Org" });

    expect(prisma.organization.create).toHaveBeenCalledWith({
      data: { name: "Org" },
    });
    expect(res).toEqual({ organization_id: 1, name: "Org" });
  });

  test("getAllOrganizations should call findMany with include users.select and orderBy", async () => {
    const mockOrgs = [{ organization_id: 2 }];
    prisma.organization.findMany.mockResolvedValue(mockOrgs);

    const res = await organizationModel.getAllOrganizations();

    expect(prisma.organization.findMany).toHaveBeenCalledWith({
      include: {
        users: {
          select: {
            user_id: true,
            first_name: true,
            last_name: true,
            email: true,
            role: true,
            position: true,
            organization_id: true,
          },
        },
      },
      orderBy: { name: "asc" },
    });
    expect(res).toEqual(mockOrgs);
  });

  test("getOrganizationById should call findUnique with include users", async () => {
    prisma.organization.findUnique.mockResolvedValue({ organization_id: 3 });

    const res = await organizationModel.getOrganizationById("3");

    expect(prisma.organization.findUnique).toHaveBeenCalledWith({
      where: { organization_id: 3 },
      include: { users: true },
    });
    expect(res).toEqual({ organization_id: 3 });
  });

  test("getOrganizationsByIds should call findMany with in mapped ids and include users", async () => {
    prisma.organization.findMany.mockResolvedValue([{ organization_id: 4 }]);

    const res = await organizationModel.getOrganizationsByIds(["4", 5]);

    expect(prisma.organization.findMany).toHaveBeenCalledWith({
      where: { organization_id: { in: [4, 5] } },
      include: { users: true },
      orderBy: { name: "asc" },
    });
    expect(res).toEqual([{ organization_id: 4 }]);
  });

  test("updateOrganization should call update with numeric id and name", async () => {
    prisma.organization.update.mockResolvedValue({ organization_id: 6, name: "X" });

    const res = await organizationModel.updateOrganization("6", { name: "X" });

    expect(prisma.organization.update).toHaveBeenCalledWith({
      where: { organization_id: 6 },
      data: { name: "X" },
    });
    expect(res).toEqual({ organization_id: 6, name: "X" });
  });

  test("deleteOrganization should call delete with numeric id and return true", async () => {
    prisma.organization.delete.mockResolvedValue(true);

    const res = await organizationModel.deleteOrganization("7");

    expect(prisma.organization.delete).toHaveBeenCalledWith({
      where: { organization_id: 7 },
    });
    expect(res).toEqual(true);
  });
});
