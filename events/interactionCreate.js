const { Events } = require("discord.js");
const db = require("../database/db");
const createTicket = require("../modules/tickets/createTicket");

module.exports = {
  name: Events.InteractionCreate,
  async execute(interaction) {
    // Slash-Commands
    if (interaction.isChatInputCommand()) {
      const command = interaction.client.commands.get(interaction.commandName);
      if (!command) return;

      try {
        await command.execute(interaction, db);
      } catch (err) {
        console.error(err);
        if (err.code === 10062) return;
        const msg = { content: "❌ Fehler beim Ausführen.", ephemeral: true };
        try {
          if (interaction.replied || interaction.deferred) {
            await interaction.followUp(msg);
          } else {
            await interaction.reply(msg);
          }
        } catch {}
      }
      return;
    }

    // Buttons
    if (interaction.isButton()) {
      try {
        if (interaction.customId === "ticket_open") {
          await createTicket(interaction, db);
        }

        if (interaction.customId === "ticket_close") {
          await interaction.deferReply();
          const [rows] = await db.execute(
            "SELECT * FROM tickets WHERE channel_id = ? AND status = 'open'",
            [interaction.channel.id],
          );

          if (rows.length === 0) {
            return interaction.editReply({
              content: "❌ Kein offenes Ticket.",
            });
          }

          await db.execute(
            "UPDATE tickets SET status = 'closed', closed_at = NOW() WHERE id = ?",
            [rows[0].id],
          );

          await interaction.editReply({
            content: "🔒 Ticket wird in 5 Sekunden geschlossen...",
          });

          setTimeout(() => {
            interaction.channel.delete().catch(() => {});
          }, 5000);
        }

        if (interaction.customId === "ticket_claim") {
          await interaction.deferReply();
          const [rows] = await db.execute(
            "SELECT * FROM tickets WHERE channel_id = ? AND status = 'open'",
            [interaction.channel.id],
          );

          if (rows.length === 0) {
            return interaction.editReply({
              content: "❌ Kein offenes Ticket.",
            });
          }

          await interaction.editReply({
            content: `✋ Ticket wurde von <@${interaction.user.id}> übernommen.`,
          });
        }
      } catch (err) {
        console.error("Button-Fehler:", err);
      }
    }
  },
};
