const { Events } = require("discord.js");
const db = require("../database/db");

module.exports = {
  name: Events.InteractionCreate,
  async execute(interaction) {
    // Nur Slash-Commands verarbeiten
    if (!interaction.isChatInputCommand()) return;

    const command = interaction.client.commands.get(interaction.commandName);
    if (!command) return;

    try {
      await command.execute(interaction, db);
    } catch (err) {
      console.error(err);
      const msg = { content: "❌ Fehler beim Ausführen.", ephemeral: true };
      if (interaction.replied || interaction.deferred) {
        await interaction.followUp(msg);
      } else {
        await interaction.reply(msg);
      }
    }
  },
};
