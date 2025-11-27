const availabilityModel = require("../models/availability.model");

async function loadAvailability(req, res, next) {
  try {
    const { id } = req.params;

    const availability = await availabilityModel.getAvailabilityById(id);

    if (!availability) {
      return next({
        type: "BUSINESS_LOGIC",
        message: "Availability not found",
        statusCode: 404,
      });
    }

    req.existing = availability;

    next();
  } catch (err) {
    next(err);
  }
}

module.exports = loadAvailability;
