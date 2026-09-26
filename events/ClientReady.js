const {Events, ActivityType} = require('discord.js');

module.exports = {
    name: Events.ClientReady,
    once: true,
    execute(client) {
        console.log(`Bot ist bereit! Eingeloggt als ${client.user.tag}`);
        client.user.setActivity('Modderiert!', {type: ActivityType.Custom});
    }
};