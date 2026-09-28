async function handleSupport(oldState, newState, db) {
  try {
    const guildId = newState.guild.id;
    const channelId = newState.channelId;

    const [rows] = await db.execute(
      "SELECT * FROM voice_support_settings WHERE guild_id = ? AND waiting_room_id = ? AND enabled = TRUE",
      [guildId, channelId],
    );

    if (rows.length === 0) return;

    const settings = rows[0];
    const member = newState.member;

    // 1. Bot in den Warteraum holen (falls nicht drin)
    const botMember = newState.guild.members.me;
    if (botMember.voice.channelId !== channelId) {
      await newState.channel.join().catch(() => {});
    }

    // 2. Team benachrichtigen
    if (settings.notify_channel_id) {
      const notifyChannel = newState.guild.channels.cache.get(
        settings.notify_channel_id,
      );
      if (notifyChannel) {
        const ping = settings.notify_role_id
          ? `<@&${settings.notify_role_id}>`
          : "";
        await notifyChannel.send(
          `${ping} 🎧 **${member.user.tag}** wartet im Sprach-Support!`,
        );
      }
    }
  } catch (err) {
    console.error("❌ Fehler im Voice-Support-Modul:", err.message);
  }
}

module.exports = handleSupport;
