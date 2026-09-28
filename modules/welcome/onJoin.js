async function onJoin(member, db) {
  try {
    // Einstellungen für das Welcome-Modul laden
    const [rows] = await db.execute(
      "SELECT settings_json, enabled FROM guild_settings WHERE guild_id = ? AND module_name = ?",
      [member.guild.id, "welcome"],
    );

    if (rows.length === 0 || !rows[0].enabled) return;

    const settings = rows[0].settings_json;

    // Willkommens-Nachricht senden
    if (settings.welcomeChannelId && settings.welcomeMessage) {
      const channel = member.guild.channels.cache.get(
        settings.welcomeChannelId,
      );
      if (channel) {
        const message = settings.welcomeMessage
          .replace("{user}", `<@${member.id}>`)
          .replace("{server}", member.guild.name)
          .replace("{membercount}", member.guild.memberCount);

        await channel.send(message);
      }
    }

    // Auto-Rolle vergeben
    if (settings.autoRoleId) {
      const role = member.guild.roles.cache.get(settings.autoRoleId);
      if (role) {
        await member.roles.add(role).catch((err) => {
          console.error(
            `❌ Auto-Rolle konnte nicht vergeben werden: ${err.message}`,
          );
        });
      }
    }

    // Willkommens-DM senden (optional)
    if (settings.dmMessage) {
      const dmText = settings.dmMessage
        .replace("{user}", member.user.username)
        .replace("{server}", member.guild.name);

      await member.send(dmText).catch(() => {
        // User hat DMs deaktiviert – ignorieren
      });
    }
  } catch (err) {
    console.error("❌ Fehler im Welcome-Modul (Join):", err.message);
  }
}

module.exports = onJoin;
