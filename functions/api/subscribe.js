// Cloudflare Pages Function: POST /api/subscribe
// Receives { email, website } from the signup form and inserts into D1.
// Binding expected: env.DB  (configured in Pages project settings)

export async function onRequestPost(context) {
  const { request, env } = context;

  let body;
  try {
    body = await request.json();
  } catch {
    return json({ ok: false, error: "Invalid request body." }, 400);
  }

  const email = String(body.email || "")
    .trim()
    .toLowerCase();
  const honeypot = String(body.website || "");

  // Honeypot: pretend success so bots don't probe for a different response.
  if (honeypot) return json({ ok: true });

  // Minimal RFC-5322-ish validation. Good enough at this layer;
  // verification email (later) is the real check.
  const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRe.test(email) || email.length > 254) {
    return json(
      { ok: false, error: "That does not look like a valid email." },
      400,
    );
  }

  const now = new Date().toISOString();
  const ua = request.headers.get("user-agent")?.slice(0, 300) || null;
  // Cloudflare provides the visitor's country without exposing the raw IP.
  const country = request.headers.get("cf-ipcountry") || null;

  try {
    await env.DB.prepare(
      `INSERT INTO subscribers (email, created_at, user_agent, country)
       VALUES (?, ?, ?, ?)`,
    )
      .bind(email, now, ua, country)
      .run();
  } catch (err) {
    // UNIQUE constraint → already subscribed. Return ok so we don't leak list membership.
    if (/UNIQUE|constraint/i.test(err.message || "")) {
      return json({ ok: true, already: true });
    }
    console.error("D1 insert failed:", err);
    return json(
      { ok: false, error: "Could not record subscription. Please try again." },
      500,
    );
  }

  return json({ ok: true });
}

// Reject anything that isn't POST
export async function onRequest({ request }) {
  if (request.method !== "POST") {
    return json({ ok: false, error: "Method not allowed." }, 405);
  }
}

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8" },
  });
}
