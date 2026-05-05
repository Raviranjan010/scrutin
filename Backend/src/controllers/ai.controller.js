const { generateReview, generateSecurityScan } = require("../services/ai.service")


module.exports.getReview = async (req, res) => {

    const code = req.body.code;

    if (!code || !code.trim()) {
        return res.status(400).send("Code is required");
    }

    try {
        const response = await generateReview(code);
        res.send(response);
    } catch (error) {
        console.error("Review error:", error.message, error.cause?.message || "");
        res.status(error.statusCode || 500).send(error.message || "Failed to generate review. Please try again.");
    }
}

module.exports.getSecurityScan = async (req, res) => {

    const code = req.body.code;

    if (!code || !code.trim()) {
        return res.status(400).send("Code is required");
    }

    try {
        const response = await generateSecurityScan(code);
        res.send(response);
    } catch (error) {
        console.error("Security scan error:", error.message, error.cause?.message || "");
        res.status(error.statusCode || 500).send(error.message || "Failed to generate security scan. Please try again.");
    }
}
