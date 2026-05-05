const express = require('express');
const aiController = require("../controllers/ai.controller")
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

router.post("/get-review", authMiddleware, aiController.getReview)
router.post("/security-scan", authMiddleware, aiController.securityScan)

module.exports = router;