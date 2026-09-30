async function onLeave(member, db) {
  try {
    const [rows] = await db.execute(
      "SELECT settings_json, enabled FROM guild_settings WHERE guild_id = ? AND module_name = ?",
      [member.guild.id, "welcome"],
    );

    if (rows.length === 0 || !rows[0].enabled) return;

    const settings = rows[0].settings_json;

    if (settings.leaveChannelId && settings.leaveMessage) {
      const channel = member.guild.channels.cache.get(settings.leaveChannelId);
      if (channel) {
        const message = settings.leaveMessage
          .replace(/{user}/g, member.user.tag)
          .replace(/{server}/g, member.guild.name)
          .replace(/{membercount}/g, member.guild.memberCount);

        await channel.send(message);
      }
    }
  } catch (err) {
    console.error("❌ Welcome-Modul (Leave):", err.message);
  }
}

module.exports = onLeave;
