require('dotenv').config();
const { REST, Routes } = require('discord.js');
const fs = require('fs');
const path = require('path');

const commands = [];

function loadAll(dir) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) loadAll(fullPath);
        else if (entry.name.endsWith('.js')) {
            const cmd = require(fullPath);
            if ('data' in cmd) commands.push(cmd.data.toJSON());
        }
    }
}

loadAll(path.join(__dirname, 'commands'));

const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);

(async () => {
    try {
        console.log(`🔄 Registriere ${commands.length} Commands...`);
        await rest.put(
            Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID),
            { body: commands }
        );
        console.log('✅ Fertig!');
    } catch (err) {
        console.error(err);
    }
})();