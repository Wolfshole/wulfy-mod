const {
  SlashCommandBuilder,
  PermissionFlagsBits,
  EmbedBuilder,
} = require("discord.js");
const logAction = require("../../modules/moderation/logAction");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("ban")
    .setDescription("Bannt einen User")
    .addUserOption((opt) =>
      opt.setName("user").setDescription("Der User").setRequired(true),
    )
    .addStringOption((opt) =>
      opt.setName("reason").setDescription("Grund").setRequired(false),
    )
    .addIntegerOption((opt) =>
      opt
        .setName("delete_days")
        .setDescription("Nachrichten der letzten X Tage löschen (0-7)")
        .setMinValue(0)
        .setMaxValue(7)
        .setRequired(false),
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers),

  async execute(interaction, db) {
    const target = interaction.options.getUser("user");
    const reason =
      interaction.options.getString("reason") ?? "Kein Grund angegeben";
    const deleteDays = interaction.options.getInteger("delete_days") ?? 0;

    const member = interaction.guild.members.cache.get(target.id);
    if (member && !member.bannable) {
      return interaction.reply({
        content: "❌ Ich kann diesen User nicht bannen.",
        ephemeral: true,
      });
    }

    try {
      await interaction.guild.members.ban(target.id, {
        reason: `${interaction.user.tag}: ${reason}`,
        deleteMessageSeconds: deleteDays * 24 * 60 * 60,
      });

      await logAction(
        db,
        interaction.guild.id,
        "BAN",
        target.id,
        interaction.user.id,
        reason,
      );

      const embed = new EmbedBuilder()
        .setColor(0xef4444)
        .setDescription(
          `🔨 **${target.tag}** wurde gebannt.\n**Grund:** ${reason}`,
        )
        .setTimestamp();

      await interaction.reply({ embeds: [embed] });
    } catch (err) {
      await interaction.reply({
        content: `❌ Fehler: ${err.message}`,
        ephemeral: true,
      });
    }
  },
};
