import crypto from "node:crypto";

const SESSION_COOKIE = "wulf_session";
const SESSION_SECRET = import.meta.env.SESSION_SECRET;

function sign(data) {
  return crypto
    .createHmac("sha256", SESSION_SECRET)
    .update(data)
    .digest("base64url");
}

export function createSession(user, accessToken, selectedGuildId = null) {
  const payload = Buffer.from(
    JSON.stringify({
      id: user.id,
      username: user.username,
      avatar: user.avatar,
      accessToken,
      selectedGuildId,
      exp: Date.now() + 1000 * 60 * 60 * 24 * 7, // 7 Tage
    }),
  ).toString("base64url");

  const signature = sign(payload);
  return `${payload}.${signature}`;
}

export function verifySession(cookieValue) {
  if (!cookieValue) return null;

  const [payload, signature] = cookieValue.split(".");
  if (!payload || !signature) return null;

  const expected = sign(payload);
  if (expected !== signature) return null;

  try {
    const data = JSON.parse(Buffer.from(payload, "base64url").toString());
    if (data.exp < Date.now()) return null;
    return data;
  } catch {
    return null;
  }
}

export function getSession(cookies) {
  const cookie = cookies.get(SESSION_COOKIE);
  if (!cookie) return null;
  return verifySession(cookie.value);
}

// Session aktualisieren (z. B. Server-Auswahl ändern)
export function updateSession(cookies, sessionData) {
  const payload = Buffer.from(
    JSON.stringify({
      ...sessionData,
      exp: Date.now() + 1000 * 60 * 60 * 24 * 7,
    }),
  ).toString("base64url");
  const signature = sign(payload);
  cookies.set(SESSION_COOKIE, `${payload}.${signature}`, {
    path: "/",
    httpOnly: true,
    secure: import.meta.env.PROD,
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7,
  });
}

export function clearSession(cookies) {
  cookies.delete(SESSION_COOKIE, { path: "/" });
}

export const SESSION_COOKIE_NAME = SESSION_COOKIE;
