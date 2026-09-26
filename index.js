require('dotenv').config();

const { Client, Collection, GatewayIntentBits } = require('discord.js');
const fs = require('fs');
const path = require('path');

// Datenbank importieren
const db = require('./db');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

client.commands = new Collection();

const commandPath = path.join(__dirname, "commands");

// Prüfen, ob der Ordner überhaupt existiert
if (!fs.existsSync(commandPath)) {
    console.error(`❌ Der Ordner "${commandPath}" existiert nicht!`);
} else {
    const commandFiles = fs
        .readdirSync(commandPath)
        .filter((file) => file.endsWith(".js"));

    console.log(`Lade ${commandFiles.length} Commands aus ${commandPath}`);

    for (const file of commandFiles) {
        const filePath = path.join(commandPath, file);
        const command = require(filePath);

        if ('data' in command && 'execute' in command) {
            client.commands.set(command.data.name, command);
            console.log(`✅ Command geladen: ${command.data.name}`);
        } else {
            console.warn(`⚠️ Command in ${file} fehlt "data" oder "execute".`);
        }
    }
}


// Slash-Commands verarbeiten
client.on('interactionCreate', async (interaction) => {
    if (!interaction.isChatInputCommand()) return;

    const command = client.commands.get(interaction.commandName);
    if (!command) return;

    try {
        await command.execute(interaction, db); // db wird mitgegeben!
    } catch (error) {
        console.error(error);
        await interaction.reply({ content: '❌ Fehler beim Ausführen des Commands.', ephemeral: true });
    }
});

// Bot einloggen
client.login(process.env.DISCORD_TOKEN);