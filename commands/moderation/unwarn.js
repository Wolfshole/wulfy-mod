const {
  SlashCommandBuilder,
  PermissionFlagsBits,
  EmbedBuilder,
} = require("discord.js");
const logAction = require("../../modules/moderation/logAction");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("unwarn")
    .setDescription("Entfernt eine Verwarnung")
    .addIntegerOption((opt) =>
      opt.setName("id").setDescription("Warn-ID").setRequired(true),
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),

  async execute(interaction, db) {
    const warnId = interaction.options.getInteger("id");

    const [rows] = await db.execute(
      "SELECT * FROM warns WHERE id = ? AND guild_id = ?",
      [warnId, interaction.guild.id],
    );

    if (rows.length === 0) {
      return interaction.reply({
        content: "❌ Warn-ID nicht gefunden.",
        ephemeral: true,
      });
    }

    const warn = rows[0];

    await db.execute("DELETE FROM warns WHERE id = ?", [warnId]);

    await logAction(
      db,
      interaction.guild.id,
      "UNWARN",
      warn.user_id,
      interaction.user.id,
      `Warn #${warnId} entfernt (Grund war: ${warn.reason})`,
    );

    const embed = new EmbedBuilder()
      .setColor(0x10b981)
      .setDescription(`✅ Warn **#${warnId}** wurde entfernt.`)
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  },
};
