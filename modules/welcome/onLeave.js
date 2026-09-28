async function onLeave(member, db) {
  try {
    // Einstellungen für das Welcome-Modul laden
    const [rows] = await db.execute(
      "SELECT settings_json, enabled FROM guild_settings WHERE guild_id = ? AND module_name = ?",
      [member.guild.id, "welcome"],
    );

    if (rows.length === 0 || !rows[0].enabled) return;

    const settings = rows[0].settings_json;

    // Leave-Nachricht senden
    if (settings.leaveChannelId && settings.leaveMessage) {
      const channel = member.guild.channels.cache.get(settings.leaveChannelId);
      if (channel) {
        const message = settings.leaveMessage
          .replace("{user}", member.user.tag)
          .replace("{server}", member.guild.name)
          .replace("{membercount}", member.guild.memberCount);

        await channel.send(message);
      }
    }
  } catch (err) {
    console.error("❌ Fehler im Welcome-Modul (Leave):", err.message);
  }
}

module.exports = onLeave;
