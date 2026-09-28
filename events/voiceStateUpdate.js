const { Events } = require("discord.js");
const db = require("../database/db");
const handleOffice = require("../modules/office/handleOffice");
const handleSupport = require("../modules/voice-support/handleSupport");

module.exports = {
  name: Events.VoiceStateUpdate,
  async execute(oldState, newState) {
    // Nur reagieren, wenn jemand einem Kanal beitritt
    if (oldState.channelId === newState.channelId) return;
    if (!newState.channelId) return;

    // 1. Büro-Warteraum prüfen
    await handleOffice(oldState, newState, db);

    // 2. Sprach-Support prüfen
    await handleSupport(oldState, newState, db);
  },
};
