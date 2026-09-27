import crypto from "node:crypto";
import dns from "node:dns/promises";

export const runtime = "nodejs";

// Lista curta de domínios de e-mail descartável mais comuns.
// Não é exaustiva — apenas um sinal a mais, não uma verdade absoluta.
const DISPOSABLE_DOMAINS = new Set([
  "mailinator.com",
  "10minutemail.com",
  "tempmail.com",
  "guerrillamail.com",
  "yopmail.com",
  "trashmail.com",
  "getnada.com",
  "temp-mail.org",
]);

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

async function checkFormatAndMx(email) {
  const formatValid = EMAIL_REGEX.test(email);
  const domain = email.split("@")[1]?.toLowerCase() || "";
  let hasMx = false;
  try {
    const records = await dns.resolveMx(domain);
    hasMx = Array.isArray(records) && records.length > 0;
  } catch {
    hasMx = false;
  }
  const disposable = DISPOSABLE_DOMAINS.has(domain);
  return { formatValid, hasMx, disposable, domain };
}

async function checkGravatar(email) {
  const hash = crypto
    .createHash("md5")
    .update(email.trim().toLowerCase())
    .digest("hex");
  const url = `https://www.gravatar.com/avatar/${hash}?d=404`;
  try {
    const res = await fetch(url, { method: "HEAD" });
    return { found: res.status === 200, avatarUrl: `${url.split("?")[0]}?s=200&d=identicon` };
  } catch {
    return { found: false, avatarUrl: null };
  }
}

async function checkBreaches(email) {
  try {
    const res = await fetch(
      `https://api.xposedornot.com/v1/check-email/${encodeURIComponent(email)}`,
      { headers: { Accept: "application/json" } }
    );
    if (res.status === 404) return { count: 0, names: [] };
    if (!res.ok) return { count: 0, names: [], unavailable: true };
    const data = await res.json();
    const flat = (data.breaches || []).flat().filter(Boolean);
    return { count: flat.length, names: flat };
  } catch {
    return { count: 0, names: [], unavailable: true };
  }
}

async function checkGithub(email) {
  try {
    const res = await fetch(
      `https://api.github.com/search/users?q=${encodeURIComponent(email)}+in:email`,
      {
        headers: {
          Accept: "application/vnd.github+json",
          "User-Agent": "osint-nukz",
        },
      }
    );
    if (!res.ok) return { found: false };
    const data = await res.json();
    const first = data.items?.[0];
    if (!first) return { found: false };
    return {
      found: true,
      login: first.login,
      profileUrl: first.html_url,
    };
  } catch {
    return { found: false };
  }
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const email = (searchParams.get("email") || "").trim();

  if (!email || !EMAIL_REGEX.test(email)) {
    return Response.json({ error: "E-mail inválido." }, { status: 400 });
  }

  const [validity, gravatar, breaches, github] = await Promise.all([
    checkFormatAndMx(email),
    checkGravatar(email),
    checkBreaches(email),
    checkGithub(email),
  ]);

  return Response.json({ validity, gravatar, breaches, github });
}
