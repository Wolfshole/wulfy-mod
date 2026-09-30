const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("warns")
    .setDescription("Zeigt alle Verwarnungen eines Users")
    .addUserOption((opt) =>
      opt.setName("user").setDescription("Der User").setRequired(true),
    ),

  async execute(interaction, db) {
    // Interaktion sofort bestätigen, damit Discord nicht timeoutet
    await interaction.deferReply();

    const target = interaction.options.getUser("user");

    const [rows] = await db.execute(
      "SELECT * FROM warns WHERE guild_id = ? AND user_id = ? ORDER BY created_at DESC",
      [interaction.guild.id, target.id],
    );

    if (rows.length === 0) {
      return interaction.editReply({
        content: `✅ **${target.tag}** hat keine Verwarnungen.`,
      });
    }

    const list = rows
      .map(
        (w) =>
          `**#${w.id}** – ${w.reason}\n<@${w.moderator_id}> · <t:${Math.floor(new Date(w.created_at).getTime() / 1000)}:R>`,
      )
      .join("\n\n");

    const embed = new EmbedBuilder()
      .setColor(0xef4444)
      .setTitle(`⚠️ Verwarnungen von ${target.tag}`)
      .setDescription(list.slice(0, 4000))
      .setFooter({ text: `Insgesamt: ${rows.length} Verwarnung(en)` })
      .setTimestamp();

    await interaction.editReply({ embeds: [embed] });
  },
};
