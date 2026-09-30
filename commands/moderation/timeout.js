const {
  SlashCommandBuilder,
  PermissionFlagsBits,
  EmbedBuilder,
} = require("discord.js");
const logAction = require("../../modules/moderation/logAction");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("timeout")
    .setDescription("Setzt einen User für X Minuten in den Timeout")
    .addUserOption((opt) =>
      opt.setName("user").setDescription("Der User").setRequired(true),
    )
    .addIntegerOption((opt) =>
      opt
        .setName("minutes")
        .setDescription("Dauer in Minuten (1-40320)")
        .setMinValue(1)
        .setMaxValue(40320)
        .setRequired(true),
    )
    .addStringOption((opt) =>
      opt.setName("reason").setDescription("Grund").setRequired(false),
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),

  async execute(interaction, db) {
    const target = interaction.options.getUser("user");
    const minutes = interaction.options.getInteger("minutes");
    const reason =
      interaction.options.getString("reason") ?? "Kein Grund angegeben";

    const member = interaction.guild.members.cache.get(target.id);
    if (!member || !member.moderatable) {
      return interaction.reply({
        content: "❌ Ich kann diesen User nicht timeouten.",
        ephemeral: true,
      });
    }

    const durationMs = minutes * 60 * 1000;

    try {
      await member.timeout(durationMs, `${interaction.user.tag}: ${reason}`);

      await logAction(
        db,
        interaction.guild.id,
        "TIMEOUT",
        target.id,
        interaction.user.id,
        `${minutes} Minuten – ${reason}`,
      );

      const embed = new EmbedBuilder()
        .setColor(0xf59e0b)
        .setDescription(
          `🔇 **${target.tag}** wurde für **${minutes} Minuten** stummgeschaltet.\n**Grund:** ${reason}`,
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
