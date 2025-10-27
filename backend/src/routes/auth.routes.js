const express = require("express");
const router = express.Router();
const authService = require("../services/auth.service");
const { registerValidation, loginValidation } = require("../middlewares/auth.validation");

router.post("/register", registerValidation, async (req, res) => {

  try {
    const user = await authService.register(req.body);
    res.status(201).json(user);
  } catch (err) {
    if (err.message === "Email already exists") {
        return res.status(409).json({ message: err.message });
    }
    res.status(400).json({ message: err.message });
  }
});

router.post("/login", loginValidation, async (req, res) => { 
  try {
    const result = await authService.login(req.body);
    res.json(result);
  } catch (err) {
    res.status(401).json({ message: err.message });
  }
});

module.exports = router;