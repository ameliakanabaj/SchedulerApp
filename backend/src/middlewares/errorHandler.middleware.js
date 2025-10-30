function errorHandler(err, req, res, next) {
  console.error("💥 Error:", err);

  // Obsługa błędów walidacji express-validator
  if (err.errors && Array.isArray(err.errors)) {
    return res.status(400).json({
      status: "error",
      message: "Validation failed",
      errors: err.errors.map((e) => ({
        field: e.path,
        message: e.msg,
      })),
    });
  }

  // Obsługa błędów autoryzacji
  if (err.name === "UnauthorizedError") {
    return res.status(401).json({
      status: "error",
      message: "Unauthorized: Invalid or missing token",
    });
  }

  // Obsługa błędów z walidacji logiki biznesowej
  if (err.type === "BUSINESS_LOGIC") {
    return res.status(err.statusCode || 400).json({
      status: "error",
      message: err.message,
    });
  }

  // Domyślny błąd (500)
  res.status(500).json({
    status: "error",
    message: err.message || "Internal Server Error",
  });
}

module.exports = errorHandler;
