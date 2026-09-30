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

    // 1. In DB speichern
    const [result] = await db.execute(
      "INSERT INTO warns (guild_id, user_id, moderator_id, reason) VALUES (?, ?, ?, ?)",
      [interaction.guild.id, target.id, interaction.user.id, reason],
    );

    const warnId = result.insertId;

    // 2. Log speichern
    await logAction(
      db,
      interaction.guild.id,
      "WARN",
      target.id,
      interaction.user.id,
      reason,
    );

    // 3. DM an User
    if (member) {
      const dmEmbed = new EmbedBuilder()
        .setColor(0xef4444)
        .setTitle(`⚠️ Verwarnung auf ${interaction.guild.name}`)
        .addFields(
          { name: "Warn-ID", value: `#${warnId}`, inline: true },
          { name: "Grund", value: reason },
          { name: "Moderator", value: interaction.user.tag },
        )
        .setTimestamp();

      await member.send({ embeds: [dmEmbed] }).catch(() => {});
    }

    // 4. Antwort im Channel
    const replyEmbed = new EmbedBuilder()
      .setColor(0xef4444)
      .setDescription(
        `⚠️ **${target.tag}** wurde verwarnt.\n` +
          `**Warn-ID:** #${warnId}\n` +
          `**Grund:** ${reason}`,
      )
      .setTimestamp();

    await interaction.reply({ embeds: [replyEmbed] });
  },
};
