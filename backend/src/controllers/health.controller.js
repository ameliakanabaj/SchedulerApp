const dbService = require('../services/db.service');

exports.checkHealth = async (req, res) => {
  try {
    const pool = dbService.getPool(); 
    const result = await pool.query("SELECT NOW()");
    
    res.status(200).json({ 
      status: "ok", 
      message: "API and Database connection are healthy",
      time: result.rows[0].now 
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
