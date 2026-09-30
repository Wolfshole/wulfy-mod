const {
  SlashCommandBuilder,
  PermissionFlagsBits,
  EmbedBuilder,
} = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("ticket-close")
    .setDescription("Schließt das aktuelle Ticket")
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),

  async execute(interaction, db) {
    await interaction.deferReply();

    const channel = interaction.channel;

    const [rows] = await db.execute(
      "SELECT * FROM tickets WHERE channel_id = ? AND status = 'open'",
      [channel.id],
    );

    if (rows.length === 0) {
      return interaction.editReply({
        content: "❌ Das ist kein offenes Ticket.",
      });
    }

    const ticket = rows[0];

    await db.execute(
      "UPDATE tickets SET status = 'closed', closed_at = NOW() WHERE id = ?",
      [ticket.id],
    );

    const embed = new EmbedBuilder()
      .setColor(0xef4444)
      .setDescription(`🔒 Ticket wird in 5 Sekunden geschlossen...`)
      .setTimestamp();

    await interaction.editReply({ embeds: [embed] });

    setTimeout(() => {
      channel.delete().catch(() => {});
    }, 5000);
  },
};
