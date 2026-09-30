const {
  SlashCommandBuilder,
  PermissionFlagsBits,
  EmbedBuilder,
} = require("discord.js");
const logAction = require("../../modules/moderation/logAction");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("kick")
    .setDescription("Kickt einen User")
    .addUserOption((opt) =>
      opt.setName("user").setDescription("Der User").setRequired(true),
    )
    .addStringOption((opt) =>
      opt.setName("reason").setDescription("Grund").setRequired(false),
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers),

  async execute(interaction, db) {
    const target = interaction.options.getUser("user");
    const reason =
      interaction.options.getString("reason") ?? "Kein Grund angegeben";

    const member = interaction.guild.members.cache.get(target.id);
    if (!member) {
      return interaction.reply({
        content: "❌ User nicht auf dem Server.",
        ephemeral: true,
      });
    }
    if (!member.kickable) {
      return interaction.reply({
        content: "❌ Ich kann diesen User nicht kicken.",
        ephemeral: true,
      });
    }

    try {
      await member.kick(`${interaction.user.tag}: ${reason}`);

      await logAction(
        db,
        interaction.guild.id,
        "KICK",
        target.id,
        interaction.user.id,
        reason,
      );

      const embed = new EmbedBuilder()
        .setColor(0xf59e0b)
        .setDescription(
          `👢 **${target.tag}** wurde gekickt.\n**Grund:** ${reason}`,
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
