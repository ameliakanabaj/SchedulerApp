const jwt = require("jsonwebtoken");
require("dotenv").config();
const JWT_SECRET = process.env.JWT_SECRET || "SUPER_SECRET";

function auth(requiredRoles = []) {
  return (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return next({
        type: "BUSINESS_LOGIC",
        message: "Missing token",
        statusCode: 401,
      });
    }

    const token = authHeader.split(" ")[1];

    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      req.user = decoded;

      if (requiredRoles.length && !requiredRoles.includes(decoded.role)) {
        return next({
          type: "BUSINESS_LOGIC",
          message: "Forbidden: Insufficient role",
          statusCode: 403,
        });
      }

      next();
    } catch (err) {
      return next({
        type: "BUSINESS_LOGIC",
        message: "Unauthorized: Invalid or expired token",
        statusCode: 401,
      });
    }
  };
}

module.exports = auth;
