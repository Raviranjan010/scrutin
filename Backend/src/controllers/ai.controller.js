const { streamReview } = require("../services/ai.service");
const { updateUserUsage } = require("../services/auth.service");

module.exports.getReview = async (req, res) => {
  const { code, language } = req.body;
  const user = req.user;

  if (!code) {
    return res.status(400).send("Code is required");
  }

  // Metering check
  if (user && !user.isPro) {
    const currentMonth = new Date().toISOString().slice(0, 7);
    const usage = user.usage?.[currentMonth] || 0;
    if (usage >= 50) {
      return res.status(429).send("Monthly limit reached. Upgrade to Studio.");
    }
  }

  // SSE headers
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("X-Accel-Buffering", "no");
  res.flushHeaders();

  try {
    const stream = streamReview(code, language || "javascript");

    for await (const chunk of stream) {
      res.write(`data: ${JSON.stringify(chunk)}\n\n`);
    }

    if (user && !user.isPro) {
      await updateUserUsage(user.id);
    }

    res.write("data: [DONE]\n\n");
    res.end();
  } catch (error) {
    console.error("Streaming error:", error);
    res.write(`data: ${JSON.stringify("[ERROR] " + error.message)}\n\n`);
    res.write("data: [DONE]\n\n");
    res.end();
  }
};