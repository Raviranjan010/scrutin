const { streamReview, streamSecurityScan } = require("../services/ai.service");
const { updateUserUsage } = require("../services/auth.service");
const { saveReview } = require("../services/review.service");

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
    let fullReviewText = "";

    for await (const chunk of stream) {
      fullReviewText += chunk;
      res.write(`data: ${JSON.stringify(chunk)}\n\n`);
    }

    if (user && !user.isPro) {
      await updateUserUsage(user.id);
    }
    
    // Parse score from text
    let score = null;
    const match = fullReviewText.match(/SCORE_JSON:(\{.*?\})/s);
    if (match) {
      try {
        const scoreData = JSON.parse(match[1]);
        score = scoreData.overall;
      } catch (e) {}
    }

    const reviewId = await saveReview({
      userId: user ? user.id : null,
      code,
      language: language || "javascript",
      review: fullReviewText,
      score
    });

    res.write(`data: ${JSON.stringify({ reviewId })}\n\n`);
    res.write("data: [DONE]\n\n");
    res.end();
  } catch (error) {
    console.error("Streaming error:", error);
    res.write(`data: ${JSON.stringify("[ERROR] " + error.message)}\n\n`);
    res.write("data: [DONE]\n\n");
    res.end();
  }
};

module.exports.securityScan = async (req, res) => {
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
    const stream = streamSecurityScan(code, language || "javascript");
    let fullReviewText = "";

    for await (const chunk of stream) {
      fullReviewText += chunk;
      res.write(`data: ${JSON.stringify(chunk)}\n\n`);
    }

    if (user && !user.isPro) {
      await updateUserUsage(user.id);
    }
    
    // Parse score from text
    let score = null;
    const match = fullReviewText.match(/SECURITY_SCORE_JSON:(\{.*?\})/s);
    if (match) {
      try {
        const scoreData = JSON.parse(match[1]);
        score = scoreData.score;
      } catch (e) {}
    }

    const reviewId = await saveReview({
      userId: user ? user.id : null,
      code,
      language: language || "javascript",
      review: fullReviewText,
      score
    });

    res.write(`data: ${JSON.stringify({ reviewId })}\n\n`);
    res.write("data: [DONE]\n\n");
    res.end();
  } catch (error) {
    console.error("Streaming error:", error);
    res.write(`data: ${JSON.stringify("[ERROR] " + error.message)}\n\n`);
    res.write("data: [DONE]\n\n");
    res.end();
  }
};