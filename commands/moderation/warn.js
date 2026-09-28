const {
  SlashCommandBuilder,
  PermissionFlagsBits,
  EmbedBuilder,
} = require("discord.js");
const logAction = require("../../modules/moderation/logAction");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("warn")
    .setDescription("Verwarnt einen User")
    .addUserOption((opt) =>
      opt.setName("user").setDescription("Der User").setRequired(true),
    )
    .addStringOption((opt) =>
      opt.setName("reason").setDescription("Grund").setRequired(true),
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),

  async execute(interaction, db) {
    const target = interaction.options.getUser("user");
    const reason = interaction.options.getString("reason");
    const member = interaction.guild.members.cache.get(target.id);

    // In die Datenbank schreiben
    await db.execute(
      "INSERT INTO warns (guild_id, user_id, moderator_id, reason) VALUES (?, ?, ?, ?)",
      [interaction.guild.id, target.id, interaction.user.id, reason],
    );

    // Log speichern
    await logAction(
      db,
      interaction.guild.id,
      "WARN",
      target.id,
      interaction.user.id,
      reason,
    );

    // DM an den User
    if (member) {
      const dmEmbed = new EmbedBuilder()
        .setColor(0xef4444)
        .setTitle(`⚠️ Verwarnung auf ${interaction.guild.name}`)
        .addFields(
          { name: "Grund", value: reason },
          { name: "Moderator", value: interaction.user.tag },
        )
        .setTimestamp();

      await member.send({ embeds: [dmEmbed] }).catch(() => {});
    }

    // Antwort im Channel
    const replyEmbed = new EmbedBuilder()
      .setColor(0xef4444)
      .setDescription(
        `⚠️ **${target.tag}** wurde verwarnt.\n**Grund:** ${reason}`,
      )
      .setTimestamp();

    await interaction.reply({ embeds: [replyEmbed] });
  },
};
