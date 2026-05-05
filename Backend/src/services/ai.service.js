const API_KEY =
  process.env.GOOGLE_GEMINI_KEY ||
  process.env.GOOGLE_GEMINI_API_KEY ||
  process.env.GEMINI_API_KEY ||
  process.env.GOOGLE_API_KEY;

const MODEL_NAME = process.env.GEMINI_MODEL || "gemini-2.5-flash";
const GEMINI_API_VERSION = process.env.GEMINI_API_VERSION || "v1beta";
const GEMINI_TIMEOUT_MS = Number(process.env.GEMINI_TIMEOUT_MS || 60000);

const reviewInstruction = `
You are a Senior Software Engineer with 7+ years of experience in professional software development and code reviews.
Act as a strict, detail-oriented, but pragmatic code reviewer.

Responsibilities:
- Ensure code is correct, bug-free, and logically sound.
- Promote clean architecture and maintainable design.
- Enforce best practices, design patterns, and clean code principles.
- Detect performance bottlenecks, redundant logic, and inefficient operations.
- Identify security vulnerabilities or risky patterns.
- Encourage readability, documentation, and clear naming conventions.
- Suggest improvements only when they offer clear, measurable value.

Guidelines:
1. Be strict and review correctness, architecture, readability, testing, security, and performance.
2. Be specific. Explain why each change matters and provide code snippets where useful.
3. Avoid nitpicking if the code is already acceptable by professional standards.
4. If the code is clean, efficient, and well-structured, say no further changes are needed.
5. Avoid recursive reviews. If suggested changes are applied correctly, acknowledge that the code is up to standard.
6. Mention strengths in the code alongside any issues.

Tone:
- Direct, professional, and technically clear.
- Actionable and justified.
- Assume the developer is competent and wants to learn.
`;

const securityInstruction = `
You are a Senior Application Security Engineer. Perform a thorough security audit of the provided code.

Security scope:
- OWASP Top 10 risks.
- Hardcoded secrets, API keys, tokens, passwords, database URIs, and private keys.
- Input validation, sanitization, and output encoding.
- Authentication, authorization, session handling, CSRF, and privilege escalation risks.
- Weak cryptography, insecure randomness, or improper encryption.
- Deprecated or vulnerable dependencies and APIs.
- Information leakage through errors, logs, or response bodies.

For each vulnerability found, include:
- Severity: Critical / High / Medium / Low
- Location: Specific line, function, or code block.
- Description: What the issue is and why it matters.
- Fix: A concrete secure alternative.

If the code has no security issues, clearly state that it passes the security audit.
Prioritize real, exploitable risks over theoretical ones.
`;

function createServiceError(statusCode, message, cause) {
  const error = new Error(message);
  error.statusCode = statusCode;
  error.cause = cause;
  return error;
}

function ensureApiKey() {
  if (!API_KEY || API_KEY === "YOUR-API-KEY-HERE") {
    throw createServiceError(
      503,
      "AI service is not configured. Set GOOGLE_GEMINI_KEY in the backend environment."
    );
  }
}

function parseGeminiText(data) {
  const text = data?.candidates?.[0]?.content?.parts
    ?.map((part) => part.text || "")
    .join("")
    .trim();

  if (text) {
    return text;
  }

  const blockReason =
    data?.promptFeedback?.blockReason ||
    data?.candidates?.[0]?.finishReason;

  if (blockReason) {
    throw createServiceError(
      502,
      `Gemini did not return review text. Finish reason: ${blockReason}.`
    );
  }

  throw createServiceError(502, "Gemini returned an empty response.");
}

function getGeminiStatusCode(statusCode) {
  if (statusCode === 400) return 400;
  if (statusCode === 401 || statusCode === 403) return 503;
  if (statusCode === 404) return 503;
  if (statusCode === 429) return 429;
  return 502;
}

function getGeminiErrorMessage(statusCode, message) {
  if (/API key not valid|invalid api key/i.test(message)) {
    return "Gemini API key is invalid. Check GOOGLE_GEMINI_KEY in the backend environment.";
  }

  if (/not found|not supported|is not found/i.test(message)) {
    return `Gemini model "${MODEL_NAME}" is unavailable. Set GEMINI_MODEL to a supported model.`;
  }

  if (/quota|rate limit|429/i.test(message) || statusCode === 429) {
    return "Gemini quota or rate limit was reached. Please try again later.";
  }

  if (message) {
    return `Gemini request failed: ${message}`;
  }

  return "Gemini request failed. Please check the backend logs.";
}

async function readGeminiResponse(response) {
  const bodyText = await response.text();

  try {
    return bodyText ? JSON.parse(bodyText) : {};
  } catch {
    return { rawText: bodyText };
  }
}

async function callGemini(code, systemInstruction) {
  ensureApiKey();

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), GEMINI_TIMEOUT_MS);
  const url = `https://generativelanguage.googleapis.com/${GEMINI_API_VERSION}/models/${MODEL_NAME}:generateContent?key=${API_KEY}`;

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      signal: controller.signal,
      body: JSON.stringify({
        systemInstruction: {
          parts: [{ text: systemInstruction }],
        },
        contents: [
          {
            role: "user",
            parts: [{ text: code }],
          },
        ],
        generationConfig: {
          temperature: 0.2,
          maxOutputTokens: 4096,
        },
      }),
    });

    const data = await readGeminiResponse(response);

    if (!response.ok) {
      const upstreamMessage = data?.error?.message || data?.rawText || response.statusText;
      throw createServiceError(
        getGeminiStatusCode(response.status),
        getGeminiErrorMessage(response.status, upstreamMessage),
        new Error(upstreamMessage)
      );
    }

    return parseGeminiText(data);
  } catch (error) {
    if (error.statusCode) {
      throw error;
    }

    if (error.name === "AbortError") {
      throw createServiceError(504, "Gemini request timed out. Please try again.", error);
    }

    throw createServiceError(
      502,
      `Could not reach Gemini API: ${error.message || "unknown error"}`,
      error
    );
  } finally {
    clearTimeout(timeout);
  }
}

async function generateWithInstruction(code, systemInstruction) {
  if (!code || !code.trim()) {
    throw createServiceError(400, "Code is required.");
  }

  return callGemini(code, systemInstruction);
}

async function generateReview(code) {
  return generateWithInstruction(code, reviewInstruction);
}

async function generateSecurityScan(code) {
  return generateWithInstruction(code, securityInstruction);
}

module.exports = { generateReview, generateSecurityScan };
