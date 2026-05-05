const { streamReview } = require("../services/ai.service");

module.exports.getReview = async (req, res) => {
  const { code, language } = req.body;

  if (!code) {
    return res.status(400).send("Code is required");
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

    res.write("data: [DONE]\n\n");
    res.end();
  } catch (error) {
    console.error("Streaming error:", error);
    res.write(`data: ${JSON.stringify("[ERROR] " + error.message)}\n\n`);
    res.write("data: [DONE]\n\n");
    res.end();
  }
};