const {
  SlashCommandBuilder,
  PermissionFlagsBits,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ChannelType,
} = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("ticket-panel")
    .setDescription("Sendet ein Ticket-Panel in einen Kanal")
    .addChannelOption((opt) =>
      opt
        .setName("channel")
        .setDescription("Kanal für das Panel")
        .addChannelTypes(ChannelType.GuildText)
        .setRequired(true),
    )
    .addStringOption((opt) =>
      opt
        .setName("title")
        .setDescription("Titel des Panels")
        .setRequired(false),
    )
    .addStringOption((opt) =>
      opt
        .setName("description")
        .setDescription("Beschreibung")
        .setRequired(false),
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),

  async execute(interaction, db) {
    await interaction.deferReply({ ephemeral: true });

    const channel = interaction.options.getChannel("channel");
    const title = interaction.options.getString("title") ?? "🎫 Support-Ticket";
    const description =
      interaction.options.getString("description") ??
      "Klicke auf den Button, um ein Ticket zu erstellen.";

    const embed = new EmbedBuilder()
      .setColor(0x2563eb)
      .setTitle(title)
      .setDescription(description)
      .setFooter({ text: interaction.guild.name })
      .setTimestamp();

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId("ticket_open")
        .setLabel("Ticket erstellen")
        .setStyle(ButtonStyle.Primary)
        .setEmoji("🎫"),
    );

    await channel.send({ embeds: [embed], components: [row] });

    await interaction.editReply({
      content: `✅ Panel in <#${channel.id}> gesendet.`,
    });
  },
};
