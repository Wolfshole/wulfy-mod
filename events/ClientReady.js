const { Events } = require("discord.js");
const setupDatabase = require("../database/setup");

module.exports = {
  name: Events.ClientReady,
  once: true,
  async execute(client) {
    console.log(`🤖 Bot ist online als ${client.user.tag}`);
    await setupDatabase();
  },
};
