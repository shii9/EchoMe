import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const MAX_BODY_BYTES = 40_000;
const MAX_MESSAGES = 20;
const MAX_MESSAGE_CHARS = 8_000;
const MAX_TOTAL_CHARS = 32_000;
const RATE_LIMIT = 10;
const RATE_WINDOW_MS = 60_000;
const MAX_RATE_BUCKETS = 5_000;

type RateBucket = { count: number; resetAt: number };
const rateBuckets = new Map<string, RateBucket>();

const systemPrompt = `You are an expert cybersecurity assistant specializing in phishing detection and email security.

Your expertise includes:
- Identifying phishing indicators (urgency tactics, suspicious URLs, brand impersonation)
- Explaining email authentication protocols (SPF, DKIM, DMARC)
- Analyzing malicious URLs and domains
- Educating users about social engineering tactics
- Providing actionable security recommendations

Guidelines:
- Keep responses clear, concise, and educational
- Use examples when explaining concepts
- Provide step-by-step guidance for checking suspicious emails
- Emphasize security best practices
- Never click suspicious links, always verify sender addresses
- Explain technical terms in simple language
- Be encouraging and supportive - cybersecurity can be complex`;

const getAllowedOrigins = (): Set<string> => {
  const configured = Deno.env.get("ALLOWED_ORIGINS") ?? "";
  const values = configured
    .split(",")
    .map((origin) => origin.trim())
    .filter((origin) => origin && origin !== "*");

  // Local development is safe to support by default. Production deployments
  // must set ALLOWED_ORIGINS to the exact deployed application origin(s).
  values.push("http://localhost:8080", "http://127.0.0.1:8080");
  return new Set(values);
};

const getCorsHeaders = (origin: string | null): HeadersInit => {
  const headers: HeadersInit = {
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Vary": "Origin",
    "X-Content-Type-Options": "nosniff",
    "Cache-Control": "no-store",
  };

  if (origin && getAllowedOrigins().has(origin)) {
    headers["Access-Control-Allow-Origin"] = origin;
  }
  return headers;
};

const jsonResponse = (
  body: Record<string, string>,
  status: number,
  origin: string | null,
  extraHeaders: HeadersInit = {},
) => new Response(JSON.stringify(body), {
  status,
  headers: {
    ...getCorsHeaders(origin),
    "Content-Type": "application/json",
    ...extraHeaders,
  },
});

const getClientKey = (req: Request): string => {
  // These headers are only a best-effort identifier. Enforce a matching
  // platform/API-gateway rate limit in production because headers can be forged.
  return req.headers.get("cf-connecting-ip")
    ?? req.headers.get("x-real-ip")
    ?? req.headers.get("x-forwarded-for")?.split(",")[0].trim()
    ?? "anonymous";
};

const isRateLimited = (key: string): { limited: boolean; retryAfter: number } => {
  const now = Date.now();
  const current = rateBuckets.get(key);

  if (!current || current.resetAt <= now) {
    if (rateBuckets.size >= MAX_RATE_BUCKETS) {
      for (const [bucketKey, bucket] of rateBuckets) {
        if (bucket.resetAt <= now) rateBuckets.delete(bucketKey);
      }
    }
    rateBuckets.set(key, { count: 1, resetAt: now + RATE_WINDOW_MS });
    return { limited: false, retryAfter: 0 };
  }

  if (current.count >= RATE_LIMIT) {
    return { limited: true, retryAfter: Math.ceil((current.resetAt - now) / 1000) };
  }

  current.count += 1;
  return { limited: false, retryAfter: 0 };
};

const validateMessages = (value: unknown): Array<{ role: "user" | "assistant"; content: string }> | null => {
  if (!Array.isArray(value) || value.length === 0 || value.length > MAX_MESSAGES) return null;

  let totalChars = 0;
  const messages: Array<{ role: "user" | "assistant"; content: string }> = [];
  for (const message of value) {
    if (!message || typeof message !== "object") return null;
    const candidate = message as { role?: unknown; content?: unknown };
    if ((candidate.role !== "user" && candidate.role !== "assistant") || typeof candidate.content !== "string") {
      return null;
    }

    const content = candidate.content.trim();
    if (!content || content.length > MAX_MESSAGE_CHARS) return null;
    totalChars += content.length;
    if (totalChars > MAX_TOTAL_CHARS) return null;
    messages.push({ role: candidate.role, content });
  }
  return messages;
};

serve(async (req) => {
  const origin = req.headers.get("origin");
  const allowedOrigins = getAllowedOrigins();

  if (origin && !allowedOrigins.has(origin)) {
    return jsonResponse({ error: "Origin not allowed" }, 403, origin);
  }

  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: getCorsHeaders(origin) });
  }

  if (req.method !== "POST") {
    return jsonResponse({ error: "Method not allowed" }, 405, origin, { Allow: "POST, OPTIONS" });
  }

  const contentLength = Number(req.headers.get("content-length") ?? 0);
  if (contentLength > MAX_BODY_BYTES) {
    return jsonResponse({ error: "Request is too large" }, 413, origin);
  }

  const rate = isRateLimited(getClientKey(req));
  if (rate.limited) {
    return jsonResponse({ error: "Rate limit exceeded. Please try again later." }, 429, origin, {
      "Retry-After": String(rate.retryAfter),
    });
  }

  try {
    const payload = await req.json() as { messages?: unknown };
    const messages = validateMessages(payload.messages);
    if (!messages) {
      return jsonResponse({ error: "Invalid message payload" }, 400, origin);
    }

    const apiKey = Deno.env.get("LOVABLE_API_KEY");
    if (!apiKey) {
      console.error("LOVABLE_API_KEY is not configured");
      return jsonResponse({ error: "AI service is not configured" }, 503, origin);
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [{ role: "system", content: systemPrompt }, ...messages],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return jsonResponse({ error: "AI service rate limit exceeded" }, 429, origin);
      }
      if (response.status === 402) {
        return jsonResponse({ error: "AI service credits are unavailable" }, 402, origin);
      }
      console.error("AI gateway returned status", response.status);
      return jsonResponse({ error: "AI service unavailable" }, 502, origin);
    }

    return new Response(response.body, {
      headers: {
        ...getCorsHeaders(origin),
        "Content-Type": "text/event-stream",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    console.error("Chat request failed", error instanceof Error ? error.name : "unknown error");
    return jsonResponse({ error: "Invalid or failed chat request" }, 400, origin);
  }
});
