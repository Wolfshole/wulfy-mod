require("dotenv").config();
const { Client, Collection, GatewayIntentBits, Events } = require("discord.js");
const path = require("path");

const loadCommands = require("./handlers/loadCommands");
const loadEvents = require("./handlers/loadEvents");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.GuildPresences,
    GatewayIntentBits.GuildModeration,
  ],
});

client.commands = new Collection();

loadCommands(client, path.join(__dirname, "commands"));
loadEvents(client, path.join(__dirname, "events"));

client.login(process.env.DISCORD_TOKEN);
