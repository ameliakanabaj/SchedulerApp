const express = require('express');
const router = express.Router();
const googleAuthController = require('../controllers/googleAuth.controller');
const auth = require('../middlewares/auth.middleware');

router.get('/connect', auth(["EMPLOYEE", "ORG_ADMIN", "GLOBAL_ADMIN"]), googleAuthController.connect);

router.get('/callback', googleAuthController.callback);

router.delete('/disconnect', auth(["EMPLOYEE", "ORG_ADMIN", "GLOBAL_ADMIN"]), googleAuthController.disconnect);

module.exports = router;
