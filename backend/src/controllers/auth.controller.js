const authService = require("../services/auth.service");

async function register(req, res, next) {
  try {
    const { user, token } = await authService.register(req.body);

    res.status(201).json({
      message: "User registered successfully",
      token,
      user: {
        user_id: user.user_id,
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
        role: user.role,
        organization_id: user.organization_id,
      },
    });
  } catch (err) {
    if (err.message === "Email already exists") {
      return next({
        type: "BUSINESS_LOGIC",
        message: err.message,
        statusCode: 409,
      });
    }
    next(err);
  }
}

async function login(req, res, next) {
  try {
    const { token, user } = await authService.login(req.body);

    res.json({
      message: "Login successful",
      token,
      user: {
        user_id: user.user_id,
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
        role: user.role,
        organization_id: user.organization_id,
      },
    });
  } catch (err) {
    next({
      type: "BUSINESS_LOGIC",
      message: err.message,
      statusCode: 401,
    });
  }
}

module.exports = { register, login };
