async function onJoin(member, db) {
  try {
    const [rows] = await db.execute(
      "SELECT settings_json, enabled FROM guild_settings WHERE guild_id = ? AND module_name = ?",
      [member.guild.id, "welcome"],
    );

    if (rows.length === 0 || !rows[0].enabled) return;

    const settings = rows[0].settings_json;

    // Willkommens-Nachricht
    if (settings.welcomeChannelId && settings.welcomeMessage) {
      const channel = member.guild.channels.cache.get(
        settings.welcomeChannelId,
      );
      if (channel) {
        const message = settings.welcomeMessage
          .replace(/{user}/g, `<@${member.id}>`)
          .replace(/{server}/g, member.guild.name)
          .replace(/{membercount}/g, member.guild.memberCount);

        await channel.send(message);
      }
    }

    // Auto-Rollen (mehrere)
    const roleIds = settings.autoRoleIds || [];
    if (roleIds.length > 0) {
      const botMember = member.guild.members.me;
      for (const roleId of roleIds) {
        const role = member.guild.roles.cache.get(roleId);
        if (!role) continue;

        // Prüfen, ob Bot die Rolle vergeben kann
        if (role.position >= botMember.roles.highest.position) {
          console.error(
            `❌ Auto-Rolle "${role.name}" ist über der Bot-Rolle – übersprungen.`,
          );
          continue;
        }

        await member.roles.add(role).catch((err) => {
          console.error(`❌ Auto-Rolle "${role.name}": ${err.message}`);
        });
      }
    }

    // Willkommens-DM
    if (settings.dmMessage) {
      const dmText = settings.dmMessage
        .replace(/{user}/g, member.user.username)
        .replace(/{server}/g, member.guild.name);

      await member.send(dmText).catch(() => {});
    }
  } catch (err) {
    console.error("❌ Welcome-Modul (Join):", err.message);
  }
}

module.exports = onJoin;
