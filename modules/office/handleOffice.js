async function handleOffice(oldState, newState, db) {
  try {
    const guildId = newState.guild.id;
    const channelId = newState.channelId;

    // Einstellungen für Office-Modul laden
    const [rows] = await db.execute(
      "SELECT * FROM office_settings WHERE guild_id = ? AND waiting_channel_id = ? AND enabled = TRUE",
      [guildId, channelId],
    );

    if (rows.length === 0) return;

    const settings = rows[0];
    const member = newState.member;

    // Büro-Kanäle aus den Kategorien sammeln
    const categoryIds = (settings.office_category_ids || "")
      .split(",")
      .filter(Boolean);
    const offices = [];

    for (const catId of categoryIds) {
      const category = newState.guild.channels.cache.get(catId);
      if (!category) continue;

      category.children.cache.forEach((ch) => {
        if (ch.type === 2) {
          // Voice channel
          const occupants = ch.members.map((m) => m.user.username);
          offices.push({ id: ch.id, name: ch.name, occupants });
        }
      });
    }

    if (offices.length === 0) return;

    // DM an den User senden
    const officeList = offices
      .map((o) => {
        let text = `**${o.name}**`;
        if (settings.show_occupants && o.occupants.length > 0) {
          text += ` – Anwesend: ${o.occupants.join(", ")}`;
        }
        return text;
      })
      .join("\n");

    try {
      await member.send(
        `👋 Willkommen im Warteraum!\n\nVerfügbare Büros:\n${officeList}\n\nAntwortzeit: ${settings.response_time} Minuten`,
      );
    } catch (err) {
      // Fallback: Nachricht in den Warteraum-Kanal
      const waitingChannel = newState.guild.channels.cache.get(channelId);
      if (waitingChannel) {
        await waitingChannel.send(
          `${member}, deine DMs sind deaktiviert. Bitte aktiviere sie, um ein Büro zu wählen.`,
        );
      }
    }
  } catch (err) {
    console.error("❌ Fehler im Office-Modul:", err.message);
  }
}

module.exports = handleOffice;
