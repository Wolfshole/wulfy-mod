// Discord-Berechtigungsflags
const ADMINISTRATOR = 0x8n;
const MANAGE_GUILD = 0x20n;

// Server laden, auf denen der User Admin ist
export async function getUserGuilds(accessToken) {
  const response = await fetch("https://discord.com/api/users/@me/guilds", {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!response.ok) {
    throw new Error("Fehler beim Laden der Server");
  }

  const guilds = await response.json();

  // Nur Server, auf denen der User Admin oder Manage Server hat
  return guilds.filter((guild) => {
    const perms = BigInt(guild.permissions);
    const isAdmin = (perms & ADMINISTRATOR) === ADMINISTRATOR;
    const canManage = (perms & MANAGE_GUILD) === MANAGE_GUILD;
    return guild.owner || isAdmin || canManage;
  });
}

// Bot-Info für einen Server laden
export async function getBotGuilds(botToken) {
  const response = await fetch("https://discord.com/api/users/@me/guilds", {
    headers: { Authorization: `Bot ${botToken}` },
  });

  if (!response.ok) return [];
  return response.json();
}

// User-Info laden
export async function getDiscordUser(accessToken) {
  const response = await fetch("https://discord.com/api/users/@me", {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!response.ok) throw new Error("Fehler beim Laden des Users");
  return response.json();
}

// Avatar-URL bauen
export function getAvatarUrl(userId, avatarHash) {
  if (!avatarHash) {
    const defaultIndex = Number(BigInt(userId) % 5n);
    return `https://cdn.discordapp.com/embed/avatars/${defaultIndex}.png`;
  }
  return `https://cdn.discordapp.com/avatars/${userId}/${avatarHash}.png`;
}
