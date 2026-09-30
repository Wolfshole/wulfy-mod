const {
  ChannelType,
  PermissionFlagsBits,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} = require("discord.js");

async function createTicket(interaction, db) {
  const guild = interaction.guild;
  const user = interaction.user;

  try {
    // 1. Settings laden
    const [rows] = await db.execute(
      "SELECT settings_json, enabled FROM guild_settings WHERE guild_id = ? AND module_name = ?",
      [guild.id, "tickets"],
    );

    if (rows.length === 0 || !rows[0].enabled) {
      return interaction.reply({
        content: "❌ Das Ticket-System ist deaktiviert.",
        ephemeral: true,
      });
    }

    const settings = rows[0].settings_json;

    if (!settings.ticketCategoryId) {
      return interaction.reply({
        content: "❌ Keine Ticket-Kategorie konfiguriert.",
        ephemeral: true,
      });
    }

    // 2. Prüfen, ob User bereits ein offenes Ticket hat
    const [existing] = await db.execute(
      "SELECT * FROM tickets WHERE guild_id = ? AND user_id = ? AND status = 'open'",
      [guild.id, user.id],
    );

    if (existing.length >= (settings.maxTicketsPerUser || 1)) {
      return interaction.reply({
        content: `❌ Du hast bereits ${existing.length} offene(s) Ticket(s).`,
        ephemeral: true,
      });
    }

    // 3. Berechtigungen aufbauen
    const permissionOverwrites = [
      {
        id: guild.id,
        deny: [PermissionFlagsBits.ViewChannel],
      },
      {
        id: user.id,
        allow: [
          PermissionFlagsBits.ViewChannel,
          PermissionFlagsBits.SendMessages,
          PermissionFlagsBits.ReadMessageHistory,
          PermissionFlagsBits.AttachFiles,
        ],
      },
    ];

    // Support-Rollen hinzufügen
    if (settings.supportRoleIds && settings.supportRoleIds.length > 0) {
      for (const roleId of settings.supportRoleIds) {
        permissionOverwrites.push({
          id: roleId,
          allow: [
            PermissionFlagsBits.ViewChannel,
            PermissionFlagsBits.SendMessages,
            PermissionFlagsBits.ReadMessageHistory,
            PermissionFlagsBits.ManageMessages,
          ],
        });
      }
    }

    // 4. Kanal erstellen
    const ticketChannel = await guild.channels.create({
      name: `ticket-${user.username}`.toLowerCase().slice(0, 32),
      type: ChannelType.GuildText,
      parent: settings.ticketCategoryId,
      permissionOverwrites,
    });

    // 5. In DB speichern
    await db.execute(
      "INSERT INTO tickets (guild_id, channel_id, user_id, status) VALUES (?, ?, ?, ?)",
      [guild.id, ticketChannel.id, user.id, "open"],
    );

    // 6. Willkommensnachricht mit Buttons
    const embed = new EmbedBuilder()
      .setColor(0x2563eb)
      .setTitle(`🎫 Ticket von ${user.tag}`)
      .setDescription(
        settings.welcomeMessage ||
          "Ein Teammitglied wird sich bald um dich kümmern.",
      )
      .setTimestamp();

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId("ticket_close")
        .setLabel("Ticket schließen")
        .setStyle(ButtonStyle.Danger)
        .setEmoji("🔒"),
      new ButtonBuilder()
        .setCustomId("ticket_claim")
        .setLabel("Übernehmen")
        .setStyle(ButtonStyle.Primary)
        .setEmoji("✋"),
    );

    const supportPing =
      settings.supportRoleIds?.map((id) => `<@&${id}>`).join(" ") || "";

    await ticketChannel.send({
      content: `<@${user.id}> ${supportPing}`,
      embeds: [embed],
      components: [row],
    });

    // 7. Antwort an User
    await interaction.reply({
      content: `✅ Dein Ticket wurde erstellt: <#${ticketChannel.id}>`,
      ephemeral: true,
    });
  } catch (err) {
    console.error("❌ Ticket-Erstellung:", err);
    if (!interaction.replied) {
      await interaction.reply({
        content: "❌ Fehler beim Erstellen des Tickets.",
        ephemeral: true,
      });
    }
  }
}

module.exports = createTicket;
