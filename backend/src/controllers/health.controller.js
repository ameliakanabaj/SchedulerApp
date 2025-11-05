const { PrismaClient } = require("../generated/prisma");
const prisma = new PrismaClient();

exports.checkHealth = async (req, res) => {
  try {
    const result = await prisma.$queryRaw`SELECT NOW()`;

    res.status(200).json({
      status: "ok",
      message: "API and Database connection are healthy",
      time: result[0].now
    });
  } catch (err) {
    console.error("Error connecting with database:", err.message);
    res.status(500).json({
      status: "error",
      message: "Database connection failed",
      error: err.message
    });
  }
};
